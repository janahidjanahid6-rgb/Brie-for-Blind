import React, { useState, useEffect } from 'react';
import { ZoomIn, ZoomOut, X } from 'lucide-react';
import { sounds } from '../services/soundEffects';
import { haptics } from '../services/haptics';

interface MagnifierLoupeProps {
  isOpen: boolean;
  onClose: () => void;
  fontScale: number;
  onUpdateFontScale: (scale: number) => void;
}

export const MagnifierLoupe: React.FC<MagnifierLoupeProps> = ({
  isOpen,
  onClose,
  fontScale,
  onUpdateFontScale,
}) => {
  if (!isOpen) return null;

  return (
    <div
      className="fixed bottom-20 right-4 sm:right-8 z-40 bg-black/95 border-2 border-yellow-400 p-4 rounded-2xl shadow-2xl text-white flex items-center gap-3 backdrop-blur-md"
      role="region"
      aria-label="Screen Magnification Bar"
    >
      <div className="flex items-center gap-2">
        <span className="text-xs font-bold text-yellow-400 uppercase tracking-wider">
          Magnification:
        </span>
        <span className="text-sm font-mono font-bold text-white tabular-nums">
          {fontScale}%
        </span>
      </div>

      <div className="flex items-center gap-1.5">
        <button
          onClick={() => {
            sounds.playClick();
            haptics.tap();
            onUpdateFontScale(Math.max(100, fontScale - 25));
          }}
          disabled={fontScale <= 100}
          className="p-2 rounded-lg bg-zinc-800 hover:bg-zinc-700 disabled:opacity-40 text-white"
          aria-label="Decrease Font Size"
        >
          <ZoomOut className="w-4 h-4" />
        </button>

        <button
          onClick={() => {
            sounds.playClick();
            haptics.tap();
            onUpdateFontScale(Math.min(250, fontScale + 25));
          }}
          disabled={fontScale >= 250}
          className="p-2 rounded-lg bg-zinc-800 hover:bg-zinc-700 disabled:opacity-40 text-white"
          aria-label="Increase Font Size"
        >
          <ZoomIn className="w-4 h-4" />
        </button>
      </div>

      <button
        onClick={() => {
          sounds.playClick();
          onClose();
        }}
        className="p-1.5 ml-2 text-zinc-400 hover:text-white rounded-lg hover:bg-zinc-800"
        aria-label="Close Magnification Bar"
      >
        <X className="w-4 h-4" />
      </button>
    </div>
  );
};
