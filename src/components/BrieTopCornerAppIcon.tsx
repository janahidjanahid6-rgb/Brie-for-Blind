import React from 'react';

interface BrieTopCornerAppIconProps {
  isListening: boolean;
  isSpeaking: boolean;
  isBrieActive?: boolean;
  onClick?: () => void;
  className?: string;
}

/**
 * Top Corner Official Brie App Icon:
 * - App icon format with squircle rounded corners on pure black background.
 * - Displays the official Brie Green Ghost app icon.
 * - Gentle glow feedback when active or listening.
 */
export const BrieTopCornerAppIcon: React.FC<BrieTopCornerAppIconProps> = ({
  isListening,
  isSpeaking,
  isBrieActive = true,
  onClick,
  className = '',
}) => {
  return (
    <button
      id="btnTapToSpeak"
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
      className={`group relative flex items-center justify-center w-14 h-14 sm:w-16 sm:h-16 rounded-[22%] bg-black overflow-hidden border-2 transition-all duration-300 cursor-pointer select-none active:scale-95 shadow-xl ${
        isListening
          ? 'border-[#00FF88] shadow-[0_0_20px_rgba(0,255,136,0.6)] animate-pulse'
          : isSpeaking
          ? 'border-[#00FF88] shadow-[0_0_20px_rgba(0,255,136,0.5)]'
          : isBrieActive
          ? 'border-emerald-500/50 hover:border-[#00FF88] shadow-[0_0_12px_rgba(0,255,136,0.2)]'
          : 'border-zinc-800 opacity-60 shadow-none'
      } ${className}`}
    >
      {/* App Icon Image Asset */}
      <img
        src="/brie_ghost_icon.jpg"
        alt="Brie App Icon"
        className="w-full h-full object-cover select-none pointer-events-none transition-transform duration-300 group-hover:scale-105"
        onError={(e) => {
          // Fallback if image path differs
          (e.currentTarget as HTMLImageElement).src = '/src/assets/images/brie_green_ghost_icon_1793874015306.jpg';
        }}
      />

      {/* Subtle Specular Glass Highlight across top */}
      <div
        className="absolute inset-0 pointer-events-none rounded-[22%]"
        style={{
          background: 'linear-gradient(135deg, rgba(255,255,255,0.25) 0%, rgba(255,255,255,0) 50%)',
        }}
      />
    </button>
  );
};
