import React, { useState, useEffect } from 'react';

interface HuntedEntityProps {
  name: string;
  level: number;
  onDefeat?: () => void;
}

export const HuntedEntity: React.FC<HuntedEntityProps> = ({ name, level, onDefeat }) => {
  const [isGlitching, setIsGlitching] = useState(false);
  const [health, setHealth] = useState(100);

  useEffect(() => {
    // Random glitch effect
    const glitchInterval = setInterval(() => {
      setIsGlitching(true);
      setTimeout(() => setIsGlitching(false), 200);
    }, 3000 + Math.random() * 2000);

    return () => clearInterval(glitchInterval);
  }, []);

  return (
    <div className="relative w-full max-w-md mx-auto">
      {/* Entity Card */}
      <div className="relative bg-gradient-to-br from-black/80 to-black/60 backdrop-blur-sm border-2 border-neon-red rounded-xl p-6 shadow-[0_0_40px_rgba(255,42,42,0.4)]">
        {/* Corner brackets */}
        <div className="absolute -top-1 -left-1 w-6 h-6 border-t-2 border-l-2 border-neon-red"></div>
        <div className="absolute -top-1 -right-1 w-6 h-6 border-t-2 border-r-2 border-neon-red"></div>
        <div className="absolute -bottom-1 -left-1 w-6 h-6 border-b-2 border-l-2 border-neon-red"></div>
        <div className="absolute -bottom-1 -right-1 w-6 h-6 border-b-2 border-r-2 border-neon-red"></div>

        {/* Glitch overlay */}
        {isGlitching && (
          <div className="absolute inset-0 bg-neon-red/20 animate-pulse rounded-xl pointer-events-none"></div>
        )}

        {/* Header */}
        <div className="text-center mb-6">
          <p className="font-tech text-neon-red text-[10px] uppercase tracking-[0.3em] mb-2">// CORRUPTED ENTITY</p>
          <h2 className={`font-display text-3xl md:text-4xl font-bold text-white mb-1 ${isGlitching ? 'animate-glitch' : ''}`}>
            {name}
          </h2>
          <p className="font-tech text-ash/60 text-xs tracking-wider">THREAT LEVEL: {level}</p>
        </div>

        {/* Entity Visual */}
        <div className="relative mb-6">
          {/* Glow background */}
          <div className="absolute inset-0 bg-neon-red/20 blur-3xl rounded-full animate-pulse"></div>
          
          {/* Ghost Icon Container */}
          <div className="relative bg-black/50 backdrop-blur-sm border-2 border-neon-red rounded-xl w-32 h-32 mx-auto flex items-center justify-center shadow-[0_0_30px_rgba(255,42,42,0.6)]">
            {/* Ghost Emoji/Icon */}
            <span className="text-7xl animate-pulse">👻</span>
          </div>
        </div>

        {/* Health Bar */}
        <div className="mb-4">
          <div className="flex justify-between items-center mb-2">
            <span className="font-tech text-white text-xs uppercase tracking-wider">INTEGRITY</span>
            <span className="font-tech text-neon-red text-xs font-bold">{health}%</span>
          </div>
          <div className="relative h-3 bg-black/50 border border-white/20 rounded-full overflow-hidden">
            {/* Health bar fill */}
            <div 
              className="absolute inset-y-0 left-0 bg-gradient-to-r from-neon-red to-neon-red/80 transition-all duration-500 shadow-[0_0_10px_rgba(255,42,42,0.8)]"
              style={{ width: `${health}%` }}
            ></div>
            {/* Animated shine */}
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent animate-shimmer"></div>
          </div>
        </div>

        {/* Status */}
        <div className="grid grid-cols-3 gap-2">
          <div className="bg-black/50 border border-white/10 rounded-lg p-2 text-center">
            <p className="font-tech text-[9px] text-ash/60 uppercase mb-1">Status</p>
            <p className="font-tech text-xs text-neon-red font-bold">ACTIVE</p>
          </div>
          <div className="bg-black/50 border border-white/10 rounded-lg p-2 text-center">
            <p className="font-tech text-[9px] text-ash/60 uppercase mb-1">Type</p>
            <p className="font-tech text-xs text-white font-bold">GHOST</p>
          </div>
          <div className="bg-black/50 border border-white/10 rounded-lg p-2 text-center">
            <p className="font-tech text-[9px] text-ash/60 uppercase mb-1">Node</p>
            <p className="font-tech text-xs text-white font-bold">{level}</p>
          </div>
        </div>
      </div>

      {/* Floating particles effect */}
      <div className="absolute inset-0 pointer-events-none">
        {[...Array(5)].map((_, i) => (
          <div
            key={i}
            className="absolute w-1 h-1 bg-neon-red rounded-full animate-pulse opacity-50"
            style={{
              left: `${20 + i * 15}%`,
              top: `${30 + (i % 3) * 20}%`,
              animationDelay: `${i * 0.5}s`
            }}
          ></div>
        ))}
      </div>
    </div>
  );
};
