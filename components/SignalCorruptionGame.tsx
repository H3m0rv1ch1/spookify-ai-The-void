import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import { SpookyButton } from './SpookyButton';
import { LEVELS, GLYPHS } from './corruptionConstants';

interface SignalCorruptionGameProps {
  onExit: () => void;
  onVictory?: () => void;
}

type GamePhase = 'INTRO' | 'WAVEFORM' | 'GLYPH' | 'PURGE' | 'VICTORY' | 'FAILURE';

// --- Helper Functions ---
const shuffleArray = <T,>(array: T[]): T[] => {
  const newArray = [...array];
  for (let i = newArray.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [newArray[i], newArray[j]] = [newArray[j], newArray[i]];
  }
  return newArray;
};

const GlitchText: React.FC<{ text: string }> = ({ text }) => {
  return (
    <div className="relative font-display font-bold text-4xl md:text-6xl text-neon-red" data-text={text}>
      {text}
      <div className="absolute inset-0 animate-glitch" data-text={text}>{text}</div>
    </div>
  );
};


export const SignalCorruptionGame: React.FC<SignalCorruptionGameProps> = ({ onExit, onVictory }) => {
  const [level, setLevel] = useState(0);
  const [phase, setPhase] = useState<GamePhase>('INTRO');
  const [introText, setIntroText] = useState('');
  
  const config = useMemo(() => LEVELS[level], [level]);

  const handleRestart = () => {
    setLevel(0);
    setPhase('INTRO');
  };

  const advanceLevel = () => {
    if (level < LEVELS.length - 1) {
      setLevel(prev => prev + 1);
      setPhase('WAVEFORM');
    } else {
      setPhase('VICTORY');
    }
  };

  // --- INTRO ---
  useEffect(() => {
    if (phase === 'INTRO') {
      const bootSequence = [
        'INITIALIZING VOID INTERFACE...',
        'SYNCING WITH NEURAL ENGINE...',
        `DETECTED ${LEVELS.length} CORRUPTED DATA NODES.`,
        'PURGE PROTOCOL REQUIRED.',
        'BEGINNING OPERATION...'
      ];
      let i = 0;
      const interval = setInterval(() => {
        if (i < bootSequence.length) {
          setIntroText(bootSequence[i]);
          i++;
        } else {
          clearInterval(interval);
          setTimeout(() => setPhase('WAVEFORM'), 1000);
        }
      }, 700);
      return () => clearInterval(interval);
    }
  }, [phase]);


  // --- Central Game Logic ---
  const handlePhaseComplete = (nextPhase: GamePhase) => {
    setPhase(nextPhase);
  };
  
  const renderPhase = () => {
    switch (phase) {
      case 'WAVEFORM':
        return <WaveformPhase key={`wave-${level}`} config={config} onComplete={() => handlePhaseComplete('GLYPH')} />;
      case 'GLYPH':
        return <GlyphPhase key={`glyph-${level}`} config={config} onComplete={() => handlePhaseComplete('PURGE')} onFail={() => setPhase('FAILURE')} />;
      case 'PURGE':
        return <PurgePhase key={`purge-${level}`} config={config} onComplete={advanceLevel} onFail={() => setPhase('FAILURE')} />;
      case 'VICTORY':
        return <VictoryScreen onRestart={handleRestart} onExit={onExit} onVictory={onVictory} />;
      case 'FAILURE':
        return <FailureScreen onRetry={() => setPhase('WAVEFORM')} />;
      default: // INTRO
        return <IntroScreen text={introText} />;
    }
  };

  return (
    <div className="fixed inset-0 bg-void font-tech text-ash flex flex-col items-center justify-center p-4 z-50 overflow-hidden">
        {/* CRT Effects & Grid */}
        <div className="absolute inset-0 bg-grid opacity-[0.08] pointer-events-none"></div>
        <div className="absolute inset-0 bg-[linear-gradient(to_bottom,rgba(0,0,0,0.5)_0%,transparent_50%,rgba(0,0,0,0.5)_100%)] pointer-events-none"></div>
        
      {/* HUD */}
      <header className="absolute top-0 left-0 right-0 p-4 flex justify-between items-center bg-black/30 border-b border-neon-red/20 backdrop-blur-sm z-10">
        <div className="font-display font-bold text-lg">
          SPOOKIFY<span className="text-neon-red">.AI</span> <span className="text-white/30 font-tech text-sm">// VOID INTERFACE</span>
        </div>
        
        {/* Centered Status */}
        <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 font-tech text-xs uppercase tracking-widest text-center hidden md:block pointer-events-none">
            <span className="text-neon-red">[NODE {level + 1}/{LEVELS.length}]</span>
            <span className="text-ash/50 mx-2">::</span>
            <span className="text-ash/80">STATUS: <span className="text-white font-bold">{phase}</span></span>
        </div>
        
        <button 
          onClick={onExit} 
          className="font-tech text-xs text-ash/40 hover:text-neon-red uppercase tracking-[0.2em] transition-colors flex items-center gap-2 group"
        >
          <span className="text-lg opacity-50 group-hover:opacity-100 transition-opacity">«</span> ABORT
        </button>
      </header>

      <div className="w-full h-full flex items-center justify-center">
        {renderPhase()}
      </div>

    </div>
  );
};


