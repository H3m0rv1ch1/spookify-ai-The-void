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
  const [destroyedSpikes, setDestroyedSpikes] = useState<Set<number>>(new Set());
  const [explodingSpikes, setExplodingSpikes] = useState<Set<number>>(new Set());
  const [isHolding, setIsHolding] = useState(false);
  const [nextSpikeIndex, setNextSpikeIndex] = useState(0);
  const intervalRef = useRef<number | undefined>(undefined);

  const startProgress = () => {
    console.log('startProgress called', { progress, purgeActive, entityFound });
    if(progress >= 100 || !purgeActive || !entityFound) {
      console.log('Cannot start - conditions not met');
      return;
    }
    console.log('Starting progress...');
    setIsHolding(true);
    intervalRef.current = window.setInterval(() => {
      setProgress(p => {
        const newP = p + (100 / (config.purgeDuration / 50));
        
        // Check if we hit a spike that hasn't been destroyed yet
        const hitSpike = spikes.find(s => !destroyedSpikes.has(s) && s > p && s <= newP);
        if (hitSpike) {
          console.log('Hit spike at', hitSpike, '- Exploding!');
          // Mark spike as exploding
          setExplodingSpikes(prev => new Set(prev).add(hitSpike));
          // After animation, mark as destroyed
          setTimeout(() => {
            setDestroyedSpikes(prev => new Set(prev).add(hitSpike));
            setExplodingSpikes(prev => {
              const newSet = new Set(prev);
              newSet.delete(hitSpike);
              return newSet;
            });
          }, 300);
          // Continue progress
        }
        
        // Reached 100% - SUCCESS
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
  };

  useEffect(() => {
    // Update next spike indicator - only count non-destroyed spikes
    const nextSpike = spikes.findIndex(s => !destroyedSpikes.has(s) && s > progress);
    setNextSpikeIndex(nextSpike);
  }, [progress, spikes, destroyedSpikes]);

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
                        className={`flex-1 transition-all duration-75 relative ${
                          isActive 
                            ? isNearEntity 
                              ? 'bg-neon-red shadow-[0_0_15px_rgba(255,42,42,1)] animate-pulse' 
                              : 'bg-neon-red/70 shadow-[0_0_8px_rgba(255,42,42,0.6)]'
                            : 'bg-white/10'
                        }`}
                        style={{ 
                          height: `${(i + 1) * 10}%`,
                          animationDelay: `${i * 0.02}s`
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
              : "Hold the center circle to charge to 100%. Spikes will explode when touched!"}
        </p>
        
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
              {/* Custom Entity Icon - Clean outline only */}
              <div 
                className="relative w-24 h-24 cursor-pointer pointer-events-auto group"
                onClick={() => setEntityFound(true)}
              >
                <svg viewBox="0 0 100 100" className="w-full h-full">
                  {/* Main entity body - ghost/wraith shape - outline only */}
                  <g className="group-hover:scale-110 transition-transform duration-200">
                    {/* Body outline */}
                    <path
                      d="M 50 25 Q 35 25 30 40 Q 28 50 28 60 L 28 75 Q 32 72 35 75 Q 38 78 41 75 Q 44 72 47 75 Q 50 78 53 75 Q 56 72 59 75 Q 62 78 65 75 Q 68 72 72 75 L 72 60 Q 72 50 70 40 Q 65 25 50 25 Z"
                      fill="none"
                      stroke="#FF2A2A"
                      strokeWidth="2"
                      className="animate-pulse"
                    />
                    
                    {/* Eyes */}
                    <circle cx="42" cy="48" r="3" fill="#FF2A2A" className="animate-pulse" />
                    <circle cx="58" cy="48" r="3" fill="#FF2A2A" className="animate-pulse" />
                    
                    {/* Mouth */}
                    <path
                      d="M 42 58 Q 50 62 58 58"
                      fill="none"
                      stroke="#FF2A2A"
                      strokeWidth="1.5"
                      strokeLinecap="round"
                    />
                  </g>
                </svg>
              </div>
              
              {/* Label */}
              <div className="absolute -bottom-8 left-1/2 -translate-x-1/2 whitespace-nowrap">
                <div className="relative">
                  <div className="absolute inset-0 bg-neon-red/20 blur-md"></div>
                  <p className="relative font-tech text-[10px] text-neon-red uppercase tracking-wider bg-black/90 px-3 py-1 rounded border border-neon-red/30 animate-pulse shadow-[0_0_15px_rgba(255,42,42,0.5)]">
                    ⚠️ CLICK TO CAPTURE
                  </p>
                </div>
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
      <div className="relative w-64 h-64 md:w-72 md:h-72">
        {/* Outer glow rings - multiple layers */}
        <div className={`absolute inset-0 rounded-full transition-all duration-300 ${
          isHolding ? 'bg-neon-red/30 blur-3xl animate-pulse' : 'bg-neon-red/10 blur-2xl'
        }`}></div>
        <div className={`absolute inset-4 rounded-full transition-all duration-300 ${
          isHolding ? 'bg-neon-red/20 blur-xl animate-pulse' : 'bg-neon-red/5 blur-lg'
        }`}></div>
        
        {/* Tech grid background */}
        <div className="absolute inset-0 rounded-full overflow-hidden opacity-20">
          <div className="absolute inset-0" style={{
            backgroundImage: 'linear-gradient(rgba(255,42,42,0.3) 1px, transparent 1px), linear-gradient(90deg, rgba(255,42,42,0.3) 1px, transparent 1px)',
            backgroundSize: '20px 20px'
          }}></div>
        </div>
        
        <svg className="w-full h-full relative z-10" viewBox="0 0 100 100">
          {/* Outer decorative ring */}
          <circle cx="50" cy="50" r="48" stroke="rgba(255,42,42,0.2)" strokeWidth="0.5" fill="none" />
          
          {/* Background Track - thicker and more defined */}
          <circle cx="50" cy="50" r="45" stroke="rgba(255,255,255,0.08)" strokeWidth="8" fill="none" />
          
          {/* Inner shadow track */}
          <circle cx="50" cy="50" r="45" stroke="rgba(0,0,0,0.5)" strokeWidth="8" fill="none" opacity="0.3" />
          
          {/* Progress Circle - Enhanced */}
          <circle 
            cx="50" 
            cy="50" 
            r="45" 
            stroke="url(#progressGradient)" 
            strokeWidth="8" 
            fill="none"
            strokeDasharray="283"
            strokeDashoffset={283 - (progress / 100) * 283}
            transform="rotate(-90 50 50)"
            className="transition-all duration-100"
            style={{ 
              filter: isHolding ? 'drop-shadow(0 0 12px #FF2A2A) drop-shadow(0 0 6px #FF2A2A)' : 'drop-shadow(0 0 4px #FF2A2A)'
            }}
          />
          
          {/* Progress gradient definition */}
          <defs>
            <linearGradient id="progressGradient" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#FF2A2A" stopOpacity="1" />
              <stop offset="50%" stopColor="#FF5555" stopOpacity="1" />
              <stop offset="100%" stopColor="#FF2A2A" stopOpacity="1" />
            </linearGradient>
            <linearGradient id="spikeGradient" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#FF5555" stopOpacity="1" />
              <stop offset="50%" stopColor="#FF2A2A" stopOpacity="1" />
              <stop offset="100%" stopColor="#CC0000" stopOpacity="1" />
            </linearGradient>
            <filter id="spikeGlow">
              <feGaussianBlur stdDeviation="2" result="coloredBlur"/>
              <feMerge>
                <feMergeNode in="coloredBlur"/>
                <feMergeNode in="SourceGraphic"/>
              </feMerge>
            </filter>
          </defs>
          
          {/* Tick marks every 10% - Smaller */}
          {[...Array(10)].map((_, i) => {
            const angle = i * 36;
            const isActive = progress >= (i * 10);
            return (
              <g key={`tick-${i}`} transform={`rotate(${angle} 50 50)`}>
                <line
                  x1="50"
                  y1="3"
                  x2="50"
                  y2="5.5"
                  stroke={isActive ? '#FF2A2A' : 'rgba(255,255,255,0.2)'}
                  strokeWidth="0.8"
                  opacity={isActive ? 0.8 : 0.4}
                  className="transition-colors duration-200"
                />
              </g>
            );
          })}
          
          {/* Danger Spikes - With enhanced explosion animation */}
          {spikes.map((spike, idx) => {
            const isDestroyed = destroyedSpikes.has(spike);
            const isExploding = explodingSpikes.has(spike);
            const isPassed = progress > spike;
            const isNear = Math.abs(progress - spike) < 3 && !isPassed && !isDestroyed;
            const isTouching = Math.abs(progress - spike) < 1 && !isPassed && !isDestroyed;
            
            // Don't render destroyed spikes
            if (isDestroyed) return null;
            
            return (
              <g 
                key={spike} 
                transform={`rotate(${spike * 3.6} 50 50)`}
              >
                {/* Compact Explosion effect */}
                {isExploding && (
                  <>
                    {/* Core flash */}
                    <circle 
                      cx="50" 
                      cy="4" 
                      r="2" 
                      fill="#FFFFFF"
                      opacity="1"
                      className="animate-ping"
                    />
                    
                    {/* Shockwave rings - smaller */}
                    <circle 
                      cx="50" 
                      cy="4" 
                      r="6" 
                      fill="none"
                      stroke="#FF2A2A"
                      strokeWidth="1"
                      opacity="0.7"
                      className="animate-ping"
                    />
                    <circle 
                      cx="50" 
                      cy="4" 
                      r="5" 
                      fill="#FF5555"
                      opacity="0.5"
                      className="animate-ping"
                      style={{ animationDelay: '0.05s' }}
                    />
                    
                    {/* Explosion particles - fewer and smaller */}
                    {[0, 90, 180, 270].map(angle => (
                      <g key={angle}>
                        {/* Main particles */}
                        <circle
                          cx="50"
                          cy="4"
                          r="1"
                          fill="#FF2A2A"
                          opacity="0.8"
                          className="animate-ping"
                          transform={`rotate(${angle} 50 4) translate(0 -5)`}
                        />
                        {/* Spark trails */}
                        <line
                          x1="50"
                          y1="4"
                          x2="50"
                          y2="0"
                          stroke="#FF5555"
                          strokeWidth="0.3"
                          opacity="0.5"
                          className="animate-ping"
                          transform={`rotate(${angle} 50 4)`}
                        />
                      </g>
                    ))}
                    
                    {/* Outer glow - smaller */}
                    <circle 
                      cx="50" 
                      cy="4" 
                      r="8" 
                      fill="#FF2A2A"
                      opacity="0.3"
                      className="animate-ping"
                    />
                  </>
                )}
                
                {/* Glow effect when touching */}
                {isTouching && isHolding && !isExploding && (
                  <>
                    <circle 
                      cx="50" 
                      cy="3" 
                      r="6" 
                      fill="#FF2A2A"
                      opacity="0.5"
                      className="animate-pulse"
                    />
                    <circle 
                      cx="50" 
                      cy="3" 
                      r="4" 
                      fill="#FF5555"
                      opacity="0.7"
                      className="animate-ping"
                    />
                  </>
                )}
                
                {/* Main spike - diamond/crystal shape */}
                {!isExploding && (
                  <g className={isTouching && isHolding ? 'animate-bounce' : ''}>
                    <path
                      d="M 50 0 L 48 5 L 50 8 L 52 5 Z"
                      fill={isPassed ? 'rgba(255,255,255,0.2)' : '#FF2A2A'}
                      stroke={isPassed ? 'rgba(255,255,255,0.15)' : '#FF0000'}
                      strokeWidth="0.5"
                      opacity={isPassed ? 0.4 : 1}
                    />
                    
                    {/* Inner shine */}
                    {!isPassed && (
                      <path
                        d="M 50 1 L 48.5 5 L 50 6 Z"
                        fill="rgba(255,150,150,0.5)"
                        opacity="0.7"
                      />
                    )}
                    
                    {/* Warning dot on top */}
                    {!isPassed && (
                      <circle
                        cx="50"
                        cy="-2"
                        r="1"
                        fill={isTouching ? '#FFFFFF' : '#FF2A2A'}
                        opacity={isTouching ? 1 : 0.8}
                        className={isTouching ? 'animate-ping' : ''}
                      />
                    )}
                  </g>
                )}
              </g>
            );
          })}
          
          {/* Center decorative circles */}
          <circle cx="50" cy="50" r="32" stroke="rgba(255,42,42,0.15)" strokeWidth="0.5" fill="none" />
          <circle cx="50" cy="50" r="28" stroke="rgba(255,42,42,0.1)" strokeWidth="0.5" fill="none" />
        </svg>
        
        {/* Center Button - Minimal & Clean */}
        <button 
          onMouseDown={startProgress} 
          onMouseUp={stopProgress} 
          onMouseLeave={stopProgress}
          onTouchStart={startProgress} 
          onTouchEnd={stopProgress}
          disabled={!purgeActive || !entityFound}
          className={`absolute inset-[52px] md:inset-[60px] rounded-full flex flex-col items-center justify-center font-display uppercase tracking-widest transition-all duration-200 border-[3px] z-20 overflow-hidden
          ${!purgeActive || !entityFound
            ? 'bg-black/95 border-white/20 text-white/30 cursor-not-allowed' 
            : isHolding 
              ? 'bg-neon-red/20 border-neon-red text-neon-red shadow-[0_0_40px_#ff2a2a] scale-95' 
              : 'bg-black/90 border-neon-red text-neon-red hover:bg-neon-red/10 hover:scale-105 cursor-pointer shadow-[inset_0_0_20px_rgba(255,42,42,0.1)]'
          }`}
        >
          {/* Simple scan line when holding */}
          {isHolding && (
            <div className="absolute inset-0 bg-gradient-to-b from-transparent via-neon-red/30 to-transparent animate-scan pointer-events-none"></div>
          )}
          
          <span className="text-2xl md:text-3xl font-bold mb-1 relative z-10">
            {!entityFound ? 'FIND' : !purgeActive ? 'LOCKED' : isHolding ? 'PURGING' : 'HOLD'}
          </span>
          <span className="text-base md:text-lg font-tech tracking-wider opacity-90 relative z-10">
            {progress.toFixed(0)}%
          </span>
          
          {/* Corner accents inside button */}
          <div className="absolute top-2 left-2 w-3 h-3 border-t border-l border-current opacity-30"></div>
          <div className="absolute top-2 right-2 w-3 h-3 border-t border-r border-current opacity-30"></div>
          <div className="absolute bottom-2 left-2 w-3 h-3 border-b border-l border-current opacity-30"></div>
          <div className="absolute bottom-2 right-2 w-3 h-3 border-b border-r border-current opacity-30"></div>
        </button>
        
        {/* Enhanced corner brackets with tech details */}
        <div className="absolute -top-3 -left-3 w-12 h-12 border-t-2 border-l-2 border-neon-red/60">
          <div className="absolute top-0 left-0 w-2 h-2 bg-neon-red/40"></div>
        </div>
        <div className="absolute -top-3 -right-3 w-12 h-12 border-t-2 border-r-2 border-neon-red/60">
          <div className="absolute top-0 right-0 w-2 h-2 bg-neon-red/40"></div>
        </div>
        <div className="absolute -bottom-3 -left-3 w-12 h-12 border-b-2 border-l-2 border-neon-red/60">
          <div className="absolute bottom-0 left-0 w-2 h-2 bg-neon-red/40"></div>
        </div>
        <div className="absolute -bottom-3 -right-3 w-12 h-12 border-b-2 border-r-2 border-neon-red/60">
          <div className="absolute bottom-0 right-0 w-2 h-2 bg-neon-red/40"></div>
        </div>
        
        {/* Tech labels around circle */}
        <div className="absolute -top-8 left-1/2 -translate-x-1/2">
          <p className="font-tech text-[8px] text-neon-red/60 tracking-widest">NEURAL INTERFACE</p>
        </div>
        <div className="absolute -bottom-8 left-1/2 -translate-x-1/2">
          <p className="font-tech text-[8px] text-neon-red/60 tracking-widest">PURGE PROTOCOL</p>
        </div>
      </div>

      {/* Stats Display */}
      <div className="grid grid-cols-2 gap-4 w-full max-w-md">
        <div className="relative bg-black/80 border-2 border-white/20 p-4 text-center hover:border-white/40 transition-all duration-300 shadow-[0_0_20px_rgba(255,255,255,0.05)]">
          <div className="absolute top-0 left-0 w-3 h-3 border-t-2 border-l-2 border-white"></div>
          <div className="absolute bottom-0 right-0 w-3 h-3 border-b-2 border-r-2 border-white"></div>
          <p className="font-tech text-[10px] text-ash/60 tracking-wider uppercase mb-2">Spikes Destroyed</p>
          <p className="font-display text-3xl text-white">{destroyedSpikes.size}/{spikes.length}</p>
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
