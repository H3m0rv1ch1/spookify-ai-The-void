import * as THREE from 'three';

export class FirstPersonController {
  camera: THREE.Camera;
  domElement: HTMLElement;
  playerGroup: THREE.Group;
  
  // Physics Constants
  readonly WALK_SPEED = 5.0; 
  readonly SPRINT_SPEED = 10.0;
  readonly CROUCH_SPEED = 2.5;
  
  readonly ACCELERATION = 80.0;
  readonly FRICTION = 10.0;
  readonly GRAVITY = 30.0;
  readonly JUMP_FORCE = 9.0;
  readonly MOUSE_SENSITIVITY = 0.002;
  
  readonly STAND_HEIGHT = 1.7;
  readonly CROUCH_HEIGHT = 0.9;
  readonly PLAYER_RADIUS = 0.5;

  // State
  private currentHeight = 1.7;
  private playerVel = new THREE.Vector3();
  private playerPos = new THREE.Vector3();
  private playerEuler = new THREE.Euler(0, 0, 0, 'YXZ');
  private keys = {
    forward: false,
    backward: false,
    left: false,
    right: false,
    jump: false,
    sprint: false,
    crouch: false
  };
  
  public isLocked = false;
  private onLockChange?: (isLocked: boolean) => void;

  constructor(camera: THREE.Camera, domElement: HTMLElement, scene: THREE.Scene, onLockChange?: (isLocked: boolean) => void) {
    this.camera = camera;
    this.domElement = domElement;
    this.onLockChange = onLockChange;

    // Create a group for the player/camera so we can move them together
    this.playerGroup = new THREE.Group();
    scene.add(this.playerGroup);
    this.playerGroup.add(this.camera);

    // Initial Position
    this.playerPos.set(0, this.STAND_HEIGHT, 0);
    this.playerGroup.position.copy(this.playerPos);

    // Bind methods to 'this'
    this.onKeyDown = this.onKeyDown.bind(this);
    this.onKeyUp = this.onKeyUp.bind(this);
    this.onMouseMove = this.onMouseMove.bind(this);
    this.onPointerLockChange = this.onPointerLockChange.bind(this);

    // Attach Event Listeners
    document.addEventListener('keydown', this.onKeyDown);
    document.addEventListener('keyup', this.onKeyUp);
    document.addEventListener('mousemove', this.onMouseMove);
    document.addEventListener('pointerlockchange', this.onPointerLockChange);
  }
  
  public lock(): void {
    this.domElement.requestPointerLock();
  }

  private onPointerLockChange() {
    this.isLocked = document.pointerLockElement === this.domElement;
    if (this.onLockChange) {
      this.onLockChange(this.isLocked);
    }
  }

  private onKeyDown(e: KeyboardEvent) {
    switch(e.code) {
        case 'KeyW': this.keys.forward = true; break;
        case 'KeyS': this.keys.backward = true; break;
        case 'KeyA': this.keys.left = true; break;
        case 'KeyD': this.keys.right = true; break;
        case 'Space': this.keys.jump = true; break;
        case 'ShiftLeft': 
        case 'ShiftRight': this.keys.sprint = true; break;
        case 'ControlLeft':
        case 'ControlRight': this.keys.crouch = true; break;
    }
  }

  private onKeyUp(e: KeyboardEvent) {
    switch(e.code) {
        case 'KeyW': this.keys.forward = false; break;
        case 'KeyS': this.keys.backward = false; break;
        case 'KeyA': this.keys.left = false; break;
        case 'KeyD': this.keys.right = false; break;
        case 'Space': this.keys.jump = false; break;
        case 'ShiftLeft': 
        case 'ShiftRight': this.keys.sprint = false; break;
        case 'ControlLeft':
        case 'ControlRight': this.keys.crouch = false; break;
    }
  }

  private onMouseMove(e: MouseEvent) {
    if (!this.isLocked) return;
    this.playerEuler.y -= e.movementX * this.MOUSE_SENSITIVITY;
    this.playerEuler.x -= e.movementY * this.MOUSE_SENSITIVITY;
    // Clamp pitch to avoid flipping
    this.playerEuler.x = Math.max(-Math.PI / 2 + 0.1, Math.min(Math.PI / 2 - 0.1, this.playerEuler.x));
    this.camera.quaternion.setFromEuler(this.playerEuler);
  }

