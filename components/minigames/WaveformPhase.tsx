import React, { useState, useEffect, useRef, useMemo } from 'react';

interface WaveformPhaseProps {
  config: any;
  onComplete: () => void;
  scannerActive?: boolean;
  radioActive?: boolean;
}

export const WaveformPhase: React.FC<WaveformPhaseProps> = ({ config, onComplete, scannerActive = false, radioActive = false }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [params, setParams] = useState({ freq: 0, amp: 0.2, phase: 0 });
  const [target] = useState({
    freq: Math.random() * 4 + 1,
    amp: Math.random() * 0.5 + 0.5,
    phase: Math.random() * Math.PI * 2,
  });
  const [match, setMatch] = useState(0);
  const [hasCompleted, setHasCompleted] = useState(false);
  
  // Ghost entities that interfere with controls
  const [ghosts] = useState(() => [
    { x: Math.random() * 80 + 10, y: Math.random() * 60 + 20, speed: 0.3 + Math.random() * 0.2, captured: false },
    { x: Math.random() * 80 + 10, y: Math.random() * 60 + 20, speed: 0.2 + Math.random() * 0.3, captured: false },
    { x: Math.random() * 80 + 10, y: Math.random() * 60 + 20, speed: 0.25 + Math.random() * 0.25, captured: false }
  ]);
  const [ghostPositions, setGhostPositions] = useState(ghosts);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const lastInterferenceRef = useRef<number>(0);
  
  // Track mouse position for scanner/radio
  useEffect(() => {
    if (scannerActive || radioActive) {
      const handleMouseMove = (e: MouseEvent) => {
        setMousePos({ x: e.clientX, y: e.clientY });
      };
      window.addEventListener('mousemove', handleMouseMove);
      return () => window.removeEventListener('mousemove', handleMouseMove);
    }
  }, [scannerActive, radioActive]);
  
  // Calculate distance from mouse to ghost
  const calculateDistance = (ghostX: number, ghostY: number) => {
    const dx = (mousePos.x / window.innerWidth * 100) - ghostX;
    const dy = (mousePos.y / window.innerHeight * 100) - ghostY;
    return Math.sqrt(dx * dx + dy * dy);
  };
  
  // Capture ghost when clicked
  const captureGhost = (index: number) => {
    setGhostPositions(prev => prev.map((g, i) => 
      i === index ? { ...g, captured: true } : g
    ));
  };

  // Ghost movement and interference
  useEffect(() => {
    const moveInterval = setInterval(() => {
      setGhostPositions(prev => prev.map(ghost => {
        let newX = ghost.x + (Math.random() - 0.5) * ghost.speed;
        let newY = ghost.y + (Math.random() - 0.5) * ghost.speed;
        
        // Keep ghosts within bounds
        newX = Math.max(5, Math.min(95, newX));
        newY = Math.max(15, Math.min(85, newY));
        
        return { ...ghost, x: newX, y: newY };
      }));
    }, 50);
    
    return () => clearInterval(moveInterval);
  }, []);
  
  // Ghost interference with controls - only from uncaptured ghosts
  useEffect(() => {
    if (hasCompleted) return;
    
    const interferenceInterval = setInterval(() => {
      const now = Date.now();
      // Only interfere every 3-5 seconds
      if (now - lastInterferenceRef.current < 3000 + Math.random() * 2000) return;
      
      // Check if there are any uncaptured ghosts
      const uncapturedGhosts = ghostPositions.filter(g => !g.captured);
      if (uncapturedGhosts.length === 0) return;
      
      lastInterferenceRef.current = now;
      
      // Randomly change one parameter
      const paramKeys = ['freq', 'amp', 'phase'] as const;
      const randomParam = paramKeys[Math.floor(Math.random() * paramKeys.length)];
      
      setParams(prev => {
        const current = prev[randomParam];
        let change = 0;
        
        if (randomParam === 'freq') {
          change = (Math.random() - 0.5) * 1.5; // Change by up to ±0.75
        } else if (randomParam === 'amp') {
          change = (Math.random() - 0.5) * 0.4; // Change by up to ±0.2
        } else {
          change = (Math.random() - 0.5) * 2; // Change by up to ±1
        }
        
        return {
          ...prev,
          [randomParam]: Math.max(
            randomParam === 'freq' ? 0 : randomParam === 'amp' ? 0.2 : 0,
            Math.min(
              randomParam === 'freq' ? 5 : randomParam === 'amp' ? 1.5 : Math.PI * 2,
              current + change
            )
          )
        };
      });
    }, 500);
    
    return () => clearInterval(interferenceInterval);
  }, [hasCompleted, ghostPositions]);

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

  // Calculate frequency for each ghost (like Phase 2)
  const getGhostFrequencies = () => {
    if (!radioActive) return ghostPositions.map(() => 0);
    
    return ghostPositions.map(ghost => {
      if (ghost.captured) return 0;
      const dx = (mousePos.x / window.innerWidth * 100) - ghost.x;
      const dy = (mousePos.y / window.innerHeight * 100) - ghost.y;
      const distance = Math.sqrt(dx * dx + dy * dy);
      const maxDistance = 100;
      return Math.max(0, 100 - (distance / maxDistance * 100));
    });
  };
  
  const ghostFrequencies = getGhostFrequencies();
  const maxFrequency = Math.max(...ghostFrequencies);
  const closestGhostIndex = ghostFrequencies.indexOf(maxFrequency);
  const isNearAnyGhost = maxFrequency > 80;

  return (
    <>
      {/* Radio Frequency Display - Shows when radio is active */}
      {radioActive && (
        <div className="fixed bottom-6 right-[200px] z-50 w-[160px] animate-fade-in">
          <div className="relative">
            {/* Corner brackets */}
            <div className={`absolute -top-1 -left-1 w-4 h-4 border-t border-l transition-all duration-300 ${
              isNearAnyGhost ? 'border-neon-red shadow-[0_0_10px_rgba(255,42,42,0.8)]' : 'border-neon-red'
            }`}></div>
            <div className={`absolute -top-1 -right-1 w-4 h-4 border-t border-r transition-all duration-300 ${
              isNearAnyGhost ? 'border-neon-red shadow-[0_0_10px_rgba(255,42,42,0.8)]' : 'border-neon-red'
            }`}></div>
            <div className={`absolute -bottom-1 -left-1 w-4 h-4 border-b border-l transition-all duration-300 ${
              isNearAnyGhost ? 'border-neon-red shadow-[0_0_10px_rgba(255,42,42,0.8)]' : 'border-neon-red'
            }`}></div>
            <div className={`absolute -bottom-1 -right-1 w-4 h-4 border-b border-r transition-all duration-300 ${
              isNearAnyGhost ? 'border-neon-red shadow-[0_0_10px_rgba(255,42,42,0.8)]' : 'border-neon-red'
            }`}></div>
            
            {isNearAnyGhost && (
              <div className="absolute inset-0 bg-neon-red/20 blur-xl animate-pulse pointer-events-none"></div>
            )}
            
            <div className={`relative bg-black/90 border backdrop-blur-xl overflow-hidden transition-all duration-300 ${
              isNearAnyGhost 
                ? 'border-neon-red shadow-[0_0_50px_rgba(255,42,42,0.8)] scale-105' 
                : 'border-neon-red/40 shadow-[0_0_30px_rgba(255,42,42,0.25)]'
            }`}>
              {isNearAnyGhost && (
                <>
                  <div className="absolute inset-0 bg-gradient-to-b from-transparent via-neon-red/15 to-transparent animate-scan pointer-events-none"></div>
                  <div className="absolute inset-0 bg-gradient-to-b from-transparent via-neon-red/10 to-transparent animate-scan pointer-events-none" style={{ animationDelay: '0.5s' }}></div>
                </>
              )}
              
              <div className="w-full p-2 flex items-center justify-between gap-2 border-b border-white/10">
                <div className="flex items-center gap-1.5">
                  <span className="relative flex h-1.5 w-1.5">
                    <span className={`absolute inline-flex h-full w-full rounded-full bg-neon-red opacity-75 ${isNearAnyGhost ? 'animate-ping' : ''}`}></span>
                    <span className={`relative inline-flex rounded-full h-1.5 w-1.5 bg-neon-red ${isNearAnyGhost ? 'shadow-[0_0_8px_rgba(255,42,42,1)]' : ''}`}></span>
                  </span>
                  <p className={`font-tech text-neon-red text-[9px] uppercase tracking-[0.12em] font-bold transition-all duration-300 ${
                    isNearAnyGhost ? 'animate-pulse drop-shadow-[0_0_8px_rgba(255,42,42,1)]' : ''
                  }`}>
                    RADIO SIGNAL
                  </p>
                </div>
              </div>
              
              <div className="p-2 pt-2">
                <div className="flex items-end justify-center gap-0.5 h-12 mb-2 relative">
                  {isNearAnyGhost && (
                    <div className="absolute inset-0 bg-neon-red/10 blur-md animate-pulse"></div>
                  )}
                  
                  {[...Array(10)].map((_, i) => {
                    const barHeight = (maxFrequency / 100) * 10;
                    const isActive = i < barHeight;
                    return (
                      <div 
                        key={i}
                        className={`flex-1 transition-all duration-75 relative ${
                          isActive 
                            ? isNearAnyGhost 
                              ? 'bg-neon-red shadow-[0_0_15px_rgba(255,42,42,1)] animate-pulse' 
                              : 'bg-neon-red/70 shadow-[0_0_8px_rgba(255,42,42,0.6)]'
                            : 'bg-white/10'
                        }`}
                        style={{ 
                          height: `${(i + 1) * 10}%`,
                          animationDelay: `${i * 0.02}s`
                        }}
                      >
                        {isActive && isNearAnyGhost && (
                          <div className="absolute inset-0 bg-neon-red/50 blur-sm"></div>
                        )}
                      </div>
                    );
                  })}
                </div>
                
                <div className="text-center py-1 border-t border-white/5 relative">
                  {isNearAnyGhost && (
                    <div className="absolute inset-0 bg-neon-red/5 animate-pulse"></div>
                  )}
                  <p className="font-tech text-[7px] text-ash/60 uppercase tracking-wider mb-0.5 relative z-10">STRENGTH</p>
                  <p className={`font-display text-xl font-bold relative z-10 transition-all duration-300 ${
                    isNearAnyGhost 
                      ? 'text-neon-red animate-pulse drop-shadow-[0_0_10px_rgba(255,42,42,1)] scale-110' 
                      : 'text-white'
                  }`}>
                    {maxFrequency.toFixed(0)}%
                  </p>
                </div>
                
                {isNearAnyGhost && (
                  <div className="mt-1 pt-1 border-t border-neon-red/30 bg-neon-red/5 relative overflow-hidden">
                    <div className="absolute inset-0 bg-neon-red/10 animate-pulse"></div>
                    <p className="font-tech text-[7px] text-neon-red uppercase tracking-wider text-center animate-pulse relative z-10 drop-shadow-[0_0_6px_rgba(255,42,42,1)]">
                      ⚠️ ENTITY NEARBY
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    
    <div className="w-full max-w-2xl flex flex-col items-center gap-4 px-4 relative">
      {/* Floating Ghost Entities - Only visible with BOTH scanner AND near (frequency > 80%) */}
      {ghostPositions.map((ghost, idx) => {
        if (ghost.captured) return null;
        
        const frequency = ghostFrequencies[idx];
        const isNear = frequency > 80;
        const isVisible = scannerActive && isNear; // BOTH scanner AND near required
        
        return (
          <div
            key={idx}
            className="fixed z-30 transition-all duration-100 ease-linear"
            style={{
              left: `${ghost.x}%`,
              top: `${ghost.y}%`,
              transform: 'translate(-50%, -50%)',
              opacity: isVisible ? 1 : 0,
              pointerEvents: isVisible ? 'auto' : 'none'
            }}
          >
            <div 
              className="relative w-24 h-24 cursor-pointer group"
              onClick={() => captureGhost(idx)}
            >
              <svg viewBox="0 0 100 100" className="w-full h-full">
                <g className="group-hover:scale-110 transition-transform duration-200">
                  <path
                    d="M 50 25 Q 35 25 30 40 Q 28 50 28 60 L 28 75 Q 32 72 35 75 Q 38 78 41 75 Q 44 72 47 75 Q 50 78 53 75 Q 56 72 59 75 Q 62 78 65 75 Q 68 72 72 75 L 72 60 Q 72 50 70 40 Q 65 25 50 25 Z"
                    fill="none"
                    stroke="#FF2A2A"
                    strokeWidth="2"
                    className="animate-pulse"
                  />
                  <circle cx="42" cy="48" r="3" fill="#FF2A2A" className="animate-pulse" />
                  <circle cx="58" cy="48" r="3" fill="#FF2A2A" className="animate-pulse" />
                  <path
                    d="M 42 58 Q 50 62 58 58"
                    fill="none"
                    stroke="#FF2A2A"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                  />
                </g>
              </svg>
              
              {isVisible && (
                <div className="absolute -bottom-6 left-1/2 -translate-x-1/2 whitespace-nowrap">
                  <div className="relative">
                    <div className="absolute inset-0 bg-neon-red/20 blur-md"></div>
                    <p className="relative font-tech text-[8px] text-neon-red uppercase tracking-wider bg-black/90 px-2 py-0.5 rounded border border-neon-red/30 animate-pulse">
                      ⚠️ CLICK TO CAPTURE
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>
        );
      })}
      
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

      {/* Controls - Compact Design */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3 w-full max-w-xl">
        {[
          { key: 'freq', label: 'FREQUENCY', min: 0, max: 5 },
          { key: 'amp', label: 'AMPLITUDE', min: 0.2, max: 1.5 },
          { key: 'phase', label: 'PHASE SHIFT', min: 0, max: Math.PI * 2 }
        ].map(({ key, label, min, max }) => (
          <div key={key} className="relative">
            {/* Corner brackets */}
            <div className="absolute -top-1 -left-1 w-3 h-3 border-t border-l border-neon-red/60"></div>
            <div className="absolute -top-1 -right-1 w-3 h-3 border-t border-r border-neon-red/60"></div>
            <div className="absolute -bottom-1 -left-1 w-3 h-3 border-b border-l border-neon-red/60"></div>
            <div className="absolute -bottom-1 -right-1 w-3 h-3 border-b border-r border-neon-red/60"></div>
            
            <div className="relative bg-black/90 border border-neon-red/40 backdrop-blur-xl shadow-[0_0_20px_rgba(255,42,42,0.15)] p-3 hover:border-neon-red/60 transition-all duration-300">
              {/* Scan line effect */}
              <div className="absolute inset-0 bg-gradient-to-b from-transparent via-neon-red/5 to-transparent animate-scan pointer-events-none opacity-50"></div>
              
              {/* Header */}
              <div className="relative z-10 flex items-center justify-between mb-2 pb-1.5 border-b border-white/10">
                <p className="font-tech text-[9px] tracking-[0.15em] uppercase text-neon-red font-bold">{label}</p>
                <span className="relative flex h-1.5 w-1.5">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-neon-red opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-neon-red"></span>
                </span>
              </div>
              
              {/* Value Display */}
              <div className="relative z-10 text-center mb-2">
                <p className="font-display text-2xl font-bold text-white">
                  {params[key as keyof typeof params].toFixed(2)}
                </p>
              </div>
              
              {/* Slider Container */}
              <div className="relative z-10">
                {/* Track background with gradient */}
                <div className="relative h-1.5 bg-black/60 border border-white/10 mb-1">
                  {/* Progress fill */}
                  <div 
                    className="absolute inset-y-0 left-0 bg-gradient-to-r from-neon-red/40 to-neon-red/20 border-r border-neon-red/60"
                    style={{ 
                      width: `${((params[key as keyof typeof params] - min) / (max - min)) * 100}%` 
                    }}
                  ></div>
                  
                  {/* Tick marks */}
                  <div className="absolute inset-0 flex justify-between items-center px-0.5">
                    {[...Array(5)].map((_, i) => (
                      <div key={i} className="w-px h-1 bg-white/20"></div>
                    ))}
                  </div>
                </div>
                
                {/* Actual slider */}
                <input 
                  type="range" 
                  min={min} 
                  max={max} 
                  step="0.01" 
                  value={params[key as keyof typeof params]} 
                  onChange={e => handleSlider(key as any, e.target.value)}
                  className="absolute bottom-0 left-0 right-0 w-full h-1.5 bg-transparent appearance-none cursor-pointer
                    [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-3.5 [&::-webkit-slider-thumb]:h-3.5 
                    [&::-webkit-slider-thumb]:bg-neon-red [&::-webkit-slider-thumb]:border-2 [&::-webkit-slider-thumb]:border-white/40
                    [&::-webkit-slider-thumb]:shadow-[0_0_10px_rgba(255,42,42,1)] [&::-webkit-slider-thumb]:cursor-grab
                    [&::-webkit-slider-thumb]:active:cursor-grabbing [&::-webkit-slider-thumb]:hover:scale-110 [&::-webkit-slider-thumb]:transition-transform
                    [&::-webkit-slider-thumb]:relative [&::-webkit-slider-thumb]:z-10
                    [&::-moz-range-thumb]:w-3.5 [&::-moz-range-thumb]:h-3.5 [&::-moz-range-thumb]:bg-neon-red 
                    [&::-moz-range-thumb]:border-2 [&::-moz-range-thumb]:border-white/40 [&::-moz-range-thumb]:rounded-none
                    [&::-moz-range-thumb]:shadow-[0_0_10px_rgba(255,42,42,1)] [&::-moz-range-thumb]:cursor-grab"
                />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
    </>
  );
};
