import React, { useEffect, useRef, useState } from 'react';
import { sounds } from '../services/soundEffects';
import { haptics } from '../services/haptics';

interface BlindGestureManagerProps {
  isListening: boolean;
  isSpeaking: boolean;
  userName: string;
  speechRate: number;
  onUpdateSpeechRate: (newRate: number) => void;
  onTriggerVoice: () => void;
  onStopSpeaking: () => void;
  onTriggerVision: () => void;
  onTriggerWhereAmI: () => void;
  onTriggerSOS: () => void;
  onNextItem?: () => void;
  onPrevItem?: () => void;
  children: React.ReactNode;
}

export const BlindGestureManager: React.FC<BlindGestureManagerProps> = ({
  isListening,
  isSpeaking,
  userName,
  speechRate,
  onUpdateSpeechRate,
  onTriggerVoice,
  onStopSpeaking,
  onTriggerVision,
  onTriggerWhereAmI,
  onTriggerSOS,
  onNextItem,
  onPrevItem,
  children,
}) => {
  // Screen Reader Assertive Live Region
  const [talkBackText, setTalkBackText] = useState<string>('');

  // Proximity Ear Detection State
  const [isNearEar, setIsNearEar] = useState<boolean>(false);

  // Gesture Tracking
  const touchStartRef = useRef<{ x: number; y: number; time: number; touches: number } | null>(null);
  const longPressTimerRef = useRef<NodeJS.Timeout | null>(null);
  const volUpPressHistoryRef = useRef<number[]>([]);
  const volDownPressHistoryRef = useRef<number[]>([]);

  // 1. Tactile Heartbeat Beacon when microphone is actively listening
  useEffect(() => {
    if (!isListening) return;

    // Initial immediate pulse
    haptics.listeningStart();

    const interval = setInterval(() => {
      haptics.heartbeatPulse();
      sounds.playHeartbeatPulse();
    }, 2400);

    return () => clearInterval(interval);
  }, [isListening]);

  // 2. Proximity Ear-Detection Sensor
  useEffect(() => {
    if (typeof window === 'undefined') return;

    const handleOrientation = (event: DeviceOrientationEvent) => {
      const pitch = event.beta; // Tilt front/back (-180 to 180)
      if (pitch !== null) {
        // High vertical tilt (> 65 degrees) indicates lifted to ear
        const nearEar = Math.abs(pitch) > 65;
        if (nearEar !== isNearEar) {
          setIsNearEar(nearEar);
          if (nearEar) {
            haptics.tap();
            setTalkBackText(`Earpiece mode active, ${userName}.`);
          }
        }
      }
    };

    if (window.DeviceOrientationEvent) {
      window.addEventListener('deviceorientation', handleOrientation, true);
      return () => window.removeEventListener('deviceorientation', handleOrientation, true);
    }
  }, [isNearEar, userName]);

  // 3. Physical Hardware Key Bindings
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const now = Date.now();

      // Double-press Volume Up (or KeyM / Space) -> Wake Voice
      if (e.key === 'AudioVolumeUp' || e.code === 'KeyM' || (e.code === 'Space' && !['INPUT', 'TEXTAREA'].includes((e.target as any)?.tagName))) {
        e.preventDefault();
        const history = volUpPressHistoryRef.current.filter((t) => now - t < 800);
        history.push(now);
        volUpPressHistoryRef.current = history;

        if (history.length >= 2 || e.code === 'KeyM' || e.code === 'Space') {
          volUpPressHistoryRef.current = [];
          sounds.playEarconStart();
          haptics.listeningStart();
          onTriggerVoice();
        }
        return;
      }

      // Volume Down single -> Mute / Stop speech
      // Volume Down triple -> Emergency SOS
      if (e.key === 'AudioVolumeDown' || e.code === 'Escape' || e.code === 'KeyE') {
        e.preventDefault();
        const history = volDownPressHistoryRef.current.filter((t) => now - t < 1200);
        history.push(now);
        volDownPressHistoryRef.current = history;

        if (history.length >= 3 || e.code === 'KeyE') {
          // Triple press = SOS!
          volDownPressHistoryRef.current = [];
          onTriggerSOS();
        } else if (e.code === 'Escape' || history.length === 1) {
          // Single press = Silence
          sounds.playEarconStop();
          haptics.listeningStop();
          onStopSpeaking();
        }
        return;
      }

      // Key V = Camera Vision ("What do you see?")
      if (e.code === 'KeyV' && !['INPUT', 'TEXTAREA'].includes((e.target as any)?.tagName)) {
        e.preventDefault();
        onTriggerVision();
        return;
      }

      // Key L = Location ("Where am I?")
      if (e.code === 'KeyL' && !['INPUT', 'TEXTAREA'].includes((e.target as any)?.tagName)) {
        e.preventDefault();
        onTriggerWhereAmI();
        return;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onTriggerVoice, onStopSpeaking, onTriggerVision, onTriggerWhereAmI, onTriggerSOS]);

  // 4. Non-Visual Screen Gestures (Touch Everywhere)
  const handleTouchStart = (e: React.TouchEvent) => {
    const touches = e.touches.length;
    const first = e.touches[0];
    touchStartRef.current = {
      x: first.clientX,
      y: first.clientY,
      time: Date.now(),
      touches,
    };

    // Long-Press Timer for Orientation & Status Briefing
    if (longPressTimerRef.current) clearTimeout(longPressTimerRef.current);
    longPressTimerRef.current = setTimeout(() => {
      haptics.orientPulse();
      sounds.playOrientationPing();
      onTriggerWhereAmI();
      touchStartRef.current = null;
    }, 650);
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (longPressTimerRef.current) {
      clearTimeout(longPressTimerRef.current);
      longPressTimerRef.current = null;
    }

    if (!touchStartRef.current) return;

    const start = touchStartRef.current;
    const duration = Date.now() - start.time;
    const changed = e.changedTouches[0];
    const dx = changed.clientX - start.x;
    const dy = changed.clientY - start.y;
    const distance = Math.sqrt(dx * dx + dy * dy);

    touchStartRef.current = null;

    // 2-Finger Tap anywhere -> Universal Wake Mic
    if (start.touches >= 2 && distance < 30) {
      sounds.playEarconStart();
      haptics.listeningStart();
      onTriggerVoice();
      return;
    }

    // Tap (< 250ms, < 20px) -> Pause/Resume Speaking
    if (duration < 250 && distance < 20) {
      if (isSpeaking) {
        sounds.playEarconStop();
        haptics.listeningStop();
        onStopSpeaking();
      }
      return;
    }

    // Swipes (distance > 50px)
    if (distance > 50) {
      const isVertical = Math.abs(dy) > Math.abs(dx);

      if (isVertical) {
        if (dy < -40) {
          // Swipe Up -> Increase Speech Rate
          haptics.gestureSwipe();
          sounds.playClick();
          const nextRate = Math.min(2.0, Math.round((speechRate + 0.1) * 10) / 10);
          onUpdateSpeechRate(nextRate);
          setTalkBackText(`Speech rate ${Math.round(nextRate * 100)} percent`);
        } else if (dy > 40) {
          // Swipe Down -> Decrease Speech Rate
          haptics.gestureSwipe();
          sounds.playClick();
          const nextRate = Math.max(0.6, Math.round((speechRate - 0.1) * 10) / 10);
          onUpdateSpeechRate(nextRate);
          setTalkBackText(`Speech rate ${Math.round(nextRate * 100)} percent`);
        }
      } else {
        if (dx > 50) {
          // Swipe Right -> Next Item / Read latest
          haptics.gestureSwipe();
          sounds.playClick();
          if (onNextItem) onNextItem();
        } else if (dx < -50) {
          // Swipe Left -> Previous Item
          haptics.gestureSwipe();
          sounds.playClick();
          if (onPrevItem) onPrevItem();
        }
      }
    }
  };

  return (
    <div
      className="relative w-full h-full select-none"
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
      role="application"
      aria-label="Brie Blind Non-Visual Touch Interface. Two finger tap to speak, single tap to silence, swipe to adjust speed."
    >
      {/* 6. TalkBack & Screen Reader Invisible Coexistence Region */}
      <div
        role="alert"
        aria-live="assertive"
        aria-atomic="true"
        className="sr-only"
        tabIndex={-1}
      >
        {talkBackText}
      </div>

      {children}
    </div>
  );
};
