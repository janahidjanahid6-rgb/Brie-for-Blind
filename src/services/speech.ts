/**
 * Speech Synthesis (TTS) & Web Speech Recognition (ASR) engine.
 * Prioritizes fast offline browser speech synthesis and local voice recognition.
 */

export interface SpeechOptions {
  rate?: number;
  pitch?: number;
  voiceURI?: string;
  onStart?: () => void;
  onEnd?: () => void;
  onError?: (err: any) => void;
}

class SpeechService {
  private synth: SpeechSynthesis | null = null;
  private recognition: any = null;
  private isListening: boolean = false;
  private isSpeaking: boolean = false;
  private wakeWords: string[] = ['hey bri', 'bri', 'hello bri', 'listen'];
  private onWakeWordDetectedCallback: (() => void) | null = null;
  private onTranscriptCallback: ((transcript: string, isFinal: boolean) => void) | null = null;
  private onErrorCallback: ((error: string) => void) | null = null;
  private currentUtterance: SpeechSynthesisUtterance | null = null;
  private keepAliveInterval: any = null;

  private pausedForSpeech = false;
  private lastSpokenText = '';
  private lastSpeechEndedAt = 0;
  private lastCommitted = '';
  private lastCommittedAt = 0;
  private pendingInterim = '';
  private silenceTimer: any = null;
  private wakeFiredThisUtterance = false;
  private restartDelayMs = 250;

  private static readonly SILENCE_COMMIT_MS = 1400;
  private static readonly ECHO_WINDOW_MS = 2500;

