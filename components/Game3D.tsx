import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { FirstPersonController } from './FirstPersonController';
import { EquipmentSystem, ToolType } from './EquipmentSystem';

interface Game3DProps {
  onExit: () => void;
}

export const Game3D: React.FC<Game3DProps> = ({ onExit }) => {
  const mountRef = useRef<HTMLDivElement>(null);
  const controllerRef = useRef<FirstPersonController | null>(null);
  const [instructionsVisible, setInstructionsVisible] = useState(true);
  
  // Game State for UI
  const [toolData, setToolData] = useState({ text: '', subText: '', signalLevel: 0 });
  const [currentTool, setCurrentTool] = useState<ToolType>('SPECTRAL_RADIO');
  const [targetsRemaining, setTargetsRemaining] = useState(0);
  const [message, setMessage] = useState('');

  useEffect(() => {
    if (!mountRef.current) return;
    const currentMount = mountRef.current;

    // --- 1. SETUP SCENE ---
    const scene = new THREE.Scene();
    // LIGHT THEME STYLE
    const bgColor = 0xf2f2f2; // Very light grey/white
    scene.background = new THREE.Color(bgColor); 
    scene.fog = new THREE.FogExp2(bgColor, 0.02);

    const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.shadowMap.enabled = true;
    currentMount.appendChild(renderer.domElement);

    // --- 2. LEVEL GENERATION (EMPTY) ---
    
    // Simple Grid (Darker lines for visibility on light floor)
    const gridHelper = new THREE.GridHelper(200, 100, 0x888888, 0xdddddd);
    scene.add(gridHelper);

    // Floor Plane
    const floorGeo = new THREE.PlaneGeometry(200, 200);
    const floorMat = new THREE.MeshStandardMaterial({ 
        color: 0xffffff, 
        roughness: 0.8, 
        metalness: 0.1 
    });
    const floor = new THREE.Mesh(floorGeo, floorMat);
    floor.rotation.x = -Math.PI / 2;
    floor.receiveShadow = true;
    scene.add(floor);

    // NO WALLS / OBSTACLES (Empty Design)
    const colliders: THREE.Box3[] = [];

    // --- 3. TARGETS (Haunted Items) ---
    // Simple Green Spheres (More opaque for light bg)
    const ghostMat = new THREE.MeshStandardMaterial({ 
        color: 0x00ff00, 
        transparent: true, 
        opacity: 0.6, 
        emissive: 0x004400,
        emissiveIntensity: 0.8
    });

    const targets: THREE.Object3D[] = [];
    const targetGroup = new THREE.Group();
    scene.add(targetGroup);

    for(let i=0; i<8; i++) {
        const ghost = new THREE.Mesh(new THREE.SphereGeometry(0.5, 16, 16), ghostMat);
        // Random positions on the flat plane
        ghost.position.set((Math.random() - 0.5) * 80, 1.5, (Math.random() - 0.5) * 80);
        ghost.userData = { 
            baseY: ghost.position.y, 
            offset: Math.random() * 100,
            speed: 1 + Math.random(),
        };
        targetGroup.add(ghost);
        targets.push(ghost);
    }
    setTargetsRemaining(targets.length);

    // --- 4. LIGHTING ---
    // Bright White Lights
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.7); // High ambient for daylight feel
    scene.add(ambientLight);

    const dirLight = new THREE.DirectionalLight(0xffffff, 1.0);
    dirLight.position.set(10, 20, 10);
    dirLight.castShadow = true;
    dirLight.shadow.mapSize.width = 2048;
    dirLight.shadow.mapSize.height = 2048;
    scene.add(dirLight);

    // --- 5. SYSTEMS ---
    const controller = new FirstPersonController(camera, renderer.domElement, scene, (isLocked) => setInstructionsVisible(!isLocked));
    controllerRef.current = controller;
    const equipment = new EquipmentSystem(camera);
    equipment.setTargets(targets);

    // --- 6. INPUT HANDLING ---
    const handleKeyDown = (e: KeyboardEvent) => {
        if(e.key === '1') {
            equipment.switchTool('SPECTRAL_RADIO');
            setCurrentTool('SPECTRAL_RADIO');
        }
        if(e.key === '2') {
            equipment.switchTool('THERMAL_SCANNER');
            setCurrentTool('THERMAL_SCANNER');
        }
        if(e.key === '3') {
            equipment.switchTool('UV_EMITTER');
            setCurrentTool('UV_EMITTER');
        }
    };
    
    const handleMouseClick = () => {
        if (!controllerRef.current?.isLocked) return;
        
        // Try to fix
        const fixedIndex = equipment.tryFix(camera.parent!.position);
        if (fixedIndex !== null) {
            // Remove target
            const target = targets[fixedIndex];
            targetGroup.remove(target);
            targets.splice(fixedIndex, 1);
            
            // Visual feedback
            setMessage("ENTITY EXORCISED!");
            setTimeout(() => setMessage(''), 3000);
            
            setTargetsRemaining(targets.length);
            equipment.setTargets(targets);
        }
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('mousedown', handleMouseClick);

    // --- 7. LOOP ---
    let prevTime = performance.now();
    let animId: number;
    const animate = () => {
        animId = requestAnimationFrame(animate);
        const time = performance.now();
        const delta = Math.min((time - prevTime) / 1000, 0.1);
        prevTime = time;

        controller.update(delta, time, colliders);
        
        // Update targets animation
        targets.forEach(t => {
            t.position.y = t.userData.baseY + Math.sin(time * 0.003 * t.userData.speed + t.userData.offset) * 0.3;
        });

        // Update Equipment
        const data = equipment.update(delta, time * 0.001, camera.parent!.position);
        setToolData(data);

        renderer.render(scene, camera);
    };

    animate();

    const handleResize = () => {
        camera.aspect = window.innerWidth / window.innerHeight;
        camera.updateProjectionMatrix();
        renderer.setSize(window.innerWidth, window.innerHeight);
    };
    window.addEventListener('resize', handleResize);

    return () => {
        cancelAnimationFrame(animId);
        window.removeEventListener('resize', handleResize);
        window.removeEventListener('keydown', handleKeyDown);
        window.removeEventListener('mousedown', handleMouseClick);
        controllerRef.current?.dispose();
        controllerRef.current = null;
        if (currentMount) currentMount.innerHTML = '';
        renderer.dispose();
    };
  }, []);
  
  const handleInitializeClick = () => {
      controllerRef.current?.lock();
  };

  return (
    <div className="fixed inset-0 bg-black font-tech text-white select-none">
      <div ref={mountRef} className="w-full h-full" />
      
      {/* EQUIPMENT HUD */}
      {!instructionsVisible && (
          <div className="absolute bottom-6 right-6 flex flex-col items-end gap-2 pointer-events-none">
              
              {/* Message Toast */}
              {message && (
                  <div className="mb-8 text-neon-green font-bold text-2xl animate-bounce drop-shadow-[0_0_10px_#0f0]">
                      {message}
                  </div>
              )}

              {/* Tool Screen */}
              <div className="bg-black/80 border border-white/20 p-4 rounded-lg backdrop-blur min-w-[250px]">
                  <div className="flex justify-between items-center mb-2 border-b border-white/10 pb-2">
                      <span className="text-xs text-ash/50 tracking-widest">{currentTool.replace('_', ' ')}</span>
                      <span className="text-xs text-neon-red animate-pulse">BAT 87%</span>
                  </div>
                  
                  <div className="font-display font-bold text-3xl text-white mb-1">
                      {toolData.text}
                  </div>
                  
                  <div className={`text-sm tracking-widest ${toolData.signalLevel > 0.8 ? 'text-neon-red animate-pulse' : 'text-ash/70'}`}>
                      {toolData.subText}
                  </div>

                  {/* Signal Bar */}
                  {currentTool === 'SPECTRAL_RADIO' && (
                      <div className="w-full h-2 bg-white/10 mt-3 rounded-full overflow-hidden">
                          <div 
                             className="h-full bg-neon-red transition-all duration-100"
                             style={{ width: `${toolData.signalLevel * 100}%` }}
                          ></div>
                      </div>
                  )}
              </div>

              {/* Controls Hint */}
              <div className="flex gap-2 mt-2">
                  <div className={`px-2 py-1 border ${currentTool === 'SPECTRAL_RADIO' ? 'border-neon-red text-neon-red' : 'border-white/10 text-ash/30'} text-xs`}>1. RADIO</div>
                  <div className={`px-2 py-1 border ${currentTool === 'THERMAL_SCANNER' ? 'border-neon-red text-neon-red' : 'border-white/10 text-ash/30'} text-xs`}>2. THERMAL</div>
                  <div className={`px-2 py-1 border ${currentTool === 'UV_EMITTER' ? 'border-neon-red text-neon-red' : 'border-white/10 text-ash/30'} text-xs`}>3. UV</div>
              </div>
          </div>
      )}

      {/* Target Counter HUD */}
      {!instructionsVisible && (
          <div className="absolute top-6 left-6 pointer-events-none">
             <div className="text-ash/50 text-xs tracking-[0.3em] uppercase mb-1">Entitites Detected</div>
             <div className="text-4xl font-display font-bold text-white">{targetsRemaining}</div>
          </div>
      )}
      
      {instructionsVisible && (
        <div 
            className="absolute inset-0 flex flex-col items-center justify-center bg-black/90 z-50 cursor-pointer"
            onClick={handleInitializeClick}
        >
            <h1 className="text-4xl md:text-6xl text-white font-bold mb-4 tracking-widest">GHOST HUNT</h1>
            <p className="text-sm md:text-xl text-ash/70 mb-8 tracking-[0.2em] uppercase">Click to Initialize</p>
            
            <div className="grid grid-cols-2 gap-x-12 gap-y-8 text-xs md:text-sm text-ash/50 max-w-2xl text-left">
                <div>
                    <h3 className="text-white font-bold mb-2 border-b border-white/20 pb-1">MOVEMENT</h3>
                    <p>WASD - Move</p>
                    <p>SHIFT - Sprint</p>
                    <p>CTRL - Crouch</p>
                    <p>SPACE - Jump</p>
                </div>
                <div>
                    <h3 className="text-white font-bold mb-2 border-b border-white/20 pb-1">EQUIPMENT</h3>
                    <p>[1] RADIO - Detect & Fix (LMB)</p>
                    <p>[2] THERMAL - Find Cold Spots</p>
                    <p>[3] UV - Light Source</p>
                </div>
            </div>
            
            <div className="mt-12 text-center">
                <p className="text-neon-red animate-pulse tracking-widest">MISSION: FIND AND EXORCISE {targetsRemaining} ENTITIES</p>
            </div>
        </div>
      )}
      
      <button 
        onClick={onExit} 
        className="absolute top-4 right-4 z-50 text-white border border-white/20 bg-black/50 px-6 py-2 hover:bg-white hover:text-black transition-colors font-bold tracking-widest text-sm"
      >
        ABORT
      </button>

      {!instructionsVisible && (
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-1 h-1 bg-white rounded-full opacity-30 pointer-events-none mix-blend-difference"></div>
      )}
    </div>
  );
};