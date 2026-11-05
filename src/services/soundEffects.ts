/**
 * Synthesizes tactile audio cues via Web Audio API.
 * 100% offline, zero network latency, zero broken external audio file dependencies.
 */

class SoundEffectsService {
  private ctx: AudioContext | null = null;
  private isEnabled: boolean = true;

  constructor() {
    // AudioContext will be initialized on first user gesture
  }

  public setEnabled(enabled: boolean) {
    this.isEnabled = enabled;
  }

  private getAudioContext(): AudioContext | null {
    if (!this.isEnabled) return null;
    try {
      if (!this.ctx) {
        const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
        if (AudioCtx) {
          this.ctx = new AudioCtx();
        }
      }
      if (this.ctx && this.ctx.state === 'suspended') {
        this.ctx.resume();
      }
      return this.ctx;
    } catch {
      return null;
    }
  }

  /**
   * Listening started earcon: Brie's signature clean double-tone ("ba-ding!")
   * 466.16Hz (Bb4) followed immediately by 932.33Hz (Bb5) with clean exponential decay.
   */
  public playEarconStart() {
    const ctx = this.getAudioContext();
    if (!ctx) return;
    const now = ctx.currentTime;

    // Brie Tone 1 (Bb4 ~ 466.16 Hz)
    const osc1 = ctx.createOscillator();
    const gain1 = ctx.createGain();
    osc1.type = 'sine';
    osc1.frequency.setValueAtTime(466.16, now);

    gain1.gain.setValueAtTime(0, now);
    gain1.gain.linearRampToValueAtTime(0.22, now + 0.015);
    gain1.gain.exponentialRampToValueAtTime(0.001, now + 0.14);

    osc1.connect(gain1);
    gain1.connect(ctx.destination);

    osc1.start(now);
    osc1.stop(now + 0.15);

    // Brie Tone 2 (Bb5 ~ 932.33 Hz) - slightly louder, sparkling chime
    const osc2 = ctx.createOscillator();
    const gain2 = ctx.createGain();
    osc2.type = 'sine';
    osc2.frequency.setValueAtTime(932.33, now + 0.09);

    gain2.gain.setValueAtTime(0, now + 0.09);
    gain2.gain.linearRampToValueAtTime(0.26, now + 0.105);
    gain2.gain.exponentialRampToValueAtTime(0.001, now + 0.35);

    // Overtone shimmer (F6 ~ 1396.9 Hz)
    const oscShimmer = ctx.createOscillator();
    const gainShimmer = ctx.createGain();
    oscShimmer.type = 'sine';
    oscShimmer.frequency.setValueAtTime(1396.91, now + 0.09);

    gainShimmer.gain.setValueAtTime(0, now + 0.09);
    gainShimmer.gain.linearRampToValueAtTime(0.06, now + 0.105);
    gainShimmer.gain.exponentialRampToValueAtTime(0.001, now + 0.28);

    osc2.connect(gain2);
    gain2.connect(ctx.destination);
    oscShimmer.connect(gainShimmer);
    gainShimmer.connect(ctx.destination);

    osc2.start(now + 0.09);
    osc2.stop(now + 0.36);
    oscShimmer.start(now + 0.09);
    oscShimmer.stop(now + 0.3);
  }

  /**
   * Listening stopped earcon (Brie dismissal soft downward chime)
   */
  public playEarconStop() {
    const ctx = this.getAudioContext();
    if (!ctx) return;
    const now = ctx.currentTime;

    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(880, now);
    osc.frequency.exponentialRampToValueAtTime(440, now + 0.16);

    gain.gain.setValueAtTime(0.18, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.18);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start(now);
    osc.stop(now + 0.2);
  }

  /**
   * Success / Confirmation chord
   */
  public playSuccess() {
    const ctx = this.getAudioContext();
    if (!ctx) return;
    const now = ctx.currentTime;

    const chord = [523.25, 659.25, 783.99, 1046.5]; // C5, E5, G5, C6
    chord.forEach((freq) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(freq, now);

      gain.gain.setValueAtTime(0, now);
      gain.gain.linearRampToValueAtTime(0.12, now + 0.03);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.45);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(now);
      osc.stop(now + 0.5);
    });
  }

  /**
   * Tactile click for button or touch navigation
   */
  public playClick() {
    const ctx = this.getAudioContext();
    if (!ctx) return;
    const now = ctx.currentTime;

    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(800, now);
    osc.frequency.exponentialRampToValueAtTime(200, now + 0.03);

    gain.gain.setValueAtTime(0.15, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.03);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start(now);
    osc.stop(now + 0.04);
  }

  /**
   * Sonar ping for spatial awareness & blind mode navigation
   */
  public playSonarPing() {
    const ctx = this.getAudioContext();
    if (!ctx) return;
    const now = ctx.currentTime;

    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(1200, now);
    osc.frequency.exponentialRampToValueAtTime(400, now + 0.35);

    gain.gain.setValueAtTime(0, now);
    gain.gain.linearRampToValueAtTime(0.18, now + 0.02);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.4);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start(now);
    osc.stop(now + 0.45);
  }

  /**
   * Error or cancellation tone
   */
  public playError() {
    const ctx = this.getAudioContext();
    if (!ctx) return;
    const now = ctx.currentTime;

    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(180, now);
    osc.frequency.setValueAtTime(130, now + 0.1);

    gain.gain.setValueAtTime(0.15, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.28);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start(now);
    osc.stop(now + 0.3);
  }

  /**
   * Phone Ring tone
   */
  public playPhoneRingPulse(): { stop: () => void } {
    const ctx = this.getAudioContext();
    if (!ctx) return { stop: () => {} };

    // Standard North American ringback tones: 440Hz + 480Hz
    const osc1 = ctx.createOscillator();
    const osc2 = ctx.createOscillator();
    const gain = ctx.createGain();

    osc1.frequency.value = 440;
    osc2.frequency.value = 480;
    gain.gain.value = 0.12;

    osc1.connect(gain);
    osc2.connect(gain);
    gain.connect(ctx.destination);

    const now = ctx.currentTime;
    osc1.start(now);
    osc2.start(now);

    return {
      stop: () => {
        try {
          gain.gain.linearRampToValueAtTime(0.001, ctx.currentTime + 0.05);
          setTimeout(() => {
            osc1.stop();
            osc2.stop();
          }, 60);
        } catch {
          // ignore
        }
      },
    };
  }
}

export const sounds = new SoundEffectsService();