// --- GAME PHASES ---

const IntroScreen: React.FC<{ text: string }> = ({ text }) => (
  <div className="text-center">
    <div className="w-16 h-16 border border-neon-red/50 rounded-full animate-spin-slow mx-auto mb-6 flex items-center justify-center">
        <div className="w-2 h-2 bg-neon-red rounded-full shadow-[0_0_15px_#ff2a2a]"></div>
    </div>
    <p className="font-tech text-neon-red tracking-[0.3em] uppercase animate-pulse">{text}</p>
  </div>
);

const VictoryScreen: React.FC<{ onRestart: () => void; onExit: () => void; onVictory?: () => void; }> = ({ onRestart, onExit, onVictory }) => (
    <div className="text-center flex flex-col items-center gap-8 animate-pulse">
        <h2 className="font-display text-4xl md:text-6xl text-cyan-400 tracking-widest">SIGNAL STABILIZED</h2>
        <p className="text-ash/70 max-w-lg">All corrupted nodes have been purged. The Void Echo is contained. System integrity restored to 100%.</p>
        <div className="flex gap-4">
            {onVictory ? (
                <SpookyButton variant="ritual" onClick={onVictory}>RESTORE SYSTEM</SpookyButton>
            ) : (
                <>
                    <SpookyButton variant="ghost" onClick={onRestart}>REPLAY</SpookyButton>
                    <SpookyButton variant="primary" onClick={onExit}>EXIT</SpookyButton>
                </>
            )}
        </div>
    </div>
);

const FailureScreen: React.FC<{ onRetry: () => void; }> = ({ onRetry }) => (
    <div className="text-center flex flex-col items-center gap-8">
        <GlitchText text="CONNECTION LOST" />
        <p className="text-ash/70 max-w-lg animate-pulse">Signal overload detected. The purge attempt has failed. Re-routing connection to the last stable node.</p>
        <SpookyButton variant="ritual" onClick={onRetry}>RE-ESTABLISH CONNECTION</SpookyButton>
    </div>
);

