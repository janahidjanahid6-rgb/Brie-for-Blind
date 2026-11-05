/**
 * Haptic Feedback Service using Web Vibration API.
 * Provides rich tactile vibration cadences for blind and seeing-impaired users.
 */

class HapticsService {
  private isEnabled: boolean = true;

  public setEnabled(enabled: boolean) {
    this.isEnabled = enabled;
  }

  private vibrate(pattern: number | number[]): boolean {
    if (!this.isEnabled) return false;
    try {
      if (typeof window !== 'undefined' && 'vibrate' in navigator) {
        return navigator.vibrate(pattern);
      }
    } catch {
      // ignore devices that reject vibrate
    }
    return false;
  }

  /**
   * Crisp micro-tap for physical touch confirmation
   */
  public tap() {
    this.vibrate(25);
  }

  /**
   * Double affirmative buzz for successful actions
   */
  public success() {
    this.vibrate([40, 40, 70]);
  }

  /**
   * Distinct buzz when voice listener turns on
   */
  public listeningStart() {
    this.vibrate([50, 30, 50]);
  }

  /**
   * Distinct buzz when voice listener turns off
   */
  public listeningStop() {
    this.vibrate(35);
  }

  /**
   * Heavy double pulse for alert or error
   */
  public error() {
    this.vibrate([80, 50, 100]);
  }

  /**
   * Triple pulse for emergency SOS or long-press trigger
   */
  public emergency() {
    this.vibrate([150, 70, 150, 70, 250]);
  }

  /**
   * Rhythmic vibration cadence for incoming/outgoing phone calls
   */
  public callPulse() {
    this.vibrate([400, 200, 400]);
  }
}

export const haptics = new HapticsService();
