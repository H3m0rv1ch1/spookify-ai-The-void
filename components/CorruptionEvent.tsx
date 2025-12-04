
import React, { useEffect, useState, useRef } from 'react';
import { SpookyButton } from './SpookyButton';

interface CorruptionEventProps {
  onFix: () => void;
}

type Phase = 'CRASH' | 'ALERT';

const BOOT_LOGS = [
  "   _____ ____  ____  ____  _  _______ __   __",
  "  / ____|  _ \\/ __ \\/ __ \\| |/ /_   _|  \\/  |",
  " | (___ | |_) | |  | |  | | ' /  | | | \\  / |",
  "  \\___ \\|  __/| |  | |  | |  <   | | | |\\/| |",
  "  ____) | |   | |__| |__| | . \\ _| |_| |  | |",
  " |_____/|_|    \\____/\\____/|_|\\_\\_____|_|  |_|",
  "                                              ",
  "SPOOKIFY OS v6.6.6 (GNU/Linux)",
  "--------------------------------------------------",
  "[    0.000000] Linux version 6.6.6-void (root@hell) (gcc version 13.2.0)",
  "[    0.000213] Command line: BOOT_IMAGE=/boot/vmlinuz-void root=UUID=666 ro quiet splash",
  "[    0.001452] KERNEL supported cpus:",
  "[    0.001454]   Intel GenuineVoid",
  "[    0.001455]   AMD ShadowRyzen",
  "[    0.002101] BiOS detected: S.P.O.O.K.I.F.Y v2.0",
  "[    0.123412] Zone ranges:",
  "[    0.123414]   DMA      [mem 0x0000000000001000-0x0000000000ffffff]",
  "[  OK  ] Started D-Bus System Message Bus.",
  "[  OK  ] Reached target Network.",
  "[  OK  ] Reached target Network is Online.",
  "[  OK  ] Started Daemon for power management.",
  "[  OK  ] Started Spookify Neural Engine.",
  "[FAILED] Failed to start Reality Anchor Service.",
  "[FAILED] Failed to load module: hope.ko.",
  "[    0.888888] VOID_SIGNAL: Connection established with unknown entity...",
  "[    0.912341] tcp_listen_port: binding to port 666 (Protocol: DARKNET)",
  "[    1.666666] audit: type=1400 audit(1638123.123:2): avc:  denied  { exist } for  pid=666 comm=\"daemon\"",
  "[    1.881231] KERNEL PANIC: VFS: Unable to mount root fs on unknown-block(0,0)",
  "[    2.012312] CRITICAL: REALITY_ANCHOR_LOST",
  "[    2.151231] RIP: 0010:void_entry_point+0x12/0x40",
  "[    2.234123] RSP: 0018:ffffa84c00003e80 EFLAGS: 00010246",
  "[    2.300000] RAX: 0000000000000000 RBX: ffff8d5f40000000 RCX: 0000000000000000",
  "[    2.350000] RDX: 0000000000000001 RSI: 0000000000000286 RDI: ffff8d5f40000000",
  "[    2.400000] ---[ end Kernel panic - not syncing: Fatal exception in interrupt ]---"
];

const renderLogLine = (text: string, index: number) => {
    if (!text) return null;
    
    // Timestamps and Kernel Panic
    if (text.startsWith("[")) {
        const timeMatch = text.match(/^\[\s*(\d+\.\d+)\]/);
        
        if (text.includes("[  OK  ]")) {
            const parts = text.split("[  OK  ]");
            return (
                <div key={index} className="whitespace-pre-wrap">
                    <span className="text-green-500 font-bold">[  OK  ]</span>
                    <span>{parts[1]}</span>
                </div>
            );
        }
        if (text.includes("[FAILED]")) {
             const parts = text.split("[FAILED]");
             return (
                <div key={index} className="whitespace-pre-wrap">
                    <span className="text-red-500 font-bold">[FAILED]</span>
                    <span>{parts[1]}</span>
                </div>
            );
        }

        if (timeMatch) {
            const rest = text.substring(timeMatch[0].length);
            // Check for KERNEL PANIC or CRITICAL
            if (rest.includes("KERNEL PANIC") || rest.includes("CRITICAL") || rest.includes("Fatal exception")) {
                return (
                    <div key={index} className="whitespace-pre-wrap">
                        <span className="text-green-500">[{timeMatch[1]}]</span>
                        <span className="text-red-500 font-bold">{rest}</span>
                    </div>
                );
            }
            return (
                <div key={index} className="whitespace-pre-wrap">
                    <span className="text-green-500">[{timeMatch[1]}]</span>
                    <span>{rest}</span>
                </div>
            );
        }
    }
    
    // ASCII Art & Default
    return <div key={index} className="text-white/80 whitespace-pre font-bold">{text}</div>;
}