  private static normalize(text: string): string {
    return text.toLowerCase().replace(/[^a-z0-9\s']/g, ' ').replace(/\s+/g, ' ').trim();
  }

  private static escapeRegExp(text: string): string {
    return text.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  }

  private containsWakeWord(normalized: string): boolean {
    return this.wakeWords.some((w) =>
      new RegExp(`\\b${SpeechService.escapeRegExp(w)}\\b`).test(normalized)
    );
  }

  // The mic can pick up Brie's own voice from the speaker right after she talks.
  private isEcho(normalized: string): boolean {
    if (!this.lastSpokenText || normalized.length < 4) return false;
    const recentlySpoke =
      this.isSpeaking || Date.now() - this.lastSpeechEndedAt < SpeechService.ECHO_WINDOW_MS;
    return recentlySpoke && this.lastSpokenText.includes(normalized);
  }

  private commitFinal(text: string) {
    clearTimeout(this.silenceTimer);
    this.pendingInterim = '';
    this.wakeFiredThisUtterance = false;

    const normalized = SpeechService.normalize(text);
    if (normalized.length < 2) return;
    if (normalized === this.lastCommitted && Date.now() - this.lastCommittedAt < 3000) return;
    if (this.isEcho(normalized)) return;

    this.lastCommitted = normalized;
    this.lastCommittedAt = Date.now();
    this.onTranscriptCallback?.(text.trim(), true);
  }

  private pauseRecognitionForSpeech() {
    if (!this.isListening || !this.recognition) return;
    this.pausedForSpeech = true;
    clearTimeout(this.silenceTimer);
    this.pendingInterim = '';
    try {
      this.recognition.abort();
    } catch {
      // not running
    }
  }

  private resumeRecognitionAfterSpeech() {
    if (!this.pausedForSpeech) return;
    this.pausedForSpeech = false;
    if (!this.isListening) return;
    setTimeout(() => {
      if (this.isListening && !this.isSpeaking) {
        try {
          this.recognition?.start();
        } catch {
          // already started
        }
      }
    }, 300);
  }

  constructor() {
    if (typeof window !== 'undefined') {
      if ('speechSynthesis' in window) {
        this.synth = window.speechSynthesis;
      }
      this.initRecognition();
    }
  }

  public getVoices(): SpeechSynthesisVoice[] {
    if (!this.synth) return [];
    return this.synth.getVoices();
  }

  public setWakeWords(words: string[]) {
    this.wakeWords = words.map((w) => w.toLowerCase().trim()).filter(Boolean);
  }

  public setCallbacks(
    onWakeWord: () => void,
    onTranscript: (text: string, isFinal: boolean) => void,
    onError: (err: string) => void
  ) {
    this.onWakeWordDetectedCallback = onWakeWord;
    this.onTranscriptCallback = onTranscript;
    this.onErrorCallback = onError;
  }

  /**
   * Speak text out loud via browser TTS with rate/pitch options
   */
  public speak(text: string, options: SpeechOptions = {}): Promise<void> {
    return new Promise((resolve) => {
      if (!this.synth) {
        resolve();
        return;
      }

      // Stop any ongoing speech
      this.stopSpeaking();

      const utterance = new SpeechSynthesisUtterance(text);
      this.currentUtterance = utterance;
      this.lastSpokenText = SpeechService.normalize(text);
      this.isSpeaking = true;
      this.pauseRecognitionForSpeech();

      // Brie always speaks at normal speed, regardless of caller or saved settings.
      utterance.rate = 1.0;
      utterance.pitch = 1.0;
      utterance.volume = 1.0;

      // Select natural English voice if available
      const voices = this.getVoices();
      if (options.voiceURI) {
        const found = voices.find((v) => v.voiceURI === options.voiceURI);
        if (found) utterance.voice = found;
      } else {
        const preferred = voices.find(
          (v) =>
            v.lang.startsWith('en') &&
            (v.name.includes('Natural') ||
              v.name.includes('Google') ||
              v.name.includes('Samantha') ||
              v.name.includes('Daniel') ||
              v.name.includes('Siri'))
        ) || voices.find((v) => v.lang.startsWith('en'));
        if (preferred) utterance.voice = preferred;
      }

      utterance.onstart = () => {
        this.isSpeaking = true;
        options.onStart?.();
      };

      utterance.onend = () => {
        this.isSpeaking = false;
        this.currentUtterance = null;
        this.lastSpeechEndedAt = Date.now();
        this.resumeRecognitionAfterSpeech();
        options.onEnd?.();
        resolve();
      };

      utterance.onerror = (e) => {
        this.isSpeaking = false;
        this.currentUtterance = null;
        this.lastSpeechEndedAt = Date.now();
        this.resumeRecognitionAfterSpeech();
        options.onError?.(e);
        resolve();
      };

      // Workaround for Chrome bug where long speech pauses after 15 seconds
      clearInterval(this.keepAliveInterval);
      this.keepAliveInterval = setInterval(() => {
        if (!this.synth?.speaking) {
          clearInterval(this.keepAliveInterval);
        } else {
          this.synth.pause();
          this.synth.resume();
        }
      }, 10000);

      this.synth.speak(utterance);
    });
  }

  public stopSpeaking() {
    if (this.synth) {
      clearInterval(this.keepAliveInterval);
      this.synth.cancel();
      this.isSpeaking = false;
      this.currentUtterance = null;
    }
  }

  public getIsSpeaking(): boolean {
    return this.isSpeaking || (this.synth ? this.synth.speaking : false);
  }

  /**
   * Initializes Speech Recognition (WebKit or Standard)
   */
  private initRecognition() {
    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (!SpeechRecognition) {
      console.warn('SpeechRecognition API is not supported in this browser.');
      return;
    }

    try {
      this.recognition = new SpeechRecognition();
      this.recognition.continuous = true;
      this.recognition.interimResults = true;
      this.recognition.lang = 'en-US';

      this.recognition.maxAlternatives = 1;

      this.recognition.onresult = (event: any) => {
        if (this.isSpeaking) return;

        let interimTranscript = '';
        let finalTranscript = '';

        for (let i = event.resultIndex; i < event.results.length; ++i) {
          const piece = event.results[i][0].transcript;
          if (event.results[i].isFinal) {
            finalTranscript += piece;
          } else {
            interimTranscript += piece;
          }
        }

        const current = SpeechService.normalize(finalTranscript || interimTranscript);
        if (!current || this.isEcho(current)) return;

        this.restartDelayMs = 250;

        if (!this.wakeFiredThisUtterance && this.containsWakeWord(current)) {
          this.wakeFiredThisUtterance = true;
          this.onWakeWordDetectedCallback?.();
        }

        if (finalTranscript) {
          this.commitFinal(finalTranscript);
        } else if (interimTranscript) {
          this.pendingInterim = interimTranscript;
          this.onTranscriptCallback?.(interimTranscript.trim(), false);
          // Some browsers never finalize a phrase; treat a pause in speech as the end of it.
          clearTimeout(this.silenceTimer);
          this.silenceTimer = setTimeout(() => {
            if (this.pendingInterim) this.commitFinal(this.pendingInterim);
          }, SpeechService.SILENCE_COMMIT_MS);
        }
      };

      this.recognition.onerror = (event: any) => {
        if (event.error === 'aborted') return;
        if (event.error === 'not-allowed' || event.error === 'service-not-allowed') {
          // Mic permission denied: restarting would loop forever and freeze the page.
          this.isListening = false;
        }
        if (event.error === 'network' || event.error === 'audio-capture') {
          this.restartDelayMs = Math.min(this.restartDelayMs * 2, 5000);
        }
        if (event.error !== 'no-speech') {
          console.warn('Speech recognition error:', event.error);
          this.onErrorCallback?.(event.error);
        }
      };

      this.recognition.onend = () => {
        if (this.pendingInterim) this.commitFinal(this.pendingInterim);
        if (!this.isListening || this.pausedForSpeech || this.isSpeaking) return;
        setTimeout(() => {
          if (this.isListening && !this.pausedForSpeech && !this.isSpeaking) {
            try {
              this.recognition?.start();
            } catch {
              // Already started
            }
          }
        }, this.restartDelayMs);
      };
    } catch (e) {
      console.error('Failed to initialize speech recognition:', e);
    }
  }

  public startListening() {
    if (!this.recognition) {
      this.initRecognition();
    }
    if (!this.recognition) {
      this.onErrorCallback?.('Speech recognition is not available in your browser.');
      return;
    }
    this.isListening = true;
    if (this.isSpeaking) {
      // Starting now would capture Brie's own voice; resume once she finishes.
      this.pausedForSpeech = true;
      return;
    }
    try {
      this.recognition.start();
    } catch {
      // recognition may already be active
    }
  }

  public stopListening() {
    this.isListening = false;
    this.pausedForSpeech = false;
    clearTimeout(this.silenceTimer);
    this.pendingInterim = '';
    if (this.recognition) {
      try {
        this.recognition.stop();
      } catch {
        // ignore
      }
    }
  }

  public getIsListening(): boolean {
    return this.isListening;
  }
}

export const speech = new SpeechService();
