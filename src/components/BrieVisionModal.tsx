import React, { useEffect, useRef, useState } from 'react';
import { Camera, X, RefreshCw, Eye, Sparkles, Volume2, ShieldAlert } from 'lucide-react';
import { vision, VisionAnalysisResult } from '../services/visionService';
import { sounds } from '../services/soundEffects';
import { haptics } from '../services/haptics';

interface BrieVisionModalProps {
  isOpen: boolean;
  onClose: () => void;
  userName: string;
  initialQuery?: string;
  onSpeakDescription: (text: string) => void;
}

export const BrieVisionModal: React.FC<BrieVisionModalProps> = ({
  isOpen,
  onClose,
  userName,
  initialQuery,
  onSpeakDescription,
}) => {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const [cameraActive, setCameraActive] = useState<boolean>(false);
  const [analyzing, setAnalyzing] = useState<boolean>(false);
  const [lastResult, setLastResult] = useState<string>('');

  useEffect(() => {
    if (!isOpen) {
      vision.stopCamera();
      setCameraActive(false);
      setAnalyzing(false);
      return;
    }

    let isMounted = true;

    const startVision = async () => {
      sounds.playSonarPing();
      haptics.tap();

      const ok = await vision.initCamera();
      if (!isMounted) return;

      if (ok) {
        setCameraActive(true);
        // Automatically capture initial snapshot after 800ms
        setTimeout(() => {
          if (isMounted) {
            handleCapture(initialQuery);
          }
        }, 900);
      } else {
        const errorMsg = `I cannot open the camera right now, ${userName}. Please check camera permissions in your browser.`;
        setLastResult(errorMsg);
        onSpeakDescription(errorMsg);
      }
    };

    startVision();

    return () => {
      isMounted = false;
      vision.stopCamera();
    };
  }, [isOpen, initialQuery]);

  const handleCapture = async (query?: string) => {
    if (analyzing) return;

    sounds.playCameraShutter();
    haptics.tap();
    setAnalyzing(true);
    sounds.playRadarSweep();

    const base64 = vision.captureFrameBase64();
    if (!base64) {
      // Offline fallback description
      const offlineRes = await vision.analyzeScene('', query, userName);
      setLastResult(offlineRes.description);
      onSpeakDescription(offlineRes.description);
      setAnalyzing(false);
      return;
    }

    const result = await vision.analyzeScene(base64, query, userName);
    setLastResult(result.description);
    onSpeakDescription(result.description);
    setAnalyzing(false);
  };

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex flex-col justify-between bg-black text-white p-6 sm:p-10 select-none overflow-hidden"
      role="dialog"
      aria-modal="true"
      aria-label="Brie Camera Vision and Object Describer"
    >
      {/* Top Header */}
      <div className="flex items-center justify-between z-10">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-emerald-500/20 border border-emerald-400/40 flex items-center justify-center">
            <Eye className="w-6 h-6 text-[#00FF88] animate-pulse" />
          </div>
          <div>
            <h2 className="text-xl sm:text-2xl font-black text-white tracking-wide flex items-center gap-2">
              BRIE VISION <span className="text-xs px-2.5 py-0.5 rounded-full bg-emerald-950 text-emerald-400 border border-emerald-500/30">EYES MODE</span>
            </h2>
            <p className="text-xs sm:text-sm text-white/60">
              Obstacles • Currency • Documents • Colors
            </p>
          </div>
        </div>

        <button
          onClick={() => {
            sounds.playClick();
            haptics.listeningStop();
            onClose();
          }}
          className="w-12 h-12 rounded-2xl bg-white/10 hover:bg-white/20 active:scale-95 flex items-center justify-center border border-white/20 cursor-pointer"
          aria-label="Close Camera Vision"
        >
          <X className="w-6 h-6 text-white" />
        </button>
      </div>

      {/* Main Viewfinder / Status Display */}
      <div className="relative my-auto flex flex-col items-center justify-center max-w-xl mx-auto w-full z-10 text-center space-y-6">
        {/* Glowing Radar Scanning Aura */}
        <div className="relative w-48 h-48 sm:w-64 sm:h-64 rounded-full border-4 border-emerald-500/40 flex items-center justify-center shadow-[0_0_60px_rgba(0,255,136,0.3)]">
          <div className={`absolute inset-0 rounded-full border-2 border-[#00FF88] ${analyzing ? 'animate-ping opacity-60' : 'opacity-20'}`} />
          <Camera className={`w-20 h-20 text-[#00FF88] ${analyzing ? 'animate-bounce' : ''}`} />
        </div>

        {/* Spoken Output Display for Low-Vision or Testing */}
        <div className="w-full p-5 rounded-3xl backdrop-blur-2xl bg-white/[0.06] border border-emerald-500/30 shadow-[0_8px_32px_rgba(0,0,0,0.6)]">
          <p className="text-xs font-bold text-emerald-400 uppercase tracking-widest mb-1.5 flex items-center justify-center gap-1.5">
            <Volume2 className="w-4 h-4" /> Spoken Aloud to {userName}
          </p>
          <p className="text-lg sm:text-2xl font-bold text-white leading-relaxed">
            {analyzing ? (
              <span className="text-emerald-300 animate-pulse">Scanning the scene and analyzing obstacles...</span>
            ) : lastResult ? (
              `“${lastResult}”`
            ) : (
              'Point your phone forward. Brie is reading the room aloud.'
            )}
          </p>
        </div>
      </div>

      {/* Bottom Action Controls */}
      <div className="grid grid-cols-2 gap-4 max-w-xl mx-auto w-full z-10">
        <button
          onClick={() => handleCapture('Read currency and cash denominations')}
          disabled={analyzing}
          className="py-4 px-6 rounded-2xl bg-emerald-950/50 hover:bg-emerald-900/60 active:scale-95 border-2 border-emerald-500/50 text-emerald-300 font-black text-base sm:text-lg tracking-wider flex items-center justify-center gap-2 cursor-pointer transition-all"
        >
          <Sparkles className="w-5 h-5 text-[#00FF88]" />
          <span>READ MONEY</span>
        </button>

        <button
          onClick={() => handleCapture()}
          disabled={analyzing}
          className="py-4 px-6 rounded-2xl bg-[#00FF88] hover:bg-[#00e67a] active:scale-95 text-black font-black text-base sm:text-lg tracking-wider flex items-center justify-center gap-2 cursor-pointer shadow-[0_0_30px_rgba(0,255,136,0.5)] transition-all"
        >
          <RefreshCw className={`w-5 h-5 ${analyzing ? 'animate-spin' : ''}`} />
          <span>SCAN AGAIN</span>
        </button>
      </div>
    </div>
  );
};
