import React from 'react';
import { Power, Moon, Mic, Volume2, Sparkles, ShieldCheck } from 'lucide-react';
import { sounds } from '../services/soundEffects';
import { haptics } from '../services/haptics';

interface VoiceActivationStatusHUDProps {
  isBrieActive: boolean;
  isListening: boolean;
  isSpeaking: boolean;
  userName: string;
  transcript: string;
  onActivate: () => void;
  onDeactivate: () => void;
}

export const VoiceActivationStatusHUD: React.FC<VoiceActivationStatusHUDProps> = ({
  isBrieActive,
  isListening,
  isSpeaking,
  userName,
  transcript,
  onActivate,
  onDeactivate,
}) => {
  return (
    <section
      aria-label="Voice Activation Choice: ACTIVATE and DEACTIVATE"
      className="rounded-3xl border-2 border-white/10 bg-black/80 backdrop-blur-2xl p-5 sm:p-7 shadow-2xl space-y-5"
    >
      {/* Top Banner explaining the two choices */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-white/10 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-cyan-400 animate-ping" />
            <h2 className="text-lg sm:text-xl font-black text-white tracking-wide uppercase">
              Voice Choice • Two Words Only
            </h2>
          </div>
          <p className="text-xs sm:text-sm text-zinc-300 font-semibold mt-1">
            Say <span className="text-emerald-400 font-black">&ldquo;ACTIVATE&rdquo;</span> or{' '}
            <span className="text-rose-400 font-black">&ldquo;DEACTIVATE&rdquo;</span>. No one needs to tap the screen — just speak!
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-[11px] px-3 py-1 rounded-full font-bold uppercase tracking-wider bg-zinc-900 border border-zinc-700 text-zinc-300">
            Android &amp; iPhone • Built for Blind
          </span>
        </div>
      </div>

      {/* The Two Words: ACTIVATE & DEACTIVATE */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
        {/* WORD 1: ACTIVATE */}
        <div
          onClick={() => {
            sounds.playClick();
            haptics.tap();
            onActivate();
          }}
          className={`relative flex flex-col justify-between p-6 sm:p-8 rounded-2xl border-4 transition-all cursor-pointer ${
            isBrieActive
              ? 'bg-emerald-950/60 border-emerald-400 shadow-xl shadow-emerald-500/20 ring-4 ring-emerald-500/30'
              : 'bg-zinc-950/70 border-zinc-800 hover:border-emerald-500/50 opacity-60 hover:opacity-90'
          }`}
          role="button"
          tabIndex={0}
          aria-pressed={isBrieActive}
          aria-label="ACTIVATE. Say Activate aloud or tap to wake Brie."
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div
                className={`w-12 h-12 rounded-2xl flex items-center justify-center border-2 ${
                  isBrieActive
                    ? 'bg-emerald-500/30 border-emerald-400 text-emerald-300'
                    : 'bg-zinc-900 border-zinc-700 text-zinc-500'
                }`}
              >
                <Power className="w-6 h-6" />
              </div>
              <span className="text-xs font-mono uppercase tracking-widest text-emerald-400 font-bold">
                Voice Choice 1
              </span>
            </div>

            {isBrieActive ? (
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/20 border border-emerald-400 text-emerald-300 text-xs font-black uppercase tracking-wider animate-pulse">
                <span className="w-2 h-2 rounded-full bg-emerald-400" />
                ACTIVE • FOLLOWING ORDERS
              </span>
            ) : (
              <span className="text-xs text-zinc-500 font-semibold">Say &ldquo;ACTIVATE&rdquo; to wake</span>
            )}
          </div>

          <div className="my-4">
            <h3 className="text-3xl sm:text-5xl font-black text-emerald-400 tracking-tight">
              ACTIVATE
            </h3>
            <p className="text-sm sm:text-base text-zinc-200 font-medium mt-1">
              Brie is awake, listening continuously, and executing all orders hands-free.
            </p>
          </div>

          <div className="text-[11px] font-mono text-emerald-300/80 bg-black/40 rounded-xl px-3 py-2 border border-emerald-500/20">
            Voice command: <span className="font-bold text-white">&ldquo;ACTIVATE&rdquo;</span> or <span className="font-bold text-white">&ldquo;Hey Brie&rdquo;</span>
          </div>
        </div>

        {/* WORD 2: DEACTIVATE */}
        <div
          onClick={() => {
            sounds.playClick();
            haptics.tap();
            onDeactivate();
          }}
          className={`relative flex flex-col justify-between p-6 sm:p-8 rounded-2xl border-4 transition-all cursor-pointer ${
            !isBrieActive
              ? 'bg-rose-950/60 border-rose-400 shadow-xl shadow-rose-500/20 ring-4 ring-rose-500/30'
              : 'bg-zinc-950/70 border-zinc-800 hover:border-rose-500/50 opacity-60 hover:opacity-90'
          }`}
          role="button"
          tabIndex={0}
          aria-pressed={!isBrieActive}
          aria-label="DEACTIVATE. Say Deactivate aloud or tap to put Brie to sleep."
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div
                className={`w-12 h-12 rounded-2xl flex items-center justify-center border-2 ${
                  !isBrieActive
                    ? 'bg-rose-500/30 border-rose-400 text-rose-300'
                    : 'bg-zinc-900 border-zinc-700 text-zinc-500'
                }`}
              >
                <Moon className="w-6 h-6" />
              </div>
              <span className="text-xs font-mono uppercase tracking-widest text-rose-400 font-bold">
                Voice Choice 2
              </span>
            </div>

            {!isBrieActive ? (
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-rose-500/20 border border-rose-400 text-rose-300 text-xs font-black uppercase tracking-wider">
                <span className="w-2 h-2 rounded-full bg-rose-400" />
                DEACTIVATED • PHONE NORMAL
              </span>
            ) : (
              <span className="text-xs text-zinc-500 font-semibold">Say &ldquo;DEACTIVATE&rdquo; to sleep</span>
            )}
          </div>

          <div className="my-4">
            <h3 className="text-3xl sm:text-5xl font-black text-rose-400 tracking-tight">
              DEACTIVATE
            </h3>
            <p className="text-sm sm:text-base text-zinc-200 font-medium mt-1">
              Brie leaves like a ghost. Phone is quiet and returns to ordinary usage.
            </p>
          </div>

          <div className="text-[11px] font-mono text-rose-300/80 bg-black/40 rounded-xl px-3 py-2 border border-rose-500/20">
            Voice command: <span className="font-bold text-white">&ldquo;DEACTIVATE&rdquo;</span> or <span className="font-bold text-white">&ldquo;Brie sleep&rdquo;</span>
          </div>
        </div>
      </div>

      {/* Real-time Hands-Free Voice Status Banner */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 p-4 rounded-2xl bg-zinc-950 border border-white/10 text-xs sm:text-sm font-semibold">
        <div className="flex items-center gap-3 w-full sm:w-auto">
          {isListening ? (
            <div className="flex items-center gap-2 text-cyan-300 font-bold animate-pulse">
              <Mic className="w-4 h-4 text-cyan-400 animate-bounce" />
              <span>Brie is listening for your command right now...</span>
            </div>
          ) : isSpeaking ? (
            <div className="flex items-center gap-2 text-pink-300 font-bold">
              <Volume2 className="w-4 h-4 text-pink-400 animate-pulse" />
              <span>Brie is speaking to {userName}...</span>
            </div>
          ) : isBrieActive ? (
            <div className="flex items-center gap-2 text-emerald-300">
              <Sparkles className="w-4 h-4 text-emerald-400" />
              <span>Ready for commands. Just speak naturally.</span>
            </div>
          ) : (
            <div className="flex items-center gap-2 text-zinc-400">
              <Moon className="w-4 h-4 text-zinc-500" />
              <span>Brie is asleep. Say &ldquo;ACTIVATE&rdquo; to wake her up.</span>
            </div>
          )}
        </div>

        {transcript && (
          <div className="text-xs font-mono text-zinc-300 bg-black/60 px-3 py-1.5 rounded-xl border border-white/10 max-w-md truncate">
            <span className="text-cyan-400 font-bold mr-1.5">Heard:</span>
            &ldquo;{transcript}&rdquo;
          </div>
        )}
      </div>
    </section>
  );
};
