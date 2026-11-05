import React from 'react';
import { Mic, MicOff, Volume2 } from 'lucide-react';

interface SiriOrbProps {
  isListening: boolean;
  isSpeaking: boolean;
  isThinking?: boolean;
  onToggleListen?: () => void;
  size?: 'sm' | 'md' | 'lg' | 'hero';
  showMicIcon?: boolean;
  className?: string;
  customIconUrl?: string | null;
  isSleeping?: boolean;
}

/**
 * The Signature Brie Chromatic Plasma Orb
 * Multi-layer iridescent glowing sphere with chromatic gradient mesh rotation,
 * ambient outer aura bloom, ripple waves, and specular crystal highlights.
 */
export const SiriOrb: React.FC<SiriOrbProps> = ({
  isListening,
  isSpeaking,
  isThinking = false,
  onToggleListen,
  size = 'hero',
  showMicIcon = true,
  className = '',
  customIconUrl = null,
  isSleeping = false,
}) => {
  // Dimensions mapping
  const sizeMap = {
    sm: {
      wrapper: 'w-16 h-16',
      orb: 'w-12 h-12',
      glow: 'w-20 h-20',
      iconSize: 'w-4 h-4',
    },
    md: {
      wrapper: 'w-28 h-28',
      orb: 'w-20 h-20',
      glow: 'w-36 h-36',
      iconSize: 'w-6 h-6',
    },
    lg: {
      wrapper: 'w-36 h-36',
      orb: 'w-28 h-28',
      glow: 'w-48 h-48',
      iconSize: 'w-8 h-8',
    },
    hero: {
      wrapper: 'w-44 h-44 sm:w-56 sm:h-56',
      orb: 'w-32 h-32 sm:w-40 sm:h-40',
      glow: 'w-60 h-60 sm:w-72 sm:h-72',
      iconSize: 'w-8 h-8 sm:w-10 sm:h-10',
    },
  }[size];

  const stateClass = isThinking
    ? 'animate-siri-rotate-fast'
    : isListening
    ? 'scale-110 animate-siri-rotate'
    : isSpeaking
    ? 'scale-105 animate-siri-breathe'
    : 'animate-siri-counter';

  return (
    <div
      onClick={onToggleListen}
      className={`relative flex items-center justify-center select-none cursor-pointer group ${sizeMap.wrapper} ${className}`}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          onToggleListen?.();
        }
      }}
      aria-label={
        isListening
          ? 'Brie Orb: Currently Listening. Tap or say command to execute.'
          : isSpeaking
          ? 'Brie Orb: Currently Speaking. Tap to interrupt.'
          : 'Brie Orb: Idle. Tap to start listening.'
      }
    >
      {/* 1. Outermost Ambient Chromatic Bloom Glow */}
      <div
        className={`absolute rounded-full transition-all duration-700 ease-out pointer-events-none ${sizeMap.glow} ${
          isListening
            ? 'opacity-95 scale-125 blur-3xl'
            : isSpeaking
            ? 'opacity-85 scale-110 blur-2xl'
            : 'opacity-55 scale-100 blur-xl group-hover:opacity-80'
        }`}
        style={{
          background: isListening
            ? 'radial-gradient(circle, rgba(6, 182, 212, 0.7) 0%, rgba(236, 72, 153, 0.6) 40%, rgba(147, 51, 234, 0.5) 70%, transparent 100%)'
            : isSpeaking
            ? 'radial-gradient(circle, rgba(236, 72, 153, 0.65) 0%, rgba(59, 130, 246, 0.55) 45%, rgba(168, 85, 247, 0.45) 75%, transparent 100%)'
            : 'radial-gradient(circle, rgba(59, 130, 246, 0.5) 0%, rgba(147, 51, 234, 0.4) 50%, rgba(6, 182, 212, 0.25) 80%, transparent 100%)',
        }}
      />

      {/* 2. Concentric Pulsing Sound Wave Ripple Rings (Active when listening or speaking) */}
      {(isListening || isSpeaking) && (
        <>
          <div
            className={`absolute rounded-full border border-cyan-400/60 animate-siri-ripple pointer-events-none ${sizeMap.orb}`}
            style={{ animationDelay: '0s' }}
          />
          <div
            className={`absolute rounded-full border border-pink-500/60 animate-siri-ripple pointer-events-none ${sizeMap.orb}`}
            style={{ animationDelay: '0.6s' }}
          />
          <div
            className={`absolute rounded-full border border-purple-400/50 animate-siri-ripple pointer-events-none ${sizeMap.orb}`}
            style={{ animationDelay: '1.2s' }}
          />
        </>
      )}

      {/* 3. The Main Brie Plasma Sphere Base */}
      <div
        className={`relative rounded-full shadow-2xl overflow-hidden transition-transform duration-500 flex items-center justify-center ${sizeMap.orb} ${stateClass}`}
        style={{
          boxShadow: isListening
            ? '0 0 45px rgba(6, 182, 212, 0.8), 0 0 75px rgba(236, 72, 153, 0.6), inset 0 0 25px rgba(255, 255, 255, 0.6)'
            : isSpeaking
            ? '0 0 40px rgba(236, 72, 153, 0.7), 0 0 60px rgba(147, 51, 234, 0.5), inset 0 0 20px rgba(255, 255, 255, 0.5)'
            : '0 0 25px rgba(59, 130, 246, 0.5), inset 0 0 15px rgba(255, 255, 255, 0.3)',
        }}
      >
        {/* Swirling Conic Gradient Layer A */}
        <div
          className="absolute inset-0 rounded-full animate-siri-rotate"
          style={{
            background:
              'conic-gradient(from 0deg, #00F0FF, #0051FF, #7928CA, #FF0080, #FFB800, #00F0FF)',
            opacity: 0.9,
          }}
        />

        {/* Counter-Swirling Conic Gradient Layer B */}
        <div
          className="absolute inset-0 rounded-full animate-siri-counter"
          style={{
            background:
              'conic-gradient(from 180deg, #FF0080, #7928CA, #00F0FF, #00FF85, #FF0080)',
            opacity: 0.75,
            mixBlendMode: 'color-dodge',
          }}
        />

        {/* Inner Fluid Plasma Spherical Mask */}
        <div
          className="absolute inset-0 rounded-full"
          style={{
            background:
              'radial-gradient(circle at 35% 30%, rgba(255, 255, 255, 0.8) 0%, rgba(6, 182, 212, 0.4) 30%, rgba(147, 51, 234, 0.6) 65%, rgba(0, 0, 0, 0.85) 100%)',
            mixBlendMode: 'overlay',
          }}
        />

        {/* Core Luminous Nucleus (Pulses with Voice) */}
        <div
          className={`absolute rounded-full bg-white transition-all duration-300 ${
            isListening
              ? 'w-10 h-10 sm:w-14 sm:h-14 opacity-90 blur-sm scale-110'
              : isSpeaking
              ? 'w-8 h-8 sm:w-12 sm:h-12 opacity-80 blur-xs scale-105'
              : 'w-6 h-6 sm:w-8 sm:h-8 opacity-60 blur-xs'
          }`}
          style={{
            boxShadow: '0 0 25px #ffffff, 0 0 45px #00F0FF',
          }}
        />

        {/* Top-Left Specular Glass Highlight (Apple Glass Aesthetic) */}
        <div
          className="absolute top-1 left-2 sm:top-2 sm:left-3 w-1/2 h-1/3 rounded-full pointer-events-none"
          style={{
            background:
              'linear-gradient(135deg, rgba(255, 255, 255, 0.75) 0%, rgba(255, 255, 255, 0) 80%)',
            filter: 'blur(1px)',
            transform: 'rotate(-20deg)',
          }}
        />

        {/* Center Glyphs (Mic / Speaker / Custom Uploaded Drawable) */}
        {customIconUrl ? (
          <div className="relative z-10 flex items-center justify-center p-2">
            <img
              src={customIconUrl}
              alt={isSleeping ? 'Brie Sleeping Drawable' : 'Brie Active Drawable'}
              className={`${sizeMap.iconSize} object-contain ${
                isSleeping ? 'opacity-70 filter grayscale' : 'animate-pulse drop-shadow-[0_0_8px_rgba(16,185,129,0.8)]'
              }`}
            />
          </div>
        ) : (
          showMicIcon && (
            <div className="relative z-10 text-white drop-shadow-md">
              {isListening ? (
                <MicOff className={`${sizeMap.iconSize} text-white animate-pulse`} />
              ) : isSpeaking ? (
                <Volume2 className={`${sizeMap.iconSize} text-white animate-bounce`} />
              ) : (
                <Mic className={`${sizeMap.iconSize} text-white/90 group-hover:scale-110 transition-transform`} />
              )}
            </div>
          )
        )}
      </div>

      {/* Floating Status Ring Badge */}
      <div
        className={`absolute -bottom-2 sm:-bottom-3 px-3 py-1 rounded-full text-[10px] sm:text-xs font-black tracking-wider uppercase backdrop-blur-xl border shadow-lg transition-all ${
          isSleeping
            ? 'bg-zinc-800/80 text-zinc-300 border-zinc-600 shadow-zinc-900/40'
            : isListening
            ? 'bg-cyan-500/30 text-cyan-200 border-cyan-400/60 shadow-cyan-500/30 animate-pulse'
            : isSpeaking
            ? 'bg-pink-500/30 text-pink-200 border-pink-400/60 shadow-pink-500/30'
            : 'bg-black/60 text-slate-300 border-white/20'
        }`}
      >
        {isSleeping ? 'Sleeping (Ghost)' : isListening ? 'Listening…' : isSpeaking ? 'Speaking…' : 'Tap to Speak'}
      </div>
    </div>
  );
};
