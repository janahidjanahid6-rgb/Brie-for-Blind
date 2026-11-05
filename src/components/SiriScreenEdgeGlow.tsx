import React from 'react';

interface SiriScreenEdgeGlowProps {
  isActive: boolean;
  isListening: boolean;
  isSpeaking: boolean;
}

/**
 * Apple Intelligence (iOS 18) Screen Edge Glowing Aura
 * Illuminates the entire device perimeter in a flowing, chromatic rainbow neon glow
 * when Brie is listening or speaking, providing an intuitive visual status.
 */
export const SiriScreenEdgeGlow: React.FC<SiriScreenEdgeGlowProps> = ({
  isActive,
  isListening,
  isSpeaking,
}) => {
  if (!isActive) return null;

  return (
    <div
      className="fixed inset-0 pointer-events-none z-40 overflow-hidden transition-opacity duration-500 ease-out"
      aria-hidden="true"
    >
      {/* Top Edge Glow */}
      <div
        className="absolute top-0 left-0 right-0 h-16 sm:h-24 opacity-90 animate-siri-edge"
        style={{
          background:
            'radial-gradient(ellipse at 50% 0%, rgba(6, 182, 212, 0.55), rgba(236, 72, 153, 0.4), rgba(147, 51, 234, 0.25), transparent 75%)',
          filter: 'blur(16px)',
        }}
      />

      {/* Bottom Edge Glow */}
      <div
        className="absolute bottom-0 left-0 right-0 h-20 sm:h-28 opacity-95 animate-siri-edge"
        style={{
          background:
            'radial-gradient(ellipse at 50% 100%, rgba(236, 72, 153, 0.6), rgba(59, 130, 246, 0.5), rgba(147, 51, 234, 0.35), transparent 80%)',
          filter: 'blur(18px)',
        }}
      />

      {/* Left Edge Glow */}
      <div
        className="absolute top-0 bottom-0 left-0 w-12 sm:w-16 opacity-85 animate-siri-edge"
        style={{
          background:
            'radial-gradient(ellipse at 0% 50%, rgba(59, 130, 246, 0.5), rgba(6, 182, 212, 0.4), transparent 75%)',
          filter: 'blur(14px)',
        }}
      />

      {/* Right Edge Glow */}
      <div
        className="absolute top-0 bottom-0 right-0 w-12 sm:w-16 opacity-85 animate-siri-edge"
        style={{
          background:
            'radial-gradient(ellipse at 100% 50%, rgba(236, 72, 153, 0.5), rgba(245, 158, 11, 0.4), transparent 75%)',
          filter: 'blur(14px)',
        }}
      />

      {/* Perimeter Hairline Chromatic Neon Border */}
      <div
        className="absolute inset-0 rounded-none border-[3px] sm:border-[4px] border-transparent animate-siri-edge"
        style={{
          borderImage:
            'linear-gradient(to right, #06b6d4, #3b82f6, #a855f7, #ec4899, #f59e0b, #06b6d4) 1',
          boxShadow: isListening
            ? 'inset 0 0 45px rgba(6, 182, 212, 0.35), 0 0 35px rgba(236, 72, 153, 0.4)'
            : 'inset 0 0 35px rgba(168, 85, 247, 0.3), 0 0 25px rgba(59, 130, 246, 0.35)',
        }}
      />
    </div>
  );
};
