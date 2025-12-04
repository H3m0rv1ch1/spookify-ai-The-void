import * as THREE from 'three';

// Generated metal texture as a self-contained base64 string
const METAL_TEXTURE_URL = "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjU2IiBoZWlnaHQ9IjI1NiIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KICA8ZGVmcz4KICAgIDxmaWx0ZXIgaWQ9Im5vaXNlIiB4PSIwIiB5PSIwIiB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIj4KICAgICAgPGZlVHVyYnVsZW5jZSB0eXBlPSJmcmFjdGFsTm9pc2UiIGJhc2VGcmVxdWVuY3k9IjAuNCIgbnVtT2N0YXZlcz0iMyIgc3RpdGNoVGlsZXM9InN0aXRjaCIvPgogICAgICA8ZmVEaWZmdXNlTGlnaHRpbmcgaW49IlNvdXJjZUdyYXBoaWMiIGxpZ2h0aW5nLWNvbG9yPSIjNDQ0IiBzdXJmYWNlU2NhbGU9IjIiPgogICAgICAgIDxmZURpc3RhbnRMaWdodCBhemltdXRoPSI0NSIgZWxldmFjpbj0IjYwIi8+CiAgICAgIDwvZmVEaWZmdXNlTGlnaHRpbmc+CiAgICA8L2ZpbHRlcj4KICA8L2RlZnM+CiAgPHJlY3Qgd2lkdGg9IjI1NiIgaGVpZ2h0PSIyNTYiIGZpbGw9IiMyMjIiIC8+CiAgPHJlY3Qgd2lkdGg9IjI1NiIgaGVpZ2h0PSIyNTYiIGZpbHRlcj0idXJsKCNub2lzZSkiIG9wYWNpdHk9IjAuMyIgLz4KPC9zdmc+";

export class UVEmitter {
  public mesh: THREE.Group;
  public spotLight: THREE.SpotLight;

  constructor() {
    this.mesh = new THREE.Group();
    
    // Material Logic
    let handleMat: THREE.Material;
    if (METAL_TEXTURE_URL) {
        const loader = new THREE.TextureLoader();
        const texture = loader.load(METAL_TEXTURE_URL);
        // Wrap the texture around the cylinder
        texture.wrapS = THREE.RepeatWrapping;
        texture.wrapT = THREE.RepeatWrapping;
        handleMat = new THREE.MeshStandardMaterial({ map: texture, roughness: 0.7, metalness: 0.8 });
    } else {
        handleMat = new THREE.MeshStandardMaterial({ color: 0x222222, roughness: 0.9 });
    }

    // Handle
    const handle = new THREE.Mesh(
        new THREE.CylinderGeometry(0.035, 0.035, 0.25),
        handleMat
    );
    handle.rotation.x = -Math.PI / 2;
    handle.position.z = 0.05;
    this.mesh.add(handle);
    
    // Flashlight Head
    const head = new THREE.Mesh(
        new THREE.CylinderGeometry(0.05, 0.035, 0.08),
        new THREE.MeshStandardMaterial({ color: 0x111111, metalness: 0.8, roughness: 0.2 })
    );
    head.rotation.x = -Math.PI / 2;
    head.position.z = -0.12;
    this.mesh.add(head);

    // Switch
    const btn = new THREE.Mesh(
        new THREE.BoxGeometry(0.02, 0.01, 0.04),
        new THREE.MeshStandardMaterial({ color: 0xbd00ff })
    );
    btn.position.set(0, 0.04, 0);
    this.mesh.add(btn);

    // The Light Source
    this.spotLight = new THREE.SpotLight(0xbd00ff, 0, 40, 0.6, 0.8, 1);
    this.spotLight.position.set(0, 0, -0.15);
    this.spotLight.target.position.set(0, 0, -5);
    
    this.mesh.add(this.spotLight);
    this.mesh.add(this.spotLight.target);
    
    // Lens Glow (Visible source)
    const lens = new THREE.Mesh(
        new THREE.CircleGeometry(0.04, 32),
        new THREE.MeshBasicMaterial({ color: 0xbd00ff, transparent: true, opacity: 0.8 })
    );
    lens.position.z = -0.161;
    lens.rotation.y = Math.PI;
    this.mesh.add(lens);
  }
}