import React, { useState, useRef, useEffect } from 'react';
import { COSTUME_STYLES, CATEGORY_ICONS } from './constants';
import { CostumeStyle, AppState } from './types';
import { generateSpookyImage } from './services/openRouterService';
import { SpookyButton } from './components/SpookyButton';
import { GeneratingView } from './components/GeneratingView';
import { SignalCorruptionGame } from './components/SignalCorruptionGame';
import { CorruptionEvent } from './components/CorruptionEvent';

const App: React.FC = () => {
  const [appState, setAppState] = useState<AppState>(() => {
    // Initialize from URL if present
    const path = window.location.pathname.replace('/', '');
    switch (path) {
      case 'upload': return AppState.IDLE;
      case 'select-style': return AppState.SELECTING;
      case 'customize': return AppState.UPLOADING;
      case 'corruption': return AppState.CORRUPTION;
      case 'minigame': return AppState.GAME;
      case 'generating': return AppState.GENERATING;
      case 'result': return AppState.RESULT;
      default: return AppState.IDLE;
    }
  });
  const [selectedStyle, setSelectedStyle] = useState<CostumeStyle | null>(null);
  const [originalImage, setOriginalImage] = useState<string | null>(null);
  const [generatedImage, setGeneratedImage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  
  // Game/Corruption State
  const [hasPurged, setHasPurged] = useState(() => {
    const saved = localStorage.getItem('spookify_hasPurged');
    return saved === 'true';
  });
  const [credits, setCredits] = useState(() => {
    const saved = localStorage.getItem('spookify_credits');
    return saved ? parseInt(saved, 10) : 0;
  });
  
  // Custom Style State
  const [showCustomModal, setShowCustomModal] = useState(false);
  const [customPrompt, setCustomPrompt] = useState('');
  
  // New state for category selection
  const [selectionCategory, setSelectionCategory] = useState<'original' | 'supernatural' | 'game' | 'movie' | null>(null);

  // Fullscreen Preview State
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [zoom, setZoom] = useState(1);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [isPanning, setIsPanning] = useState(false);
  const panStartRef = useRef({ startX: 0, startY: 0, startPanX: 0, startPanY: 0 });

  // Mouse Tracking for "Void Core" effect
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const containerRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Comparison Slider
  const [sliderPosition, setSliderPosition] = useState(50);
  const sliderRef = useRef<HTMLDivElement>(null);

  // Update URL based on app state
  useEffect(() => {
    const stateToPath: Partial<Record<AppState, string>> = {
      [AppState.IDLE]: '/upload',
      [AppState.SELECTING]: '/select-style',
      [AppState.UPLOADING]: '/customize',
      [AppState.CORRUPTION]: '/corruption',
      [AppState.GAME]: '/minigame',
      [AppState.GENERATING]: '/generating',
      [AppState.RESULT]: '/result',
      [AppState.ERROR]: '/error',
    };
    
    const newPath = stateToPath[appState] || '/';
    if (window.location.pathname !== newPath) {
      window.history.pushState({}, '', newPath);
    }
  }, [appState]);

  // Persist credits and hasPurged to localStorage
  useEffect(() => {
    localStorage.setItem('spookify_credits', credits.toString());
  }, [credits]);

  useEffect(() => {
    localStorage.setItem('spookify_hasPurged', hasPurged.toString());
  }, [hasPurged]);

  useEffect(() => {
    // Initial center position
    setMousePos({ x: window.innerWidth / 2, y: window.innerHeight / 2 });

    const handleMouseMove = (e: MouseEvent) => {
      // Direct mapping for that "instant" digital feel
      setMousePos({ x: e.clientX, y: e.clientY });
    };
    
    // Only track mouse on non-touch devices to save performance
    if (window.matchMedia("(pointer: fine)").matches) {
       window.addEventListener('mousemove', handleMouseMove);
    }
    
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  const handleSliderDrag = (e: React.MouseEvent | React.TouchEvent) => {
    if (sliderRef.current) {
      const rect = sliderRef.current.getBoundingClientRect();
      const clientX = 'touches' in e ? e.touches[0].clientX : (e as React.MouseEvent).clientX;
      const x = Math.max(0, Math.min(clientX - rect.left, rect.width));
      const percentage = (x / rect.width) * 100;
      setSliderPosition(percentage);
    }
  };

  const handleStyleSelect = (style: CostumeStyle) => {
    if (style.id === 'custom') {
      setShowCustomModal(true);
      return;
    }
    setSelectedStyle(style);
    setAppState(AppState.UPLOADING);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleCustomSubmit = () => {
    if (!customPrompt.trim()) return;

    const baseCustomStyle = COSTUME_STYLES.find(s => s.id === 'custom');
    if (baseCustomStyle) {
      const customStyle = {
        ...baseCustomStyle,
        promptModifier: `Create a custom Halloween costume based on: ${customPrompt}. Apply makeup and costuming effects.`
      };
      setSelectedStyle(customStyle);
      setAppState(AppState.UPLOADING);
      setShowCustomModal(false);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      if (!file.type.startsWith('image/')) {
        setError('INVALID DATA TYPE. IMAGE REQUIRED.');
        return;
      }
      const reader = new FileReader();
      reader.onload = (event) => {
        if (event.target && typeof event.target.result === 'string') {
          setOriginalImage(event.target.result);
          setError(null);
        }
      };
      reader.onerror = () => setError('UPLOAD STREAM CORRUPTED.');
      reader.readAsDataURL(file);
      e.target.value = '';
    }
  };

  const handleGenerate = async () => {
    console.log('Execute Ritual clicked!', { originalImage: !!originalImage, selectedStyle: !!selectedStyle, hasPurged, credits });
    
    if (!originalImage || !selectedStyle) {
      console.log('Missing image or style');
      return;
    }

    // --- CORRUPTION EVENT TRIGGER ---
    // If the user hasn't purged the system yet, hijack the process
    if (!hasPurged) {
      console.log('Triggering corruption event');
      setAppState(AppState.CORRUPTION);
      return;
    }

    // --- CREDIT CHECK ---
    // Check if user is a judge (unlimited credits)
    const isJudge = localStorage.getItem('spookify_isJudge') === 'true';
    
    // User must have at least 1 credit to generate an image (unless they're a judge)
    if (!isJudge && credits <= 0) {
      setError("INSUFFICIENT CREDITS. COMPLETE MINIGAMES TO EARN CREDITS.");
      return;
    }

    setAppState(AppState.GENERATING);
    setError(null);
    try {
      const result = await generateSpookyImage(originalImage, selectedStyle.promptModifier);
      setGeneratedImage(result);
      // Deduct 1 credit after successful generation (unless they're a judge)
      if (!isJudge) {
        setCredits(prev => prev - 1);
      }
      setAppState(AppState.RESULT);
    } catch (err: any) {
      console.error(err);
      setError("AI MODEL CONNECTION FAILED. RETRY.");
      setAppState(AppState.UPLOADING);
    }
  };
  
  const handleGameVictory = () => {
      setHasPurged(true);
      setAppState(AppState.IDLE); // Go back to home page instead of style selection
      setSuccessMessage("SYSTEM RESTORED. SIGNAL PURGED.");
      // Clear success message after a few seconds
      setTimeout(() => setSuccessMessage(null), 5000);
  };
  
  const resetZoomAndPan = () => {
    setZoom(1);
    setPan({ x: 0, y: 0 });
  };
  
  const handleReset = () => {
    setAppState(AppState.IDLE);
    setSelectedStyle(null);
    setOriginalImage(null);
    setGeneratedImage(null);
    setError(null);
    setSuccessMessage(null);
    setSliderPosition(50);
    setIsFullscreen(false);
    resetZoomAndPan();
    setShowCustomModal(false);
    setCustomPrompt('');
    setSelectionCategory(null);
    // Note: We do NOT reset hasPurged, so they don't have to play the game every single time they reset.
    // If you want them to play every time, uncomment the line below:
    // setHasPurged(false); 
  };

  // --- FULLSCREEN MODAL HANDLERS ---
  
  const handleWheelZoom = (e: React.WheelEvent) => {
    e.preventDefault();
    const zoomSpeed = 1.1; // Multiplicative factor for smoother feel
    const oldZoom = zoom;
    // Zoom in on scroll up (deltaY < 0), zoom out on scroll down (deltaY > 0)
    let newZoom = e.deltaY < 0 ? oldZoom * zoomSpeed : oldZoom / zoomSpeed;
    newZoom = Math.max(1, Math.min(newZoom, 10)); // Clamp zoom between 100% and 1000%
    
    setZoom(newZoom);
    
    if (newZoom <= 1) {
        setPan({ x: 0, y: 0 });
    }
  };

  const handlePanStart = (e: React.MouseEvent) => {
    if (zoom <= 1) return;
    e.preventDefault();
    e.stopPropagation();
    setIsPanning(true);
    panStartRef.current = {
        startX: e.clientX,
        startY: e.clientY,
        startPanX: pan.x,
        startPanY: pan.y,
    };
  };

  const handlePanMove = (e: React.MouseEvent) => {
    if (!isPanning || zoom <= 1) return;
    e.preventDefault();
    const dx = e.clientX - panStartRef.current.startX;
    const dy = e.clientY - panStartRef.current.startY;
    
    setPan({
        x: panStartRef.current.startPanX + (dx / zoom),
        y: panStartRef.current.startPanY + (dy / zoom),
    });
  };

  const handlePanEnd = () => {
    setIsPanning(false);
  };

  const closeFullscreen = () => {
    setIsFullscreen(false);
    setTimeout(() => {
        resetZoomAndPan();
    }, 300); // Match transition duration
  };

  // --- RENDER SECTIONS ---

  const renderHero = () => (
    <div className="relative min-h-screen flex flex-col justify-center items-center overflow-hidden">
      
      {/* Background Marquee */}
      <div className="absolute top-1/2 -translate-y-1/2 w-full opacity-5 pointer-events-none select-none overflow-hidden">
         <div className="whitespace-nowrap font-display font-black text-[20vw] leading-none animate-marquee text-white">
            TRANSFORM YOUR REALITY // ENTER THE VOID // SPOOKIFY AI // 
         </div>
      </div>

      <div className="z-10 text-center px-6 relative flex flex-col items-center">
        
        {/* NEW PILL DESIGN */}
        <div className="inline-flex items-center gap-3 px-4 py-2 rounded-full border border-neon-red/30 bg-neon-red/5 backdrop-blur-md mb-8 hover:bg-neon-red/10 transition-colors duration-300 group cursor-default">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-neon-red opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-neon-red"></span>
          </span>
          <span className="font-tech text-xs font-bold tracking-[0.2em] text-neon-red uppercase group-hover:text-white transition-colors">
            AI Costume Generator v2.0
          </span>
        </div>

        <h1 className="font-display font-extrabold text-4xl xs:text-5xl sm:text-6xl md:text-[8rem] lg:text-[10rem] leading-[0.9] tracking-tighter text-white mix-blend-difference mb-6 md:mb-8">
          SPOOK<span className="text-transparent text-outline hover:text-white transition-colors duration-500 cursor-none">IFY</span>
        </h1>

        <div className="max-w-3xl mx-auto mb-8 md:mb-16 relative group text-center px-4 md:px-8">
           {/* Decorative lines around text */}
           <div className="absolute -left-6 top-0 bottom-0 w-[1px] bg-gradient-to-b from-transparent via-white/10 to-transparent group-hover:via-neon-red/50 transition-all duration-500 hidden md:block"></div>
           <div className="absolute -right-6 top-0 bottom-0 w-[1px] bg-gradient-to-b from-transparent via-white/10 to-transparent group-hover:via-neon-red/50 transition-all duration-500 hidden md:block"></div>
           
           <div className="flex flex-col gap-6">
              <p className="font-tech text-neon-red text-[10px] tracking-[0.4em] uppercase opacity-70 animate-pulse">
                // System Status: Awaiting Bio-Data
              </p>
              
              <p className="font-display text-ash/90 text-base sm:text-lg md:text-xl lg:text-2xl leading-relaxed tracking-wide text-shimmer">
                Unlock the dark potential of your digital twin. 
                Our neural engines are primed to deconstruct your reality and 
                reforge it into a <span className="text-white italic bg-white/5 px-2">cinematic nightmare</span>.
              </p>
              
              <div className="flex flex-wrap items-center justify-center gap-4 pt-4 border-t border-white/5 mt-2">
                <span className="font-tech text-ash/40 text-[9px] xs:text-[10px] md:text-xs tracking-[0.2em] uppercase">Upload Image</span>
                <span className="w-1 h-1 bg-neon-red rounded-full hidden sm:block"></span>
                <span className="font-tech text-ash/40 text-[9px] xs:text-[10px] md:text-xs tracking-[0.2em] uppercase">Choose Style</span>
                <span className="w-1 h-1 bg-neon-red rounded-full hidden sm:block"></span>
                <span className="font-tech text-ash/40 text-[9px] xs:text-[10px] md:text-xs tracking-[0.2em] uppercase">Enter The Void</span>
              </div>
           </div>
        </div>

        <SpookyButton variant="ritual" onClick={() => setAppState(AppState.SELECTING)} className="text-sm md:text-lg shadow-[0_0_50px_rgba(255,42,42,0.2)] px-6 md:px-10 py-3 md:py-5">
            INITIALIZE RITUAL
        </SpookyButton>
      </div>
    </div>
  );

  const renderCategorySelector = () => (
    <div className="min-h-screen py-24 md:py-32 px-4 md:px-6 max-w-5xl mx-auto">
      <header className="mb-12 md:mb-16 text-center">
        <h2 className="font-display font-bold text-4xl md:text-6xl text-white mb-2">CHOOSE YOUR VESSEL</h2>
        <p className="font-tech text-ash/50 text-xs md:text-sm tracking-widest">SELECT A REALM OF TRANSFORMATION</p>
      </header>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Original Nightmares Card */}
        <div 
          onClick={() => setSelectionCategory('original')}
          className="group relative h-[450px] bg-black border border-white/10 p-8 flex flex-col justify-between cursor-pointer overflow-hidden hover:border-neon-red transition-all duration-300 hover:shadow-[0_0_40px_rgba(255,42,42,0.2)]"
          style={{ backgroundImage: 'radial-gradient(circle at 100% 100%, rgba(255,42,42,0.1), transparent 40%)' }}
        >
          <div className="absolute inset-0 bg-grid opacity-[0.05] group-hover:opacity-[0.1] transition-opacity duration-300"></div>
          
          {/* Top: Category Label */}
          <div className="relative z-10">
            <span className="font-tech text-xs text-ash/40 tracking-[0.3em] uppercase group-hover:text-neon-red transition-colors">Category I</span>
          </div>
          
          {/* Center: Large Icon */}
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <div className="relative w-48 h-48 md:w-64 md:h-64 opacity-20 group-hover:opacity-40 group-hover:scale-110 transition-all duration-500 ease-out">
              <img src={CATEGORY_ICONS.nightmares} alt="Original Nightmares" className="w-full h-full object-contain" />
              
              {/* Corner Brackets - Only visible on hover */}
              <div className="absolute top-0 left-0 w-6 h-6 border-t-2 border-l-2 border-neon-red opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              <div className="absolute top-0 right-0 w-6 h-6 border-t-2 border-r-2 border-neon-red opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              <div className="absolute bottom-0 left-0 w-6 h-6 border-b-2 border-l-2 border-neon-red opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              <div className="absolute bottom-0 right-0 w-6 h-6 border-b-2 border-r-2 border-neon-red opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
            </div>
          </div>
          
          {/* Bottom: Title & Description */}
          <div className="relative z-10">
            <h3 className="font-display font-bold text-3xl md:text-4xl text-white mb-2">Original Nightmares</h3>
            <p className="font-tech text-sm text-ash/60 leading-relaxed max-w-sm">Classic horrors from folklore and shadow.</p>
          </div>
        </div>
        {/* Supernatural Card */}
        <div 
          onClick={() => setSelectionCategory('supernatural')}
          className="group relative h-[450px] bg-black border border-white/10 p-8 flex flex-col justify-between cursor-pointer overflow-hidden hover:border-neon-red transition-all duration-300 hover:shadow-[0_0_40px_rgba(255,42,42,0.2)]"
           style={{ backgroundImage: 'radial-gradient(circle at 100% 100%, rgba(255,42,42,0.1), transparent 40%)' }}
        >
          <div className="absolute inset-0 bg-grid opacity-[0.05] group-hover:opacity-[0.1] transition-opacity duration-300"></div>
          
          {/* Top: Category Label */}
          <div className="relative z-10">
            <span className="font-tech text-xs text-ash/40 tracking-[0.3em] uppercase group-hover:text-neon-red transition-colors">Category II</span>
          </div>
          
          {/* Center: Large Icon */}
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <div className="relative w-48 h-48 md:w-64 md:h-64 opacity-20 group-hover:opacity-40 group-hover:scale-110 transition-all duration-500 ease-out">
              <img src={CATEGORY_ICONS.supernatural} alt="Supernatural" className="w-full h-full object-contain" />
              
              {/* Corner Brackets - Only visible on hover */}
              <div className="absolute top-0 left-0 w-6 h-6 border-t-2 border-l-2 border-neon-red opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              <div className="absolute top-0 right-0 w-6 h-6 border-t-2 border-r-2 border-neon-red opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              <div className="absolute bottom-0 left-0 w-6 h-6 border-b-2 border-l-2 border-neon-red opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              <div className="absolute bottom-0 right-0 w-6 h-6 border-b-2 border-r-2 border-neon-red opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
            </div>
          </div>
          
          {/* Bottom: Title & Description */}
          <div className="relative z-10">
            <h3 className="font-display font-bold text-3xl md:text-4xl text-white mb-2">Supernatural</h3>
            <p className="font-tech text-sm text-ash/60 leading-relaxed max-w-sm">Characters from the iconic TV series.</p>
          </div>
        </div>
        {/* Video Game Legends Card */}
        <div 
          onClick={() => setSelectionCategory('game')}
          className="group relative h-[450px] bg-black border border-white/10 p-8 flex flex-col justify-between cursor-pointer overflow-hidden hover:border-neon-red transition-all duration-300 hover:shadow-[0_0_40px_rgba(255,42,42,0.2)]"
           style={{ backgroundImage: 'radial-gradient(circle at 100% 100%, rgba(255,42,42,0.1), transparent 40%)' }}
        >
          <div className="absolute inset-0 bg-grid opacity-[0.05] group-hover:opacity-[0.1] transition-opacity duration-300"></div>
          
          {/* Top: Category Label */}
          <div className="relative z-10">
            <span className="font-tech text-xs text-ash/40 tracking-[0.3em] uppercase group-hover:text-neon-red transition-colors">Category III</span>
          </div>
          
          {/* Center: Large Icon */}
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <div className="relative w-48 h-48 md:w-64 md:h-64 opacity-20 group-hover:opacity-40 group-hover:scale-110 transition-all duration-500 ease-out">
              <img src={CATEGORY_ICONS.game} alt="Video Game Legends" className="w-full h-full object-contain" />
              
              {/* Corner Brackets - Only visible on hover */}
              <div className="absolute top-0 left-0 w-6 h-6 border-t-2 border-l-2 border-neon-red opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              <div className="absolute top-0 right-0 w-6 h-6 border-t-2 border-r-2 border-neon-red opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              <div className="absolute bottom-0 left-0 w-6 h-6 border-b-2 border-l-2 border-neon-red opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              <div className="absolute bottom-0 right-0 w-6 h-6 border-b-2 border-r-2 border-neon-red opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
            </div>
          </div>
          
          {/* Bottom: Title & Description */}
          <div className="relative z-10">
            <h3 className="font-display font-bold text-3xl md:text-4xl text-white mb-2 whitespace-nowrap">Game Legends</h3>
            <p className="font-tech text-sm text-ash/60 leading-relaxed max-w-sm">Iconic heroes and villains from games.</p>
          </div>
        </div>
        {/* Movie Maniacs Card */}
        <div 
          onClick={() => setSelectionCategory('movie')}
          className="group relative h-[450px] bg-black border border-white/10 p-8 flex flex-col justify-between cursor-pointer overflow-hidden hover:border-neon-red transition-all duration-300 hover:shadow-[0_0_40px_rgba(255,42,42,0.2)]"
           style={{ backgroundImage: 'radial-gradient(circle at 100% 100%, rgba(255,42,42,0.1), transparent 40%)' }}
        >
          <div className="absolute inset-0 bg-grid opacity-[0.05] group-hover:opacity-[0.1] transition-opacity duration-300"></div>
          
          {/* Top: Category Label */}
          <div className="relative z-10">
            <span className="font-tech text-xs text-ash/40 tracking-[0.3em] uppercase group-hover:text-neon-red transition-colors">Category IV</span>
          </div>
          
          {/* Center: Large Icon */}
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <div className="relative w-48 h-48 md:w-64 md:h-64 opacity-20 group-hover:opacity-40 group-hover:scale-110 transition-all duration-500 ease-out">
              <img src={CATEGORY_ICONS.movie} alt="Movie Maniacs" className="w-full h-full object-contain" />
              
              {/* Corner Brackets - Only visible on hover */}
              <div className="absolute top-0 left-0 w-6 h-6 border-t-2 border-l-2 border-neon-red opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              <div className="absolute top-0 right-0 w-6 h-6 border-t-2 border-r-2 border-neon-red opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              <div className="absolute bottom-0 left-0 w-6 h-6 border-b-2 border-l-2 border-neon-red opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              <div className="absolute bottom-0 right-0 w-6 h-6 border-b-2 border-r-2 border-neon-red opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
            </div>
          </div>
          
          {/* Bottom: Title & Description */}
          <div className="relative z-10">
            <h3 className="font-display font-bold text-3xl md:text-4xl text-white mb-2">Movie Maniacs</h3>
            <p className="font-tech text-sm text-ash/60 leading-relaxed max-w-sm">Legendary villains and heroes from film.</p>
          </div>
        </div>
      </div>
       <div className="mt-16 text-center pb-8">
         <button onClick={() => setAppState(AppState.IDLE)} className="font-tech text-xs text-ash/40 hover:text-white uppercase tracking-[0.2em] transition-colors flex items-center justify-center gap-2 mx-auto">
            <span className="text-xl">«</span> Abort Sequence
         </button>
      </div>
    </div>
  );

  const renderStyleSelector = () => {
    if (!selectionCategory) {
      return renderCategorySelector();
    }

    const stylesToShow = COSTUME_STYLES.filter(
      style => style.category === selectionCategory || style.category === 'custom'
    );
    
    return (
      <div className="min-h-screen py-24 md:py-32 px-4 md:px-6 max-w-7xl mx-auto">
        <header className="mb-12 md:mb-20 flex flex-col md:flex-row justify-between items-end border-b border-ash/10 pb-8">
          <div>
             <h2 className="font-display font-bold text-4xl md:text-6xl text-white mb-2">CHOOSE YOUR VESSEL</h2>
             <p className="font-tech text-ash/50 text-xs md:text-sm tracking-widest uppercase">{selectionCategory.replace('-', ' ')}</p>
          </div>
          <div className="font-tech text-neon-red text-xl font-bold mt-4 md:mt-0 flex gap-2">
              <span>01</span>
              <span className="opacity-30">/</span>
              <span>{String(stylesToShow.length).padStart(2, '0')}</span>
          </div>
        </header>
  
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 pb-20">
          {stylesToShow.map((style, index) => (
            <div 
              key={style.id}
              onClick={() => handleStyleSelect(style)}
              className="group relative h-[350px] md:h-[400px] bg-white/5 border border-white/10 hover:border-neon-red transition-all duration-300 cursor-pointer overflow-hidden flex flex-col justify-between p-6 md:p-8 hover:shadow-[0_0_30px_rgba(255,42,42,0.1)]"
            >
              {/* Hover Gradient */}
              <div className="absolute inset-0 bg-gradient-to-t from-neon-red/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
              
              <div className="relative z-10 flex justify-between items-start">
                 {/* SVG Icon with Corner Brackets */}
                 <div className="relative w-24 h-24 md:w-32 md:h-32 mb-4 grayscale group-hover:grayscale-0 transition-all duration-300 transform group-hover:scale-110 drop-shadow-[0_0_15px_rgba(255,255,255,0.2)] flex items-center justify-center">
                    <img src={style.icon} alt={style.name} className="w-full h-full object-contain" />
                    
                    {/* Corner Brackets - Only visible on hover */}
                    <div className="absolute top-0 left-0 w-4 h-4 border-t border-l border-neon-red opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                    <div className="absolute top-0 right-0 w-4 h-4 border-t border-r border-neon-red opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                    <div className="absolute bottom-0 left-0 w-4 h-4 border-b border-l border-neon-red opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                    <div className="absolute bottom-0 right-0 w-4 h-4 border-b border-r border-neon-red opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                 </div>
                 
                 <div className="flex flex-col items-end gap-2">
                     <span className="font-tech text-[10px] text-ash/30 tracking-widest">INDEX.{String(index + 1).padStart(2, '0')}</span>
                     
                     <div className="flex items-center gap-2">
                        {/* GENDER BADGE */}
                        <span className={`font-tech text-[10px] px-2 py-1 border uppercase tracking-widest ${
                            style.gender === 'male' ? 'text-cyan-400 border-cyan-400/30 bg-cyan-900/10' :
                            style.gender === 'female' ? 'text-pink-400 border-pink-400/30 bg-pink-900/10' :
                            'text-ash/50 border-white/10 bg-white/5'
                         }`}>
                            {style.gender}
                         </span>
  
                         {/* ID BADGE */}
                         <span className="font-tech text-xs border border-white/20 px-2 py-1 bg-black/50 text-ash/50 group-hover:border-neon-red group-hover:text-neon-red transition-colors">
                           {style.id.toUpperCase()}
                         </span>
                     </div>
                 </div>
              </div>
  
              <div className="relative z-10">
                 <h3 className="font-display font-bold text-2xl md:text-3xl text-white mb-2 group-hover:translate-x-2 transition-transform duration-300 group-hover:text-neon-red">
                    {style.name}
                 </h3>
                 <p className="font-tech text-xs md:text-sm text-ash/60 leading-relaxed group-hover:text-white transition-colors border-t border-white/10 pt-4 mt-2 line-clamp-3">
                   {style.description}
                 </p>
              </div>
              
              {/* Glitch Overlay on Hover */}
              <div className="absolute inset-0 bg-white/5 translate-y-full group-hover:translate-y-0 transition-transform duration-500 ease-out z-0 pointer-events-none mix-blend-overlay"></div>
              
              {/* Card Corners */}
              <div className="absolute top-0 right-0 w-4 h-4 border-t border-r border-white/10 group-hover:border-neon-red transition-colors"></div>
              <div className="absolute bottom-0 left-0 w-4 h-4 border-b border-l border-white/10 group-hover:border-neon-red transition-colors"></div>
            </div>
          ))}
        </div>
        
        <div className="mt-8 text-center pb-8">
           <button onClick={() => setSelectionCategory(null)} className="font-tech text-xs text-ash/40 hover:text-white uppercase tracking-[0.2em] transition-colors flex items-center justify-center gap-2 mx-auto">
              <span className="text-xl">«</span> Change Category
           </button>
        </div>
      </div>
    )
  };

  const renderCustomInputModal = () => (
    <div className={`fixed inset-0 z-[60] flex items-center justify-center bg-black/90 backdrop-blur-xl transition-opacity duration-300 px-4 ${showCustomModal ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'}`}>
       <div className="relative w-full max-w-lg p-1 bg-gradient-to-br from-neon-red/50 to-transparent rounded-lg">
          <div className="bg-void p-6 md:p-12 rounded-lg border border-neon-red/20 shadow-[0_0_50px_rgba(255,42,42,0.2)]">
             <header className="mb-6 md:mb-8">
                <span className="font-tech text-neon-red text-xs tracking-[0.2em] uppercase animate-pulse mb-2 block">// Manual Override</span>
                <h3 className="font-display font-bold text-2xl md:text-4xl text-white">RITUAL SPECIFICATION</h3>
                <p className="font-tech text-ash/50 text-xs md:text-sm mt-2">Describe the entity you wish to invoke.</p>
             </header>

             <textarea
                value={customPrompt}
                onChange={(e) => setCustomPrompt(e.target.value)}
                placeholder="e.g. A cyberpunk samurai with a glowing katana, rain-soaked city background..."
                className="w-full h-32 md:h-40 bg-black/50 border border-white/20 rounded-none p-4 font-tech text-white focus:border-neon-red focus:outline-none focus:ring-1 focus:ring-neon-red transition-all placeholder-white/20 resize-none mb-6 md:mb-8 text-sm md:text-base"
             />

             <div className="flex flex-col md:flex-row gap-4">
                <button 
                  onClick={() => setShowCustomModal(false)}
                  className="order-2 md:order-1 flex-1 py-4 font-tech text-xs uppercase tracking-widest text-ash/50 hover:text-white hover:bg-white/10 transition-colors border border-transparent"
                >
                  Cancel
                </button>
                <div className="order-1 md:order-2 flex-1">
                    <SpookyButton variant="ritual" onClick={handleCustomSubmit} disabled={!customPrompt.trim()} className="w-full">
                    CONJURE
                    </SpookyButton>
                </div>
             </div>
          </div>
       </div>
    </div>
  );

  const renderUpload = () => (
    <div className="min-h-screen flex flex-col justify-center items-center py-20 px-4 relative">
        {/* Background Grid Accent */}
        <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.03)_1px,transparent_1px)] bg-[size:100px_100px] pointer-events-none"></div>

        <div className="relative z-10 w-full max-w-2xl">
            <header className="mb-8 md:mb-12 text-center">
                <span className="inline-block px-3 py-1 bg-neon-red/10 border border-neon-red text-neon-red font-tech text-xs font-bold tracking-widest mb-4 animate-pulse">
                    STEP 02: DATA INPUT
                </span>
                <h2 className="font-display font-bold text-4xl md:text-5xl text-white">INITIATE TRANSFER</h2>
            </header>

            <input 
                type="file" 
                ref={fileInputRef}
                onChange={handleFileChange}
                accept="image/*"
                className="hidden" 
            />

            <div 
                className={`
                    relative w-full aspect-square md:aspect-[16/9] border-2 border-dashed rounded-lg flex flex-col items-center justify-center cursor-pointer overflow-hidden transition-all duration-300 group
                    ${originalImage ? 'border-neon-red bg-black' : 'border-ash/20 hover:border-white hover:bg-white/5'}
                `}
                onClick={() => fileInputRef.current?.click()}
            >
                 {originalImage ? (
                    <>
                        <img src={originalImage} alt="Input" className="w-full h-full object-contain z-10 opacity-80" />
                        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-black/80 backdrop-blur border border-white/20 text-white font-tech text-xs px-4 py-2 z-20 uppercase tracking-widest group-hover:bg-neon-red group-hover:border-neon-red transition-colors flex items-center gap-2 whitespace-nowrap">
                           <span className="w-2 h-2 bg-neon-red rounded-full animate-pulse"></span>
                           Replace File
                        </div>
                        {/* Scanline over image */}
                        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-white/5 to-transparent h-[10%] animate-scanline opacity-50 pointer-events-none"></div>
                    </>
                 ) : (
                    <div className="text-center p-8 relative z-20">
                        <div className="w-16 h-16 md:w-20 md:h-20 border border-ash/30 rounded-full flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform group-hover:border-white group-hover:bg-white text-ash/50 group-hover:text-black duration-300">
                            <span className="text-3xl font-display font-bold text-inherit">+</span>
                        </div>
                        <p className="font-display text-xl md:text-2xl text-white mb-2 tracking-wide">Drag & Drop or Click</p>
                        <p className="font-tech text-ash/50 text-xs md:text-sm">Supports JPG, PNG (Max 5MB)</p>
                    </div>
                 )}
            </div>

            {error && (
                <div className="mt-6 flex items-center gap-3 text-neon-red font-tech text-sm bg-neon-red/5 p-4 border border-neon-red/20 animate-pulse">
                    <span className="font-bold">ERROR:</span> {error}
                </div>
            )}
            
            {successMessage && (
                <div className="mt-6 flex items-center gap-3 text-cyan-400 font-tech text-sm bg-cyan-900/20 p-4 border border-cyan-400/20 animate-pulse">
                    <span className="font-bold">SUCCESS:</span> {successMessage}
                </div>
            )}

            <div className="mt-8 md:mt-12 flex flex-col md:flex-row justify-between items-center gap-6">
                 <button onClick={() => setAppState(AppState.SELECTING)} className="font-tech text-sm text-ash/50 hover:text-white uppercase tracking-widest transition-colors order-2 md:order-1">
                    Back
                 </button>
                 <div className="order-1 md:order-2 w-full md:w-auto">
                    <SpookyButton 
                        onClick={handleGenerate} 
                        disabled={!originalImage}
                        variant="ritual"
                        className="shadow-2xl w-full md:w-auto"
                    >
                        EXECUTE RITUAL
                    </SpookyButton>
                 </div>
            </div>
        </div>
    </div>
  );

  const renderResult = () => (
    <div className="min-h-screen flex flex-col items-center pt-24 pb-12 px-4 md:px-6">
       <header className="mb-8 md:mb-12 text-center flex flex-col items-center">
            <div className="inline-flex items-center gap-3 px-4 py-2 rounded-full border border-neon-red/30 bg-neon-red/5 backdrop-blur-md mb-6 cursor-default">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-neon-red opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-neon-red"></span>
              </span>
              <span className="font-tech text-xs font-bold tracking-[0.2em] text-neon-red uppercase">
                Processing Complete
              </span>
            </div>
            
            <h2 className="font-display font-bold text-4xl md:text-6xl text-white tracking-tight">THE REVELATION</h2>
       </header>

       {/* ULTRA-WIDE CINEMATIC SLIDER CONTAINER */}
       <div className="relative w-full max-w-5xl mx-auto p-1 bg-gradient-to-b from-white/10 to-transparent">
         {/* Decorative Frame Elements */}
         <div className="absolute top-0 left-0 w-4 h-4 border-l-2 border-t-2 border-neon-red z-20"></div>
         <div className="absolute top-0 right-0 w-4 h-4 border-r-2 border-t-2 border-neon-red z-20"></div>
         <div className="absolute bottom-0 left-0 w-4 h-4 border-l-2 border-b-2 border-neon-red z-20"></div>
         <div className="absolute bottom-0 right-0 w-4 h-4 border-r-2 border-b-2 border-neon-red z-20"></div>

         <div 
          className="relative w-full aspect-[3/4] md:aspect-[16/9] bg-black border border-white/5 shadow-[0_0_50px_rgba(0,0,0,1)] overflow-hidden cursor-ew-resize group select-none touch-none"
          ref={sliderRef}
          onMouseDown={(e) => { e.preventDefault(); handleSliderDrag(e); }}
          onMouseMove={(e) => { if(e.buttons === 1) handleSliderDrag(e); }}
          onTouchMove={handleSliderDrag}
          onTouchStart={handleSliderDrag}
        >
           {/* Background: Generated (The Reveal) */}
           {generatedImage && <img src={generatedImage} alt="Result" className="absolute inset-0 w-full h-full object-cover" />}
           
           {/* FULLSCREEN ZOOM BUTTON */}
           <button 
             onClick={(e) => { e.stopPropagation(); setIsFullscreen(true); }}
             className="absolute top-4 right-4 md:top-8 md:right-8 z-30 group/btn flex items-center gap-3 flex-row-reverse"
             title="View Fullscreen"
           >
             <div className="bg-black/50 backdrop-blur border border-white/20 p-2 text-white hover:bg-neon-red hover:text-black hover:border-neon-red transition-all duration-300 rounded-full md:rounded-none">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 3.75v4.5m0-4.5h4.5m-4.5 0L9 9M3.75 20.25v-4.5m0 4.5h4.5m-4.5 0L9 15M20.25 3.75h-4.5m4.5 0v4.5m0-4.5L15 9m5.25 11.25h-4.5m4.5 0v-4.5m0 4.5L15 15" />
                </svg>
             </div>
             <span className="font-tech text-xs tracking-widest text-white/50 opacity-0 group-hover/btn:opacity-100 transition-opacity hidden md:inline-block">EXPAND_VIEW</span>
           </button>

           {/* Foreground: Original (The Input) */}
           <div 
              className="absolute top-0 left-0 h-full overflow-hidden bg-black border-r border-white/50"
              style={{ width: `${sliderPosition}%` }}
           >
               {originalImage && <img 
                  src={originalImage} 
                  alt="Original" 
                  className="absolute top-0 left-0 max-w-none h-full object-cover filter grayscale contrast-125 brightness-75"
                  style={{ width: sliderRef.current?.offsetWidth }}
               />}
               
               {/* Digital Grid Overlay on Original Only */}
               <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.05)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.05)_1px,transparent_1px)] bg-[size:40px_40px] pointer-events-none"></div>
               
               {/* Original Label - HUD Style */}
               <div className="absolute bottom-4 left-4 md:bottom-8 md:left-8 flex flex-col items-start z-10 pointer-events-none">
                  <div className="flex items-center gap-2 mb-1">
                     <span className="font-tech text-white text-[10px] md:text-xs tracking-[0.3em] font-bold bg-black/50 px-2 py-1">BIO_DATA_INPUT</span>
                     <div className="w-2 h-2 bg-white/50 rounded-full"></div>
                  </div>
                  <div className="h-[1px] w-16 md:w-24 bg-gradient-to-r from-white/50 to-transparent"></div>
               </div>
           </div>

           {/* Custom Dragger */}
           <div className="absolute top-0 bottom-0 w-0 z-20" style={{ left: `${sliderPosition}%` }}>
              {/* Glowing vertical line */}
              <div className="absolute top-0 bottom-0 left-[-1px] w-[2px] bg-gradient-to-b from-transparent via-neon-red to-transparent shadow-[0_0_20px_#ff2a2a]"></div>
              
              {/* Handle */}
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-10 h-10 flex items-center justify-center pointer-events-none">
                 {/* Diamond Shape */}
                 <div className="w-8 h-8 bg-black/90 border border-neon-red rotate-45 transform shadow-[0_0_15px_rgba(255,42,42,0.5)] flex items-center justify-center">
                    <div className="w-2 h-2 bg-neon-red rounded-full animate-pulse"></div>
                 </div>
                 {/* Arrows */}
                 <div className="absolute -left-6 text-neon-red font-bold text-xs opacity-50 hidden md:block">◄</div>
                 <div className="absolute -right-6 text-neon-red font-bold text-xs opacity-50 hidden md:block">►</div>
              </div>
           </div>
        </div>
       </div>

      {/* ACTION BUTTONS: Wide spacing, Symmetrical Sizing */}
      <div className="mt-16 flex flex-col md:flex-row gap-8 md:gap-12 w-full max-w-5xl justify-center items-center">
        <div className="w-full md:w-auto">
             <SpookyButton variant="ritual" onClick={handleReset} className="w-full md:min-w-[280px]">
                RE-INITIALIZE
            </SpookyButton>
        </div>
        
        <a href={generatedImage || '#'} download="spookify-result.png" className="w-full md:w-auto">
            <SpookyButton variant="primary" className="w-full md:min-w-[280px] whitespace-nowrap">
               SAVE TO REALITY
            </SpookyButton>
        </a>
      </div>
    </div>
  );

  const renderFullscreenModal = () => (
    <div 
      className={`fixed inset-0 z-[60] flex flex-col items-center justify-center bg-black/95 backdrop-blur-xl transition-opacity duration-300 ${isFullscreen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'}`}
      onMouseMove={handlePanMove}
      onMouseUp={handlePanEnd}
      onMouseLeave={handlePanEnd}
    >
      <button 
        onClick={closeFullscreen}
        className="absolute top-6 right-6 text-white/50 hover:text-neon-red transition-colors z-[61] p-2"
        aria-label="Close fullscreen view"
      >
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-8 h-8 md:w-10 md:h-10">
          <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
        </svg>
      </button>

      <div 
        className="relative w-full h-full flex items-center justify-center overflow-hidden"
        onWheel={handleWheelZoom}
        onDoubleClick={resetZoomAndPan}
        style={{ cursor: isPanning ? 'grabbing' : zoom > 1 ? 'grab' : 'default' }}
      >
        {generatedImage && <img 
          src={generatedImage} 
          alt="Full Screen Result" 
          className="max-w-[90vw] max-h-[90vh] object-contain shadow-[0_0_50px_rgba(0,0,0,1)] rounded-sm border border-white/10 select-none"
          style={{ 
            transform: `scale(${zoom}) translate(${pan.x}px, ${pan.y}px)`,
            transition: isPanning ? 'none' : 'transform 0.1s ease-out',
          }}
          onMouseDown={handlePanStart}
        />}
      </div>

      <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-[61] flex items-center gap-6 bg-black/50 backdrop-blur-md border border-white/10 px-4 py-2 rounded-lg font-tech text-xs select-none">
          <div className="flex items-center gap-2 text-ash/70">
            <span className="tracking-widest">ZOOM</span>
            <span className="font-bold text-white w-12 text-center">{Math.round(zoom * 100)}%</span>
          </div>
          <div className="w-[1px] h-4 bg-white/10"></div>
          <button onClick={resetZoomAndPan} className="text-ash/70 hover:text-white transition-colors tracking-widest">
            RESET VIEW
          </button>
      </div>
      <div className="absolute bottom-16 left-1/2 -translate-x-1/2 font-tech text-ash/50 text-xs tracking-widest uppercase opacity-50 select-none hidden md:block z-[61]">
          [ Scroll to Zoom / Drag to Pan / Double-click to Reset ]
      </div>
    </div>
  );

  return (
    <div className="bg-void min-h-screen text-ash relative selection:bg-neon-red selection:text-black" ref={containerRef}>
      
      {/* 1. Static Grid Background */}
      <div className="fixed inset-0 bg-grid opacity-[0.08] pointer-events-none z-0"></div>
      
      {/* 2. Noise Overlay */}
      <div className="noise-overlay"></div>
      
      {/* 3. Scanline Overlay REMOVED */}

      {/* 4. The "Void Core" (Mouse Follower) */}
      <div 
         className="fixed w-[400px] h-[400px] md:w-[600px] md:h-[600px] rounded-full pointer-events-none z-0 mix-blend-screen filter blur-[80px] md:blur-[100px] opacity-25 transition-transform duration-100 ease-linear hidden md:block"
         style={{
            background: 'radial-gradient(circle, rgba(255,42,42,0.8) 0%, rgba(189,0,255,0.4) 40%, transparent 70%)',
            left: mousePos.x - 300,
            top: mousePos.y - 300,
         }}
      ></div>

      {/* 5. Top Navigation Bar */}
      {appState !== AppState.GAME && appState !== AppState.CORRUPTION && (
        <nav className="fixed top-0 left-0 w-full p-4 md:p-6 flex justify-between items-center z-50 pointer-events-none">
          <div className="font-display font-bold text-xl text-white pointer-events-auto cursor-pointer" onClick={handleReset}>
              SPOOKIFY<span className="text-neon-red">.AI</span>
          </div>
          
          {/* Credits Display - Only show if user has credits or is a judge */}
          {(credits > 0 || localStorage.getItem('spookify_isJudge') === 'true') && (
            <div className="font-tech text-xs uppercase tracking-wider flex items-center gap-2 px-3 py-1.5 bg-neon-red/10 border border-neon-red/30 rounded pointer-events-auto backdrop-blur-sm">
              <span className="text-ash/60">CREDITS:</span>
              <span className="text-neon-red font-bold">
                {localStorage.getItem('spookify_isJudge') === 'true' ? '∞ UNLIMITED' : credits}
              </span>
              {localStorage.getItem('spookify_isJudge') === 'true' && (
                <span className="text-green-500 text-[10px]">JUDGE</span>
              )}
            </div>
          )}
        </nav>
      )}

      {/* 6. Main Content Area */}
      <main className="relative z-30">
         {appState === AppState.IDLE && renderHero()}
         {appState === AppState.SELECTING && renderStyleSelector()}
         {appState === AppState.UPLOADING && renderUpload()}
         {appState === AppState.GENERATING && <GeneratingView />}
         {appState === AppState.RESULT && renderResult()}
         {appState === AppState.GAME && <SignalCorruptionGame onExit={(earnedCredits) => {
           setCredits(prev => prev + earnedCredits);
           handleReset();
         }} onVictory={handleGameVictory} credits={credits} onCreditsChange={setCredits} />}
         {appState === AppState.CORRUPTION && <CorruptionEvent onFix={() => setAppState(AppState.GAME)} />}
      </main>

      {/* 7. Modals */}
      {renderFullscreenModal()}
      {renderCustomInputModal()}

    </div>
  );
};

export default App;