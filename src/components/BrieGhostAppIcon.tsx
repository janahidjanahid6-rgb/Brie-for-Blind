import React from 'react';

interface BrieGhostAppIconProps {
  isListening: boolean;
  isSpeaking: boolean;
  isBrieActive?: boolean;
  onClick?: () => void;
  size?: 'sm' | 'md' | 'lg' | 'hero';
  className?: string;
  id?: string;
}

/**
 * Brie Ghost App Icon:
 * - App icon format with rounded corners on pure black background (#000000).
 * - Center: Bright green neon glowing ghost with white-green glowing outline.
 * - Face: Big, shiny black eyes, smiling wide and happy, mouth open like she is laughing or talking.
 * - Body: Soft, round ghost shape with a wavy sheet bottom.
 * - Around her: Sound waves on both left and right sides.
 *   * When speaking: Left and right waves move dynamically and shift through vibrant rainbow colors.
 *   * When listening: Bright neon-green pulsating sound waves.
 *   * When deactivated: Gently sleeping/dimmed state.
 */
export const BrieGhostAppIcon: React.FC<BrieGhostAppIconProps> = ({
  isListening,
  isSpeaking,
  isBrieActive = true,
  onClick,
  size = 'md',
  className = '',
  id = 'btnTapToSpeak',
}) => {
  const sizeMap = {
    sm: { container: 'w-14 h-14', svg: 56, ghostScale: 0.9 },
    md: { container: 'w-16 h-16 sm:w-20 sm:h-20', svg: 80, ghostScale: 1 },
    lg: { container: 'w-24 h-24 sm:w-28 sm:h-28', svg: 112, ghostScale: 1.35 },
    hero: { container: 'w-36 h-36 sm:w-44 sm:h-44', svg: 160, ghostScale: 1.8 },
  }[size];

  return (
    <button
      id={id}
      type="button"
      onClick={onClick}
      title={isListening ? 'Brie is listening... Tap to stop' : 'Tap to speak with Brie'}
      aria-label={
        isListening
          ? 'Brie is listening'
          : isSpeaking
          ? 'Brie is speaking'
          : 'Tap to speak with Brie'
      }
      className={`group relative flex items-center justify-center bg-[#000000] border-2 transition-all duration-300 cursor-pointer select-none active:scale-95 ${
        sizeMap.container
      } rounded-[24%] ${
        isListening
          ? 'border-[#00FF88] shadow-[0_0_25px_rgba(0,255,136,0.6)]'
          : isSpeaking
          ? 'border-fuchsia-400 shadow-[0_0_30px_rgba(236,72,153,0.5)]'
          : isBrieActive
          ? 'border-[#00FF88]/40 shadow-[0_0_15px_rgba(0,255,136,0.2)] hover:border-[#00FF88] hover:shadow-[0_0_20px_rgba(0,255,136,0.4)]'
          : 'border-zinc-800 opacity-60 shadow-none'
      } ${className}`}
    >
      <svg
        viewBox="0 0 100 100"
        className="w-full h-full p-1.5 overflow-visible"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          {/* Intense Neon Glow Filters */}
          <filter id="brieGhostGlow" x="-30%" y="-30%" width="160%" height="160%">
            <feGaussianBlur stdDeviation="3.5" result="blur1" />
            <feGaussianBlur stdDeviation="7" result="blur2" />
            <feMerge>
              <feMergeNode in="blur2" />
              <feMergeNode in="blur1" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>

          <filter id="brieWaveGlow" x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur stdDeviation="2.5" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>

          {/* Rainbow Gradient for Sound Waves when speaking */}
          <linearGradient id="rainbowGradientLeft" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#00E5FF" />
            <stop offset="25%" stopColor="#D946EF" />
            <stop offset="50%" stopColor="#EC4899" />
            <stop offset="75%" stopColor="#F59E0B" />
            <stop offset="100%" stopColor="#00FF88" />
          </linearGradient>

          <linearGradient id="rainbowGradientRight" x1="100%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#F59E0B" />
            <stop offset="25%" stopColor="#EC4899" />
            <stop offset="50%" stopColor="#D946EF" />
            <stop offset="75%" stopColor="#00E5FF" />
            <stop offset="100%" stopColor="#00FF88" />
          </linearGradient>

          {/* Ghost Neon Body Gradient */}
          <linearGradient id="ghostBodyGrad" x1="50%" y1="0%" x2="50%" y2="100%">
            <stop offset="0%" stopColor="#55FFAA" />
            <stop offset="40%" stopColor="#00FF88" />
            <stop offset="100%" stopColor="#00C868" />
          </linearGradient>

          <linearGradient id="mouthTongueGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#FF6B8B" />
            <stop offset="100%" stopColor="#FF3366" />
          </linearGradient>
        </defs>

        {/* ============================================================ */}
        {/* LEFT SOUND WAVES (Listen: Green, Speak: Moving Rainbow) */}
        {/* ============================================================ */}
        <g
          filter="url(#brieWaveGlow)"
          className={`transition-all duration-300 ${
            isSpeaking
              ? 'animate-rainbow-pulse'
              : isListening
              ? 'animate-pulse text-[#00FF88]'
              : 'opacity-70 text-[#00FF88]'
          }`}
        >
          {/* Wave 1 (Inner Left) */}
          <path
            d="M 27 38 A 15 15 0 0 0 27 62"
            stroke={isSpeaking ? 'url(#rainbowGradientLeft)' : '#00FF88'}
            strokeWidth={isSpeaking ? 3.5 : 2.5}
            strokeLinecap="round"
            className={isSpeaking ? 'animate-wave-left-1' : ''}
          />
          {/* Wave 2 (Middle Left) */}
          <path
            d="M 21 32 A 22 22 0 0 0 21 68"
            stroke={isSpeaking ? 'url(#rainbowGradientLeft)' : '#00FF88'}
            strokeWidth={isSpeaking ? 3.5 : 2.5}
            strokeLinecap="round"
            className={isSpeaking ? 'animate-wave-left-2' : ''}
          />
          {/* Wave 3 (Outer Left) */}
          <path
            d="M 15 26 A 29 29 0 0 0 15 74"
            stroke={isSpeaking ? 'url(#rainbowGradientLeft)' : '#00FF88'}
            strokeWidth={isSpeaking ? 3.5 : 2.5}
            strokeLinecap="round"
            className={isSpeaking ? 'animate-wave-left-3' : ''}
          />
        </g>

        {/* ============================================================ */}
        {/* RIGHT SOUND WAVES (Listen: Green, Speak: Moving Rainbow) */}
        {/* ============================================================ */}
        <g
          filter="url(#brieWaveGlow)"
          className={`transition-all duration-300 ${
            isSpeaking
              ? 'animate-rainbow-pulse'
              : isListening
              ? 'animate-pulse text-[#00FF88]'
              : 'opacity-70 text-[#00FF88]'
          }`}
        >
          {/* Wave 1 (Inner Right) */}
          <path
            d="M 73 38 A 15 15 0 0 1 73 62"
            stroke={isSpeaking ? 'url(#rainbowGradientRight)' : '#00FF88'}
            strokeWidth={isSpeaking ? 3.5 : 2.5}
            strokeLinecap="round"
            className={isSpeaking ? 'animate-wave-right-1' : ''}
          />
          {/* Wave 2 (Middle Right) */}
          <path
            d="M 79 32 A 22 22 0 0 1 79 68"
            stroke={isSpeaking ? 'url(#rainbowGradientRight)' : '#00FF88'}
            strokeWidth={isSpeaking ? 3.5 : 2.5}
            strokeLinecap="round"
            className={isSpeaking ? 'animate-wave-right-2' : ''}
          />
          {/* Wave 3 (Outer Right) */}
          <path
            d="M 85 26 A 29 29 0 0 1 85 74"
            stroke={isSpeaking ? 'url(#rainbowGradientRight)' : '#00FF88'}
            strokeWidth={isSpeaking ? 3.5 : 2.5}
            strokeLinecap="round"
            className={isSpeaking ? 'animate-wave-right-3' : ''}
          />
        </g>

        {/* ============================================================ */}
        {/* GHOST BODY (Floating, Neon Green, White-Green Glowing Outline) */}
        {/* ============================================================ */}
        <g
          className={`origin-center transition-transform duration-500 ${
            isSpeaking
              ? 'animate-ghost-bounce'
              : isListening
              ? 'animate-ghost-float scale-105'
              : isBrieActive
              ? 'animate-ghost-float'
              : 'opacity-60 scale-95'
          }`}
        >
          {/* Outer White-Green Glowing Aura */}
          <path
            d="M 50 18 C 36 18 31 30 31 46 C 31 58 30 70 27 75 C 29 78 33 78 36 75 C 40 71 43 73 45 76 C 47 79 53 79 55 76 C 57 73 60 71 64 75 C 67 78 71 78 73 75 C 70 70 69 58 69 46 C 69 30 64 18 50 18 Z"
            fill="none"
            stroke="#EAFFF5"
            strokeWidth="5"
            strokeLinejoin="round"
            filter="url(#brieGhostGlow)"
            opacity={isBrieActive ? 0.95 : 0.4}
          />

          {/* Solid Neon Green Ghost Body */}
          <path
            d="M 50 18 C 36 18 31 30 31 46 C 31 58 30 70 27 75 C 29 78 33 78 36 75 C 40 71 43 73 45 76 C 47 79 53 79 55 76 C 57 73 60 71 64 75 C 67 78 71 78 73 75 C 70 70 69 58 69 46 C 69 30 64 18 50 18 Z"
            fill="url(#ghostBodyGrad)"
            stroke="#FFFFFF"
            strokeWidth="1.8"
            strokeLinejoin="round"
          />

          {/* Cute Ghost Head Specular Highlight (Glassy 3D shine) */}
          <ellipse
            cx="44"
            cy="24"
            rx="5"
            ry="2.5"
            transform="rotate(-25 44 24)"
            fill="#FFFFFF"
            opacity="0.65"
          />

          {/* ============================================================ */}
          {/* FACE: Big, shiny black eyes with white light reflections */}
          {/* ============================================================ */}
          {/* Left Eye */}
          <g>
            <ellipse cx="42" cy="40" rx="4.8" ry="6" fill="#0A0A0A" />
            {/* Big sparkle */}
            <circle cx="40.5" cy="38" r="2.1" fill="#FFFFFF" />
            {/* Cute mini catchlight */}
            <circle cx="44.2" cy="42.5" r="1.1" fill="#FFFFFF" />
          </g>

          {/* Right Eye */}
          <g>
            <ellipse cx="58" cy="40" rx="4.8" ry="6" fill="#0A0A0A" />
            {/* Big sparkle */}
            <circle cx="56.5" cy="38" r="2.1" fill="#FFFFFF" />
            {/* Cute mini catchlight */}
            <circle cx="60.2" cy="42.5" r="1.1" fill="#FFFFFF" />
          </g>

          {/* ============================================================ */}
          {/* MOUTH: Wide, happy, open laughing/talking mouth with tongue */}
          {/* ============================================================ */}
          {isSpeaking ? (
            /* Animated talking/laughing open mouth */
            <g className="animate-talking-mouth origin-center">
              <path
                d="M 43 51 Q 50 49 57 51 Q 58 62 50 63 Q 42 62 43 51 Z"
                fill="#121212"
              />
              {/* Cute smiling tongue */}
              <path
                d="M 45 57 Q 50 54 55 57 Q 54 62 50 62.5 Q 46 62 45 57 Z"
                fill="url(#mouthTongueGrad)"
              />
            </g>
          ) : (
            /* Happy wide open smile */
            <g>
              <path
                d="M 43 51 Q 50 49.5 57 51 Q 58 61 50 62 Q 42 61 43 51 Z"
                fill="#121212"
              />
              {/* Tongue inside */}
              <path
                d="M 46 57 Q 50 54.5 54 57 Q 53 61.2 50 61.5 Q 47 61.2 46 57 Z"
                fill="url(#mouthTongueGrad)"
              />
            </g>
          )}

          {/* Cute Rosy Cheeks */}
          <ellipse cx="37" cy="47" rx="2.5" ry="1.5" fill="#FF8DA1" opacity="0.45" />
          <ellipse cx="63" cy="47" rx="2.5" ry="1.5" fill="#FF8DA1" opacity="0.45" />
        </g>
      </svg>
    </button>
  );
};
