import React from 'react';

interface SiriWaveformProps {
  isListening: boolean;
  isSpeaking: boolean;
  className?: string;
  height?: number;
}

/**
 * Authentic Siri Multi-Layer Liquid Audio Waveform
 * Four vibrant overlapping sine-wave ribbons (Cyan, Magenta, Violet, Emerald)
 * that dance and undulate in real-time during speech and voice recognition.
 */
export const SiriWaveform: React.FC<SiriWaveformProps> = ({
  isListening,
  isSpeaking,
  className = '',
  height,
}) => {
  const isActive = isListening || isSpeaking;

  return (
    <div
      style={height ? { height: `${height}px` } : undefined}
      className={`relative w-full max-w-lg h-16 sm:h-20 flex items-center justify-center overflow-hidden pointer-events-none ${className}`}
      aria-hidden="true"
    >
      <svg
        viewBox="0 0 500 100"
        className="w-full h-full overflow-visible"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          <filter id="waveformGlow" x="-20%" y="-40%" width="140%" height="180%">
            <feGaussianBlur stdDeviation="4" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>

          <linearGradient id="siriWaveCyan" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#00F0FF" stopOpacity="0" />
            <stop offset="20%" stopColor="#00F0FF" stopOpacity="0.85" />
            <stop offset="50%" stopColor="#00E5FF" stopOpacity="1" />
            <stop offset="80%" stopColor="#00F0FF" stopOpacity="0.85" />
            <stop offset="100%" stopColor="#00F0FF" stopOpacity="0" />
          </linearGradient>

          <linearGradient id="siriWaveMagenta" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#FF0080" stopOpacity="0" />
            <stop offset="25%" stopColor="#FF0080" stopOpacity="0.8" />
            <stop offset="50%" stopColor="#D946EF" stopOpacity="1" />
            <stop offset="75%" stopColor="#EC4899" stopOpacity="0.8" />
            <stop offset="100%" stopColor="#FF0080" stopOpacity="0" />
          </linearGradient>

          <linearGradient id="siriWaveViolet" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#7928CA" stopOpacity="0" />
            <stop offset="30%" stopColor="#8B5CF6" stopOpacity="0.75" />
            <stop offset="50%" stopColor="#A855F7" stopOpacity="0.9" />
            <stop offset="70%" stopColor="#6366F1" stopOpacity="0.75" />
            <stop offset="100%" stopColor="#7928CA" stopOpacity="0" />
          </linearGradient>

          <linearGradient id="siriWaveGreen" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#00FF88" stopOpacity="0" />
            <stop offset="25%" stopColor="#10B981" stopOpacity="0.8" />
            <stop offset="50%" stopColor="#00FF88" stopOpacity="1" />
            <stop offset="75%" stopColor="#34D399" stopOpacity="0.8" />
            <stop offset="100%" stopColor="#00FF88" stopOpacity="0" />
          </linearGradient>
        </defs>

        {/* Ambient Center Glow */}
        <ellipse
          cx="250"
          cy="50"
          rx={isActive ? "180" : "80"}
          ry={isActive ? "28" : "8"}
          fill="url(#siriWaveCyan)"
          opacity={isActive ? 0.25 : 0.08}
          filter="url(#waveformGlow)"
          className="transition-all duration-700"
        />

        {/* Wave 1: Violet Bass Ribbon */}
        <path
          d={
            isActive
              ? "M 20 50 Q 80 15, 150 50 T 280 50 T 410 50 T 480 50"
              : "M 20 50 Q 140 48, 250 50 T 480 50"
          }
          stroke="url(#siriWaveViolet)"
          strokeWidth={isActive ? "3.5" : "1.5"}
          strokeLinecap="round"
          filter="url(#waveformGlow)"
          className={isActive ? "animate-siri-wave-1" : "opacity-40"}
        />

        {/* Wave 2: Magenta Melody Ribbon */}
        <path
          d={
            isActive
              ? "M 20 50 Q 100 85, 180 50 T 320 50 T 440 50 T 480 50"
              : "M 20 50 Q 150 52, 250 50 T 480 50"
          }
          stroke="url(#siriWaveMagenta)"
          strokeWidth={isActive ? "3.5" : "1.5"}
          strokeLinecap="round"
          filter="url(#waveformGlow)"
          className={isActive ? "animate-siri-wave-2" : "opacity-50"}
        />

        {/* Wave 3: Cyan Harmonic Ribbon */}
        <path
          d={
            isActive
              ? "M 20 50 Q 120 20, 200 50 T 340 50 T 460 50 T 480 50"
              : "M 20 50 Q 160 49, 250 50 T 480 50"
          }
          stroke="url(#siriWaveCyan)"
          strokeWidth={isActive ? "4" : "2"}
          strokeLinecap="round"
          filter="url(#waveformGlow)"
          className={isActive ? "animate-siri-wave-3" : "opacity-60"}
        />

        {/* Wave 4: Neon Green Brie Signature Ribbon */}
        <path
          d={
            isActive
              ? "M 20 50 Q 70 75, 160 50 T 300 50 T 420 50 T 480 50"
              : "M 20 50 Q 120 51, 250 50 T 480 50"
          }
          stroke="url(#siriWaveGreen)"
          strokeWidth={isActive ? "3" : "1"}
          strokeLinecap="round"
          filter="url(#waveformGlow)"
          className={isActive ? "animate-siri-wave-4" : "opacity-40"}
        />
      </svg>
    </div>
  );
};
