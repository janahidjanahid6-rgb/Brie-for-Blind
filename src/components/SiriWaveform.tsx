import React, { useEffect, useRef } from 'react';

interface SiriWaveformProps {
  isListening: boolean;
  isSpeaking: boolean;
  height?: number;
  className?: string;
}

/**
 * Brie Classic & Modern Sinusoidal Waveform Ribbon Visualizer
 * Overlapping harmonic sine waves (Cyan, Magenta, Violet, White)
 * that undulate dynamically with vocal activity.
 */
export const SiriWaveform: React.FC<SiriWaveformProps> = ({
  isListening,
  isSpeaking,
  height = 70,
  className = '',
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const animFrameRef = useRef<number | null>(null);
  const phaseRef = useRef<number>(0);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let isActive = isListening || isSpeaking;

    const render = () => {
      // Dynamic scaling for high DPI
      const width = canvas.offsetWidth;
      const h = height;
      if (canvas.width !== width || canvas.height !== h) {
        canvas.width = width;
        canvas.height = h;
      }

      ctx.clearRect(0, 0, width, h);

      // Advance phase
      phaseRef.current += isActive ? 0.08 : 0.02;
      const phase = phaseRef.current;

      // Base target amplitude
      const baseAmp = isActive ? (isSpeaking ? h * 0.38 : h * 0.28) : h * 0.08;

      // Draw 4 overlapping sinusoidal ribbons
      const ribbons = [
        {
          color: 'rgba(6, 182, 212, 0.75)', // Cyan
          freq: 0.016,
          amp: baseAmp * 1.1,
          phaseOffset: 0,
          lineWidth: 3,
        },
        {
          color: 'rgba(236, 72, 153, 0.75)', // Hot Magenta
          freq: 0.019,
          amp: baseAmp * 0.9,
          phaseOffset: Math.PI / 2.5,
          lineWidth: 2.5,
        },
        {
          color: 'rgba(168, 85, 247, 0.7)', // Purple
          freq: 0.014,
          amp: baseAmp * 1.25,
          phaseOffset: Math.PI,
          lineWidth: 2.5,
        },
        {
          color: 'rgba(255, 255, 255, 0.85)', // Core White
          freq: 0.022,
          amp: baseAmp * 0.7,
          phaseOffset: Math.PI / 1.5,
          lineWidth: 1.5,
        },
      ];

      const midY = h / 2;

      ribbons.forEach((r) => {
        ctx.beginPath();
        ctx.strokeStyle = r.color;
        ctx.lineWidth = r.lineWidth;
        ctx.shadowBlur = isActive ? 12 : 4;
        ctx.shadowColor = r.color;

        for (let x = 0; x <= width; x += 3) {
          // Windowing function: taper amplitude smoothly to 0 at both ends
          const normX = x / width;
          const envelope = Math.sin(normX * Math.PI); // 0 at edges, 1 in center

          const y =
            midY +
            Math.sin(x * r.freq + phase + r.phaseOffset) *
              r.amp *
              envelope *
              (1 + 0.15 * Math.sin(phase * 1.5 + normX * 4));

          if (x === 0) {
            ctx.moveTo(x, y);
          } else {
            ctx.lineTo(x, y);
          }
        }
        ctx.stroke();
      });

      animFrameRef.current = requestAnimationFrame(render);
    };

    render();

    return () => {
      if (animFrameRef.current) {
        cancelAnimationFrame(animFrameRef.current);
      }
    };
  }, [isListening, isSpeaking, height]);

  return (
    <div className={`w-full overflow-hidden flex items-center justify-center ${className}`}>
      <canvas
        ref={canvasRef}
        style={{ height: `${height}px`, width: '100%' }}
        className="w-full pointer-events-none"
      />
    </div>
  );
};
