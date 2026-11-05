import React from 'react';
import { SiriOrb } from './SiriOrb';
import { SiriWaveform } from './SiriWaveform';
import {
  Volume2,
  VolumeX,
  Sparkles,
  ShieldCheck,
  ShieldAlert,
  Brain,
  X,
  Maximize2,
  Minimize2,
} from 'lucide-react';
import { VoiceSpeakerType } from '../types';

interface SiriFloatingHUDProps {
  isListening: boolean;
  isSpeaking: boolean;
  lastReply: string;
  transcript: string;
  onToggleListen: () => void;
  onRepeatSpeech: () => void;
  onStopSpeech: () => void;
  onQuickCommand: (command: string) => void;
  speaker: VoiceSpeakerType;
  voiceSimilarity: number;
  onOpenReasoning?: () => void;
  wakeWord: string;
}

/**
 * Modern Glassmorphic Floating HUD for Brie
 * Features the signature Brie Orb, animated sinusoidal waveform ribbons,
 * frosted obsidian blur, and suggestion chips.
 */
export const SiriFloatingHUD: React.FC<SiriFloatingHUDProps> = ({
  isListening,
  isSpeaking,
  lastReply,
  transcript,
  onToggleListen,
  onRepeatSpeech,
  onStopSpeech,
  onQuickCommand,
  speaker,
  voiceSimilarity,
  onOpenReasoning,
  wakeWord,
}) => {
  const isOwner = voiceSimilarity >= 85;

  const suggestions = [
    'Brie, read my last message and reply I am coming',
    'Call Sarah on speakerphone',
    'Download Spotify from Play Store',
    'Turn on living room lights',
    'Set thermostat to 72 degrees',
    'What time is it and how is battery?',
  ];

  return (
    <section
      className="relative w-full rounded-3xl overflow-hidden border border-white/15 bg-gradient-to-b from-zinc-900/90 via-black/95 to-black shadow-2xl backdrop-blur-2xl p-6 sm:p-8 space-y-6"
      style={{
        boxShadow: isListening
          ? '0 0 50px rgba(6, 182, 212, 0.25), 0 20px 40px rgba(0, 0, 0, 0.8)'
          : '0 20px 50px rgba(0, 0, 0, 0.8)',
      }}
      aria-label="Brie for Blind Interface"
    >
      {/* Subtle Apple-style top ambient glow line */}
      <div
        className="absolute top-0 left-1/4 right-1/4 h-[2px] opacity-80"
        style={{
          background:
            'linear-gradient(90deg, transparent, #06b6d4, #ec4899, #a855f7, transparent)',
        }}
      />

      {/* Top Header: Security Pill & Status */}
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <div className="flex items-center gap-2">
          <div
            className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-black tracking-wide border ${
              isOwner
                ? 'bg-emerald-950/80 text-emerald-300 border-emerald-500/40 shadow-sm shadow-emerald-500/20'
                : 'bg-amber-950/80 text-amber-300 border-amber-500/40'
            }`}
          >
            {isOwner ? (
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
            ) : (
              <ShieldAlert className="w-3.5 h-3.5 text-amber-400" />
            )}
            <span>
              {isOwner
                ? `Owner Voice (${voiceSimilarity}%)`
                : `Guest Mode (${voiceSimilarity}%)`}
            </span>
          </div>

          <div className="text-[11px] font-mono text-zinc-400">
            Wake phrase: <span className="text-cyan-300 font-bold">&ldquo;{wakeWord}&rdquo;</span>
          </div>
        </div>

        {onOpenReasoning && (
          <button
            onClick={onOpenReasoning}
            className="flex items-center gap-1.5 px-3 py-1 bg-white/5 hover:bg-white/10 text-cyan-300 rounded-full text-xs font-bold border border-white/10 transition-colors"
            title="Inspect Brie 4-Step Human Reasoning"
          >
            <Brain className="w-3.5 h-3.5 text-cyan-400" />
            <span>Reasoning</span>
          </button>
        )}
      </div>

      {/* Main Center Stage: The Iconic Brie Orb */}
      <div className="flex flex-col items-center justify-center pt-2 pb-1 space-y-4">
        <SiriOrb
          isListening={isListening}
          isSpeaking={isSpeaking}
          onToggleListen={onToggleListen}
          size="hero"
        />

        {/* Dynamic Sinusoidal Brie Waveform */}
        <div className="w-full max-w-xl mx-auto -mt-2">
          <SiriWaveform isListening={isListening} isSpeaking={isSpeaking} height={60} />
        </div>
      </div>

      {/* Spoken Response Glass Bubble */}
      <div className="p-5 sm:p-6 rounded-2xl bg-white/[0.04] border border-white/10 backdrop-blur-xl space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-cyan-400 animate-pulse" />
            <span className="text-xs font-extrabold uppercase tracking-widest text-cyan-300">
              Brie Voice Assistant
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={onRepeatSpeech}
              className="p-2 rounded-xl bg-white/5 hover:bg-white/10 text-white/90 border border-white/10 transition-colors"
              title="Repeat response aloud"
              aria-label="Repeat response aloud"
            >
              <Volume2 className="w-4 h-4 text-cyan-300" />
            </button>
            <button
              onClick={onStopSpeech}
              className="p-2 rounded-xl bg-white/5 hover:bg-white/10 text-white/70 hover:text-white border border-white/10 transition-colors"
              title="Stop audio"
              aria-label="Stop audio"
            >
              <VolumeX className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* The Text Spoken by Brie */}
        <p className="text-xl sm:text-2xl font-bold text-white tracking-tight leading-snug">
          &ldquo;{lastReply}&rdquo;
        </p>

        {/* Live User Transcript */}
        {transcript && (
          <div className="p-3 rounded-xl bg-black/60 border border-white/10 text-xs sm:text-sm font-mono text-zinc-300 flex items-center gap-2">
            <span className="text-pink-400 font-bold shrink-0">Heard:</span>
            <span className="truncate">&ldquo;{transcript}&rdquo;</span>
          </div>
        )}
      </div>

      {/* Brie Quick Suggestion Chips */}
      <div className="space-y-2">
        <div className="flex items-center gap-1.5 text-xs font-bold text-zinc-400">
          <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
          <span>Brie Suggestions (say aloud or tap):</span>
        </div>

        <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none text-xs">
          {suggestions.map((cmd) => (
            <button
              key={cmd}
              onClick={() => onQuickCommand(cmd)}
              className="px-4 py-2.5 rounded-2xl bg-white/[0.06] hover:bg-white/[0.12] text-white border border-white/10 whitespace-nowrap active:scale-95 transition-all font-medium flex items-center gap-2 group shadow-sm"
            >
              <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 group-hover:scale-125 transition-transform" />
              <span>&ldquo;{cmd}&rdquo;</span>
            </button>
          ))}
        </div>
      </div>
    </section>
  );
};
