import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import { SpookyButton } from './SpookyButton';
import { LEVELS, GLYPHS } from './corruptionConstants';
import { GlyphPhase, WaveformPhase, PurgePhase } from './minigames';

interface SignalCorruptionGameProps {
  onExit: (earnedCredits: number) => void;
  onVictory?: () => void;
  credits: number;
  onCreditsChange: (credits: number) => void;
}

type GamePhase = 'INTRO' | 'WAVEFORM' | 'GLYPH' | 'PURGE' | 'VICTORY' | 'FAILURE' | 'PHASE1_COMPLETE' | 'PHASE2_COMPLETE' | 'PHASE3_COMPLETE';

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


export const SignalCorruptionGame: React.FC<SignalCorruptionGameProps> = ({ onExit, onVictory, credits, onCreditsChange }) => {
  const [level, setLevel] = useState(0);
  const [phase, setPhase] = useState<GamePhase>('INTRO');
  const [introText, setIntroText] = useState('');
  const [toolsExpanded, setToolsExpanded] = useState(false);
  const [selectedTool, setSelectedTool] = useState<'scanner' | 'decoder' | 'purge' | null>(null);
  const [selectedTools, setSelectedTools] = useState<Set<'scanner' | 'decoder' | 'purge'>>(new Set());
  const [isDragging, setIsDragging] = useState(false);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const [earnedCredits, setEarnedCredits] = useState(0);
  
  const config = useMemo(() => LEVELS[level], [level]);

  // Track mouse position for scanner glow effect
  useEffect(() => {
    const isScannerActive = phase === 'PURGE' ? selectedTools.has('scanner') : selectedTool === 'scanner';
    if (isScannerActive) {
      const handleMouseMove = (e: MouseEvent) => {
        setMousePos({ x: e.clientX, y: e.clientY });
      };
      window.addEventListener('mousemove', handleMouseMove);
      return () => window.removeEventListener('mousemove', handleMouseMove);
    }
  }, [selectedTool, selectedTools, phase]);

  const handleRestart = () => {
    setLevel(0);
    setPhase('INTRO');
  };

  const advanceLevel = () => {
    if (level < LEVELS.length - 1) {
      setLevel(prev => prev + 1);
      setPhase('GLYPH');
    } else {
      setPhase('VICTORY');
    }
  };
  // --- Central Game Logic ---
  const handlePhaseComplete = (nextPhase: GamePhase) => {
    setPhase(nextPhase);
  };
  
  const renderPhase = () => {
    switch (phase) {
      case 'GLYPH':
        return <GlyphPhase key={`glyph-${level}`} config={config} onComplete={() => {
          console.log('Phase 1 complete, adding 1 credit');
          setEarnedCredits(prev => {
            const newTotal = prev + 1;
            onCreditsChange(credits + newTotal);
            return newTotal;
          });
          handlePhaseComplete('PHASE1_COMPLETE');
        }} onFail={() => setPhase('FAILURE')} scannerActive={selectedTool === 'scanner'} />;
      case 'PHASE1_COMPLETE':
        return <Phase1CompleteScreen onContinue={() => handlePhaseComplete('PURGE')} />;
      case 'PURGE':
        return <PurgePhase key={`purge-${level}`} config={config} onComplete={() => {
          console.log('Phase 2 complete, adding 2 credits');
          setEarnedCredits(prev => {
            const newTotal = prev + 2;
            onCreditsChange(credits + newTotal);
            return newTotal;
          });
          handlePhaseComplete('PHASE2_COMPLETE');
        }} onFail={() => setPhase('FAILURE')} purgeActive={selectedTools.has('purge')} radioActive={selectedTools.has('decoder')} scannerActive={selectedTools.has('scanner')} />;
      case 'PHASE2_COMPLETE':
        return <Phase2CompleteScreen onContinue={() => handlePhaseComplete('WAVEFORM')} />;
      case 'WAVEFORM':
        return <WaveformPhase key={`wave-${level}`} config={config} onComplete={() => {
          console.log('Phase 3 complete, adding 2 credits');
          setEarnedCredits(prev => {
            const newTotal = prev + 2;
            onCreditsChange(credits + newTotal);
            return newTotal;
          });
          handlePhaseComplete('PHASE3_COMPLETE');
        }} scannerActive={selectedTools.has('scanner')} radioActive={selectedTools.has('decoder')} />;
      case 'PHASE3_COMPLETE':
        return <Phase3CompleteScreen onContinue={() => setPhase('VICTORY')} />;
      case 'VICTORY':
        return <VictoryScreen onRestart={handleRestart} onExit={() => onExit(earnedCredits)} onVictory={onVictory} />;
      case 'FAILURE':
        return <FailureScreen onRetry={() => setPhase('GLYPH')} />;
      default: // INTRO
        return <IntroScreen text={introText} onStart={() => setPhase('GLYPH')} />;
    }
  };

  // Check if scanner is active (works for Phase 1, 2, and 3)
  const isScannerActive = (phase === 'PURGE' || phase === 'WAVEFORM') ? selectedTools.has('scanner') : selectedTool === 'scanner';

  // Get current node number based on phase
  const getCurrentNode = () => {
    if (phase === 'GLYPH' || phase === 'PHASE1_COMPLETE') return 1;
    if (phase === 'PURGE') return 2;
    if (phase === 'WAVEFORM') return 3;
    return level + 1;
  };

  return (
    <div className={`fixed inset-0 bg-void font-tech text-ash flex flex-col items-center justify-center p-4 z-50 overflow-hidden ${isScannerActive ? 'cursor-crosshair' : ''}`}>
        {/* CRT Effects & Grid */}
        <div className="absolute inset-0 bg-grid opacity-[0.08] pointer-events-none"></div>
        <div className="absolute inset-0 bg-[linear-gradient(to_bottom,rgba(0,0,0,0.5)_0%,transparent_50%,rgba(0,0,0,0.5)_100%)] pointer-events-none"></div>
        
        {/* Scanner Glow Cursor Effect - Void Core Style - ONLY when scanner is selected */}
        {isScannerActive && (
          <div 
            className="fixed w-[400px] h-[400px] md:w-[600px] md:h-[600px] rounded-full pointer-events-none z-[100] mix-blend-screen filter blur-[80px] md:blur-[100px] opacity-40 transition-transform duration-100 ease-linear"
            style={{
              background: 'radial-gradient(circle, rgba(255,42,42,0.9) 0%, rgba(255,80,80,0.5) 40%, transparent 70%)',
              left: mousePos.x - 300,
              top: mousePos.y - 300,
            }}
          ></div>
        )}

        
      {/* HUD */}
      <header className="absolute top-0 left-0 right-0 p-4 flex justify-between items-center bg-black/30 border-b border-neon-red/20 backdrop-blur-sm z-10">
        <div className="font-display font-bold text-lg">
          SPOOKIFY<span className="text-neon-red">.AI</span> <span className="text-white/30 font-tech text-sm">// VOID INTERFACE</span>
        </div>
        
        {/* Centered Status */}
        <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 font-tech text-xs uppercase tracking-widest text-center hidden md:block pointer-events-none">
            <span className="text-neon-red">[NODE {getCurrentNode()}/{LEVELS.length}]</span>
            <span className="text-ash/50 mx-2">::</span>
            <span className="text-ash/80">STATUS: <span className="text-white font-bold">{phase}</span></span>
        </div>
        
        <div className="flex items-center gap-4">
          {/* Credits Display - Only show after Phase 1 is completed */}
          {(phase !== 'INTRO' && phase !== 'GLYPH') && (
            <div className="font-tech text-xs uppercase tracking-wider flex items-center gap-2 px-3 py-1.5 bg-neon-red/10 border border-neon-red/30 rounded animate-fade-in">
              <span className="text-ash/60">CREDITS:</span>
              <span className="text-neon-red font-bold">{credits + earnedCredits}</span>
              {earnedCredits > 0 && <span className="text-green-500 text-[10px]">(+{earnedCredits})</span>}
            </div>
          )}
          
          <button 
            onClick={() => onExit(earnedCredits)} 
            className="font-tech text-xs text-ash/40 hover:text-neon-red uppercase tracking-[0.2em] transition-colors flex items-center gap-2 group"
          >
            <span className="text-lg opacity-50 group-hover:opacity-100 transition-opacity">«</span> ABORT
          </button>
        </div>
      </header>

      <div className="w-full h-full flex items-center justify-center">
        {renderPhase()}
      </div>

      {/* Tools Panel - Show during game phases (not on INTRO, VICTORY, or FAILURE) */}
      {phase !== 'INTRO' && phase !== 'VICTORY' && phase !== 'FAILURE' && (
        <div className="fixed bottom-6 right-6 z-50 w-[160px]">
          <div className="relative">
            {/* Corner brackets */}
            <div className="absolute -top-1 -left-1 w-4 h-4 border-t border-l border-neon-red"></div>
            <div className="absolute -top-1 -right-1 w-4 h-4 border-t border-r border-neon-red"></div>
            <div className="absolute -bottom-1 -left-1 w-4 h-4 border-b border-l border-neon-red"></div>
            <div className="absolute -bottom-1 -right-1 w-4 h-4 border-b border-r border-neon-red"></div>
            
            <div className="relative bg-black/90 border border-neon-red/40 backdrop-blur-xl shadow-[0_0_30px_rgba(255,42,42,0.25)] overflow-hidden">
              {/* Header - Always visible */}
              <button 
                onClick={() => setToolsExpanded(!toolsExpanded)}
                className="w-full p-2 flex items-center justify-between gap-2 hover:bg-white/5 transition-colors"
              >
                <div className="flex items-center gap-1.5">
                  <span className="relative flex h-1.5 w-1.5">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-neon-red opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-neon-red"></span>
                  </span>
                  <p className="font-tech text-neon-red text-[9px] uppercase tracking-[0.12em] font-bold">DETECTION TOOLS</p>
                </div>
                <svg 
                  className={`w-3 h-3 text-white/60 transition-transform ${toolsExpanded ? 'rotate-180' : ''}`} 
                  fill="none" 
                  viewBox="0 0 24 24" 
                  stroke="currentColor"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>
              
              {/* Tools - Expandable */}
              <div className={`transition-all duration-300 overflow-hidden ${toolsExpanded ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'}`}>
                <div className="p-1.5 pt-0 space-y-1 border-t border-white/10">
                  
                  {/* Void Scanner Tool */}
                  <button 
                    onClick={() => {
                      if (phase === 'PURGE' || phase === 'WAVEFORM') {
                        const newTools = new Set(selectedTools);
                        if (newTools.has('scanner')) newTools.delete('scanner');
                        else newTools.add('scanner');
                        setSelectedTools(newTools);
                      } else {
                        setSelectedTool(selectedTool === 'scanner' ? null : 'scanner');
                      }
                    }}
                    className={`relative p-1.5 bg-black/40 border transition-all w-full text-left cursor-pointer
                      ${((phase === 'PURGE' || phase === 'WAVEFORM') ? selectedTools.has('scanner') : selectedTool === 'scanner')
                        ? 'border-neon-red shadow-[0_0_20px_rgba(255,42,42,0.5)] scale-105' 
                        : 'border-white/10 hover:border-neon-red/30'}`}
                  >
                    <div className="flex items-center gap-1.5 mb-0.5">
                      <svg className="w-2.5 h-2.5 text-neon-red" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                      </svg>
                      <span className="font-tech text-white text-[8px] uppercase tracking-wider font-bold">
                        VOID SCANNER {((phase === 'PURGE' || phase === 'WAVEFORM') ? selectedTools.has('scanner') : selectedTool === 'scanner') && '✓'}
                      </span>
                    </div>
                    <p className="font-tech text-ash/60 text-[7px] leading-tight">Detects hidden corruption</p>
                  </button>
                  
                  {/* Radio Decoder Tool */}
                  <button 
                    onClick={() => {
                      if (phase === 'PURGE' || phase === 'WAVEFORM') {
                        const newTools = new Set(selectedTools);
                        if (newTools.has('decoder')) newTools.delete('decoder');
                        else newTools.add('decoder');
                        setSelectedTools(newTools);
                      } else {
                        setSelectedTool(selectedTool === 'decoder' ? null : 'decoder');
                      }
                    }}
                    className={`relative p-1.5 bg-black/40 border transition-all w-full text-left cursor-pointer
                      ${((phase === 'PURGE' || phase === 'WAVEFORM') ? selectedTools.has('decoder') : selectedTool === 'decoder')
                        ? 'border-neon-red shadow-[0_0_20px_rgba(255,42,42,0.5)] scale-105' 
                        : 'border-white/10 hover:border-neon-red/30'}`}
                  >
                    <div className="flex items-center gap-1.5 mb-0.5">
                      <svg className="w-2.5 h-2.5 text-neon-red" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                      </svg>
                      <span className="font-tech text-white text-[8px] uppercase tracking-wider font-bold">
                        RADIO DECODER {((phase === 'PURGE' || phase === 'WAVEFORM') ? selectedTools.has('decoder') : selectedTool === 'decoder') && '✓'}
                      </span>
                    </div>
                    <p className="font-tech text-ash/60 text-[7px] leading-tight">Detects signal frequency</p>
                  </button>
                  
                  {/* Neural Purge Tool */}
                  <button 
                    onClick={() => {
                      if (phase === 'PURGE') {
                        const newTools = new Set(selectedTools);
                        if (newTools.has('purge')) newTools.delete('purge');
                        else newTools.add('purge');
                        setSelectedTools(newTools);
                      } else {
                        setSelectedTool(selectedTool === 'purge' ? null : 'purge');
                      }
                    }}
                    className={`relative p-1.5 bg-black/40 border transition-all w-full text-left cursor-pointer
                      ${(phase === 'PURGE' ? selectedTools.has('purge') : selectedTool === 'purge')
                        ? 'border-neon-red shadow-[0_0_20px_rgba(255,42,42,0.5)] scale-105' 
                        : 'border-white/10 hover:border-neon-red/30'}`}
                  >
                    <div className="flex items-center gap-1.5 mb-0.5">
                      <svg className="w-2.5 h-2.5 text-neon-red" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                      </svg>
                      <span className="font-tech text-white text-[8px] uppercase tracking-wider font-bold">
                        NEURAL PURGE {(phase === 'PURGE' ? selectedTools.has('purge') : selectedTool === 'purge') && '✓'}
                      </span>
                    </div>
                    <p className="font-tech text-ash/60 text-[7px] leading-tight">Eliminates threats</p>
                  </button>
                  
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};


// --- GAME PHASES ---

const Phase1CompleteScreen: React.FC<{ onContinue: () => void }> = ({ onContinue }) => {
  const [mentorText, setMentorText] = React.useState('');
  const [showButton, setShowButton] = React.useState(false);
  
  const fullText = "Congratulations! You have successfully identified and revealed the corrupted entity: VOID WRAITH. The entity has been exposed and marked for purging. You have earned 1 CREDIT for your efforts. Proceed to the next phase to complete the purge ritual.";
  
  React.useEffect(() => {
    // Mentor speaks with voice
    const speak = (textToSpeak: string) => {
      if ('speechSynthesis' in window) {
        window.speechSynthesis.cancel();
        
        const doSpeak = () => {
          const utterance = new SpeechSynthesisUtterance(textToSpeak.toLowerCase());
          utterance.pitch = 0.1; 
          utterance.rate = 0.8;
          utterance.volume = 1;
          
          const voices = window.speechSynthesis.getVoices();
          const robotVoice = voices.find(v => 
            v.name.toLowerCase().includes('male') || 
            v.name.toLowerCase().includes('david') ||
            v.name.toLowerCase().includes('google us english')
          ) || voices[0];
          
          if (robotVoice) utterance.voice = robotVoice;
          
          window.speechSynthesis.speak(utterance);
        };
        
        if (window.speechSynthesis.getVoices().length > 0) {
          doSpeak();
        } else {
          window.speechSynthesis.onvoiceschanged = () => {
            doSpeak();
          };
        }
      }
    };
    
    // Start speaking
    const speechTimer = setTimeout(() => speak(fullText), 500);
    
    // Typewriter effect
    let i = 0;
    const interval = setInterval(() => {
      setMentorText(fullText.slice(0, i + 1));
      i++;
      if (i >= fullText.length) {
        clearInterval(interval);
        setTimeout(() => setShowButton(true), 500);
      }
    }, 30);
    
    return () => {
      clearInterval(interval);
      clearTimeout(speechTimer);
      window.speechSynthesis.cancel();
    };
  }, []);
  
  return (
    <div className="relative h-full flex flex-col items-center justify-center p-6 gap-8">
      <div className="max-w-3xl w-full">
        {/* Mentor Box - Centered */}
        <div className="relative animate-fade-in">
          {/* Corner brackets */}
          <div className="absolute -top-1 -left-1 w-4 h-4 border-t border-l border-neon-red"></div>
          <div className="absolute -top-1 -right-1 w-4 h-4 border-t border-r border-neon-red"></div>
          <div className="absolute -bottom-1 -left-1 w-4 h-4 border-b border-l border-neon-red"></div>
          <div className="absolute -bottom-1 -right-1 w-4 h-4 border-b border-r border-neon-red"></div>
          
          <div className="relative bg-black/90 border border-neon-red/40 backdrop-blur-xl shadow-[0_0_30px_rgba(255,42,42,0.25)] overflow-hidden p-8">
            {/* Animated scan line */}
            <div className="absolute inset-0 bg-gradient-to-b from-transparent via-neon-red/5 to-transparent animate-scan pointer-events-none"></div>
            
            <div className="relative z-10 flex flex-col md:flex-row gap-6 items-center">
              {/* Mentor Image - Normal Size */}
              <div className="relative w-32 h-32 flex-shrink-0">
                <div className="absolute inset-0 border-2 border-neon-red/30 rounded-full animate-spin-slow"></div>
                <div className="absolute inset-1 border-2 border-white/10 rounded-full animate-spin" style={{ animationDirection: 'reverse', animationDuration: '3s' }}></div>
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="w-28 h-28 bg-neon-red rounded-full blur-2xl animate-pulse opacity-30 absolute"></div>
                  <div className="w-30 h-30 border-2 border-neon-red rounded-full grid place-items-center bg-black relative overflow-hidden shadow-[0_0_20px_rgba(255,42,42,0.6)] p-3">
                    <img src="/Public/Icons/The Mentor .svg" alt="The Mentor" className="w-full h-full object-contain relative z-10 drop-shadow-[0_0_12px_rgba(255,42,42,0.8)]" />
                  </div>
                </div>
                <div className="absolute -top-1 -left-1 w-4 h-4 border-t-2 border-l-2 border-white/60"></div>
                <div className="absolute -bottom-1 -right-1 w-4 h-4 border-b-2 border-r-2 border-white/60"></div>
              </div>
              
              {/* Text */}
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-4 pb-2 border-b border-white/10">
                  <span className="relative flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-neon-red opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-neon-red"></span>
                  </span>
                  <p className="font-tech text-neon-red text-sm uppercase tracking-[0.15em] font-bold">THE MENTOR</p>
                  <span className="font-tech text-white/40 text-xs uppercase tracking-wider ml-auto">TRANSMISSION</span>
                </div>
                
                <p className="font-tech text-white/90 text-base leading-relaxed">
                  {mentorText}
                  <span className="inline-block w-1.5 h-4 bg-neon-red ml-0.5 animate-pulse shadow-[0_0_6px_#ff2a2a]"></span>
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Button OUTSIDE the card */}
      {showButton && (
        <div className="animate-fade-in">
          <SpookyButton variant="ritual" onClick={onContinue} className="text-lg px-8 py-4">
            CONTINUE TO PHASE 2
          </SpookyButton>
        </div>
      )}
    </div>
  );
};

const Phase2CompleteScreen: React.FC<{ onContinue: () => void }> = ({ onContinue }) => {
  const [mentorText, setMentorText] = React.useState('');
  const [showButton, setShowButton] = React.useState(false);
  
  const fullText = "Excellent work! You have successfully neutralized all corruption spikes and purged the entity: SHADOW PHANTOM. The neural pathways have been cleansed and the threat has been eliminated. You have earned 1 CREDIT for your exceptional performance. Proceed to the final phase to complete the system restoration.";
  
  React.useEffect(() => {
    // Mentor speaks with voice
    const speak = (textToSpeak: string) => {
      if ('speechSynthesis' in window) {
        window.speechSynthesis.cancel();
        
        const doSpeak = () => {
          const utterance = new SpeechSynthesisUtterance(textToSpeak.toLowerCase());
          utterance.pitch = 0.1; 
          utterance.rate = 0.8;
          utterance.volume = 1;
          
          const voices = window.speechSynthesis.getVoices();
          const robotVoice = voices.find(v => 
            v.name.toLowerCase().includes('male') || 
            v.name.toLowerCase().includes('david') ||
            v.name.toLowerCase().includes('google us english')
          ) || voices[0];
          
          if (robotVoice) utterance.voice = robotVoice;
          
          window.speechSynthesis.speak(utterance);
        };
        
        if (window.speechSynthesis.getVoices().length > 0) {
          doSpeak();
        } else {
          window.speechSynthesis.onvoiceschanged = () => {
            doSpeak();
          };
        }
      }
    };
    
    // Start speaking
    const speechTimer = setTimeout(() => speak(fullText), 500);
    
    // Typewriter effect
    let i = 0;
    const interval = setInterval(() => {
      setMentorText(fullText.slice(0, i + 1));
      i++;
      if (i >= fullText.length) {
        clearInterval(interval);
        setTimeout(() => setShowButton(true), 500);
      }
    }, 30);
    
    return () => {
      clearInterval(interval);
      clearTimeout(speechTimer);
      window.speechSynthesis.cancel();
    };
  }, []);
  
  return (
    <div className="relative h-full flex flex-col items-center justify-center p-6 gap-8">
      <div className="max-w-3xl w-full">
        {/* Mentor Box - Centered */}
        <div className="relative animate-fade-in">
          {/* Corner brackets */}
          <div className="absolute -top-1 -left-1 w-4 h-4 border-t border-l border-neon-red"></div>
          <div className="absolute -top-1 -right-1 w-4 h-4 border-t border-r border-neon-red"></div>
          <div className="absolute -bottom-1 -left-1 w-4 h-4 border-b border-l border-neon-red"></div>
          <div className="absolute -bottom-1 -right-1 w-4 h-4 border-b border-r border-neon-red"></div>
          
          <div className="relative bg-black/90 border border-neon-red/40 backdrop-blur-xl shadow-[0_0_30px_rgba(255,42,42,0.25)] overflow-hidden p-8">
            {/* Animated scan line */}
            <div className="absolute inset-0 bg-gradient-to-b from-transparent via-neon-red/5 to-transparent animate-scan pointer-events-none"></div>
            
            <div className="relative z-10 flex flex-col md:flex-row gap-6 items-center">
              {/* Mentor Image - Normal Size */}
              <div className="relative w-32 h-32 flex-shrink-0">
                <div className="absolute inset-0 border-2 border-neon-red/30 rounded-full animate-spin-slow"></div>
                <div className="absolute inset-1 border-2 border-white/10 rounded-full animate-spin" style={{ animationDirection: 'reverse', animationDuration: '3s' }}></div>
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="w-28 h-28 bg-neon-red rounded-full blur-2xl animate-pulse opacity-30 absolute"></div>
                  <div className="w-30 h-30 border-2 border-neon-red rounded-full grid place-items-center bg-black relative overflow-hidden shadow-[0_0_20px_rgba(255,42,42,0.6)] p-3">
                    <img src="/Public/Icons/The Mentor .svg" alt="The Mentor" className="w-full h-full object-contain relative z-10 drop-shadow-[0_0_12px_rgba(255,42,42,0.8)]" />
                  </div>
                </div>
                <div className="absolute -top-1 -left-1 w-4 h-4 border-t-2 border-l-2 border-white/60"></div>
                <div className="absolute -bottom-1 -right-1 w-4 h-4 border-b-2 border-r-2 border-white/60"></div>
              </div>
              
              {/* Text */}
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-4 pb-2 border-b border-white/10">
                  <span className="relative flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-neon-red opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-neon-red"></span>
                  </span>
                  <p className="font-tech text-neon-red text-sm uppercase tracking-[0.15em] font-bold">THE MENTOR</p>
                  <span className="font-tech text-white/40 text-xs uppercase tracking-wider ml-auto">TRANSMISSION</span>
                </div>
                
                <p className="font-tech text-white/90 text-base leading-relaxed">
                  {mentorText}
                  <span className="inline-block w-1.5 h-4 bg-neon-red ml-0.5 animate-pulse shadow-[0_0_6px_#ff2a2a]"></span>
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Button OUTSIDE the card */}
      {showButton && (
        <div className="animate-fade-in">
          <SpookyButton variant="ritual" onClick={onContinue} className="text-lg px-8 py-4">
            CONTINUE TO PHASE 3
          </SpookyButton>
        </div>
      )}
    </div>
  );
};

const Phase3CompleteScreen: React.FC<{ onContinue: () => void }> = ({ onContinue }) => {
  const [mentorText, setMentorText] = React.useState('');
  const [showButton, setShowButton] = React.useState(false);
  
  const fullText = "Outstanding performance! You have successfully calibrated the signal waveform and restored system stability. The entity: FREQUENCY WRAITH has been neutralized and all corruption has been purged. You have earned 3 CREDITS for your masterful execution. The system is now fully operational. Mission complete.";
  
  React.useEffect(() => {
    // Mentor speaks with voice
    const speak = (textToSpeak: string) => {
      if ('speechSynthesis' in window) {
        window.speechSynthesis.cancel();
        
        const doSpeak = () => {
          const utterance = new SpeechSynthesisUtterance(textToSpeak.toLowerCase());
          utterance.pitch = 0.1; 
          utterance.rate = 0.8;
          utterance.volume = 1;
          
          const voices = window.speechSynthesis.getVoices();
          const robotVoice = voices.find(v => 
            v.name.toLowerCase().includes('male') || 
            v.name.toLowerCase().includes('david') ||
            v.name.toLowerCase().includes('google us english')
          ) || voices[0];
          
          if (robotVoice) utterance.voice = robotVoice;
          
          window.speechSynthesis.speak(utterance);
        };
        
        if (window.speechSynthesis.getVoices().length > 0) {
          doSpeak();
        } else {
          window.speechSynthesis.onvoiceschanged = () => {
            doSpeak();
          };
        }
      }
    };
    
    // Start speaking
    const speechTimer = setTimeout(() => speak(fullText), 500);
    
    // Typewriter effect
    let i = 0;
    const interval = setInterval(() => {
      setMentorText(fullText.slice(0, i + 1));
      i++;
      if (i >= fullText.length) {
        clearInterval(interval);
        setTimeout(() => setShowButton(true), 500);
      }
    }, 30);
    
    return () => {
      clearInterval(interval);
      clearTimeout(speechTimer);
      window.speechSynthesis.cancel();
    };
  }, []);
  
  return (
    <div className="relative h-full flex flex-col items-center justify-center p-6 gap-8">
      <div className="max-w-3xl w-full">
        {/* Mentor Box - Centered */}
        <div className="relative animate-fade-in">
          {/* Corner brackets */}
          <div className="absolute -top-1 -left-1 w-4 h-4 border-t border-l border-neon-red"></div>
          <div className="absolute -top-1 -right-1 w-4 h-4 border-t border-r border-neon-red"></div>
          <div className="absolute -bottom-1 -left-1 w-4 h-4 border-b border-l border-neon-red"></div>
          <div className="absolute -bottom-1 -right-1 w-4 h-4 border-b border-r border-neon-red"></div>
          
          <div className="relative bg-black/90 border border-neon-red/40 backdrop-blur-xl shadow-[0_0_30px_rgba(255,42,42,0.25)] overflow-hidden p-8">
            {/* Animated scan line */}
            <div className="absolute inset-0 bg-gradient-to-b from-transparent via-neon-red/5 to-transparent animate-scan pointer-events-none"></div>
            
            <div className="relative z-10 flex flex-col md:flex-row gap-6 items-center">
              {/* Mentor Image - Normal Size */}
              <div className="relative w-32 h-32 flex-shrink-0">
                <div className="absolute inset-0 border-2 border-neon-red/30 rounded-full animate-spin-slow"></div>
                <div className="absolute inset-1 border-2 border-white/10 rounded-full animate-spin" style={{ animationDirection: 'reverse', animationDuration: '3s' }}></div>
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="w-28 h-28 bg-neon-red rounded-full blur-2xl animate-pulse opacity-30 absolute"></div>
                  <div className="w-30 h-30 border-2 border-neon-red rounded-full grid place-items-center bg-black relative overflow-hidden shadow-[0_0_20px_rgba(255,42,42,0.6)] p-3">
                    <img src="/Public/Icons/The Mentor .svg" alt="The Mentor" className="w-full h-full object-contain relative z-10 drop-shadow-[0_0_12px_rgba(255,42,42,0.8)]" />
                  </div>
                </div>
                <div className="absolute -top-1 -left-1 w-4 h-4 border-t-2 border-l-2 border-white/60"></div>
                <div className="absolute -bottom-1 -right-1 w-4 h-4 border-b-2 border-r-2 border-white/60"></div>
              </div>
              
              {/* Text */}
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-4 pb-2 border-b border-white/10">
                  <span className="relative flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-neon-red opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-neon-red"></span>
                  </span>
                  <p className="font-tech text-neon-red text-sm uppercase tracking-[0.15em] font-bold">THE MENTOR</p>
                  <span className="font-tech text-white/40 text-xs uppercase tracking-wider ml-auto">TRANSMISSION</span>
                </div>
                
                <p className="font-tech text-white/90 text-base leading-relaxed">
                  {mentorText}
                  <span className="inline-block w-1.5 h-4 bg-neon-red ml-0.5 animate-pulse shadow-[0_0_6px_#ff2a2a]"></span>
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Button OUTSIDE the card */}
      {showButton && (
        <div className="animate-fade-in">
          <SpookyButton variant="ritual" onClick={onContinue} className="text-lg px-8 py-4">
            VIEW RESULTS
          </SpookyButton>
        </div>
      )}
    </div>
  );
};

