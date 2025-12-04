import React, { useState, useEffect, useRef } from 'react';
import { ECHO_FRAGMENTS, PURGE_CHARS } from './gameConstants';
import { SpookyButton } from './SpookyButton';

interface VoidTerminalGameProps {
  onExit: () => void;
}

type GameState = 'BOOTING' | 'IDLE' | 'SCANNING' | 'ANALYZING' | 'PURGING' | 'SUCCESS' | 'FAILURE' | 'VICTORY' | 'SHUTDOWN';
type Line = { text: string; type: 'input' | 'output' | 'system' | 'error' | 'success' };

const TARGET_PURGES = 5;
const PURGE_TIME_LIMIT = 15; // seconds

export const VoidTerminalGame: React.FC<VoidTerminalGameProps> = ({ onExit }) => {
  const [gameState, setGameState] = useState<GameState>('BOOTING');
  const [lines, setLines] = useState<Line[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [echoesPurged, setEchoesPurged] = useState(0);

  // Purge state
  const [currentEcho, setCurrentEcho] = useState<{ id: string; text: string } | null>(null);
  const [purgeSequence, setPurgeSequence] = useState('');
  const [timer, setTimer] = useState(PURGE_TIME_LIMIT);

  const inputRef = useRef<HTMLInputElement>(null);
  const terminalEndRef = useRef<HTMLDivElement>(null);

  // --- UTILITY FUNCTIONS ---
  const addLine = (text: string, type: Line['type']) => {
    setLines(prev => [...prev, { text, type }]);
  };

  const generatePurgeSequence = (length: number): string => {
    let result = '';
    for (let i = 0; i < length; i++) {
      result += PURGE_CHARS.charAt(Math.floor(Math.random() * PURGE_CHARS.length));
    }
    return result;
  };

  // --- GAME STATE MANAGEMENT ---
  useEffect(() => {
    // BOOT SEQUENCE
    const bootLines = [
      { text: 'INITIATING KERNEL...', delay: 100 },
      { text: 'MOUNTING /dev/void...', delay: 300 },
      { text: 'MEMORY CHECK: 16384PB OK', delay: 500 },
      { text: 'WARNING: Unstable data fragments detected in memory.', delay: 800 },
      { text: 'LOADING VOID_ARCHIVE.DLL...', delay: 1200 },
      { text: 'SYSTEM READY. Type "help" for a list of commands.', delay: 1500 },
    ];
    // FIX: Using an array to hold all timeout IDs to prevent memory leaks on unmount.
    // Also fixes the NodeJS type error by using the correct return type for setTimeout in the browser environment.
    const timeoutIds: ReturnType<typeof setTimeout>[] = [];
    bootLines.forEach((line, index) => {
      const timeoutId = setTimeout(() => {
        addLine(line.text, 'system');
        if (index === bootLines.length - 1) {
          setGameState('IDLE');
        }
      }, line.delay);
      timeoutIds.push(timeoutId);
    });
    return () => {
      timeoutIds.forEach(clearTimeout);
    };
  }, []);

  useEffect(() => {
    // PURGE TIMER
    if (gameState === 'PURGING') {
      const interval = setInterval(() => {
        setTimer(prev => {
          if (prev <= 1) {
            clearInterval(interval);
            setGameState('FAILURE');
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
      return () => clearInterval(interval);
    }
  }, [gameState]);

  useEffect(() => {
    // Automatically scroll to the bottom and focus input
    terminalEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    if (inputRef.current && (gameState === 'IDLE' || gameState === 'PURGING')) {
      inputRef.current.focus();
    }
  }, [lines, gameState]);


  // --- COMMAND HANDLING ---
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    if (gameState === 'PURGING') {
        setInputValue(value);
        if (value === purgeSequence) {
            setGameState('SUCCESS');
        }
    } else {
        setInputValue(value);
    }
  };

  const handleCommandSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputValue.trim()) return;

    addLine(`> ${inputValue}`, 'input');
    const command = inputValue.trim().toLowerCase().split(' ')[0];
    const args = inputValue.trim().toLowerCase().split(' ').slice(1);

    switch (command) {
      case 'scan':
        setGameState('SCANNING');
        const randomEcho = ECHO_FRAGMENTS[Math.floor(Math.random() * ECHO_FRAGMENTS.length)];
        setCurrentEcho(randomEcho);
        setTimeout(() => addLine('Scanning memory sectors for anomalies...', 'system'), 300);
        setTimeout(() => addLine('[ANOMALY DETECTED]', 'error'), 1200);
        setTimeout(() => {
          addLine(`Corrupted file found: ECHO_${randomEcho.id}.dat`, 'system');
          addLine(`Type "analyze ${randomEcho.id}" to proceed.`, 'system');
          setGameState('IDLE');
        }, 1500);
        break;

      case 'analyze':
        if (currentEcho && args[0] && args[0].toUpperCase() === currentEcho.id) {
          setGameState('ANALYZING');
          addLine(`ANALYZING: ECHO_${currentEcho.id}.dat`, 'system');
          setTimeout(() => {
            addLine(`DATA FRAGMENT: "${currentEcho.text}"`, 'output');
            addLine('Memory corruption is severe. Purge sequence required.', 'system');
            addLine('Type "purge" to initiate containment.', 'system');
            setGameState('IDLE');
          }, 800);
        } else {
          addLine('ERROR: No target specified or target invalid. Use "scan" first.', 'error');
        }
        break;

      case 'purge':
        if (currentEcho) {
          const sequence = generatePurgeSequence(20 + echoesPurged * 2);
          setPurgeSequence(sequence);
          setTimer(PURGE_TIME_LIMIT);
          setGameState('PURGING');
        } else {
          addLine('ERROR: No anomaly analyzed. Use "scan" and "analyze" first.', 'error');
        }
        break;

      case 'help':
        addLine('Available commands:', 'system');
        addLine('  scan   - Search for corrupted data fragments.', 'output');
        addLine('  analyze <ID> - Display data from a found fragment.', 'output');
        addLine('  purge  - Attempt to purge the analyzed fragment.', 'output');
        addLine('  status - Check system stability and progress.', 'output');
        addLine('  exit   - Disconnect from the terminal.', 'output');
        break;
        
      case 'status':
        addLine(`System Stability: ${((echoesPurged / TARGET_PURGES) * 100).toFixed(0)}%`, 'system');
        addLine(`Echoes Purged: ${echoesPurged} / ${TARGET_PURGES}`, 'output');
        break;

      case 'exit':
        setGameState('SHUTDOWN');
        addLine('Disconnecting from Void Echoes Terminal...', 'system');
        setTimeout(onExit, 1000);
        break;

      default:
        addLine(`ERROR: Command not recognized: "${command}"`, 'error');
    }
    setInputValue('');
  };
  
  // --- STATE-BASED UI RENDERING ---

  if (gameState === 'SUCCESS') {
    const newCount = echoesPurged + 1;
    setEchoesPurged(newCount);
    if (newCount >= TARGET_PURGES) {
        setGameState('VICTORY');
    } else {
        setGameState('IDLE');
        setLines(prev => [...prev, 
            { text: 'PURGE SEQUENCE ACCEPTED. ECHO ELIMINATED.', type: 'success' },
            { text: `System stability increased. ${TARGET_PURGES - newCount} echoes remaining.`, type: 'system' }
        ]);
    }
    setCurrentEcho(null);
    setInputValue('');
    setPurgeSequence('');
  }
  
  if (gameState === 'FAILURE') {
      setGameState('IDLE');
      setLines(prev => [...prev, 
          { text: 'SEQUENCE CORRUPTED. PURGE FAILED.', type: 'error' },
          { text: 'Re-analyzing anomaly... Type "purge" to try again.', type: 'system' }
      ]);
      setInputValue('');
      setPurgeSequence('');
  }
  
  if (gameState === 'VICTORY') {
      setLines(prev => [...prev,
          { text: 'ALL ECHOES PURGED. SYSTEM STABILITY AT 100%.', type: 'success' },
          { text: 'Void archive is clean. You may disconnect safely.', type: 'system' },
          { text: 'Type "exit" to disconnect.', type: 'system'}
      ]);
      setGameState('IDLE'); // Allow exit command
  }


  return (
    <div className="fixed inset-0 bg-void font-tech text-ash text-lg p-4 flex flex-col overflow-hidden" style={{ textShadow: '0 0 8px rgba(255, 42, 42, 0.3)' }}>
      {/* CRT Effects */}
      <div className="absolute inset-0 bg-[linear-gradient(to_bottom,rgba(0,0,0,0.5)_0%,transparent_50%,rgba(0,0,0,0.5)_100%)] pointer-events-none"></div>
      <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(255,255,255,0.05)_1px,transparent_1px)] bg-[size:3px_3px] pointer-events-none opacity-50"></div>
      <div className="absolute top-0 left-0 w-full h-full animate-scan opacity-20 bg-gradient-to-b from-neon-red/50 to-transparent pointer-events-none"></div>

      <header className="flex justify-between items-center border-b border-neon-red/20 pb-2 mb-4">
        <h1 className="font-display font-bold text-xl text-neon-red animate-pulse">VOID TERMINAL</h1>
        <div className="flex items-center gap-4">
            <span className="text-xs tracking-widest text-ash/50 hidden sm:inline">PURGED: {echoesPurged}/{TARGET_PURGES}</span>
            <SpookyButton variant="ghost" onClick={onExit} className="!px-4 !py-1 !text-xs !rounded-md">
                DISCONNECT
            </SpookyButton>
        </div>
      </header>

      <div className="flex-1 overflow-y-auto pr-2" id="terminal-output">
        {lines.map((line, index) => (
          <p key={index} className={`whitespace-pre-wrap break-words ${
            line.type === 'input' ? 'text-white' :
            line.type === 'output' ? 'text-ash/80' :
            line.type === 'system' ? 'text-neon-red/80' :
            line.type === 'error' ? 'text-neon-red animate-glitch' :
            line.type === 'success' ? 'text-cyan-400' : ''
          }`}>
            {line.text}
          </p>
        ))}
        
        {gameState === 'PURGING' && (
            <div className="my-4 p-4 border border-neon-red/50 bg-neon-red/10">
                <p className="text-neon-red animate-pulse text-center tracking-widest mb-2">!! CONTAINMENT BREACH IMMINENT !!</p>
                <p className="text-center">TYPE THE SEQUENCE EXACTLY AS SHOWN. TIME REMAINING: {timer}s</p>
                <p className="text-2xl text-center font-bold tracking-wider my-2 select-none text-white">{purgeSequence}</p>
                 <div className="w-full bg-white/10 h-1 mt-2">
                    <div className="h-full bg-neon-red transition-all duration-1000 linear" style={{ width: `${(timer / PURGE_TIME_LIMIT) * 100}%` }}></div>
                </div>
            </div>
        )}

        <div ref={terminalEndRef} />
      </div>

      <form onSubmit={handleCommandSubmit} className="mt-2">
        <div className="flex items-center">
          <span className="text-neon-red mr-2">&gt;</span>
          <input
            ref={inputRef}
            type="text"
            value={inputValue}
            onChange={handleInputChange}
            disabled={gameState !== 'IDLE' && gameState !== 'PURGING'}
            className="flex-1 bg-transparent border-none outline-none text-white w-full"
            autoComplete="off"
            spellCheck="false"
          />
          { (gameState === 'IDLE' || gameState === 'PURGING') && 
            <span className="w-2 h-5 bg-neon-red animate-pulse-fast ml-1"></span>
          }
        </div>
      </form>
    </div>
  );
};
