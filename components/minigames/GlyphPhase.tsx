import React, { useState, useEffect } from 'react';
import { GLYPHS } from '../corruptionConstants';
import { HuntedEntity } from './HuntedEntity';

interface GlyphPhaseProps {
  config: any;
  onComplete: () => void;
  onFail: () => void;
  scannerActive?: boolean;
}

const shuffleArray = <T,>(array: T[]): T[] => {
  const newArray = [...array];
  for (let i = newArray.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [newArray[i], newArray[j]] = [newArray[j], newArray[i]];
  }
  return newArray;
};

export const GlyphPhase: React.FC<GlyphPhaseProps> = ({ config, onComplete, onFail, scannerActive = false }) => {
  const [targetSequence, setTargetSequence] = useState<string[]>([]);
  const [grid, setGrid] = useState<string[]>([]);
  const [playerSequence, setPlayerSequence] = useState<string[]>([]);
  const [isShowing, setIsShowing] = useState(true);
  const [countdown, setCountdown] = useState(0);
  
  // Fake glyph states
  const [fakeGlyphIndex, setFakeGlyphIndex] = useState<number>(-1); // Which grid position has the fake
  const [fakeGlyph, setFakeGlyph] = useState<string>(''); // The fake glyph shown
  const [realGlyph, setRealGlyph] = useState<string>(''); // The real glyph (from sequence)
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

  useEffect(() => {
    const uniqueGlyphs = shuffleArray(GLYPHS).slice(0, config.glyphGridSize * config.glyphGridSize);
    const sequence = uniqueGlyphs.slice(0, config.glyphSequenceLength);
    setTargetSequence(sequence);
    
    // Create grid and pick one position to be fake
    const gridGlyphs = shuffleArray(uniqueGlyphs);
    
    // Find a position in grid that contains one of the sequence glyphs
    const sequencePositions = gridGlyphs
      .map((g, i) => ({ glyph: g, index: i }))
      .filter(item => sequence.includes(item.glyph));
    
    if (sequencePositions.length > 0) {
      // Pick random position from sequence glyphs to make fake
      const fakePos = sequencePositions[Math.floor(Math.random() * sequencePositions.length)];
      setFakeGlyphIndex(fakePos.index);
      setRealGlyph(fakePos.glyph);
      
      // Find a different glyph to show as fake
      const availableFakes = GLYPHS.filter(g => g !== fakePos.glyph && !sequence.includes(g));
      const selectedFake = availableFakes[Math.floor(Math.random() * availableFakes.length)];
      setFakeGlyph(selectedFake);
      
      // Replace in grid with fake
      gridGlyphs[fakePos.index] = selectedFake;
    }
    
    setGrid(gridGlyphs);
    
    const totalTime = 2000 + config.glyphSequenceLength * 500;
    setCountdown(Math.ceil(totalTime / 1000));
    
    const countdownInterval = setInterval(() => {
      setCountdown(prev => Math.max(0, prev - 1));
    }, 1000);
    
    setTimeout(() => {
      setIsShowing(false);
      clearInterval(countdownInterval);
    }, totalTime);
    
    return () => clearInterval(countdownInterval);
  }, [config]);

  const handleGlyphClick = (glyph: string, index: number) => {
    if (isShowing) return;
    
    // Determine the actual glyph (real if it's the fake position, otherwise what's shown)
    const actualGlyph = index === fakeGlyphIndex ? realGlyph : glyph;
    
    const newSequence = [...playerSequence, actualGlyph];
    setPlayerSequence(newSequence);
    
    // Check if correct so far
    if (actualGlyph !== targetSequence[newSequence.length - 1]) {
      setTimeout(onFail, 500);
    } else if (newSequence.length === targetSequence.length) {
      setTimeout(onComplete, 500);
    }
  };
  
  return (
    <div className="w-full max-w-4xl flex flex-col items-center px-4 gap-8">
      <div className="w-full max-w-2xl flex flex-col items-center">
        {/* Header */}
        <div className="mb-8 text-center">
          <p className="font-tech text-neon-red text-xs tracking-[0.3em] uppercase mb-2">// PHASE 01</p>
          <h3 className="font-display text-3xl md:text-4xl font-bold text-white mb-2">PATTERN RECOGNITION</h3>
          <p className="font-tech text-xs tracking-wider">
            {isShowing 
              ? <span className="text-ash/60">Memorize the corrupted glyph sequence</span>
              : <span className="text-ash/60">Use scanner to reveal corrupted glyphs - Replicate the sequence</span>}
          </p>
        </div>

      {/* Sequence Display */}
      <div className="relative w-full bg-black/50 backdrop-blur-sm border border-white/20 rounded-xl p-6 mb-8 min-h-[120px] flex items-center justify-center shadow-lg">
        {/* Status indicator */}
        <div className="absolute top-3 left-3 font-tech text-[10px] tracking-wider bg-black/80 border border-white/20 rounded px-3 py-1.5">
          {isShowing ? (
            <span className="text-neon-red">MEMORIZE: {countdown}s</span>
          ) : (
            <span className="text-white">INPUT: {playerSequence.length}/{targetSequence.length}</span>
          )}
        </div>
        
        <div className="flex items-center justify-center gap-4 md:gap-6 flex-wrap">
          {isShowing ? (
            targetSequence.map((g, i) => (
              <div 
                key={i} 
                className="relative"
                style={{ animationDelay: `${i * 0.1}s` }}
              >
                {/* Glow background */}
                <div className="absolute inset-0 bg-neon-red/20 blur-xl rounded-full animate-pulse"></div>
                {/* Glyph with border - ALL glyphs show normally during memorize */}
                <div className="relative bg-black/80 backdrop-blur-sm border-2 border-neon-red rounded-xl w-14 h-14 md:w-16 md:h-16 flex items-center justify-center shadow-[0_0_20px_rgba(255,42,42,0.6)] animate-pulse">
                  <span className="text-2xl md:text-3xl text-neon-red font-bold">
                    {g}
                  </span>
                </div>
              </div>
            ))
          ) : playerSequence.length > 0 ? (
            playerSequence.map((g, i) => (
              <div 
                key={i} 
                className="relative animate-fade-in"
              >
                {/* Glow background */}
                <div className="absolute inset-0 bg-neon-red/20 blur-xl rounded-full"></div>
                {/* Glyph with border - smaller size */}
                <div className="relative bg-gradient-to-br from-neon-red/30 to-neon-red/20 backdrop-blur-sm border-2 border-neon-red rounded-xl w-14 h-14 md:w-16 md:h-16 flex items-center justify-center shadow-[0_0_20px_rgba(255,42,42,0.5)]">
                  <span className="text-2xl md:text-3xl text-neon-red font-bold">
                    {g}
                  </span>
                </div>
              </div>
            ))
          ) : (
            <p className="font-tech text-ash/40 text-sm tracking-wider">SELECT GLYPHS BELOW</p>
          )}
        </div>
      </div>

      {/* Grid */}
      <div className="relative">
        <div className={`grid gap-3 md:gap-4`} style={{gridTemplateColumns: `repeat(${config.glyphGridSize}, minmax(0, 1fr))`}}>
          {grid.map((glyph, i) => {
            const isUsed = playerSequence.includes(glyph);
            const isDisabled = isShowing;
            const isFakePosition = i === fakeGlyphIndex && !isShowing;
            const isScanningThis = scannerActive && hoveredIndex === i && isFakePosition;
            const displayGlyph = isScanningThis ? realGlyph : glyph;
            
            return (
              <button 
                key={i} 
                onClick={() => handleGlyphClick(glyph, i)}
                onMouseEnter={() => setHoveredIndex(i)}
                onMouseLeave={() => setHoveredIndex(null)}
                disabled={isDisabled}
                className={`group relative overflow-hidden w-16 h-16 md:w-20 md:h-20 backdrop-blur-sm border-2 rounded-xl flex items-center justify-center transition-all duration-300 font-bold
                ${isDisabled ? 'bg-black/30 text-ash/20 cursor-not-allowed border-white/5 shadow-none' : 'bg-gradient-to-br from-black/70 to-black/50 cursor-pointer border-white/30 hover:scale-110 hover:-translate-y-2 shadow-[0_4px_20px_rgba(0,0,0,0.5)]'}
                ${!isDisabled && !isUsed ? 'hover:from-neon-red hover:to-neon-red/80 hover:border-neon-red hover:text-black hover:shadow-[0_8px_30px_rgba(255,42,42,0.6)]' : ''}
                ${isUsed ? '!bg-gradient-to-br !from-neon-red/20 !to-neon-red/10 !border-neon-red !text-neon-red !shadow-[0_0_20px_rgba(255,42,42,0.4)] opacity-60 cursor-not-allowed' : ''}
                ${isScanningThis ? '!border-neon-red !shadow-[0_0_40px_rgba(255,42,42,0.8)] scale-110' : ''}`}
              >
                {/* Scanning reveal effect - ONLY when hovering with scanner */}
                {isScanningThis && (
                  <>
                    <div className="absolute inset-0 bg-neon-red/20 animate-pulse rounded-xl z-20"></div>
                    <div className="absolute inset-0 bg-gradient-to-br from-neon-red/30 to-transparent rounded-xl z-20"></div>
                    {/* Scanning lines - red */}
                    <div className="absolute inset-0 overflow-hidden rounded-xl z-25">
                      <div className="absolute w-full h-0.5 bg-neon-red top-0 animate-pulse shadow-[0_0_10px_rgba(255,42,42,0.8)]"></div>
                      <div className="absolute w-full h-0.5 bg-neon-red bottom-0 animate-pulse shadow-[0_0_10px_rgba(255,42,42,0.8)]" style={{ animationDelay: '0.3s' }}></div>
                    </div>
                    {/* "REVEALED" indicator */}
                    <div className="absolute top-1 right-1 text-[8px] font-tech text-neon-red uppercase tracking-wider bg-black/90 px-1 rounded z-30 animate-pulse">REVEALED</div>
                  </>
                )}
                
                {/* Glow effect behind icon */}
                {!isDisabled && !isUsed && (
                  <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-xl"></div>
                )}
                
                {/* Shining Wipe Effect */}
                {!isDisabled && !isUsed && (
                  <div className="absolute inset-0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700 bg-gradient-to-r from-transparent via-white/40 to-transparent z-20 skew-x-12"></div>
                )}
                
                {/* Icon with enhanced styling - perfectly centered */}
                <span className={`relative z-30 text-3xl md:text-4xl leading-none transition-all duration-300
                  ${isDisabled ? '' : isScanningThis ? 'text-neon-red drop-shadow-[0_0_10px_rgba(255,42,42,1)] scale-110' : 'text-white group-hover:scale-110'}
                  ${isUsed ? 'font-extrabold' : 'font-bold'}
                `} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: '100%', height: '100%' }}>
                  {displayGlyph}
                </span>
                
                {/* Subtle inner shadow for depth */}
                <div className="absolute inset-0 rounded-xl shadow-[inset_0_2px_8px_rgba(0,0,0,0.3)] pointer-events-none"></div>
              </button>
            );
          })}
        </div>
      </div>
      </div>
    </div>
  );
};
