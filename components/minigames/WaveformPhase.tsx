import React, { useState, useEffect, useRef, useMemo } from 'react';

interface WaveformPhaseProps {
  config: any;
  onComplete: () => void;
}

export const WaveformPhase: React.FC<WaveformPhaseProps> = ({ config, onComplete }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [params, setParams] = useState({ freq: 0, amp: 0.2, phase: 0 });
  const [target] = useState({
    freq: Math.random() * 4 + 1,
    amp: Math.random() * 0.5 + 0.5,
    phase: Math.random() * Math.PI * 2,
  });
  const [match, setMatch] = useState(0);
  const [hasCompleted, setHasCompleted] = useState(false);

  useEffect(() => {
    const freqMatch = 1 - Math.min(1, Math.abs(params.freq - target.freq) / 5);
    const ampMatch = 1 - Math.min(1, Math.abs(params.amp - target.amp));
    const phaseMatch = 1 - Math.min(1, Math.abs(params.phase - target.phase) / (Math.PI * 2));
    const totalMatch = (freqMatch + ampMatch + phaseMatch) / 3;
    setMatch(totalMatch);

    if (totalMatch > config.waveMatchThreshold && !hasCompleted) {
      console.log('Waveform matched!', totalMatch);
      setHasCompleted(true);
      setTimeout(onComplete, 500);
    }
  }, [params, target, config.waveMatchThreshold, onComplete, hasCompleted]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animFrame: number;
    const draw = (time: number) => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      const w = canvas.width, h = canvas.height, h2 = h / 2;
      
      // Draw grid lines
      ctx.strokeStyle = "rgba(255, 255, 255, 0.03)";
      ctx.lineWidth = 1;
      for (let i = 0; i < w; i += 40) {
        ctx.beginPath();
        ctx.moveTo(i, 0);
        ctx.lineTo(i, h);
        ctx.stroke();
      }
      for (let i = 0; i < h; i += 40) {
        ctx.beginPath();
        ctx.moveTo(0, i);
        ctx.lineTo(w, i);
        ctx.stroke();
      }
      
      // Draw center line
      ctx.strokeStyle = "rgba(255, 42, 42, 0.2)";
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(0, h2);
      ctx.lineTo(w, h2);
      ctx.stroke();
      
      // Draw Target Wave (white/ghost)
      ctx.strokeStyle = "rgba(255, 255, 255, 0.3)";
      ctx.lineWidth = 2;
      ctx.beginPath();
      for (let x = 0; x < w; x++) {
        const angle = (x / w) * (target.freq * 4 * Math.PI) + target.phase;
        const y = Math.sin(angle) * (h2 * 0.8 * target.amp);
        ctx.lineTo(x, h2 + y);
      }
      ctx.stroke();

      // Draw User Wave (neon red with glow)
      ctx.strokeStyle = "#FF2A2A";
      ctx.lineWidth = 3;
      ctx.shadowColor = "#FF2A2A";
      ctx.shadowBlur = 15;
      ctx.beginPath();
      for (let x = 0; x < w; x++) {
        const angle = (x / w) * (params.freq * 4 * Math.PI) + params.phase;
        const y = Math.sin(angle) * (h2 * 0.8 * params.amp);
        ctx.lineTo(x, h2 + y);
      }
      ctx.stroke();
      ctx.shadowBlur = 0;

      animFrame = requestAnimationFrame(draw);
    };
    draw(0);
    return () => cancelAnimationFrame(animFrame);
  }, [params, target]);

  const handleSlider = (name: 'freq' | 'amp' | 'phase', value: string) => {
    setParams(p => ({ ...p, [name]: parseFloat(value) }));
  };

  return (
    <div className="w-full max-w-2xl flex flex-col items-center gap-6 px-4">
      {/* Header */}
      <div className="text-center">
        <p className="font-tech text-neon-red text-xs tracking-[0.3em] uppercase mb-2 animate-pulse">// PHASE 03</p>
        <h3 className="font-display text-3xl md:text-4xl font-bold text-white mb-2">SIGNAL CALIBRATION</h3>
        <p className="font-tech text-ash/60 text-xs tracking-wider mb-2">
          Match the target waveform to stabilize the corrupted signal
        </p>
        
        {/* Match Progress Indicator */}
        {match > config.waveMatchThreshold ? (
          <div className="inline-flex items-center gap-2 px-2 py-1 bg-green-500/10 border border-green-500/30 animate-pulse">
            <svg className="w-3 h-3 text-green-500" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
            </svg>
            <span className="font-tech text-[9px] text-green-500 tracking-wider uppercase">
              SIGNAL MATCHED - {(match * 100).toFixed(1)}%
            </span>
          </div>
        ) : (
          <div className="inline-flex items-center gap-1.5 px-2 py-1 bg-neon-red/10 border border-neon-red/30">
            <span className="font-tech text-[9px] text-neon-red tracking-wider uppercase">
              SYNC: {(match * 100).toFixed(1)}% / {(config.waveMatchThreshold * 100).toFixed(0)}%
            </span>
          </div>
        )}
      </div>

      {/* Oscilloscope Display */}
      <div className="relative w-full max-w-lg aspect-video bg-black border border-neon-red/40 shadow-[0_0_30px_rgba(255,42,42,0.25)] overflow-hidden">
        {/* Corner brackets */}
        <div className="absolute -top-1.5 -left-1.5 w-6 h-6 border-t-2 border-l-2 border-neon-red/50"></div>
        <div className="absolute -top-1.5 -right-1.5 w-6 h-6 border-t-2 border-r-2 border-neon-red/50"></div>
        <div className="absolute -bottom-1.5 -left-1.5 w-6 h-6 border-b-2 border-l-2 border-neon-red/50"></div>
        <div className="absolute -bottom-1.5 -right-1.5 w-6 h-6 border-b-2 border-r-2 border-neon-red/50"></div>
        
        {/* Scanline effect */}
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-neon-red/5 to-transparent animate-scan pointer-events-none"></div>
        
        {/* Outer glow when matched */}
        {match > config.waveMatchThreshold && (
          <div className="absolute inset-0 bg-green-500/10 animate-pulse pointer-events-none"></div>
        )}
        
        <canvas ref={canvasRef} className="w-full h-full"></canvas>
        
        {/* Legend */}
        <div className="absolute top-2 right-2 font-tech text-[8px] tracking-wider bg-black/90 border border-white/10 px-1.5 py-1 backdrop-blur-sm space-y-0.5">
          <div className="flex items-center gap-1.5">
            <div className="w-2.5 h-0.5 bg-white/40"></div>
            <span className="text-ash/60 uppercase">Target</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-2.5 h-0.5 bg-neon-red shadow-[0_0_4px_#FF2A2A]"></div>
            <span className="text-neon-red uppercase">Current</span>
          </div>
        </div>
      </div>

      {/* Controls */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-3 w-full max-w-md">
        {[
          { key: 'freq', label: 'FREQUENCY', min: 0, max: 5 },
          { key: 'amp', label: 'AMPLITUDE', min: 0.2, max: 1.5 },
          { key: 'phase', label: 'PHASE SHIFT', min: 0, max: Math.PI * 2 }
        ].map(({ key, label, min, max }) => (
          <div key={key} className="relative bg-black/80 border-2 border-white/20 p-3 text-center hover:border-white/40 transition-all duration-300 shadow-[0_0_20px_rgba(255,255,255,0.05)]">
            {/* Corner accents */}
            <div className="absolute top-0 left-0 w-2.5 h-2.5 border-t-2 border-l-2 border-white"></div>
            <div className="absolute bottom-0 right-0 w-2.5 h-2.5 border-b-2 border-r-2 border-white"></div>
            
            <p className="font-tech text-[9px] tracking-wider uppercase text-ash/60 mb-2">{label}</p>
            
            <input 
              type="range" 
              min={min} 
              max={max} 
              step="0.01" 
              value={params[key as keyof typeof params]} 
              onChange={e => handleSlider(key as any, e.target.value)}
              className="w-full h-1.5 bg-black/50 rounded-none appearance-none cursor-pointer mb-2
                [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-3 [&::-webkit-slider-thumb]:h-3 
                [&::-webkit-slider-thumb]:bg-neon-red [&::-webkit-slider-thumb]:border [&::-webkit-slider-thumb]:border-white/20
                [&::-webkit-slider-thumb]:shadow-[0_0_8px_rgba(255,42,42,0.8)] [&::-webkit-slider-thumb]:cursor-grab
                [&::-webkit-slider-thumb]:active:cursor-grabbing [&::-webkit-slider-thumb]:hover:scale-110 [&::-webkit-slider-thumb]:transition-transform
                [&::-moz-range-thumb]:w-3 [&::-moz-range-thumb]:h-3 [&::-moz-range-thumb]:bg-neon-red 
                [&::-moz-range-thumb]:border [&::-moz-range-thumb]:border-white/20 [&::-moz-range-thumb]:rounded-none
                [&::-moz-range-thumb]:shadow-[0_0_8px_rgba(255,42,42,0.8)] [&::-moz-range-thumb]:cursor-grab"
            />
            
            <p className="font-display text-2xl text-white">{params[key as keyof typeof params].toFixed(2)}</p>
          </div>
        ))}
      </div>
    </div>
  );
};
