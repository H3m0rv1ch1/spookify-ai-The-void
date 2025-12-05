import React, { useState, useEffect, useRef } from 'react';

interface PurgePhaseProps {
  config: any;
  onComplete: () => void;
  onFail: () => void;
  purgeActive?: boolean;
  radioActive?: boolean;
  scannerActive?: boolean;
}

export const PurgePhase: React.FC<PurgePhaseProps> = ({ config, onComplete, onFail, purgeActive = false, radioActive = false, scannerActive = false }) => {
  const [progress, setProgress] = useState(0);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const [entityPosition] = useState({ x: Math.random() * 60 + 20, y: Math.random() * 60 + 20 }); // Random position 20-80%
  const [entityFound, setEntityFound] = useState(false);
  const [spikes] = useState(() => {
    const s = new Set<number>();
    while(s.size < config.purgeSpikes) {
      s.add(Math.floor(Math.random() * 85) + 10); // Spikes between 10% and 95%
    }
    return Array.from(s).sort((a,b) => a - b);
  });
  const [isHolding, setIsHolding] = useState(false);
  const [nextSpikeIndex, setNextSpikeIndex] = useState(0);
  const [clearedSpikes, setClearedSpikes] = useState<Set<number>>(new Set());
  const [spikePositions] = useState(() => 
    spikes.map(() => ({
      x: Math.random() * 70 + 15, // 15-85% of screen width
      y: Math.random() * 70 + 15  // 15-85% of screen height
    }))
  );
  const [holdingSpike, setHoldingSpike] = useState<number | null>(null);
  const [spikeHoldProgress, setSpikeHoldProgress] = useState(0);
  const spikeHoldRef = useRef<number | undefined>(undefined);
  const intervalRef = useRef<number | undefined>(undefined);

  const startHoldingSpike = (spikeIndex: number) => {
    if (!purgeActive || clearedSpikes.has(spikes[spikeIndex])) return;
    console.log('Started holding spike:', spikeIndex);
    setHoldingSpike(spikeIndex);
    setSpikeHoldProgress(0);
    
    spikeHoldRef.current = window.setInterval(() => {
      setSpikeHoldProgress(prev => {
        const newProgress = prev + 2; // 2% per 50ms = 2.5 seconds to clear
        if (newProgress >= 100) {
          if (spikeHoldRef.current !== undefined) window.clearInterval(spikeHoldRef.current);
          setClearedSpikes(prevCleared => {
            const newSet = new Set(prevCleared);
            newSet.add(spikes[spikeIndex]);
            return newSet;
          });
          setHoldingSpike(null);
          setSpikeHoldProgress(0);
          return 100;
        }
        return newProgress;
      });
    }, 50);
  };

  const stopHoldingSpike = () => {
    if (spikeHoldRef.current !== undefined) window.clearInterval(spikeHoldRef.current);
    setHoldingSpike(null);
    setSpikeHoldProgress(0);
  };

  const allSpikesCleared = spikes.every(spike => clearedSpikes.has(spike));

  const startProgress = () => {
    console.log('startProgress called', { progress, purgeActive, entityFound, allSpikesCleared });
    if(progress >= 100 || !purgeActive || !entityFound || !allSpikesCleared) {
      console.log('Cannot start - conditions not met');
      return;
    }
    console.log('Starting progress...');
    setIsHolding(true);
    intervalRef.current = window.setInterval(() => {
      setProgress(p => {
        const newP = p + (100 / (config.purgeDuration / 50));
        
        // Reached 100% - SUCCESS (no more spike checks since they're all cleared)
        if (newP >= 100) {
          console.log('Reached 100%!');
          if(intervalRef.current !== undefined) window.clearInterval(intervalRef.current);
          setIsHolding(false);
          setTimeout(() => onComplete(), 200);
          return 100;
        }
        
        return newP;
      });
    }, 50);
  };

  const stopProgress = () => {
    setIsHolding(false);
    if(intervalRef.current !== undefined) window.clearInterval(intervalRef.current);
    // When releasing, just stop - no penalty, no success
    // Player must release BEFORE spikes and continue holding after
  };

  useEffect(() => {
    // Update next spike indicator
    const nextSpike = spikes.findIndex(s => s > progress);
    setNextSpikeIndex(nextSpike);
  }, [progress, spikes]);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      const rect = e.currentTarget as HTMLElement;
      setMousePos({ x: e.clientX, y: e.clientY });
    };
    
    if (radioActive || scannerActive) {
      window.addEventListener('mousemove', handleMouseMove as any);
    }
    
    return () => {
      if(intervalRef.current !== undefined) window.clearInterval(intervalRef.current);
      if(spikeHoldRef.current !== undefined) window.clearInterval(spikeHoldRef.current);
      window.removeEventListener('mousemove', handleMouseMove as any);
    };
  }, [radioActive, scannerActive]);

  const nextSpikeValue = nextSpikeIndex >= 0 ? spikes[nextSpikeIndex] : null;

  // Calculate distance from mouse to entity (for radio frequency)
  const calculateFrequency = () => {
    if (!radioActive) return 0;
    const dx = (mousePos.x / window.innerWidth * 100) - entityPosition.x;
    const dy = (mousePos.y / window.innerHeight * 100) - entityPosition.y;
    const distance = Math.sqrt(dx * dx + dy * dy);
    const maxDistance = 100;
    const frequency = Math.max(0, 100 - (distance / maxDistance * 100));
    return frequency;
  };

  const frequency = calculateFrequency();
  const isNearEntity = frequency > 80; // Very close to entity

  // Debug logging
  useEffect(() => {
    console.log('PurgePhase state:', { purgeActive, radioActive, scannerActive, entityFound, progress });
  }, [purgeActive, radioActive, scannerActive, entityFound, progress]);

  return (
    <>
      {/* Frequency Display Card - To the LEFT of Detection Tools - Show when radio is active */}
      {radioActive && (
        <div className="fixed bottom-6 right-[200px] z-50 w-[160px] animate-fade-in">
          <div className="relative">
            {/* Corner brackets - glow when near entity */}
            <div className={`absolute -top-1 -left-1 w-4 h-4 border-t border-l transition-all duration-300 ${
              isNearEntity ? 'border-neon-red shadow-[0_0_10px_rgba(255,42,42,0.8)]' : 'border-neon-red'
            }`}></div>
            <div className={`absolute -top-1 -right-1 w-4 h-4 border-t border-r transition-all duration-300 ${
              isNearEntity ? 'border-neon-red shadow-[0_0_10px_rgba(255,42,42,0.8)]' : 'border-neon-red'
            }`}></div>
            <div className={`absolute -bottom-1 -left-1 w-4 h-4 border-b border-l transition-all duration-300 ${
              isNearEntity ? 'border-neon-red shadow-[0_0_10px_rgba(255,42,42,0.8)]' : 'border-neon-red'
            }`}></div>
            <div className={`absolute -bottom-1 -right-1 w-4 h-4 border-b border-r transition-all duration-300 ${
              isNearEntity ? 'border-neon-red shadow-[0_0_10px_rgba(255,42,42,0.8)]' : 'border-neon-red'
            }`}></div>
            
            {/* Outer glow effect when near entity */}
            {isNearEntity && (
              <div className="absolute inset-0 bg-neon-red/20 blur-xl animate-pulse pointer-events-none"></div>
            )}
            
            <div className={`relative bg-black/90 border backdrop-blur-xl overflow-hidden transition-all duration-300 ${
              isNearEntity 
                ? 'border-neon-red shadow-[0_0_50px_rgba(255,42,42,0.8)] scale-105' 
                : 'border-neon-red/40 shadow-[0_0_30px_rgba(255,42,42,0.25)]'
            }`}>
              {/* Animated scan lines - multiple when near entity */}
              {isNearEntity && (
                <>
                  <div className="absolute inset-0 bg-gradient-to-b from-transparent via-neon-red/15 to-transparent animate-scan pointer-events-none"></div>
                  <div className="absolute inset-0 bg-gradient-to-b from-transparent via-neon-red/10 to-transparent animate-scan pointer-events-none" style={{ animationDelay: '0.5s' }}></div>
                </>
              )}
              
              {/* Header - Always visible */}
              <div className="w-full p-2 flex items-center justify-between gap-2 border-b border-white/10">
                <div className="flex items-center gap-1.5">
                  <span className="relative flex h-1.5 w-1.5">
                    <span className={`absolute inline-flex h-full w-full rounded-full bg-neon-red opacity-75 ${isNearEntity ? 'animate-ping' : ''}`}></span>
                    <span className={`relative inline-flex rounded-full h-1.5 w-1.5 bg-neon-red ${isNearEntity ? 'shadow-[0_0_8px_rgba(255,42,42,1)]' : ''}`}></span>
                  </span>
                  <p className={`font-tech text-neon-red text-[9px] uppercase tracking-[0.12em] font-bold transition-all duration-300 ${
                    isNearEntity ? 'animate-pulse drop-shadow-[0_0_8px_rgba(255,42,42,1)]' : ''
                  }`}>
                    RADIO SIGNAL
                  </p>
                </div>
              </div>
              
              {/* Frequency Content */}
              <div className="p-2 pt-2">
                {/* Frequency Bars */}
                <div className="flex items-end justify-center gap-0.5 h-12 mb-2 relative">
                  {/* Background glow when near entity */}
                  {isNearEntity && (
                    <div className="absolute inset-0 bg-neon-red/10 blur-md animate-pulse"></div>
                  )}
                  
                  {[...Array(10)].map((_, i) => {
                    const barHeight = (frequency / 100) * 10;
                    const isActive = i < barHeight;
                    return (
                      <div 
                        key={i}
                        className={`flex-1 transition-all duration-150 relative ${
                          isActive 
                            ? isNearEntity 
                              ? 'bg-neon-red shadow-[0_0_15px_rgba(255,42,42,1)] animate-pulse' 
                              : 'bg-cyan-400'
                            : 'bg-white/10'
                        }`}
                        style={{ 
                          height: `${(i + 1) * 10}%`,
                          animationDelay: `${i * 0.05}s`
                        }}
                      >
                        {/* Extra glow layer for active bars when near entity */}
                        {isActive && isNearEntity && (
                          <div className="absolute inset-0 bg-neon-red/50 blur-sm"></div>
                        )}
                      </div>
                    );
                  })}
                </div>
                
                {/* Frequency Value */}
                <div className="text-center py-1 border-t border-white/5 relative">
                  {isNearEntity && (
                    <div className="absolute inset-0 bg-neon-red/5 animate-pulse"></div>
                  )}
                  <p className="font-tech text-[7px] text-ash/60 uppercase tracking-wider mb-0.5 relative z-10">STRENGTH</p>
                  <p className={`font-display text-xl font-bold relative z-10 transition-all duration-300 ${
                    isNearEntity 
                      ? 'text-neon-red animate-pulse drop-shadow-[0_0_10px_rgba(255,42,42,1)] scale-110' 
                      : 'text-white'
                  }`}>
                    {frequency.toFixed(0)}%
                  </p>
                </div>
                
                {isNearEntity && (
                  <div className="mt-1 pt-1 border-t border-neon-red/30 bg-neon-red/5 relative overflow-hidden">
                    {/* Pulsing background */}
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
      
      <div className="w-full max-w-2xl flex flex-col items-center gap-8 px-4">
        {/* Header */}
      <div className="text-center">
        <p className="font-tech text-neon-red text-xs tracking-[0.3em] uppercase mb-2 animate-pulse">// PHASE 02</p>
        <h3 className="font-display text-3xl md:text-4xl font-bold text-white mb-2">NEURAL PURGE</h3>
        <p className="font-tech text-ash/60 text-xs tracking-wider mb-4">
          {!entityFound 
            ? <span className="text-neon-red animate-pulse">⚠️ Use RADIO DECODER to locate entity, then VOID SCANNER to reveal</span>
            : !purgeActive 
              ? <span className="text-neon-red animate-pulse">⚠️ Select NEURAL PURGE tool to activate</span>
              : !allSpikesCleared
                ? <span className="text-neon-red animate-pulse">⚠️ Click all {spikes.length} red spikes to clear them first ({clearedSpikes.size}/{spikes.length})</span>
                : "All spikes cleared! Hold button to charge to 100%."}
        </p>
        
        {/* Spike Locations - Hold to deactivate */}
        {purgeActive && spikePositions.map((pos, idx) => {
          const spike = spikes[idx];
          const isCleared = clearedSpikes.has(spike);
          const isHoldingThis = holdingSpike === idx;
          
          return (
            <div
              key={idx}
              className="fixed z-40 animate-fade-in"
              style={{
                left: `${pos.x}%`,
                top: `${pos.y}%`,
                transform: 'translate(-50%, -50%)',
                pointerEvents: isCleared ? 'none' : 'auto'
              }}
              onMouseDown={() => startHoldingSpike(idx)}
              onMouseUp={stopHoldingSpike}
              onMouseLeave={stopHoldingSpike}
              onTouchStart={() => startHoldingSpike(idx)}
              onTouchEnd={stopHoldingSpike}
            >
              <div className="relative">
                {/* Outer glow */}
                <div className={`absolute inset-0 rounded-full w-16 h-16 -translate-x-1/2 -translate-y-1/2 left-1/2 top-1/2 transition-all duration-300 ${
                  isCleared 
                    ? 'bg-green-500/20 blur-xl' 
                    : isHoldingThis 
                      ? 'bg-neon-red/40 blur-2xl animate-pulse' 
                      : 'bg-neon-red/20 blur-xl animate-pulse'
                }`}></div>
                
                {/* Spike marker */}
                <div className={`relative w-12 h-12 rounded-full border-4 flex items-center justify-center cursor-pointer transition-all duration-300 ${
                  isCleared
                    ? 'bg-green-500/20 border-green-500 shadow-[0_0_20px_rgba(34,197,94,0.8)]'
                    : isHoldingThis
                      ? 'bg-neon-red/30 border-neon-red shadow-[0_0_30px_rgba(255,42,42,1)] scale-110'
                      : 'bg-black/80 border-neon-red shadow-[0_0_20px_rgba(255,42,42,0.6)] hover:scale-110'
                }`}>
                  {/* Progress ring when holding */}
                  {isHoldingThis && (
                    <svg className="absolute inset-0 w-full h-full -rotate-90" viewBox="0 0 100 100">
                      <circle
                        cx="50"
                        cy="50"
                        r="45"
                        stroke="#FF2A2A"
                        strokeWidth="8"
                        fill="none"
                        strokeDasharray="283"
                        strokeDashoffset={283 - (spikeHoldProgress / 100) * 283}
                        className="transition-all duration-100"
                      />
                    </svg>
                  )}
                  
                  {/* Icon */}
                  <span className={`relative z-10 text-2xl ${isCleared ? '' : 'animate-pulse'}`}>
                    {isCleared ? '✓' : '⚠️'}
                  </span>
                </div>
                
                {/* Label */}
                <div className="absolute -bottom-8 left-1/2 -translate-x-1/2 whitespace-nowrap">
                  <p className={`font-tech text-[9px] uppercase tracking-wider px-2 py-0.5 rounded ${
                    isCleared
                      ? 'text-green-500 bg-green-500/10'
                      : isHoldingThis
                        ? 'text-neon-red bg-black/90 animate-pulse'
                        : 'text-neon-red bg-black/80'
                  }`}>
                    {isCleared ? 'CLEARED' : isHoldingThis ? `${spikeHoldProgress.toFixed(0)}%` : 'HOLD TO CLEAR'}
                  </p>
                </div>
              </div>
            </div>
          );
        })}
        
        {/* Entity Reveal with Scanner - ONLY when scanner is active AND near entity */}
        {scannerActive && isNearEntity && !entityFound && (
          <div 
            className="fixed z-50 animate-fade-in"
            style={{
              left: `${entityPosition.x}%`,
              top: `${entityPosition.y}%`,
              transform: 'translate(-50%, -50%)',
              pointerEvents: 'auto'
            }}
          >
            <div className="relative">
              <div className="absolute inset-0 bg-neon-red/30 blur-2xl rounded-full w-32 h-32 animate-pulse"></div>
              <div 
                className="relative text-6xl cursor-pointer pointer-events-auto"
                onClick={() => setEntityFound(true)}
              >
                👻
              </div>
              <div className="absolute -bottom-6 left-1/2 -translate-x-1/2 whitespace-nowrap">
                <p className="font-tech text-[10px] text-neon-red uppercase tracking-wider bg-black/90 px-2 py-1 rounded animate-pulse">
                  CLICK TO CAPTURE
                </p>
              </div>
            </div>
          </div>
        )}
        
        {/* Warning indicator */}
        {entityFound && nextSpikeValue !== null && (
          <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-neon-red/10 border border-neon-red/30 animate-pulse">
            <svg className="w-4 h-4 text-neon-red" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
            </svg>
            <span className="font-tech text-[10px] text-neon-red tracking-wider uppercase">
              NEXT SPIKE AT {nextSpikeValue.toFixed(0)}%
            </span>
          </div>
        )}
      </div>

      {/* Purge Circle */}
      <div className="relative w-56 h-56 md:w-64 md:h-64">
        {/* Outer glow ring */}
        <div className={`absolute inset-0 rounded-full transition-all duration-300 ${
          isHolding ? 'bg-neon-red/20 blur-2xl animate-pulse' : 'bg-neon-red/5 blur-xl'
        }`}></div>
        
        <svg className="w-full h-full relative z-10" viewBox="0 0 100 100">
          {/* Background Track */}
          <circle cx="50" cy="50" r="45" stroke="rgba(255,255,255,0.05)" strokeWidth="6" fill="none" />
          
          {/* Progress Circle */}
          <circle 
            cx="50" 
            cy="50" 
            r="45" 
            stroke="#FF2A2A" 
            strokeWidth="6" 
            fill="none"
            strokeDasharray="283"
            strokeDashoffset={283 - (progress / 100) * 283}
            transform="rotate(-90 50 50)"
            className="transition-all duration-100"
            style={{ 
              filter: isHolding ? 'drop-shadow(0 0 8px #FF2A2A)' : 'none'
            }}
          />
          
          {/* Danger Spikes - Visual indicators */}
          {spikes.map((spike, idx) => {
            const isCleared = clearedSpikes.has(spike);
            const isPassed = progress > spike;
            
            return (
              <g 
                key={spike} 
                transform={`rotate(${spike * 3.6} 50 50)`}
              >
                <rect 
                  x="47" 
                  y="-2" 
                  width="6" 
                  height="12" 
                  fill={isCleared ? '#22C55E' : isPassed ? '#FFFFFF' : '#FF2A2A'}
                  opacity={isCleared ? 1 : isPassed ? 0.3 : 0.8}
                  className={isCleared ? 'animate-pulse' : ''}
                />
                {isCleared && (
                  <rect 
                    x="47" 
                    y="-2" 
                    width="6" 
                    height="12" 
                    fill="#22C55E"
                    opacity="0.5"
                    className="animate-ping"
                  />
                )}
              </g>
            );
          })}
        </svg>
        
        {/* Center Button */}
        <button 
          onMouseDown={startProgress} 
          onMouseUp={stopProgress} 
          onMouseLeave={stopProgress}
          onTouchStart={startProgress} 
          onTouchEnd={stopProgress}
          disabled={!purgeActive || !entityFound || !allSpikesCleared}
          className={`absolute inset-12 md:inset-16 rounded-full flex flex-col items-center justify-center font-display uppercase tracking-widest transition-all duration-200 border-4 z-20
          ${!purgeActive || !entityFound || !allSpikesCleared
            ? 'bg-black/90 border-white/20 text-white/30 cursor-not-allowed' 
            : isHolding 
              ? 'bg-neon-red text-black border-white/50 shadow-[0_0_40px_#ff2a2a] scale-95' 
              : 'bg-black/80 border-neon-red text-neon-red hover:bg-neon-red/10 hover:scale-105 cursor-pointer'
          }`}
        >
          <span className="text-2xl md:text-3xl font-bold mb-1">
            {!entityFound ? 'FIND ENTITY' : !purgeActive ? 'LOCKED' : !allSpikesCleared ? 'CLEAR SPIKES' : isHolding ? 'PURGING' : 'HOLD'}
          </span>
          <span className="text-sm md:text-base font-tech tracking-wider opacity-80">
            {progress.toFixed(0)}%
          </span>
        </button>
        
        {/* Corner brackets */}
        <div className="absolute -top-2 -left-2 w-8 h-8 border-t-2 border-l-2 border-neon-red/50"></div>
        <div className="absolute -top-2 -right-2 w-8 h-8 border-t-2 border-r-2 border-neon-red/50"></div>
        <div className="absolute -bottom-2 -left-2 w-8 h-8 border-b-2 border-l-2 border-neon-red/50"></div>
        <div className="absolute -bottom-2 -right-2 w-8 h-8 border-b-2 border-r-2 border-neon-red/50"></div>
      </div>

      {/* Stats Display */}
      <div className="grid grid-cols-2 gap-4 w-full max-w-md">
        <div className="relative bg-black/80 border-2 border-white/20 p-4 text-center hover:border-white/40 transition-all duration-300 shadow-[0_0_20px_rgba(255,255,255,0.05)]">
          <div className="absolute top-0 left-0 w-3 h-3 border-t-2 border-l-2 border-white"></div>
          <div className="absolute bottom-0 right-0 w-3 h-3 border-b-2 border-r-2 border-white"></div>
          <p className="font-tech text-[10px] text-ash/60 tracking-wider uppercase mb-2">Spikes Cleared</p>
          <p className="font-display text-3xl text-white">{spikes.filter(s => progress > s).length}/{spikes.length}</p>
        </div>
        <div className="relative bg-black/80 border-2 border-neon-red/30 p-4 text-center hover:border-neon-red/50 transition-all duration-300 shadow-[0_0_20px_rgba(255,42,42,0.1)]">
          <div className="absolute top-0 left-0 w-3 h-3 border-t-2 border-l-2 border-neon-red"></div>
          <div className="absolute bottom-0 right-0 w-3 h-3 border-b-2 border-r-2 border-neon-red"></div>
          <p className="font-tech text-[10px] text-ash/60 tracking-wider uppercase mb-2">Purge Status</p>
          <p className="font-display text-3xl text-neon-red">{isHolding ? 'ACTIVE' : 'STANDBY'}</p>
        </div>
      </div>
      </div>
    </>
  );
};
