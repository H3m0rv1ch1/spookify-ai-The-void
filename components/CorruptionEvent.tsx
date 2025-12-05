
import React, { useEffect, useState, useRef } from 'react';
import { SpookyButton } from './SpookyButton';
import { MENTOR_ICON } from '../constants';

interface CorruptionEventProps {
  onFix: () => void;
}

type Phase = '404' | 'CRASH' | 'ALERT';

const BOOT_LOGS = [
  "","","","","","","","","","","","","","","","","","","","","","","","",
  "╔═══════════════════════════════════════════════════════════════════╗",
  "║  ███████╗██████╗  ██████╗  ██████╗ ██╗  ██╗██╗███████╗██╗   ██╗   ║",
  "║  ██╔════╝██╔══██╗██╔═══██╗██╔═══██╗██║ ██╔╝██║██╔════╝╚██╗ ██╔╝   ║",
  "║  ███████╗██████╔╝██║   ██║██║   ██║█████╔╝ ██║█████╗   ╚████╔╝    ║",
  "║  ╚════██║██╔═══╝ ██║   ██║██║   ██║██╔═██╗ ██║██╔══╝    ╚██╔╝     ║",
  "║  ███████║██║     ╚██████╔╝╚██████╔╝██║  ██╗██║██║        ██║      ║",
  "║  ╚══════╝╚═╝      ╚═════╝  ╚═════╝ ╚═╝  ╚═╝╚═╝╚═╝        ╚═╝      ║",
  "║                                                                   ║",
  "║              OS v6.6.6 (GNU/Linux) - VOID EDITION                 ║",
  "╚═══════════════════════════════════════════════════════════════════╝",
  "",
  "[    0.000000] Linux version 6.6.6-void (root@hell) (gcc version 13.2.0)",
  "[    0.000213] Command line: BOOT_IMAGE=/boot/vmlinuz-void root=UUID=666 ro quiet splash",
  "[    0.001452] KERNEL supported cpus:",
  "[    0.001454]   Intel GenuineVoid",
  "[    0.001455]   AMD ShadowRyzen",
  "[    0.002101] BIOS detected: S.P.O.O.K.I.F.Y v2.0",
  "[    0.002234] DMI: SPOOKIFY VOID-SYSTEM/VOID-MAINBOARD, BIOS V6.66 10/31/2024",
  "[    0.002456] tsc: Detected 3600.000 MHz processor",
  "[    0.003001] total RAM covered: 16383M",
  "[    0.003334] Secure boot disabled",
  "[    0.123412] Zone ranges:",
  "[    0.123414]   DMA      [mem 0x0000000000001000-0x0000000000ffffff]",
  "[    0.123415]   DMA32    [mem 0x0000000001000000-0x00000000ffffffff]",
  "[    0.123416]   Normal   [mem 0x0000000100000000-0x000000041f7fffff]",
  "[    0.567890] Memory: 16252468K/16703488K available (16384K kernel code, 3452K rwdata)",
  "[    0.789123] Console: colour dummy device 80x25",
  "[    0.789234] printk: console [tty0] enabled",
  "[    0.890123] ACPI: Core revision 20231122",
  "[    0.901234] Calibrating delay loop.. 7200.00 BogoMIPS",
  "[    1.012345] LSM: initializing lsm=lockdown,capability,landlock,yama,apparmor",
  "[    1.234567] Spectre V1 : Mitigation: usercopy/swapgs barriers",
  "[    1.234678] Spectre V2 : Mitigation: Enhanced / Automatic IBRS",
  "[    1.345678] MDS: Mitigation: Clear CPU buffers",
  "[    1.456789] smpboot: Allowing 8 CPUs, 0 hotplug CPUs",
  "[    1.789012] ACPI: PM: (supports S0 S3 S4 S5)",
  "[    1.890123] ACPI: Using IOAPIC for interrupt routing",
  "[    2.012345] ACPI: Enabled 3 GPEs in block 00 to 1F",
  "[    2.567890] pci 0000:00:00.0: [8086:1234] type 00 class 0x060000",
  "[    2.678901] pci 0000:00:02.0: [8086:5912] type 00 class 0x030000",
  "[    3.456789] SCSI subsystem initialized",
  "[    3.678901] usbcore: registered new interface driver usbfs",
  "[    3.789012] usbcore: registered new interface driver hub",
  "[    4.456789] NetLabel:  protocols = UNLABELED CIPSOv4 CALIPSO",
  "[    4.567890] PCI: Using ACPI for IRQ routing",
  "[    5.456789] NET: Registered PF_INET protocol family",
  "[    5.789012] TCP established hash table entries: 131072",
  "[    6.012345] NTFS driver 2.1.32 [Flags: R/W MODULE]",
  "[    6.234567] Block layer SCSI generic (bsg) driver version 0.4 loaded",
  "[    7.012345] NET: Registered PF_INET6 protocol family",
  "[    7.345678] microcode: CPU0 sig=0x906ea, pf=0x20, revision=0xf0",
  "[    7.789012] Loading compiled-in X.509 certificates",
  "[    8.012345] PM: Magic number: 12:345:678",
  "[  OK  ] Started D-Bus System Message Bus.",
  "[  OK  ] Reached target Network.",
  "[  OK  ] Reached target Network is Online.",
  "[  OK  ] Reached target Multi-User System.",
  "[  OK  ] Reached target Graphical Interface.",
  "[  OK  ] Started Daemon for power management.",
  "[  OK  ] Started Load/Save Random Seed.",
  "[  OK  ] Started User Manager for UID 1000.",
  "[  OK  ] Started Spookify Neural Engine.",
  "[  OK  ] Started GNOME Display Manager.",
  "[FAILED] Failed to start Reality Anchor Service.",
  "[FAILED] Failed to load module: hope.ko.",
  "[FAILED] Failed to mount /dev/soul0: Device not found.",
  "[FAILED] Failed to start Sanity Check Service.",
  "[FAILED] Failed to start Consciousness Monitor.",
  "[    8.888888] VOID_SIGNAL: Connection established with unknown entity...",
  "[    8.912341] tcp_listen_port: binding to port 666 (Protocol: DARKNET)",
  "[    8.923456] WARNING: Unrecognized entity attempting handshake",
  "[    8.934567] ERROR: Cryptographic signature verification FAILED",
  "[    8.945678] ALERT: Unauthorized access to memory segment 0xDEADBEEF",
  "[    9.012345] BUG: unable to handle page fault for address: 0xffffffffc0666000",
  "[    9.123456] #PF: supervisor read access in kernel mode",
  "[    9.234567] #PF: error_code(0x0000) - not-present page",
  "[    9.345678] Oops: 0000 [#1] PREEMPT SMP NOPTI",
  "[    9.456789] CPU: 0 PID: 666 Comm: void_daemon Tainted: G W 6.6.6-void #1",
  "[    9.567890] Hardware name: SPOOKIFY/VOID-MAINBOARD, BIOS 6.66 10/31/2024",
  "[    9.678901] RIP: 0010:void_entry_point+0x12/0x40 [void_module]",
  "[    9.789012] Code: 48 8b 05 d1 e0 00 00 48 85 c0 74 1f 48 8b 40 28 48 85 c0 74 16",
  "[    9.890123] RSP: 0018:ffffd1a6c0e0e1a0 EFLAGS: 0x00010246",
  "[   10.012345] RAX: 0000000000000000 RBX: ffff8d5f40000000 RCX: 0000000000000000",
  "[   10.123456] RDX: 0000000000000001 RSI: 0000000000000200 RDI: ffff8d5f40000000",
  "[   10.234567] RBP: ffffd1a6c0e0e1b8 R08: 0000000000000000 R09: 0000000000000000",
  "[   10.345678] R10: 0000000000000000 R11: 0000000000000000 R12: 0000000000000000",
  "[   10.456789] R13: ffff8d5f40000000 R14: 0000000000000000 R15: 0000000000000000",
  "[   10.567890] FS:  00007f8a9c123740(0000) GS:ffff8d5f7fc00000(0000) knlGS:0000000000000000",
  "[   10.678901] CS:  0010 DS: 0000 ES: 0000 CR0: 0000000080050033",
  "[   10.789012] CR2: ffffffffc0666000 CR3: 000000010a234000 CR4: 00000000003506f0",
  "[   10.890123] Call Trace:",
  "[   10.901234]  <TASK>",
  "[   11.012345]  ? show_regs.cold+0x1a/0x1f",
  "[   11.123456]  ? __die_body+0x1d/0x60",
  "[   11.234567]  ? die+0x2e/0x50",
  "[   11.345678]  ? do_trap+0xca/0x110",
  "[   11.456789]  ? void_entry_point+0x12/0x40 [void_module]",
  "[   11.567890]  ? exc_invalid_op+0x4c/0x60",
  "[   11.678901]  ? asm_exc_invalid_op+0x16/0x20",
  "[   11.789012]  </TASK>",
  "[   11.890123] Modules linked in: void_module(OE) corruption_driver(OE) shadow_net(OE)",
  "[   11.901234] ---[ end trace 0000000000000666 ]---",
  "[   12.012345] KERNEL PANIC: VFS: Unable to mount root fs on unknown-block(0,0)",
  "[   12.123456] CRITICAL: REALITY_ANCHOR_LOST",
  "[   12.234567] EMERGENCY: System integrity compromised",
  "[   12.345678] Kernel panic - not syncing: Fatal exception in interrupt",
  "[   12.456789] Kernel Offset: 0x2e000000 from 0xffffffff81000000",
  "[   12.567890] ---[ end Kernel panic - not syncing: Fatal exception in interrupt ]---"
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
  const [phase, setPhase] = useState<Phase>('404');
  
  // Crash Phase State
  const [logs, setLogs] = useState<string[]>([]);
  const logContainerRef = useRef<HTMLDivElement>(null);

  // Alert Phase State
  const [text, setText] = useState('');
  const [showButton, setShowButton] = useState(false);
  const [glitchOffset, setGlitchOffset] = useState({ x: 0, y: 0 });
  const [isMounted, setIsMounted] = useState(false);
  const [showSecondMessage, setShowSecondMessage] = useState(false);
  
  const fullText = "ALERT: THE SYSTEM HAS BEEN HAUNTED BY A MALICIOUS ENTITY. YOU HAVE BEEN CHOSEN TO BANISH THIS THREAT. COMPLETE THE PURGE RITUAL AND YOU WILL BE REWARDED WITH FULL ACCESS TO CREATE YOUR TRANSFORMATION. ARE YOU READY TO FACE THE DARKNESS?";
  const secondMessage = "...STILL THERE? THE CORRUPTION GROWS STRONGER WITH EVERY SECOND. DON'T WORRY, I'VE SEEN WORSE. CLICK THE BUTTON WHEN YOU'RE READY... OR STAY FROZEN IN FEAR. YOUR CHOICE.";
  
  // --- 404 LOGIC ---
  // No automatic transition - user must click button

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
    }, 35); // Speed of scrolling text - balanced speed

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
        
        // Show second message 15 seconds after first message finishes
        setTimeout(() => {
            setShowSecondMessage(true);
            setText(''); // Clear the text first
            
            // Type out second message (replacing the first)
            let j = 0;
            const secondInterval = setInterval(() => {
                setText(secondMessage.slice(0, j + 1));
                j++;
                if (j >= secondMessage.length) {
                    clearInterval(secondInterval);
                }
            }, 35);
            
            // Speak the second message with same voice settings
            setTimeout(() => speak(secondMessage), 500);
        }, 15000);
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

    // Audio / Speech - Reusable function with consistent voice
    const speak = (textToSpeak: string) => {
        if ('speechSynthesis' in window) {
            window.speechSynthesis.cancel();
            
            const doSpeak = () => {
                const utterance = new SpeechSynthesisUtterance(textToSpeak.toLowerCase());
                utterance.pitch = 0.1; 
                utterance.rate = 0.8;
                utterance.volume = 1;
                
                const voices = window.speechSynthesis.getVoices();
                // Try to find a male/deep voice consistently
                const robotVoice = voices.find(v => 
                    v.name.toLowerCase().includes('male') || 
                    v.name.toLowerCase().includes('david') ||
                    v.name.toLowerCase().includes('google us english')
                ) || voices[0]; // Fallback to first voice
                
                if (robotVoice) utterance.voice = robotVoice;
                
                window.speechSynthesis.speak(utterance);
            };
            
            // Ensure voices are loaded
            if (window.speechSynthesis.getVoices().length > 0) {
                doSpeak();
            } else {
                window.speechSynthesis.onvoiceschanged = () => {
                    doSpeak();
                };
            }
        }
    };

    const speechTimer = setTimeout(() => speak(fullText), 500);

    return () => {
        window.speechSynthesis.cancel();
        clearInterval(interval);
        clearInterval(glitchInterval);
        clearTimeout(mountTimer);
        clearTimeout(speechTimer);
    };
  }, [phase]);

  // RENDER 404 PHASE
  if (phase === '404') {
      return (
          <div className="fixed inset-0 z-[100] bg-void font-tech text-ash flex flex-col items-center justify-center p-4 overflow-hidden">
              
              {/* Background Marquee - Static, no animation */}
              <div className="absolute top-1/2 -translate-y-1/2 w-full opacity-5 pointer-events-none select-none overflow-hidden">
                 <div className="whitespace-nowrap font-display font-black text-[20vw] leading-none text-neon-red">
                    ERROR 404 // SIGNAL LOST // VOID DETECTED // ERROR 404 // 
                 </div>
              </div>
              
              {/* CRT Effects & Grid - Fade in */}
              <div className="absolute inset-0 bg-grid opacity-[0.08] pointer-events-none animate-[fadeIn_0.5s_ease-out]"></div>
              <div className="absolute inset-0 bg-[linear-gradient(to_bottom,rgba(0,0,0,0.5)_0%,transparent_50%,rgba(0,0,0,0.5)_100%)] pointer-events-none animate-[fadeIn_0.5s_ease-out]"></div>
              
              {/* Radial gradient glow - Fade in */}
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(255,42,42,0.1)_0%,transparent_70%)] pointer-events-none animate-[fadeIn_0.6s_ease-out]"></div>
              
              {/* HUD Header - Slide down */}
              <header className="absolute top-0 left-0 right-0 p-4 flex justify-between items-center bg-black/30 border-b border-neon-red/20 backdrop-blur-sm z-10 animate-[slideDown_0.4s_ease-out]">
                  <div className="font-display font-bold text-lg">
                      SPOOKIFY<span className="text-neon-red">.AI</span> <span className="text-white/30 font-tech text-sm">// SYSTEM ERROR</span>
                  </div>
                  
                  <div className="font-tech text-xs uppercase tracking-widest text-center hidden md:block pointer-events-none">
                      <span className="text-neon-red">[ERROR 404]</span>
                      <span className="text-ash/50 mx-2">::</span>
                      <span className="text-ash/80">STATUS: <span className="text-white font-bold">NOT FOUND</span></span>
                  </div>
              </header>

              <div className="w-full h-full flex items-center justify-center">
                  <div className="text-center flex flex-col items-center gap-8">
                      {/* 404 - Scale up with glow */}
                      <h2 className="font-display font-extrabold text-6xl sm:text-8xl md:text-[8rem] lg:text-[10rem] text-neon-red leading-[0.9] tracking-tighter drop-shadow-[0_0_40px_rgba(255,42,42,0.6)] animate-[scaleIn_0.5s_ease-out]">404</h2>
                      
                      {/* Description - Slide up and fade in */}
                      <div className="max-w-3xl mx-auto mb-8 relative group text-center px-8 animate-[slideUp_0.5s_ease-out_0.2s_both]">
                           {/* Decorative lines around text */}
                           <div className="absolute -left-6 top-0 bottom-0 w-[1px] bg-gradient-to-b from-transparent via-white/10 to-transparent group-hover:via-neon-red/50 transition-all duration-500 hidden md:block"></div>
                           <div className="absolute -right-6 top-0 bottom-0 w-[1px] bg-gradient-to-b from-transparent via-white/10 to-transparent group-hover:via-neon-red/50 transition-all duration-500 hidden md:block"></div>
                           
                           <div className="flex flex-col gap-6">
                              <p className="font-tech text-neon-red text-[10px] tracking-[0.4em] uppercase opacity-70 animate-pulse">
                                // System Status: Connection Lost
                              </p>
                              
                              <p className="font-display text-ash/90 text-xl md:text-2xl leading-relaxed tracking-wide text-shimmer">
                                SIGNAL LOST. The requested interface node could not be located in the neural matrix. 
                                Reality anchor <span className="text-white italic bg-white/5 px-2">disconnected</span>.
                              </p>
                              
                              <div className="flex flex-wrap items-center justify-center gap-4 pt-4 border-t border-white/5 mt-2">
                                <span className="font-tech text-ash/40 text-[10px] md:text-xs tracking-[0.2em] uppercase">Error Code: 404</span>
                                <span className="w-1 h-1 bg-neon-red rounded-full hidden sm:block"></span>
                                <span className="font-tech text-ash/40 text-[10px] md:text-xs tracking-[0.2em] uppercase">Node Not Found</span>
                                <span className="w-1 h-1 bg-neon-red rounded-full hidden sm:block"></span>
                                <span className="font-tech text-ash/40 text-[10px] md:text-xs tracking-[0.2em] uppercase">Reboot Required</span>
                              </div>
                           </div>
                        </div>
                      
                      {/* Reboot Button - Fade in and scale */}
                      <div className="shadow-[0_0_50px_rgba(255,42,42,0.2)] animate-[scaleIn_0.4s_ease-out_0.4s_both]">
                          <SpookyButton 
                              variant="ritual" 
                              onClick={() => setPhase('CRASH')} 
                              className="text-lg"
                          >
                              ATTEMPT SYSTEM REBOOT
                          </SpookyButton>
                      </div>
                  </div>
              </div>
          </div>
      );
  }

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
        <div className={`relative z-20 flex flex-col items-center text-center max-w-5xl w-full transition-all duration-1000 ease-out transform scale-[0.85] ${isMounted ? 'translate-y-0 opacity-100 blur-0' : 'translate-y-8 opacity-0 blur-sm'}`}>
            
            <div className="inline-flex items-center gap-3 px-4 py-2 rounded-full border border-neon-red/30 bg-neon-red/5 backdrop-blur-md mb-8 md:mb-12 animate-pulse">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-neon-red opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-neon-red"></span>
                </span>
                <span className="font-tech text-xs font-bold tracking-[0.2em] text-neon-red uppercase">
                    SYSTEM OVERRIDE // EVENT ID: 666
                </span>
            </div>

            <div className="relative w-48 h-48 md:w-48 md:h-48 mb-8 md:mb-10 group grid place-items-center">
                <div className="absolute inset-0 border border-neon-red/30 rounded-full animate-spin-slow group-hover:border-neon-red/60 transition-colors"></div>
                <div className="absolute inset-2 border border-neon-red/20 rounded-full animate-spin" style={{ animationDirection: 'reverse', animationDuration: '4s' }}></div>
                
                <div className="absolute inset-0 flex items-center justify-center">
                    <div className="w-40 h-40 md:w-40 md:h-40 bg-neon-red rounded-full blur-2xl animate-pulse opacity-30 absolute"></div>
                    
                     <div className="w-40 h-40 md:w-40 md:h-40 border border-neon-red rounded-full grid place-items-center bg-black/80 relative overflow-hidden shadow-[0_0_15px_rgba(255,42,42,0.3)] p-1">
                          
                          <img src={MENTOR_ICON} alt="The Mentor" className="w-[150%] h-[150%] object-contain relative z-10 drop-shadow-[0_0_10px_rgba(255,42,42,0.5)]" />
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