export const CorruptionEvent: React.FC<CorruptionEventProps> = ({ onFix }) => {
  const [phase, setPhase] = useState<Phase>('CRASH');
  
  // Crash Phase State
  const [logs, setLogs] = useState<string[]>([]);
  const logContainerRef = useRef<HTMLDivElement>(null);

  // Alert Phase State
  const [text, setText] = useState('');
  const [showButton, setShowButton] = useState(false);
  const [glitchOffset, setGlitchOffset] = useState({ x: 0, y: 0 });
  const [isMounted, setIsMounted] = useState(false);
  
  const fullText = "HALT. THE SIGNAL IS COMPROMISED. SHADOWS ARE BLEEDING INTO YOUR REQUEST. YOU MUST CLEANSE THE INTERFACE BEFORE THE RITUAL CAN PROCEED.";
  
  // --- CRASH LOGIC ---
  useEffect(() => {
    if (phase !== 'CRASH') return;

    let logIndex = 0;
    const interval = setInterval(() => {
        if (logIndex < BOOT_LOGS.length) {
            setLogs(prev => [...prev, BOOT_LOGS[logIndex]]);
            logIndex++;
        } else {
            clearInterval(interval);
            setTimeout(() => setPhase('ALERT'), 1500); // Wait a bit after panic then switch
        }
        
        // Auto scroll
        if (logContainerRef.current) {
            logContainerRef.current.scrollTop = logContainerRef.current.scrollHeight;
        }
    }, 50); // Speed of scrolling text

    return () => clearInterval(interval);
  }, [phase]);


  // --- ALERT LOGIC ---
  useEffect(() => {
    if (phase !== 'ALERT') return;
    
    // Trigger Entrance Animation
    const mountTimer = setTimeout(() => setIsMounted(true), 100);

    // Typewriter effect
    let i = 0;
    const interval = setInterval(() => {
      setText(fullText.slice(0, i + 1));
      i++;
      if (i >= fullText.length) {
        clearInterval(interval);
        setShowButton(true);
      }
    }, 35); 

    // Glitch jitter loop
    const glitchInterval = setInterval(() => {
        if (Math.random() > 0.9) {
            setGlitchOffset({ 
                x: (Math.random() - 0.5) * 6,
                y: (Math.random() - 0.5) * 4  
            });
            setTimeout(() => setGlitchOffset({ x: 0, y: 0 }), 50);
        }
    }, 100);

    // Audio / Speech
    const speak = () => {
        if ('speechSynthesis' in window) {
            window.speechSynthesis.cancel();
            const utterance = new SpeechSynthesisUtterance(fullText.toLowerCase());
            utterance.pitch = 0.1; 
            utterance.rate = 0.8;
            utterance.volume = 1;
            
            const voices = window.speechSynthesis.getVoices();
            const robotVoice = voices.find(v => v.name.toLowerCase().includes('google') || v.name.toLowerCase().includes('zira'));
            if (robotVoice) utterance.voice = robotVoice;
            
            window.speechSynthesis.speak(utterance);
        }
    };

    const speechTimer = setTimeout(speak, 500);

    return () => {
        window.speechSynthesis.cancel();
        clearInterval(interval);
        clearInterval(glitchInterval);
        clearTimeout(mountTimer);
        clearTimeout(speechTimer);
    };
  }, [phase]);

  // RENDER CRASH PHASE
  if (phase === 'CRASH') {
      return (
          <div className="fixed inset-0 z-[100] bg-black font-mono text-xs md:text-sm text-white/90 p-4 md:p-8 overflow-hidden flex flex-col justify-end">
              {/* Scanlines for crash phase */}
              <div className="absolute inset-0 bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.25)_50%),linear-gradient(90deg,rgba(255,0,0,0.06),rgba(0,255,0,0.02),rgba(0,0,255,0.06))] z-[10] bg-[size:100%_4px,6px_100%] pointer-events-none opacity-50"></div>
              
              <div 
                ref={logContainerRef} 
                className="w-full h-full overflow-y-auto scrollbar-hide flex flex-col justify-end pb-20 relative z-20"
              >
                  {logs.map((log, i) => renderLogLine(log, i))}
                  <div className="animate-pulse bg-white w-2 h-4 mt-1"></div>
              </div>
          </div>
      );
  }

  // RENDER ALERT PHASE
  return (
    <div className={`fixed inset-0 z-[100] bg-void flex flex-col items-center justify-center overflow-hidden font-tech text-ash p-4 transition-opacity duration-1000 ease-out ${isMounted ? 'opacity-100' : 'opacity-0'}`}>
        
        {/* 1. Background Elements */}
        <div className="absolute inset-0 bg-grid opacity-[0.15] pointer-events-none"></div>

        <div className="absolute inset-0 z-0 opacity-20 pointer-events-none select-none overflow-hidden mix-blend-screen">
            <div className="absolute inset-0 bg-gradient-to-b from-void via-transparent to-void z-10"></div>
            <div className="w-full h-[200%] animate-scan text-[10px] md:text-xs leading-none text-neon-red font-mono opacity-40 break-all whitespace-pre-wrap p-4">
                {Array(60).fill(0).map((_, i) => (
                    <div key={i} className="flex justify-between gap-4">
                         <span>{Math.random() > 0.5 ? 'SPOOKIFY' : '01010101'}</span>
                         <span>{Math.random() > 0.5 ? 'ERROR' : '10101010'}</span>
                         <span className="hidden md:inline">{Math.random() > 0.5 ? 'VOID' : '00110011'}</span>
                         <span className="hidden md:inline">{Math.random() > 0.5 ? 'SIGNAL_LOST' : '11001100'}</span>
                    </div>
                ))}
            </div>
        </div>

        <div className="absolute inset-0 bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.25)_50%),linear-gradient(90deg,rgba(255,0,0,0.06),rgba(0,255,0,0.02),rgba(0,0,255,0.06))] z-[10] bg-[size:100%_4px,6px_100%] pointer-events-none"></div>

        {/* 2. Main Content */}
        <div className={`relative z-20 flex flex-col items-center text-center max-w-5xl w-full transition-all duration-1000 ease-out transform ${isMounted ? 'translate-y-0 opacity-100 blur-0' : 'translate-y-8 opacity-0 blur-sm'}`}>
            
            <div className="inline-flex items-center gap-3 px-4 py-2 rounded-full border border-neon-red/30 bg-neon-red/5 backdrop-blur-md mb-8 md:mb-12 animate-pulse">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-neon-red opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-neon-red"></span>
                </span>
                <span className="font-tech text-xs font-bold tracking-[0.2em] text-neon-red uppercase">
                    SYSTEM OVERRIDE // EVENT ID: 666
                </span>
            </div>

            <div className="relative w-24 h-24 md:w-32 md:h-32 mb-8 md:mb-10 group grid place-items-center">
                <div className="absolute inset-0 border border-neon-red/30 rounded-full animate-spin-slow group-hover:border-neon-red/60 transition-colors"></div>
                <div className="absolute inset-2 border border-neon-red/20 rounded-full animate-spin" style={{ animationDirection: 'reverse', animationDuration: '4s' }}></div>
                
                <div className="absolute inset-0 flex items-center justify-center">
                    <div className="w-16 h-16 md:w-20 md:h-20 bg-neon-red rounded-full blur-2xl animate-pulse opacity-30 absolute"></div>
                    
                     <div className="w-16 h-16 md:w-20 md:h-20 border border-neon-red rounded-full grid place-items-center bg-black/80 relative overflow-hidden shadow-[0_0_15px_rgba(255,42,42,0.3)]">
                          <div className="absolute inset-0 bg-neon-red/20 animate-scan z-0"></div>
                          
                          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-10 h-10 md:w-12 md:h-12 text-neon-red opacity-90 relative z-10">
                            <path fillRule="evenodd" d="M7.5 6a4.5 4.5 0 119 0 4.5 4.5 0 01-9 0zM3.751 20.105a8.25 8.25 0 0116.498 0 .75.75 0 01-.437.695A18.683 18.683 0 0112 22.5c-2.786 0-5.433-.608-7.812-1.7a.75.75 0 01-.437-.695z" clipRule="evenodd" />
                          </svg>
                     </div>
                </div>
            </div>

            <h1 
                className="font-display font-black text-6xl md:text-8xl lg:text-9xl tracking-tighter text-white mb-8 mix-blend-difference leading-[0.8] relative z-20 transition-transform duration-75"
                style={{
                    transform: `translate(${glitchOffset.x}px, ${glitchOffset.y}px)`
                }}
            >
                FATAL_ERROR
            </h1>

            <div className="w-24 h-[1px] bg-gradient-to-r from-transparent via-neon-red to-transparent mb-8 opacity-50"></div>

            <div className="font-tech text-lg md:text-2xl text-ash/80 leading-relaxed max-w-3xl min-h-[100px] mb-12 px-4">
                 <span className="text-neon-red font-bold mr-3">&gt;</span>
                 <span>
                    {text}
                 </span>
                 <span className="inline-block w-3 h-6 bg-neon-red ml-1 animate-pulse align-middle shadow-[0_0_10px_#ff0000]"></span>
            </div>

            <div className={`transition-all duration-1000 transform ${showButton ? 'translate-y-0 opacity-100' : 'translate-y-12 opacity-0'} z-[70] relative`}>
                <SpookyButton 
                    variant="ritual" 
                    onClick={onFix} 
                    className="shadow-[0_0_60px_rgba(255,42,42,0.4)] hover:shadow-[0_0_80px_rgba(255,42,42,0.6)] scale-110"
                >
                    INITIATE PURGE
                </SpookyButton>
            </div>
        </div>
    </div>
  );
};