// --- WAVEFORM PHASE ---
const WaveformPhase: React.FC<{ config: any; onComplete: () => void; }> = ({ config, onComplete }) => {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const [params, setParams] = useState({ freq: 1, amp: 1, phase: 0 });
    const [target, setTarget] = useState({ freq: 1, amp: 1, phase: 0 });
    const [match, setMatch] = useState(0);

    useEffect(() => {
        setTarget({
            freq: Math.random() * 4 + 1,
            amp: Math.random() * 0.5 + 0.5,
            phase: Math.random() * Math.PI,
        });
    }, []);

    useEffect(() => {
        const freqMatch = 1 - Math.min(1, Math.abs(params.freq - target.freq) / 5);
        const ampMatch = 1 - Math.min(1, Math.abs(params.amp - target.amp));
        const phaseMatch = 1 - Math.min(1, Math.abs(params.phase - target.phase) / Math.PI);
        const totalMatch = (freqMatch + ampMatch + phaseMatch) / 3;
        setMatch(totalMatch);

        if (totalMatch > config.waveMatchThreshold) {
           setTimeout(onComplete, 500);
        }
    }, [params, target, config.waveMatchThreshold, onComplete]);

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        let animFrame: number;
        const draw = (time: number) => {
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            const w = canvas.width, h = canvas.height, h2 = h / 2;
            
            // Draw Target Wave
            ctx.strokeStyle = "rgba(255, 255, 255, 0.2)";
            ctx.lineWidth = 2;
            ctx.beginPath();
            for (let x = 0; x < w; x++) {
                const angle = (x / w) * (target.freq * 4 * Math.PI) + target.phase;
                const y = Math.sin(angle) * (h2 * 0.8 * target.amp);
                ctx.lineTo(x, h2 + y);
            }
            ctx.stroke();

            // Draw User Wave
            ctx.strokeStyle = "#FF2A2A";
            ctx.lineWidth = 3;
            ctx.shadowColor = "#FF2A2A";
            ctx.shadowBlur = 10;
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
      <div className="w-full max-w-3xl flex flex-col items-center">
         <p className="font-tech text-center tracking-[0.2em] text-ash/70 mb-2 uppercase">Objective: Tune Signal</p>
         <div className="relative w-full aspect-video bg-black/50 border border-white/10 p-2">
            <canvas ref={canvasRef} className="w-full h-full"></canvas>
            <div className="absolute top-2 left-2 font-tech text-xs tracking-widest bg-black/50 px-2 py-1">
                MATCH: <span className={match > config.waveMatchThreshold ? 'text-cyan-400' : 'text-neon-red'}>{(match * 100).toFixed(1)}%</span>
            </div>
         </div>
         <div className="grid grid-cols-3 gap-4 w-full mt-4">
            {['freq', 'amp', 'phase'].map(p => (
                <div key={p} className="flex flex-col items-center">
                    <label className="text-xs tracking-widest uppercase mb-2">{p}</label>
                    <input type="range" min={p === 'amp' ? 0.2 : 0} max={p === 'freq' ? 5 : p === 'amp' ? 1.5 : Math.PI*2} step="0.01" value={params[p as keyof typeof params]} onChange={e => handleSlider(p as any, e.target.value)}
                        className="w-full accent-neon-red"
                    />
                </div>
            ))}
         </div>
      </div>
    );
};

// --- GLYPH PHASE ---
const GlyphPhase: React.FC<{ config: any; onComplete: () => void; onFail: () => void; }> = ({ config, onComplete, onFail }) => {
    const [targetSequence, setTargetSequence] = useState<string[]>([]);
    const [grid, setGrid] = useState<string[]>([]);
    const [playerSequence, setPlayerSequence] = useState<string[]>([]);
    const [isShowing, setIsShowing] = useState(true);

    useEffect(() => {
        const uniqueGlyphs = shuffleArray(GLYPHS).slice(0, config.glyphGridSize * config.glyphGridSize);
        const sequence = uniqueGlyphs.slice(0, config.glyphSequenceLength);
        setTargetSequence(sequence);
        setGrid(shuffleArray(uniqueGlyphs));
        
        setTimeout(() => setIsShowing(false), 2000 + config.glyphSequenceLength * 500);
    }, [config]);

    const handleGlyphClick = (glyph: string) => {
        if (isShowing) return;
        const newSequence = [...playerSequence, glyph];
        setPlayerSequence(newSequence);
        
        // Check if correct so far
        if (glyph !== targetSequence[newSequence.length - 1]) {
            setTimeout(onFail, 500);
        } else if (newSequence.length === targetSequence.length) {
            setTimeout(onComplete, 500);
        }
    };
    
    return (
        <div className="w-full max-w-xl flex flex-col items-center">
            <p className="font-tech text-center tracking-[0.2em] text-ash/70 mb-4 uppercase">
                {isShowing ? "Objective: Memorize Sequence" : "Objective: Replicate Sequence"}
            </p>
            {/* Target Sequence Display */}
            <div className="h-16 flex items-center justify-center gap-4 mb-6">
                {isShowing ? (
                    targetSequence.map((g, i) => (
                        <div key={i} className="text-4xl text-neon-red animate-pulse">{g}</div>
                    ))
                ) : (
                    playerSequence.map((g, i) => (
                         <div key={i} className="text-4xl text-cyan-400">{g}</div>
                    ))
                )}
            </div>
            {/* Grid */}
            <div className={`grid gap-2 md:gap-4`} style={{gridTemplateColumns: `repeat(${config.glyphGridSize}, minmax(0, 1fr))`}}>
                {grid.map((glyph, i) => (
                    <button key={i} onClick={() => handleGlyphClick(glyph)} disabled={isShowing}
                        className={`w-16 h-16 md:w-20 md:h-20 bg-black/50 border border-white/10 text-4xl flex items-center justify-center transition-all duration-200
                        ${isShowing ? 'text-ash/30 cursor-default' : 'hover:bg-neon-red/20 hover:border-neon-red hover:text-white cursor-pointer'}
                        ${playerSequence.includes(glyph) ? '!bg-cyan-900/50 !border-cyan-400 !text-cyan-400' : ''}`}
                    >
                        {glyph}
                    </button>
                ))}
            </div>
        </div>
    );
};

