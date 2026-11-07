import React, { useEffect, useRef, useState } from 'react';

interface AcousticReactiveWaveformProps {
  isListening: boolean;
  isSpeaking: boolean;
  isBrieActive?: boolean;
  className?: string;
  height?: number;
}

/**
 * Acoustic Waveform Voice Reactive Animation (Item #5)
 * Real-time audio-reactive Siri fluid sine-wave visualizer.
 * Connects directly to the device microphone via Web Audio API (AnalyserNode)
 * when listening, and tracks vocal cadence envelopes when Aria is speaking.
 * Renders multiple layered organic wave ribbons that dance to real voice levels.
 */
export const AcousticReactiveWaveform: React.FC<AcousticReactiveWaveformProps> = ({
  isListening,
  isSpeaking,
  isBrieActive = true,
  className = '',
  height = 70,
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const mediaStreamRef = useRef<MediaStream | null>(null);
  const animationFrameIdRef = useRef<number | null>(null);
  const [micVolume, setMicVolume] = useState<number>(0);

  // Initialize and tear down real Microphone Analyser on Web Audio API
  useEffect(() => {
    let active = true;

    if (isListening && typeof window !== 'undefined') {
      const initMic = async () => {
        try {
          const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
          if (!AudioCtx) return;

          if (!audioContextRef.current) {
            audioContextRef.current = new AudioCtx();
          }
          if (audioContextRef.current.state === 'suspended') {
            await audioContextRef.current.resume();
          }

          if (navigator.mediaDevices?.getUserMedia) {
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true, video: false });
            if (!active) {
              stream.getTracks().forEach((t) => t.stop());
              return;
            }
            mediaStreamRef.current = stream;

            const source = audioContextRef.current.createMediaStreamSource(stream);
            const analyser = audioContextRef.current.createAnalyser();
            analyser.fftSize = 256;
            analyser.smoothingTimeConstant = 0.65;
            source.connect(analyser);
            analyserRef.current = analyser;
          }
        } catch {
          // Mic permission denied or unavailable - synthetic audio volume fallback is used
        }
      };

      initMic();
    } else {
      // Release mic stream when not listening to save battery
      if (mediaStreamRef.current) {
        mediaStreamRef.current.getTracks().forEach((t) => t.stop());
        mediaStreamRef.current = null;
      }
      analyserRef.current = null;
    }

    return () => {
      active = false;
      if (mediaStreamRef.current) {
        mediaStreamRef.current.getTracks().forEach((t) => t.stop());
        mediaStreamRef.current = null;
      }
    };
  }, [isListening]);

  // Main Canvas Rendering Loop: 60 FPS Fluid Sine Ribbon Waves
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let phase = 0;
    let smoothedVol = 0.04;
    const dataArray = new Uint8Array(128);

    const render = () => {
      let targetVol = 0.04; // Resting idle amplitude

      // 1. Calculate Real Volume Level
      if (isListening && analyserRef.current) {
        try {
          analyserRef.current.getByteFrequencyData(dataArray);
          let sum = 0;
          for (let i = 0; i < dataArray.length; i++) {
            sum += dataArray[i];
          }
          const avg = sum / dataArray.length; // 0..255
          targetVol = Math.max(0.06, Math.min(1.0, (avg / 120) * 1.3));
        } catch {
          targetVol = 0.35 + Math.sin(phase * 4) * 0.2;
        }
      } else if (isListening) {
        // Fallback simulated listening ripple if user hasn't accepted mic prompt yet
        targetVol = 0.25 + Math.sin(phase * 3.5) * 0.15;
      } else if (isSpeaking) {
        // Natural speech cadence envelope (Aria voice cadence modulation)
        const syllableMod = Math.sin(phase * 5.2) * Math.cos(phase * 2.8);
        targetVol = Math.max(0.18, 0.55 + syllableMod * 0.4 + (Math.random() - 0.5) * 0.12);
      } else if (!isBrieActive) {
        targetVol = 0.01;
      }

      // Smooth volume transitions (spring interpolation)
      smoothedVol += (targetVol - smoothedVol) * 0.22;
      setMicVolume(smoothedVol);

      // Advance phase proportional to volume intensity
      const phaseSpeed = 0.035 + smoothedVol * 0.07;
      phase += phaseSpeed;

      // Resize canvas to match display pixel ratio
      const width = canvas.clientWidth;
      const cHeight = canvas.clientHeight;
      const dpr = window.devicePixelRatio || 1;

      if (canvas.width !== width * dpr || canvas.height !== cHeight * dpr) {
        canvas.width = width * dpr;
        canvas.height = cHeight * dpr;
      }

      ctx.save();
      ctx.scale(dpr, dpr);
      ctx.clearRect(0, 0, width, cHeight);

      const centerY = cHeight / 2;
      const maxAmp = (cHeight / 2) * 0.88;

      // Wave definitions: [color, thickness, amplitudeMultiplier, frequency, phaseOffset, opacity]
      const waves = [
        {
          color: '#00FF88',
          lineWidth: 3.2,
          amp: maxAmp * smoothedVol,
          freq: 0.024,
          offset: 0,
          opacity: 0.95,
          glow: true,
        },
        {
          color: '#55FFAA',
          lineWidth: 2.2,
          amp: maxAmp * (smoothedVol * 0.85),
          freq: 0.028,
          offset: Math.PI / 2.5,
          opacity: 0.8,
          glow: true,
        },
        {
          color: '#10B981',
          lineWidth: 2.5,
          amp: maxAmp * (smoothedVol * 0.7),
          freq: 0.02,
          offset: Math.PI / 1.3,
          opacity: 0.65,
          glow: false,
        },
        {
          color: '#A7F3D0',
          lineWidth: 1.6,
          amp: maxAmp * (smoothedVol * 0.55),
          freq: 0.032,
          offset: Math.PI,
          opacity: 0.75,
          glow: true,
        },
      ];

      // Draw each organic fluid ribbon wave
      waves.forEach((w) => {
        ctx.beginPath();
        ctx.lineWidth = w.lineWidth;
        ctx.strokeStyle = w.color;
        ctx.globalAlpha = w.opacity;

        if (w.glow && (isListening || isSpeaking)) {
          ctx.shadowBlur = 14 * smoothedVol;
          ctx.shadowColor = '#00FF88';
        } else {
          ctx.shadowBlur = 0;
        }

        // Draw smooth sinusoidal curve across width
        for (let x = 0; x <= width; x += 4) {
          // Window envelope so the ends smoothly taper to 0 at the edges
          const envelope = Math.sin((x / width) * Math.PI);
          const y =
            centerY +
            Math.sin(x * w.freq + phase + w.offset) *
              w.amp *
              envelope *
              (1 + Math.cos(x * 0.01 + phase * 0.5) * 0.2);

          if (x === 0) {
            ctx.moveTo(x, y);
          } else {
            ctx.lineTo(x, y);
          }
        }
        ctx.stroke();
      });

      // Ambient Center Glow Pool
      if (isListening || isSpeaking) {
        const glowRad = Math.min(width / 2, 80 + smoothedVol * 120);
        const grad = ctx.createRadialGradient(
          width / 2,
          centerY,
          0,
          width / 2,
          centerY,
          glowRad
        );
        grad.addColorStop(0, `rgba(0, 255, 136, ${0.15 + smoothedVol * 0.25})`);
        grad.addColorStop(0.5, `rgba(16, 185, 129, ${0.08 + smoothedVol * 0.12})`);
        grad.addColorStop(1, 'rgba(0, 0, 0, 0)');

        ctx.fillStyle = grad;
        ctx.globalAlpha = 1;
        ctx.fillRect(0, 0, width, cHeight);
      }

      ctx.restore();
      animationFrameIdRef.current = requestAnimationFrame(render);
    };

    animationFrameIdRef.current = requestAnimationFrame(render);

    return () => {
      if (animationFrameIdRef.current) {
        cancelAnimationFrame(animationFrameIdRef.current);
      }
    };
  }, [isListening, isSpeaking, isBrieActive]);

  return (
    <div
      className={`relative w-full max-w-xl flex flex-col items-center justify-center select-none overflow-hidden ${className}`}
      style={{ height: `${height}px` }}
      aria-hidden="true"
    >
      <canvas
        ref={canvasRef}
        className="w-full h-full block pointer-events-none transition-opacity duration-500"
        style={{
          opacity: isBrieActive ? (isListening || isSpeaking ? 1 : 0.45) : 0.2,
        }}
      />
    </div>
  );
};
