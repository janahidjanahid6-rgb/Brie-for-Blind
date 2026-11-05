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
        options.onEnd?.();
        resolve();
      };

      utterance.onerror = (e) => {
        this.isSpeaking = false;
        this.currentUtterance = null;
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

      this.recognition.onresult = (event: any) => {
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

        const rawTranscript = (finalTranscript || interimTranscript).toLowerCase().trim();

        // Check if wake word detected
        const hasWakeWord = this.wakeWords.some((w) => rawTranscript.includes(w));
        if (hasWakeWord) {
          this.onWakeWordDetectedCallback?.();
        }

        if (finalTranscript) {
          this.onTranscriptCallback?.(finalTranscript.trim(), true);
        } else if (interimTranscript) {
          this.onTranscriptCallback?.(interimTranscript.trim(), false);
        }
      };

      this.recognition.onerror = (event: any) => {
        if (event.error !== 'no-speech') {
          console.warn('Speech recognition error:', event.error);
          this.onErrorCallback?.(event.error);
        }
      };

      this.recognition.onend = () => {
        // If listening should be kept alive, restart recognition
        if (this.isListening) {
          try {
            this.recognition?.start();
          } catch {
            // Already started
          }
        }
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
    try {
      this.recognition.start();
    } catch {
      // recognition may already be active
    }
  }

  public stopListening() {
    this.isListening = false;
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
