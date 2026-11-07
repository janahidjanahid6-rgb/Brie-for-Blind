import React, { useState, useEffect } from 'react';
import { Volume2, VolumeX, RotateCcw, X, Mic, Sparkles } from 'lucide-react';

interface SiriTransientPillProps {
  isListening: boolean;
  isSpeaking: boolean;
  isBrieActive: boolean;
  spokenTranscript: string;
  lastBriReply: string;
  userName: string;
  onToggleListen: () => void;
  onRepeatSpeech: () => void;
  onStopSpeech: () => void;
  className?: string;
}

/**
 * Authentic Siri / Dynamic Island Floating Transient Pill:
 * - Floats gracefully over the interface with Apple-grade frosted glass (backdrop-blur-3xl).
 * - Compact pill when idle: gentle glowing capsule.
 * - Expands automatically into a sleek floating card when listening or speaking.
 * - Displays real-time voice transcription and Brie's spoken reply in clean typography.
 * - Features mini audio wave bars, repeat button, mute button, and auto-contracts when quiet.
 */
export const SiriTransientPill: React.FC<SiriTransientPillProps> = ({
  isListening,
  isSpeaking,
  isBrieActive,
  spokenTranscript,
  lastBriReply,
  userName,
  onToggleListen,
  onRepeatSpeech,
  onStopSpeech,
  className = '',
}) => {
  const [isManuallyDismissed, setIsManuallyDismissed] = useState(false);
  const [hasRecentActivity, setHasRecentActivity] = useState(false);

  // Track recent activity for transient auto-contracting
  useEffect(() => {
    if (isListening || isSpeaking) {
      setIsManuallyDismissed(false);
      setHasRecentActivity(true);
    } else if (hasRecentActivity) {
      // Auto-contract back to compact pill after 7 seconds of inactivity
      const timer = setTimeout(() => {
        setHasRecentActivity(false);
      }, 7000);
      return () => clearTimeout(timer);
    }
  }, [isListening, isSpeaking, hasRecentActivity]);

  const isExpanded = (isListening || isSpeaking || hasRecentActivity) && !isManuallyDismissed;

  return (
    <div
      className={`fixed bottom-4 sm:bottom-6 left-1/2 -translate-x-1/2 z-40 w-[92%] max-w-lg transition-all duration-500 ease-out select-none ${className}`}
    >
      {isExpanded ? (
        /* EXPANDED TRANSIENT CARD (Apple Dynamic Island / Siri Expanded State) */
        <div
          role="region"
          aria-live="polite"
          className="relative w-full rounded-3xl p-4 sm:p-5 backdrop-blur-3xl bg-black/85 border border-white/20 shadow-[0_20px_50px_rgba(0,0,0,0.9),0_0_35px_rgba(0,255,136,0.25)] flex flex-col gap-3 transition-all duration-500 overflow-hidden"
        >
          {/* Top Glass Specular Shine */}
          <div
            className="absolute inset-x-0 top-0 h-1/2 pointer-events-none rounded-t-3xl"
            style={{
              background:
                'linear-gradient(180deg, rgba(255,255,255,0.25) 0%, rgba(255,255,255,0.03) 60%, transparent 100%)',
            }}
          />

          {/* Card Top Row: State Pill + Audio Waveform + Dismiss Button */}
          <div className="flex items-center justify-between gap-2 z-10">
            <div className="flex items-center gap-2">
              {/* Dynamic Animated Status Indicator */}
              <div
                className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-black tracking-wider uppercase border transition-all ${
                  isSpeaking
                    ? 'bg-emerald-950/90 text-[#00FF88] border-[#00FF88]/60 shadow-[0_0_12px_rgba(0,255,136,0.4)]'
                    : isListening
                    ? 'bg-emerald-950/90 text-[#00FF88] border-[#00FF88]/60 animate-pulse'
                    : 'bg-zinc-900/90 text-zinc-300 border-zinc-700'
                }`}
              >
                <span
                  className={`w-2 h-2 rounded-full ${
                    isSpeaking
                      ? 'bg-[#00FF88] animate-ping'
                      : isListening
                      ? 'bg-[#00FF88] animate-pulse'
                      : 'bg-zinc-400'
                  }`}
                />
                <span>{isSpeaking ? 'Brie Speaking' : isListening ? 'Listening' : 'Brie Active'}</span>
              </div>

              {/* Animated Mini Audio Wave Bars */}
              {(isSpeaking || isListening) && (
                <div className="flex items-center gap-1 px-1.5 h-4">
                  <span className="w-1 bg-[#00FF88] rounded-full animate-wave-bar-1" />
                  <span className="w-1 bg-[#00FF88] rounded-full animate-wave-bar-2" />
                  <span className="w-1 bg-[#00FF88] rounded-full animate-wave-bar-3" />
                  <span className="w-1 bg-[#00FF88] rounded-full animate-wave-bar-4" />
                </div>
              )}
            </div>

            {/* Controls: Repeat, Mute, Dismiss */}
            <div className="flex items-center gap-1.5">
              {isSpeaking && (
                <button
                  type="button"
                  onClick={onStopSpeech}
                  title="Pause Brie"
                  aria-label="Pause Brie"
                  className="p-1.5 rounded-full bg-white/5 hover:bg-white/15 text-zinc-300 hover:text-white border border-white/10 transition-colors"
                >
                  <VolumeX className="w-3.5 h-3.5" />
                </button>
              )}
              {!isSpeaking && lastBriReply && (
                <button
                  type="button"
                  onClick={onRepeatSpeech}
                  title="Repeat reply out loud"
                  aria-label="Repeat reply out loud"
                  className="p-1.5 rounded-full bg-white/5 hover:bg-white/15 text-[#00FF88] hover:text-[#55FFAA] border border-white/10 transition-colors"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                </button>
              )}
              <button
                type="button"
                onClick={() => setIsManuallyDismissed(true)}
                title="Dismiss pill"
                aria-label="Dismiss pill"
                className="p-1.5 rounded-full bg-white/5 hover:bg-white/15 text-zinc-400 hover:text-white border border-white/10 transition-colors"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* Transcript / Spoken Output Display */}
          <div className="z-10 space-y-1">
            {isListening && spokenTranscript ? (
              <p className="text-sm sm:text-base font-semibold text-zinc-300 italic tracking-wide">
                &ldquo;{spokenTranscript}&rdquo;
              </p>
            ) : isListening ? (
              <p className="text-sm sm:text-base font-medium text-emerald-300/80">
                Listening to your voice, {userName}…
              </p>
            ) : (
              <p className="text-sm sm:text-base font-semibold text-white tracking-wide leading-relaxed drop-shadow-[0_1px_4px_rgba(0,0,0,0.8)]">
                {lastBriReply}
              </p>
            )}
          </div>
        </div>
      ) : (
        /* COMPACT FLOATING PILL (Apple Dynamic Island Standby State) */
        <button
          type="button"
          onClick={() => {
            setIsManuallyDismissed(false);
            onToggleListen();
          }}
          className="group mx-auto flex items-center justify-between gap-3 px-4 sm:px-5 py-2.5 rounded-full backdrop-blur-3xl bg-black/80 hover:bg-black/95 border border-white/15 hover:border-[#00FF88]/60 shadow-[0_10px_35px_rgba(0,0,0,0.8),0_0_20px_rgba(0,255,136,0.2)] transition-all duration-300 cursor-pointer active:scale-95"
          title="Tap to speak with Brie"
          aria-label="Tap to speak with Brie"
        >
          <div className="flex items-center gap-2.5">
            {/* Luminous Green Pulse Dot */}
            <span
              className={`w-2.5 h-2.5 rounded-full ${
                isBrieActive ? 'bg-[#00FF88] shadow-[0_0_8px_#00FF88] animate-pulse' : 'bg-zinc-600'
              }`}
            />
            <span className="text-xs sm:text-sm font-bold text-white tracking-wider">
              {isBrieActive ? `Brie is here, ${userName}` : 'Brie Sleeping'}
            </span>
          </div>

          <div className="flex items-center gap-1.5 text-xs font-semibold text-[#00FF88] group-hover:text-[#55FFAA]">
            <Mic className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Tap to Talk</span>
          </div>
        </button>
      )}
    </div>
  );
};
