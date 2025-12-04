import * as THREE from 'three';

// Generated HUD texture as a self-contained base64 string
const SCREEN_TEXTURE_URL = "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjU2IiBoZWlnaHQ9IjE3MiIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIiBzdHlsZT0iYmFja2dyb3VuZC1jb2xvcjojMDAxYTMzOyI+CiAgPGRlZnM+CiAgICA8ZmlsdGVyIGlkPSJnbG93Ij4KICAgICAgPGZlR2F1c3NpYW5CbHVyIHN0ZERldmlhdGlvbj0iMiIgcmVzdWx0PSJjb2xvcmVkQmx1ciIvPgogICAgICA8ZmVNZXJnZT4KICAgICAgICA8ZmVNZXJnZU5vZGUgaW49ImNvbG9yZWRCbHVyIi8+CiAgICAgICAgPGZlTWVyZ2VOb2RlIGluPSJTb3VyY2VHcmFwaGljIi8+CiAgICAgIDwvZmVNZXJnZT4KICAgIDwvZmlsdGVyPgogIDwvZGVmcz4KICA8ZyBzdHJva2U9IiMwMGZmZmYiIHN0cm9rZS1widthPSIxIiBmaWxsPSJub25lIiBvcGFjaXR5PSIwLjYiPgogICAgPCEtLSBHcmlkIGxpbmVzIC0tPgogICAgPHBhdGggZD0iTTAgNDMgSDI1NiBNMCA4NiBIMjU2IE0wIDEyOSBIMjU2IE02NCAwIFYxNzIgTTEyOCAwIFYxNzIgTTE5MiAwIFYxNzIiIC8+CiAgICA8IS0tIFRhcmdldGluZyBjaXJjbGUgLS0+CiAgICA8Y2lyY2xlIGN4PSIxMjgiIGN5PSI4NiIgcj0iMzAiIC8+CiAgICA8Y2lyY2xlIGN4PSIxMjgiIGN5PSI4NiIgcj0iNjAiIC8+CiAgICA8cGF0aCBkPSJNMTI4IDAgVjMwIE0xMjggMTQyIFYxNzIgTTAgODYgSDMwIE0yMjYgODYgSDI1NiIgLz4KICA8L2c+CiAgPGcgZmlsbD0iIzAwZmZmZiIgZm9udC1mYW1pbHk9Im1vbm9zcGFjZSIgZm9udC1zaXplPSIxMCIgZmlsdGVyPSJ1cmwoI2dsb3cpIj4KICAgIDx0ZXh0IHg9IjEwIiB5PSIyMCI+U1lTOiBPTkxJTkU8L3RleHQ+CiAgICA8dGV4dCB4PSIxMCIgeT0iMTYyIj5UQVJHRVQ6IE4vQTwvdGV4dD4KICAgIDx0ZXh0IHg9IjIwMCIgeT0iMjAiPlBXUjogODclPC90ZXh0PgogIDwvZz4KPC9zdmc+";

export class ThermalScanner {
  public mesh: THREE.Group;

  constructor() {
    this.mesh = new THREE.Group();
    
    // Tablet Body
    const body = new THREE.Mesh(
        new THREE.BoxGeometry(0.28, 0.20, 0.02),
        new THREE.MeshStandardMaterial({ color: 0x1a1a1a, roughness: 0.5, metalness: 0.5 })
    );
    
    // Screen Material
    let screenMat: THREE.Material;
    if (SCREEN_TEXTURE_URL) {
        const loader = new THREE.TextureLoader();
        const texture = loader.load(SCREEN_TEXTURE_URL);
        // Make it glow
        screenMat = new THREE.MeshBasicMaterial({ map: texture }); 
    } else {
        screenMat = new THREE.MeshBasicMaterial({ color: 0x002244 });
    }

    const screen = new THREE.Mesh(new THREE.PlaneGeometry(0.24, 0.16), screenMat);
    screen.position.z = 0.011;
    
    // Camera Lens on back
    const lens = new THREE.Mesh(
        new THREE.CylinderGeometry(0.03, 0.03, 0.01),
        new THREE.MeshStandardMaterial({ color: 0x111111 })
    );
    lens.rotation.x = Math.PI / 2;
    lens.position.set(0.08, 0.05, -0.015);

    // Grip / Handle on side
    const grip = new THREE.Mesh(
        new THREE.BoxGeometry(0.03, 0.14, 0.04),
        new THREE.MeshStandardMaterial({ color: 0x050505, roughness: 0.9 })
    );
    grip.position.set(-0.155, 0, 0);

    this.mesh.add(body, screen, lens, grip);
  }
}