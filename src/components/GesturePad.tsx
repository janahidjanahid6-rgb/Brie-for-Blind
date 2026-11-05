import React, { useRef, useState } from 'react';
import { sounds } from '../services/soundEffects';
import { haptics } from '../services/haptics';
import { speech } from '../services/speech';
import { Mic, VolumeX, ArrowUp, ArrowDown, ArrowLeft, ArrowRight, ShieldAlert, Sparkles } from 'lucide-react';

interface GesturePadProps {
  onTriggerMic: () => void;
  onStopSpeech: () => void;
  onNextItem: () => void;
  onPrevItem: () => void;
  onReadStatus: () => void;
  onEmergencySOS: () => void;
  speechRate: number;
  isListening: boolean;
}

export const GesturePad: React.FC<GesturePadProps> = ({
  onTriggerMic,
  onStopSpeech,
  onNextItem,
  onPrevItem,
  onReadStatus,
  onEmergencySOS,
  speechRate,
  isListening,
}) => {
  const touchStartRef = useRef<{ x: number; y: number; time: number; touches: number } | null>(null);
  const longPressTimerRef = useRef<any>(null);
  const lastTapRef = useRef<number>(0);
  const [activeGesture, setActiveGesture] = useState<string | null>(null);

  const clearGestureTimeout = useRef<any>(null);
  const showGestureBanner = (name: string) => {
    setActiveGesture(name);
    clearTimeout(clearGestureTimeout.current);
    clearGestureTimeout.current = setTimeout(() => {
      setActiveGesture(null);
    }, 1400);
  };

  const handleTouchStart = (e: React.TouchEvent) => {
    const touch = e.touches[0];
    const touchCount = e.touches.length;

    touchStartRef.current = {
      x: touch.clientX,
      y: touch.clientY,
      time: Date.now(),
      touches: touchCount,
    };

    // Check for Two-finger touch
    if (touchCount >= 2) {
      sounds.playSonarPing();
      haptics.tap();
      showGestureBanner('Two-Finger Tap: Status Briefing');
      onReadStatus();
      return;
    }

    // Start Long-Press detection (1.2 seconds for SOS/Emergency)
    longPressTimerRef.current = setTimeout(() => {
      sounds.playError();
      haptics.emergency();
      showGestureBanner('Long Press: Emergency Action');
      onEmergencySOS();
      touchStartRef.current = null;
    }, 1200);
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (longPressTimerRef.current) {
      clearTimeout(longPressTimerRef.current);
      longPressTimerRef.current = null;
    }

    if (!touchStartRef.current) return;

    const touch = e.changedTouches[0];
    const deltaX = touch.clientX - touchStartRef.current.x;
    const deltaY = touch.clientY - touchStartRef.current.y;
    const elapsed = Date.now() - touchStartRef.current.time;
    const dist = Math.sqrt(deltaX * deltaX + deltaY * deltaY);

    const now = Date.now();
    const isDoubleTap = now - lastTapRef.current < 320;
    lastTapRef.current = now;

    // Minimum swipe threshold
    const SWIPE_THRESHOLD = 50;

    if (dist < 20 && elapsed < 400) {
      // Tap or Double Tap
      if (isDoubleTap) {
        sounds.playEarconStart();
        haptics.listeningStart();
        showGestureBanner('Double Tap: Listening to Voice');
        onTriggerMic();
      } else {
        sounds.playClick();
        haptics.tap();
        showGestureBanner('Single Tap');
      }
    } else if (dist >= SWIPE_THRESHOLD) {
      // Swipes
      if (Math.abs(deltaX) > Math.abs(deltaY)) {
        // Horizontal Swipe
        if (deltaX > 0) {
          sounds.playClick();
          haptics.tap();
          showGestureBanner('Swipe Right: Next Section');
          onNextItem();
        } else {
          sounds.playClick();
          haptics.tap();
          showGestureBanner('Swipe Left: Previous Section');
          onPrevItem();
        }
      } else {
        // Vertical Swipe
        if (deltaY > 0) {
          // Swipe Down
          sounds.playEarconStop();
          haptics.listeningStop();
          showGestureBanner('Swipe Down: Silence / Pause Bri');
          onStopSpeech();
        } else {
          // Swipe Up
          sounds.playSonarPing();
          haptics.tap();
          showGestureBanner('Swipe Up: Phone & Status Briefing');
          onReadStatus();
        }
      }
    }

    touchStartRef.current = null;
  };

  return (
    <div
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
      className={`relative w-full rounded-3xl border-4 transition-all duration-200 select-none cursor-pointer flex flex-col items-center justify-between p-6 sm:p-8 min-h-[320px] sm:min-h-[380px] ${
        isListening
          ? 'bg-yellow-400/10 border-yellow-400 shadow-2xl shadow-yellow-400/20'
          : 'bg-zinc-950 hover:bg-zinc-900 border-zinc-700 hover:border-yellow-400'
      }`}
      aria-label="Tactile Gesture Area for Non-Visual Control. Double tap to talk, swipe down to silence, swipe up for status, long press for emergency."
      role="region"
    >
      {/* Visual Header Inside Pad */}
      <div className="w-full flex items-center justify-between text-yellow-400">
        <div className="flex items-center gap-2">
          <Sparkles className="w-6 h-6 animate-spin text-yellow-400" />
          <span className="font-extrabold tracking-wider text-sm sm:text-base uppercase">
            TACTILE GESTURE SURFACE
          </span>
        </div>
        <span className="text-xs sm:text-sm font-semibold text-zinc-400 bg-zinc-800 px-3 py-1 rounded-full">
          TOUCH ANYWHERE
        </span>
      </div>

      {/* Center Action Target & Status */}
      <div className="flex flex-col items-center justify-center my-auto text-center space-y-4">
        <div
          onClick={(e) => {
            e.stopPropagation();
            onTriggerMic();
          }}
          className={`w-28 h-28 sm:w-36 sm:h-36 rounded-full flex items-center justify-center border-4 transition-all duration-300 ${
            isListening
              ? 'bg-yellow-400 text-black border-yellow-300 scale-110 shadow-lg shadow-yellow-400/50 animate-pulse'
              : 'bg-zinc-900 text-yellow-400 border-yellow-400/60 hover:scale-105 active:scale-95'
          }`}
        >
          <Mic className={`w-14 h-14 sm:w-16 sm:h-16 ${isListening ? 'animate-bounce' : ''}`} />
        </div>

        <div>
          <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
            {isListening ? 'Brie is Listening...' : 'Double-Tap to Talk'}
          </h2>
          <p className="text-sm sm:text-base text-zinc-300 mt-1 max-w-sm">
            Or say <span className="text-yellow-400 font-bold">&quot;Hey Brie&quot;</span> anytime hands-free.
          </p>
        </div>

        {/* Live Gesture Banner Notification */}
        {activeGesture && (
          <div className="px-5 py-2.5 bg-yellow-400 text-black font-extrabold text-sm sm:text-base rounded-xl shadow-lg animate-in fade-in zoom-in duration-150">
            {activeGesture}
          </div>
        )}
      </div>

      {/* Bottom Gesture Quick Reference for Low Vision & Helpers */}
      <div className="w-full grid grid-cols-2 sm:grid-cols-4 gap-2 pt-4 border-t border-zinc-800 text-xs font-semibold text-zinc-300">
        <div className="flex items-center gap-1.5 justify-center py-2 bg-zinc-900/80 rounded-lg">
          <ArrowUp className="w-4 h-4 text-yellow-400" />
          <span>Swipe Up: Status</span>
        </div>
        <div className="flex items-center gap-1.5 justify-center py-2 bg-zinc-900/80 rounded-lg">
          <ArrowDown className="w-4 h-4 text-yellow-400" />
          <span>Swipe Down: Silence</span>
        </div>
        <div className="flex items-center gap-1.5 justify-center py-2 bg-zinc-900/80 rounded-lg">
          <ArrowRight className="w-4 h-4 text-yellow-400" />
          <span>Swipe: Navigate</span>
        </div>
        <div className="flex items-center gap-1.5 justify-center py-2 bg-zinc-900/80 rounded-lg">
          <ShieldAlert className="w-4 h-4 text-red-400" />
          <span>Hold 1.2s: SOS</span>
        </div>
      </div>
    </div>
  );
};