// --- PURGE PHASE ---
const PurgePhase: React.FC<{ config: any; onComplete: () => void; onFail: () => void; }> = ({ config, onComplete, onFail }) => {
    const [progress, setProgress] = useState(0);
    const [spikes] = useState(() => {
        const s = new Set<number>();
        while(s.size < config.purgeSpikes) {
            s.add(Math.floor(Math.random() * 85) + 10); // Spikes between 10% and 95%
        }
        return Array.from(s).sort((a,b) => a - b);
    });
    const [isHolding, setIsHolding] = useState(false);
    // Explicitly using number for browser interval
    const intervalRef = useRef<number | undefined>(undefined);

    const startProgress = () => {
        if(progress >= 100) return;
        setIsHolding(true);
        intervalRef.current = window.setInterval(() => {
            setProgress(p => {
                const newP = p + (100 / (config.purgeDuration / 50));
                if (newP >= 100) {
                    if(intervalRef.current !== undefined) window.clearInterval(intervalRef.current);
                    setIsHolding(false);
                    setTimeout(() => onComplete(), 200);
                    return 100;
                }
                for (const spike of spikes) {
                    if (p < spike && newP >= spike) {
                         if(intervalRef.current !== undefined) window.clearInterval(intervalRef.current);
                         setIsHolding(false);
                         setTimeout(() => onFail(), 200);
                         return p;
                    }
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
        return () => {
          if(intervalRef.current !== undefined) window.clearInterval(intervalRef.current);
        };
    }, []);

    return (
        <div className="w-full max-w-md flex flex-col items-center gap-8">
            <p className="font-tech text-center tracking-[0.2em] text-ash/70 uppercase">Objective: Purge Corrupted Node</p>
            <p className="text-center text-xs text-ash/50 max-w-xs">Hold to charge the purge sequence. Release before hitting instability spikes.</p>
            <div className="relative w-52 h-52 md:w-64 md:h-64">
                 <svg className="w-full h-full" viewBox="0 0 100 100">
                    {/* Track */}
                    <circle cx="50" cy="50" r="45" stroke="rgba(255,255,255,0.1)" strokeWidth="5" fill="none" />
                    {/* Progress */}
                    <circle cx="50" cy="50" r="45" stroke="#FF2A2A" strokeWidth="5" fill="none"
                        strokeDasharray="283"
                        strokeDashoffset={283 - (progress / 100) * 283}
                        transform="rotate(-90 50 50)"
                        className="transition-all duration-100"
                    />
                    {/* Spikes */}
                    {spikes.map(spike => (
                        <rect key={spike} x="48" y="0" width="4" height="10" fill="#FF2A2A"
                              transform={`rotate(${spike * 3.6} 50 50)`} />
                    ))}
                 </svg>
                 <button 
                    onMouseDown={startProgress} onMouseUp={stopProgress} onMouseLeave={stopProgress}
                    onTouchStart={startProgress} onTouchEnd={stopProgress}
                    className={`absolute inset-10 rounded-full flex items-center justify-center text-2xl font-display uppercase tracking-widest
                    ${isHolding ? 'bg-neon-red text-black animate-pulse-fast shadow-[0_0_30px_#ff2a2a]' : 'bg-black/50 border-2 border-neon-red text-neon-red'}`}
                 >
                    Purge
                 </button>
            </div>
        </div>
    );
};