  public update(delta: number, time: number, colliders: THREE.Box3[]) {
    if (!this.isLocked) return;

    // --- 0. DETERMINE STATE (Speed & Height) ---
    let currentSpeedLimit = this.WALK_SPEED;
    if (this.keys.sprint && !this.keys.crouch) currentSpeedLimit = this.SPRINT_SPEED;
    if (this.keys.crouch) currentSpeedLimit = this.CROUCH_SPEED;

    const targetHeight = this.keys.crouch ? this.CROUCH_HEIGHT : this.STAND_HEIGHT;
    // Smoothly interpolate height
    this.currentHeight = THREE.MathUtils.lerp(this.currentHeight, targetHeight, delta * 10);

    // --- 1. CALCULATE DIRECTION (X/Z) ---
    const forward = new THREE.Vector3(0, 0, -1).applyAxisAngle(new THREE.Vector3(0, 1, 0), this.playerEuler.y);
    const right = new THREE.Vector3(1, 0, 0).applyAxisAngle(new THREE.Vector3(0, 1, 0), this.playerEuler.y);
    
    const direction = new THREE.Vector3(0,0,0);
    if (this.keys.forward) direction.add(forward);
    if (this.keys.backward) direction.sub(forward);
    if (this.keys.left) direction.sub(right);
    if (this.keys.right) direction.add(right);
    
    if (direction.lengthSq() > 0) direction.normalize();

    // --- 2. ACCELERATION / FRICTION ---
    if (direction.lengthSq() > 0) {
        this.playerVel.x += direction.x * this.ACCELERATION * delta;
        this.playerVel.z += direction.z * this.ACCELERATION * delta;
    } else {
        this.playerVel.x -= this.playerVel.x * this.FRICTION * delta;
        this.playerVel.z -= this.playerVel.z * this.FRICTION * delta;
    }

    // Cap Horizontal Speed based on current state (walk/sprint/crouch)
    const horizontalSpeed = new THREE.Vector2(this.playerVel.x, this.playerVel.z).length();
    if (horizontalSpeed > currentSpeedLimit) {
        const ratio = currentSpeedLimit / horizontalSpeed;
        this.playerVel.x *= ratio;
        this.playerVel.z *= ratio;
    }

    // --- 3. GRAVITY & JUMP (Y) ---
    this.playerVel.y -= this.GRAVITY * delta;

    // Check Grounded: Compare playerPos.y (eye level) to current collision height (floor is at 0)
    const isGrounded = this.playerPos.y <= this.currentHeight + 0.01;

    if (isGrounded && this.keys.jump) {
        this.playerVel.y = this.JUMP_FORCE;
    }

    // --- 4. COLLISION DETECTION & INTEGRATION ---
    
    // Move X
    const originalX = this.playerPos.x;
    this.playerPos.x += this.playerVel.x * delta;
    let playerBox = new THREE.Box3();
    let min = new THREE.Vector3(this.playerPos.x - this.PLAYER_RADIUS, 0, this.playerPos.z - this.PLAYER_RADIUS);
    let max = new THREE.Vector3(this.playerPos.x + this.PLAYER_RADIUS, this.currentHeight, this.playerPos.z + this.PLAYER_RADIUS);
    playerBox.set(min, max);

    for(const wall of colliders) {
        if(playerBox.intersectsBox(wall)) {
            this.playerPos.x = originalX;
            this.playerVel.x = 0;
            break;
        }
    }

    // Move Z
    const originalZ = this.playerPos.z;
    this.playerPos.z += this.playerVel.z * delta;
    min.set(this.playerPos.x - this.PLAYER_RADIUS, 0, this.playerPos.z - this.PLAYER_RADIUS);
    max.set(this.playerPos.x + this.PLAYER_RADIUS, this.currentHeight, this.playerPos.z + this.PLAYER_RADIUS);
    playerBox.set(min, max);

    for(const wall of colliders) {
        if(playerBox.intersectsBox(wall)) {
            this.playerPos.z = originalZ;
            this.playerVel.z = 0;
            break;
        }
    }

    // Move Y
    this.playerPos.y += this.playerVel.y * delta;
    // Ground constraint (Floor at 0)
    if (this.playerPos.y < this.currentHeight) {
        this.playerPos.y = this.currentHeight;
        this.playerVel.y = 0;
    }

    // Update Camera/Player Position
    this.playerGroup.position.copy(this.playerPos);

    // --- 5. CAMERA HEAD BOB ---
    if (isGrounded && horizontalSpeed > 1.0) {
        // Frequency and Amplitude increase with speed
        const bobFreq = horizontalSpeed > 6.0 ? 0.018 : 0.012; 
        const bobAmp = horizontalSpeed > 6.0 ? 0.1 : 0.08;
        this.camera.position.y = Math.sin(time * bobFreq) * bobAmp;
    } else {
        this.camera.position.y = THREE.MathUtils.lerp(this.camera.position.y, 0, delta * 5);
    }
  }

  public dispose() {
    document.removeEventListener('keydown', this.onKeyDown);
    document.removeEventListener('keyup', this.onKeyUp);
    document.removeEventListener('mousemove', this.onMouseMove);
    document.removeEventListener('pointerlockchange', this.onPointerLockChange);
    
    if (this.playerGroup.parent) {
      this.playerGroup.parent.remove(this.playerGroup);
    }
  }
}