/**
 * Speech Synthesis (TTS) & Web Speech Recognition (ASR) engine.
 * Prioritizes fast offline browser speech synthesis and local voice recognition.
 */

export interface SpeechOptions {
  rate?: number;
  pitch?: number;
  volume?: number;
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
        this.getAriaVoice();
        window.speechSynthesis.onvoiceschanged = () => {
          this.getAriaVoice();
        };
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
   * Formats text for clear US English that is easily understood by a Ugandan listener.
   * Avoids rapid fluent connected speech, expands slurred contractions into distinct words,
   * articulates every letter and syllable clearly (e.g. "finish" -> "fin-ish", "PIN" -> "P. I. N.").
   */
  public formatForUgandanUSClearSpeech(raw: string): string {
    if (!raw) return '';
    let t = raw;

    // 1. Expand contractions so letters and words are fully enunciated
    t = t.replace(/\bI'm\b/gi, 'I am');
    t = t.replace(/\byou're\b/gi, 'you are');
    t = t.replace(/\bit's\b/gi, 'it is');
    t = t.replace(/\bthat's\b/gi, 'that is');
    t = t.replace(/\bdon't\b/gi, 'do not');
    t = t.replace(/\bcan't\b/gi, 'can not');
    t = t.replace(/\bwon't\b/gi, 'will not');
    t = t.replace(/\blet's\b/gi, 'let us');
    t = t.replace(/\bwe're\b/gi, 'we are');
    t = t.replace(/\bthey're\b/gi, 'they are');
    t = t.replace(/\bdidn't\b/gi, 'did not');
    t = t.replace(/\bdoesn't\b/gi, 'does not');
    t = t.replace(/\bwasn't\b/gi, 'was not');
    t = t.replace(/\bisn't\b/gi, 'is not');
    t = t.replace(/\baren't\b/gi, 'are not');
    t = t.replace(/\bgonna\b/gi, 'going to');
    t = t.replace(/\bwanna\b/gi, 'want to');

    // 2. Specific words: pronounce both syllables and every letter distinctly (e.g. "finish" -> "fin-ish")
    t = t.replace(/\bfinish\b/gi, 'fin-ish');
    t = t.replace(/\bfinished\b/gi, 'fin-ished');
    t = t.replace(/\bfinishing\b/gi, 'fin-ish-ing');

    // 3. Clear letter-by-letter enunciation for local & financial terms
    t = t.replace(/\bPIN\b/gi, 'P. I. N.');
    t = t.replace(/\bMTN\b/gi, 'M. T. N.');
    t = t.replace(/\bMoMo\b/gi, 'Mo-Mo');
    t = t.replace(/\bAirtel\b/gi, 'Air-tel');
    t = t.replace(/\bUGX\b/gi, 'U. G. X.');
    t = t.replace(/\bshs\b/gi, 'Shil-lings');
    t = t.replace(/\bshillings\b/gi, 'Shil-lings');
    t = t.replace(/\bSMS\b/gi, 'S. M. S.');
    t = t.replace(/\bSOS\b/gi, 'S. O. S.');
    t = t.replace(/\bWhatsApp\b/gi, 'Whats-App');

    // 4. Syllable-by-syllable buttons
    t = t.replace(/\bACTIVATE\b/g, 'AC-TI-VATE');
    t = t.replace(/\bDEACTIVATE\b/g, 'DE-AC-TI-VATE');

    return t;
  }

  /**
   * Discovers and locks Aria voice (same lady as Meta AI Aria / Microsoft Aria / Natural).
   * If Aria is not present on this phone, falls back to the closest soft clear female voice
   * (Google US English Female, Microsoft Jenny, or Samantha) labeled as 'Aria Style'.
   */
  public getAriaVoice(): SpeechSynthesisVoice | null {
    const voices = this.getVoices();
    if (!voices.length) return null;

    // 1. Search for Aria (Meta AI / Microsoft Aria / Natural)
    const aria = voices.find(
      (v) => /aria/i.test(v.name) || /aria/i.test(v.voiceURI)
    );
    if (aria) {
      try {
        localStorage.setItem('brieVoice', 'Aria');
      } catch {}
      return aria;
    }

    // 2. Closest soft clear female US English voice
    const usVoices = voices.filter(
      (v) => v.lang === 'en-US' || v.lang === 'en_US' || v.lang.startsWith('en-US')
    );

    const fallback =
      usVoices.find(
        (v) =>
          /jenny/i.test(v.name) ||
          (/google/i.test(v.name) && /female|woman/i.test(v.name)) ||
          /samantha/i.test(v.name) ||
          /zira/i.test(v.name) ||
          /natural/i.test(v.name)
      ) ||
      usVoices.find((v) => /female|woman/i.test(v.name)) ||
      usVoices.find((v) => /google/i.test(v.name)) ||
      usVoices[0] ||
      voices.find((v) => v.lang.startsWith('en')) ||
      voices[0];

    try {
      localStorage.setItem('brieVoice', 'Aria Style');
    } catch {}

    return fallback || null;
  }

  /**
   * Speak text out loud with Aria voice (Meta AI Aria style)
   */
  public speak(text: string, options: SpeechOptions = {}): Promise<void> {
    return new Promise((resolve) => {
      if (!this.synth) {
        resolve();
        return;
      }

      // Always cancel before speaking so voices NEVER overlap
      this.stopSpeaking();

      const clearText = this.formatForUgandanUSClearSpeech(text);
      const utterance = new SpeechSynthesisUtterance(clearText);
      this.currentUtterance = utterance;

      // Aria Voice Settings: rate 0.85 (clear, natural, not rushed), pitch 1.0, volume 1.0, lang en-US
      utterance.lang = 'en-US';
      utterance.rate = options.rate ?? 0.85;
      utterance.pitch = options.pitch ?? 1.0;
      utterance.volume = options.volume ?? 1.0;

      // Lock Aria Voice
      const aria = this.getAriaVoice();
      if (aria) {
        utterance.voice = aria;
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