const IntroScreen: React.FC<{ text: string; onStart: () => void }> = ({ text, onStart }) => {
  const [mentorText, setMentorText] = React.useState('');
  const [showToolsExplanation, setShowToolsExplanation] = React.useState(false);
  const [highlightedTool, setHighlightedTool] = React.useState<string | null>(null);
  const [toolsExpanded, setToolsExpanded] = React.useState(false);
  const [showMentor, setShowMentor] = React.useState(true);
  
  const fullMentorText = "Access granted. You will face corrupted entities blocking the system. Complete each challenge to eliminate them. Success grants you full transformation access.";
  const toolsExplanation = "I have provided you with three essential tools. The VOID SCANNER detects hidden corruption in the system. The RADIO DECODER analyzes signal frequencies to locate entities. The NEURAL PURGE eliminates threats permanently. Master these tools to succeed in your hunt.";
  
  React.useEffect(() => {
    // First message typewriter effect
    let i = 0;
    const interval = setInterval(() => {
      setMentorText(fullMentorText.slice(0, i + 1));
      i++;
      if (i >= fullMentorText.length) {
        clearInterval(interval);
        
        // After 3 seconds, show tools explanation
        setTimeout(() => {
          setShowToolsExplanation(true);
          setToolsExpanded(true); // Auto-expand tools panel
          
          // Speak the tools explanation immediately
          speak(toolsExplanation);
          
          // Type tools explanation
          let j = 0;
          const toolsInterval = setInterval(() => {
            setMentorText(fullMentorText + " " + toolsExplanation.slice(0, j + 1));
            j++;
            
            // Highlight tools based on what the mentor is currently talking about
            const currentText = toolsExplanation.slice(0, j + 1);
            
            // Highlight VOID SCANNER while talking about it
            if (currentText.includes('VOID SCANNER') && !currentText.includes('RADIO DECODER')) {
              setHighlightedTool('scanner');
            } 
            // Highlight RADIO DECODER while talking about it
            else if (currentText.includes('RADIO DECODER') && !currentText.includes('NEURAL PURGE')) {
              setHighlightedTool('decoder');
            } 
            // Highlight NEURAL PURGE while talking about it
            else if (currentText.includes('NEURAL PURGE') && !currentText.includes('Master these tools')) {
              setHighlightedTool('purge');
            }
            // Clear highlight when done talking about tools
            else if (currentText.includes('Master these tools')) {
              setHighlightedTool(null);
            }
            
            if (j >= toolsExplanation.length) {
              clearInterval(toolsInterval);
            }
          }, 35);
        }, 3000);
      }
    }, 35);
    
    // Mentor speaks with voice
    const speak = (textToSpeak: string) => {
        if ('speechSynthesis' in window) {
            window.speechSynthesis.cancel();
            
            const doSpeak = () => {
                const utterance = new SpeechSynthesisUtterance(textToSpeak.toLowerCase());
                utterance.pitch = 0.1; 
                utterance.rate = 0.8;
                utterance.volume = 1;
                
                const voices = window.speechSynthesis.getVoices();
                const robotVoice = voices.find(v => 
                    v.name.toLowerCase().includes('male') || 
                    v.name.toLowerCase().includes('david') ||
                    v.name.toLowerCase().includes('google us english')
                ) || voices[0];
                
                if (robotVoice) utterance.voice = robotVoice;
                
                window.speechSynthesis.speak(utterance);
            };
            
            if (window.speechSynthesis.getVoices().length > 0) {
                doSpeak();
            } else {
                window.speechSynthesis.onvoiceschanged = () => {
                    doSpeak();
                };
            }
        }
    };
    
    const speechTimer = setTimeout(() => speak(fullMentorText), 500);
    
    return () => {
      clearInterval(interval);
      clearTimeout(speechTimer);
      window.speechSynthesis.cancel();
    };
  }, []);
  
  return (
    <div className="relative h-full flex items-center justify-center">
      
      {/* Center: START HUNTING Button */}
      <div className="text-center z-10">
        <h2 className="font-display font-extrabold text-5xl md:text-7xl text-white mb-8 tracking-tighter">
          READY TO HUNT?
        </h2>
        <p className="font-tech text-ash/70 text-sm md:text-base mb-12 max-w-md mx-auto">
          The corrupted entities await. Begin your mission to restore the system.
        </p>
        <SpookyButton 
          variant="ritual" 
          onClick={onStart}
          className="text-lg"
        >
          START HUNTING
        </SpookyButton>
      </div>
      
      {/* Mentor Box in bottom left corner - COMPACT & REFINED */}
      {showMentor && (
        <div className="fixed bottom-6 left-6 max-w-md animate-fade-in z-50">
          <div className="relative">
            {/* Corner brackets */}
            <div className="absolute -top-1 -left-1 w-4 h-4 border-t border-l border-neon-red"></div>
            <div className="absolute -top-1 -right-1 w-4 h-4 border-t border-r border-neon-red"></div>
            <div className="absolute -bottom-1 -left-1 w-4 h-4 border-b border-l border-neon-red"></div>
            <div className="absolute -bottom-1 -right-1 w-4 h-4 border-b border-r border-neon-red"></div>
            
            {/* Main box */}
            <div className="relative bg-black/90 border border-neon-red/40 backdrop-blur-xl shadow-[0_0_30px_rgba(255,42,42,0.25)] overflow-hidden">
              {/* Animated scan line */}
              <div className="absolute inset-0 bg-gradient-to-b from-transparent via-neon-red/5 to-transparent animate-scan pointer-events-none"></div>
              
              {/* Close button */}
              <button 
                onClick={() => setShowMentor(false)}
                className="absolute top-2 left-2 z-20 w-5 h-5 flex items-center justify-center text-white/40 hover:text-neon-red hover:bg-white/10 transition-colors rounded"
                title="Close Mentor"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
              
              <div className="relative z-10 p-3 flex gap-3 items-center">
              {/* LEFT: Mentor Image - Slightly bigger */}
              <div className="relative w-20 h-20 flex-shrink-0">
                {/* Spinning rings */}
                <div className="absolute inset-0 border border-neon-red/30 rounded-full animate-spin-slow"></div>
                <div className="absolute inset-0.5 border border-white/10 rounded-full animate-spin" style={{ animationDirection: 'reverse', animationDuration: '3s' }}></div>
                
                {/* Glow */}
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="w-16 h-16 bg-neon-red rounded-full blur-xl animate-pulse opacity-30 absolute"></div>
                  
                  {/* Image */}
                  <div className="w-[4.5rem] h-[4.5rem] border border-neon-red rounded-full grid place-items-center bg-black relative overflow-hidden shadow-[0_0_15px_rgba(255,42,42,0.4)] p-2">
                    <img src="/Public/Icons/The Mentor .svg" alt="The Mentor" className="w-full h-full object-contain relative z-10 drop-shadow-[0_0_10px_rgba(255,42,42,0.6)]" />
                  </div>
                </div>
                
                {/* Corner accents - white instead of blue */}
                <div className="absolute -top-0.5 -left-0.5 w-2 h-2 border-t border-l border-white/60"></div>
                <div className="absolute -bottom-0.5 -right-0.5 w-2 h-2 border-b border-r border-white/60"></div>
              </div>
              
              {/* RIGHT: Text - Improved layout */}
              <div className="flex-1 min-w-0">
                {/* Header */}
                <div className="flex items-center gap-2 mb-2 pb-1.5 border-b border-white/10">
                  <span className="relative flex h-1.5 w-1.5">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-neon-red opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-neon-red"></span>
                  </span>
                  <p className="font-tech text-neon-red text-[10px] uppercase tracking-[0.15em] font-bold">THE MENTOR</p>
                  <span className="font-tech text-white/40 text-[9px] uppercase tracking-wider ml-auto">ONLINE</span>
                </div>
                
                {/* Message */}
                <p className="font-tech text-white/90 text-xs leading-relaxed">
                  {mentorText}
                  <span className="inline-block w-1.5 h-3 bg-neon-red ml-0.5 animate-pulse shadow-[0_0_6px_#ff2a2a]"></span>
                </p>
                
                {/* Status footer */}
                <div className="mt-2 pt-1.5 border-t border-white/5 flex items-center gap-1.5 text-[9px] font-tech text-ash/30 uppercase tracking-wide">
                  <span>MTR-001</span>
                  <span className="w-0.5 h-0.5 bg-ash/30 rounded-full"></span>
                  <span>ACTIVE</span>
                </div>
              </div>
            </div>
          </div>
        </div>
        </div>
      )}
      
      {/* Tools Panel in bottom right - EXPANDABLE */}
      <div className="fixed bottom-6 right-6 z-50 w-[160px]">
        <div className="relative">
          {/* Corner brackets */}
          <div className="absolute -top-1 -left-1 w-4 h-4 border-t border-l border-neon-red"></div>
          <div className="absolute -top-1 -right-1 w-4 h-4 border-t border-r border-neon-red"></div>
          <div className="absolute -bottom-1 -left-1 w-4 h-4 border-b border-l border-neon-red"></div>
          <div className="absolute -bottom-1 -right-1 w-4 h-4 border-b border-r border-neon-red"></div>
          
          <div className="relative bg-black/90 border border-neon-red/40 backdrop-blur-xl shadow-[0_0_30px_rgba(255,42,42,0.25)] overflow-hidden">
            {/* Header - Always visible */}
            <button 
              onClick={() => setToolsExpanded(!toolsExpanded)}
              className="w-full p-2 flex items-center justify-between gap-2 hover:bg-white/5 transition-colors"
            >
              <div className="flex items-center gap-1.5">
                <span className="relative flex h-1.5 w-1.5">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-neon-red opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-neon-red"></span>
                </span>
                <p className="font-tech text-neon-red text-[9px] uppercase tracking-[0.12em] font-bold">DETECTION TOOLS</p>
              </div>
              <svg 
                className={`w-3 h-3 text-white/60 transition-transform ${toolsExpanded ? 'rotate-180' : ''}`} 
                fill="none" 
                viewBox="0 0 24 24" 
                stroke="currentColor"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </button>
            
            {/* Tools - Expandable */}
            <div className={`transition-all duration-300 overflow-hidden ${toolsExpanded ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'}`}>
              <div className="p-1.5 pt-0 space-y-1 border-t border-white/10">
                
                {/* Void Scanner Tool */}
                <div className={`p-1.5 bg-black/40 border border-white/10 transition-all duration-300 ${highlightedTool === 'scanner' ? 'border-neon-red shadow-[0_0_20px_rgba(255,42,42,0.5)] scale-105' : ''}`}>
                  <div className="flex items-center gap-1.5 mb-0.5">
                    <svg className="w-2.5 h-2.5 text-neon-red" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                    <span className="font-tech text-white text-[8px] uppercase tracking-wider font-bold">VOID SCANNER</span>
                  </div>
                  <p className="font-tech text-ash/60 text-[7px] leading-tight">Detects hidden corruption</p>
                </div>
                
                {/* Radio Decoder Tool */}
                <div className={`p-1.5 bg-black/40 border border-white/10 transition-all duration-300 ${highlightedTool === 'decoder' ? 'border-neon-red shadow-[0_0_20px_rgba(255,42,42,0.5)] scale-105' : ''}`}>
                  <div className="flex items-center gap-1.5 mb-0.5">
                    <svg className="w-2.5 h-2.5 text-neon-red" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                    </svg>
                    <span className="font-tech text-white text-[8px] uppercase tracking-wider font-bold">RADIO DECODER</span>
                  </div>
                  <p className="font-tech text-ash/60 text-[7px] leading-tight">Detects signal frequency</p>
                </div>
                
                {/* Neural Purge Tool */}
                <div className={`p-1.5 bg-black/40 border border-white/10 transition-all duration-300 ${highlightedTool === 'purge' ? 'border-neon-red shadow-[0_0_20px_rgba(255,42,42,0.5)] scale-105' : ''}`}>
                  <div className="flex items-center gap-1.5 mb-0.5">
                    <svg className="w-2.5 h-2.5 text-neon-red" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                    </svg>
                    <span className="font-tech text-white text-[8px] uppercase tracking-wider font-bold">NEURAL PURGE</span>
                  </div>
                  <p className="font-tech text-ash/60 text-[7px] leading-tight">Eliminates threats</p>
                </div>
                
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const VictoryScreen: React.FC<{ onRestart: () => void; onExit: () => void; onVictory?: () => void; }> = ({ onRestart, onExit, onVictory }) => (
    <div className="text-center flex flex-col items-center gap-6">
        {/* Header */}
        <div className="animate-fade-in">
            <p className="font-tech text-green-500 text-xs tracking-[0.3em] uppercase mb-2 animate-pulse">// MISSION COMPLETE</p>
            <h2 className="font-display text-4xl md:text-6xl font-bold text-white mb-4 tracking-tight">
                SIGNAL STABILIZED
            </h2>
            <p className="font-tech text-ash/70 text-sm max-w-lg mx-auto">
                All corrupted nodes have been purged. The Void Echo is contained. System integrity restored to 100%.
            </p>
        </div>
        
        {/* Action buttons */}
        <div className="flex gap-4 animate-fade-in">
            {onVictory ? (
                <SpookyButton variant="ritual" onClick={onVictory}>
                    RESTORE SYSTEM
                </SpookyButton>
            ) : (
                <>
                    <SpookyButton variant="ghost" onClick={onRestart}>
                        REPLAY
                    </SpookyButton>
                    <SpookyButton variant="primary" onClick={onExit}>
                        EXIT
                    </SpookyButton>
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

