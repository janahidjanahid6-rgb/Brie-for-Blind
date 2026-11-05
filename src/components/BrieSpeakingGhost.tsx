import React from 'react';

interface BrieSpeakingGhostProps {
  isListening: boolean;
  isSpeaking: boolean;
  isBrieActive?: boolean;
  onToggleListen?: () => void;
  size?: 'sm' | 'md' | 'lg' | 'hero';
  className?: string;
}

/**
 * The Speaking Green Ghost with Microphone Inside & Bouncing Waves:
 * - Glowing neon green ghost on pure black background.
 * - Big shiny black eyes, smiling wide and open laughing/talking mouth.
 * - Soft round ghost body with wavy sheet bottom.
 * - Crisp luminous MICROPHONE inside the ghost's body.
 * - Green sound waves on left and right that BOUNCE and move dynamically when she speaks (no rainbow, all pure neon green).
 */
export const BrieSpeakingGhost: React.FC<BrieSpeakingGhostProps> = ({
  isListening,
  isSpeaking,
  isBrieActive = true,
  onToggleListen,
  size = 'hero',
  className = '',
}) => {
  const sizeMap = {
    sm: { wrapper: 'w-24 h-24', svg: 96 },
    md: { wrapper: 'w-36 h-36 sm:w-44 sm:h-44', svg: 160 },
    lg: { wrapper: 'w-48 h-48 sm:w-56 sm:h-56', svg: 210 },
    hero: { wrapper: 'w-56 h-56 sm:w-64 sm:h-64', svg: 240 },
  }[size];

  return (
    <div
      onClick={onToggleListen}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          onToggleListen?.();
        }
      }}
      title={
        isSpeaking
          ? 'Brie is speaking. Tap to pause.'
          : isListening
          ? 'Brie is listening to you. Tap to finish.'
          : 'Tap to speak with Brie'
      }
      aria-label={
        isSpeaking
          ? 'Brie is speaking. Tap to pause.'
          : isListening
          ? 'Brie is listening. Tap to finish.'
          : 'Tap to speak with Brie'
      }
      className={`relative flex flex-col items-center justify-center select-none cursor-pointer group ${sizeMap.wrapper} ${className}`}
    >
      {/* Outer Ambient Neon Green Bloom Glow */}
      <div
        className={`absolute rounded-full transition-all duration-700 ease-out pointer-events-none w-48 h-48 sm:w-60 sm:h-60 ${
          isSpeaking
            ? 'opacity-90 scale-125 blur-3xl'
            : isListening
            ? 'opacity-85 scale-115 blur-2xl'
            : isBrieActive
            ? 'opacity-50 scale-100 blur-xl group-hover:opacity-75'
            : 'opacity-20 scale-90 blur-lg'
        }`}
        style={{
          background: isSpeaking
            ? 'radial-gradient(circle, rgba(0, 255, 136, 0.75) 0%, rgba(16, 185, 129, 0.5) 45%, rgba(5, 150, 105, 0.25) 70%, transparent 100%)'
            : isListening
            ? 'radial-gradient(circle, rgba(0, 255, 136, 0.65) 0%, rgba(34, 197, 94, 0.45) 50%, transparent 80%)'
            : 'radial-gradient(circle, rgba(0, 255, 136, 0.35) 0%, rgba(16, 185, 129, 0.2) 60%, transparent 85%)',
        }}
      />

      <svg
        viewBox="0 0 160 160"
        className="w-full h-full overflow-visible z-10"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          {/* Intense Neon Green Glow Filter */}
          <filter id="speakingGhostGlow" x="-40%" y="-40%" width="180%" height="180%">
            <feGaussianBlur stdDeviation="3.5" result="blur1" />
            <feGaussianBlur stdDeviation="7" result="blur2" />
            <feMerge>
              <feMergeNode in="blur2" />
              <feMergeNode in="blur1" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>

          {/* Sound Wave Neon Glow */}
          <filter id="speakingWaveGlow" x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur stdDeviation="3" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>

          {/* Pure Bright Neon Green Gradient for Ghost Body */}
          <linearGradient id="speakingGhostBodyGrad" x1="50%" y1="0%" x2="50%" y2="100%">
            <stop offset="0%" stopColor="#73FFBA" />
            <stop offset="35%" stopColor="#00FF88" />
            <stop offset="85%" stopColor="#00D270" />
            <stop offset="100%" stopColor="#00A855" />
          </linearGradient>

          {/* Neon Microphone Inside Gradient */}
          <linearGradient id="innerMicGrad" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#FFFFFF" />
            <stop offset="50%" stopColor="#E6FFFA" />
            <stop offset="100%" stopColor="#00FF88" />
          </linearGradient>

          {/* Mouth Tongue Gradient */}
          <linearGradient id="speakingMouthTongueGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#FF7A95" />
            <stop offset="100%" stopColor="#FF3366" />
          </linearGradient>
        </defs>

        {/* ============================================================ */}
        {/* LEFT SOUND WAVES (Pure Neon Green, Bouncing when Speaking) */}
        {/* ============================================================ */}
        <g
          filter="url(#speakingWaveGlow)"
          className={`transition-all duration-300 ${
            isSpeaking
              ? 'opacity-100'
              : isListening
              ? 'opacity-90 animate-pulse'
              : isBrieActive
              ? 'opacity-65'
              : 'opacity-25'
          }`}
        >
          {/* Wave 1 (Inner Left) */}
          <path
            d="M 40 60 A 24 24 0 0 0 40 100"
            stroke="#00FF88"
            strokeWidth={isSpeaking ? 4.5 : 3}
            strokeLinecap="round"
            className={isSpeaking ? 'animate-speaking-wave-l1' : ''}
          />
          {/* Wave 2 (Middle Left) */}
          <path
            d="M 30 50 A 35 35 0 0 0 30 110"
            stroke="#00FF88"
            strokeWidth={isSpeaking ? 4.5 : 3}
            strokeLinecap="round"
            className={isSpeaking ? 'animate-speaking-wave-l2' : ''}
          />
          {/* Wave 3 (Outer Left) */}
          <path
            d="M 20 40 A 46 46 0 0 0 20 120"
            stroke="#55FFAA"
            strokeWidth={isSpeaking ? 4 : 2.5}
            strokeLinecap="round"
            className={isSpeaking ? 'animate-speaking-wave-l3' : ''}
          />
        </g>

        {/* ============================================================ */}
        {/* RIGHT SOUND WAVES (Pure Neon Green, Bouncing when Speaking) */}
        {/* ============================================================ */}
        <g
          filter="url(#speakingWaveGlow)"
          className={`transition-all duration-300 ${
            isSpeaking
              ? 'opacity-100'
              : isListening
              ? 'opacity-90 animate-pulse'
              : isBrieActive
              ? 'opacity-65'
              : 'opacity-25'
          }`}
        >
          {/* Wave 1 (Inner Right) */}
          <path
            d="M 120 60 A 24 24 0 0 1 120 100"
            stroke="#00FF88"
            strokeWidth={isSpeaking ? 4.5 : 3}
            strokeLinecap="round"
            className={isSpeaking ? 'animate-speaking-wave-r1' : ''}
          />
          {/* Wave 2 (Middle Right) */}
          <path
            d="M 130 50 A 35 35 0 0 1 130 110"
            stroke="#00FF88"
            strokeWidth={isSpeaking ? 4.5 : 3}
            strokeLinecap="round"
            className={isSpeaking ? 'animate-speaking-wave-r2' : ''}
          />
          {/* Wave 3 (Outer Right) */}
          <path
            d="M 140 40 A 46 46 0 0 1 140 120"
            stroke="#55FFAA"
            strokeWidth={isSpeaking ? 4 : 2.5}
            strokeLinecap="round"
            className={isSpeaking ? 'animate-speaking-wave-r3' : ''}
          />
        </g>

        {/* ============================================================ */}
        {/* GHOST BODY (Bounces When Speaking!) */}
        {/* ============================================================ */}
        <g
          className={`origin-bottom transition-all duration-300 ${
            isSpeaking
              ? 'animate-speaking-ghost-bounce'
              : isListening
              ? 'animate-ghost-float scale-105'
              : isBrieActive
              ? 'animate-ghost-float'
              : 'opacity-50 scale-95'
          }`}
        >
          {/* Outer White-Green Glowing Outline Aura */}
          <path
            d="M 80 28 C 58 28 50 48 50 72 C 50 92 48 112 44 120 C 47 124 53 124 58 120 C 64 114 69 117 72 121 C 75 125 85 125 88 121 C 91 117 96 114 102 120 C 107 124 113 124 116 120 C 112 112 110 92 110 72 C 110 48 102 28 80 28 Z"
            fill="none"
            stroke="#EAFFF5"
            strokeWidth="6"
            strokeLinejoin="round"
            filter="url(#speakingGhostGlow)"
            opacity={isBrieActive ? 0.95 : 0.4}
          />

          {/* Solid Neon Green Ghost Body */}
          <path
            d="M 80 28 C 58 28 50 48 50 72 C 50 92 48 112 44 120 C 47 124 53 124 58 120 C 64 114 69 117 72 121 C 75 125 85 125 88 121 C 91 117 96 114 102 120 C 107 124 113 124 116 120 C 112 112 110 92 110 72 C 110 48 102 28 80 28 Z"
            fill="url(#speakingGhostBodyGrad)"
            stroke="#FFFFFF"
            strokeWidth="2.5"
            strokeLinejoin="round"
          />

          {/* Glassy Head 3D Specular Highlight */}
          <ellipse
            cx="70"
            cy="38"
            rx="8"
            ry="4"
            transform="rotate(-25 70 38)"
            fill="#FFFFFF"
            opacity="0.65"
          />

          {/* ============================================================ */}
          {/* FACE: Big Shiny Black Eyes with Sparkling White Catchlights */}
          {/* ============================================================ */}
          {/* Left Eye */}
          <g>
            <ellipse cx="67" cy="62" rx="7.5" ry="9.5" fill="#0A0A0A" />
            <circle cx="64.5" cy="59" r="3.2" fill="#FFFFFF" />
            <circle cx="70" cy="66" r="1.7" fill="#FFFFFF" />
          </g>

          {/* Right Eye */}
          <g>
            <ellipse cx="93" cy="62" rx="7.5" ry="9.5" fill="#0A0A0A" />
            <circle cx="90.5" cy="59" r="3.2" fill="#FFFFFF" />
            <circle cx="96" cy="66" r="1.7" fill="#FFFFFF" />
          </g>

          {/* Rosy Cheeks */}
          <ellipse cx="59" cy="72" rx="4" ry="2.5" fill="#FF8DA1" opacity="0.45" />
          <ellipse cx="101" cy="72" rx="4" ry="2.5" fill="#FF8DA1" opacity="0.45" />

          {/* ============================================================ */}
          {/* MOUTH: Wide Open Happy Smiling/Laughing Mouth */}
          {/* ============================================================ */}
          {isSpeaking ? (
            /* Animated talking open mouth */
            <g className="animate-talking-mouth origin-center">
              <path
                d="M 68 77 Q 80 74 92 77 Q 94 92 80 94 Q 66 92 68 77 Z"
                fill="#121212"
              />
              <path
                d="M 72 86 Q 80 81 88 86 Q 87 93 80 93.5 Q 73 93 72 86 Z"
                fill="url(#speakingMouthTongueGrad)"
              />
            </g>
          ) : (
            /* Happy wide smile */
            <g>
              <path
                d="M 69 77 Q 80 75 91 77 Q 93 90 80 91 Q 67 90 69 77 Z"
                fill="#121212"
              />
              <path
                d="M 73 85 Q 80 82 87 85 Q 86 90.5 80 91 Q 74 90.5 73 85 Z"
                fill="url(#speakingMouthTongueGrad)"
              />
            </g>
          )}

          {/* ============================================================ */}
          {/* MICROPHONE INSIDE THE GHOST'S BODY */}
          {/* ============================================================ */}
          <g
            id="micInside"
            className={`transition-all duration-300 ${
              isSpeaking
                ? 'animate-pulse'
                : isListening
                ? 'scale-110 drop-shadow-[0_0_8px_#ffffff]'
                : 'opacity-90'
            }`}
          >
            {/* Glowing circular aura behind microphone */}
            <circle
              cx="80"
              cy="104"
              r="11"
              fill="#002E18"
              opacity="0.45"
            />

            {/* Microphone Capsule / Grille */}
            <rect
              x="76.5"
              y="97"
              width="7"
              height="10.5"
              rx="3.5"
              fill="url(#innerMicGrad)"
              stroke="#003B20"
              strokeWidth="0.8"
              filter="drop-shadow(0 0 4px #FFFFFF)"
            />
            {/* Mic Grille Lines */}
            <line x1="77.5" y1="101" x2="82.5" y2="101" stroke="#00A855" strokeWidth="0.6" />
            <line x1="77.5" y1="103.5" x2="82.5" y2="103.5" stroke="#00A855" strokeWidth="0.6" />

            {/* Microphone U-Bracket Stand */}
            <path
              d="M 74 102 C 74 109 86 109 86 102"
              stroke="#FFFFFF"
              strokeWidth="1.6"
              strokeLinecap="round"
              fill="none"
              filter="drop-shadow(0 0 3px #00FF88)"
            />

            {/* Microphone Stand Stem & Base */}
            <line
              x1="80"
              y1="109"
              x2="80"
              y2="112"
              stroke="#FFFFFF"
              strokeWidth="1.6"
              strokeLinecap="round"
            />
            <line
              x1="76"
              y1="112"
              x2="84"
              y2="112"
              stroke="#FFFFFF"
              strokeWidth="1.8"
              strokeLinecap="round"
            />
          </g>
        </g>
      </svg>

      {/* Floating Status Badge Below the Speaking Ghost */}
      <div
        className={`mt-1 sm:mt-2 px-3.5 py-1 rounded-full text-xs font-black tracking-wider uppercase backdrop-blur-xl border transition-all ${
          !isBrieActive
            ? 'bg-zinc-900/90 text-zinc-400 border-zinc-700'
            : isSpeaking
            ? 'bg-emerald-950/90 text-[#00FF88] border-[#00FF88] shadow-[0_0_15px_rgba(0,255,136,0.6)] animate-pulse'
            : isListening
            ? 'bg-emerald-950/90 text-[#00FF88] border-[#00FF88] shadow-[0_0_15px_rgba(0,255,136,0.6)] animate-bounce'
            : 'bg-black/80 text-zinc-300 border-white/20'
        }`}
      >
        {!isBrieActive
          ? 'Sleeping (Ghost)'
          : isSpeaking
          ? 'Brie is Speaking…'
          : isListening
          ? 'Listening to you…'
          : 'Tap Ghost to Speak'}
      </div>
    </div>
  );
};
