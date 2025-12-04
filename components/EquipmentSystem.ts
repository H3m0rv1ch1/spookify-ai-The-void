import * as THREE from 'three';
import { SpectralRadio } from './items/SpectralRadio';
import { ThermalScanner } from './items/ThermalScanner';
import { UVEmitter } from './items/UVEmitter';

export type ToolType = 'SPECTRAL_RADIO' | 'THERMAL_SCANNER' | 'UV_EMITTER';

export class EquipmentSystem {
  private camera: THREE.Camera;
  private handGroup: THREE.Group;
  private tools: Record<ToolType, THREE.Group> = {} as any;
  public activeTool: ToolType = 'SPECTRAL_RADIO';
  private uvEmitter: UVEmitter | null = null;
  
  // Game Logic State
  private targets: THREE.Object3D[] = [];
  
  constructor(camera: THREE.Camera) {
    this.camera = camera;
    
    // Container for the tools, attached to camera
    // Adjusted position: Closer (z: -0.5), Higher (y: -0.35), Less offset (x: 0.3)
    this.handGroup = new THREE.Group();
    this.handGroup.position.set(0.3, -0.35, -0.5); 
    this.handGroup.rotation.set(0.1, -0.1, 0);
    this.camera.add(this.handGroup);
    
    this.initTools();
    this.switchTool('SPECTRAL_RADIO');
  }
  
  private initTools() {
    // 1. SPECTRAL RADIO
    const radio = new SpectralRadio();
    this.tools['SPECTRAL_RADIO'] = radio.mesh;
    this.handGroup.add(radio.mesh);

    // 2. THERMAL SCANNER
    const scanner = new ThermalScanner();
    // Angle it so the player looks down at the screen
    scanner.mesh.rotation.x = -Math.PI / 4; 
    scanner.mesh.rotation.z = 0.1;
    scanner.mesh.position.y = 0.05; 
    
    this.tools['THERMAL_SCANNER'] = scanner.mesh;
    this.handGroup.add(scanner.mesh);

    // 3. UV EMITTER
    const emitter = new UVEmitter();
    this.uvEmitter = emitter; // Save ref to toggle light
    this.tools['UV_EMITTER'] = emitter.mesh;
    this.handGroup.add(emitter.mesh);
  }

  public setTargets(targets: THREE.Object3D[]) {
    this.targets = targets;
  }

  public switchTool(tool: ToolType) {
    this.activeTool = tool;
    
    // Hide all
    Object.values(this.tools).forEach(mesh => mesh.visible = false);
    
    // Show active
    this.tools[tool].visible = true;
    
    // Handle Light logic
    if (this.uvEmitter) {
        this.uvEmitter.spotLight.intensity = (tool === 'UV_EMITTER') ? 10 : 0;
    }
    
    // Slight animation kick (Weapon switch bob)
    this.handGroup.position.y = -0.45;
  }

  public update(delta: number, time: number, playerPos: THREE.Vector3): { text: string, subText: string, signalLevel: number } {
    // Animate hand sway (Idle animation)
    const targetY = -0.35 + Math.sin(time * 1.5) * 0.015;
    const targetX = 0.3 + Math.cos(time * 1) * 0.01;
    
    this.handGroup.position.y = THREE.MathUtils.lerp(this.handGroup.position.y, targetY, delta * 5);
    this.handGroup.position.x = THREE.MathUtils.lerp(this.handGroup.position.x, targetX, delta * 5);

    // Find nearest target
    let nearestDist = Infinity;
    this.targets.forEach(t => {
        const d = playerPos.distanceTo(t.position);
        if (d < nearestDist) nearestDist = d;
    });

    // Tool Logic
    if (this.activeTool === 'SPECTRAL_RADIO') {
        const range = 25;
        if (nearestDist < range) {
            const intensity = 1 - (nearestDist / range); // 0 to 1
            const pct = Math.floor(intensity * 100);
            
            // Radio shake based on intensity
            if (intensity > 0.5) {
                this.handGroup.position.x += (Math.random() - 0.5) * 0.015;
                this.handGroup.position.y += (Math.random() - 0.5) * 0.015;
            }

            return { 
                text: `SIGNAL: ${pct}%`, 
                subText: nearestDist < 5 ? "TARGET LOCKED - CLICK TO FIX" : "TRACKING...", 
                signalLevel: intensity 
            };
        } else {
            return { text: "SEARCHING...", subText: "NO SIGNAL", signalLevel: 0 };
        }
    } 
    else if (this.activeTool === 'THERMAL_SCANNER') {
        let temp = 21.0; // Room temp
        if (nearestDist < 15) {
            temp -= (15 - nearestDist) * 1.5; // Drop temp near ghosts
        }
        // Add noise
        temp += (Math.random() - 0.5) * 0.5;
        
        return { 
            text: `${temp.toFixed(1)}°C`, 
            subText: temp < 5 ? "FREEZING TEMP DETECTED" : "AMBIENT STABLE",
            signalLevel: 0 
        };
    }
    else {
        return { 
            text: "UV EMITTER", 
            subText: "ACTIVE", 
            signalLevel: 0 
        };
    }
  }
  
  public tryFix(playerPos: THREE.Vector3): number | null {
      // Must use Radio to fix
      if (this.activeTool !== 'SPECTRAL_RADIO') return null;

      // Find target in range
      for (let i = 0; i < this.targets.length; i++) {
          const t = this.targets[i];
          if (t.position.distanceTo(playerPos) < 5) {
              return i; // Return index of fixed target
          }
      }
      return null;
  }
}