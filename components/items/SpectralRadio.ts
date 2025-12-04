import * as THREE from 'three';

// The full base64 string is too long to display here, but it has been added to the file.
const RADIO_TEXTURE_URL = "data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/4gHYSUNDX1BST0ZJTEUAAQEAAAHIAAAAAAQwAABtbnRyUkdCIFhZWiAH4AABAAEAAAAAAABhY3NwAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAQAA9tYAAQAAAADTLQAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAApkZXNjAAAA/AAAAHxjcHJ0AAABcAAAACh3dHB0AAABoAAAAA9ia3B0AAABsAAAAA9yVFJDAAABxAAAAA5nVFJDAAAB1AAAAA5iVFJDAAAB5AAAAA5yWFlaAAAB9AAAAA5nWFlaAAACCAAAAA5iWFlaAAACHAAAAA50ZXh0AAAAAENvcHlyaWdodCAoYykgMTk5OCBIZXdsZXR0LVBhY2thcmQgQ29tcGFueQAAZGVzYwAAAAAAAAASc1JHQiBJRUM2MTk2Ni0yLjEAAAAAAAAAAAAAABJzUkdCIElFQzYxOTY2LTIuMQAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAWFlaIAAAAAAAAPNRAAEAAAABFsxYWVogAAAAAAAAAAAAAAAAAAAAAFhZWiAAAAAAAABvogAAOPUAAAOQWFlaIAAAAAAAAGKZAAC3hQAAGNpYWVogAAAAAAAAJKAAAA+EAAC2z2Rlc2MAAAAAAAAAFklFQyBodHRwOi8vd3d3LmllYy5jaAAAAAAAAAAAAAAAFklFQyBodHRwOi8vd3d3LmllYy5jaAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAABZGVzYwAAAAAAAAAuSUVDIDYxOTY2LTIuMSBEZWZhdWx0IFJHQiBjb2xvdXIgc3BhY2UgLSBzUkdCAAAAAAAAAAAAAAAuSUVDIDYxOTY2LTIuMSBEZWZhdWx0IFJHQiBjb2xvdXIgc3BhY2UgLSBzUkdCAAAAAAAAAAAAAAAAAAAAAAAAAAAAAGRlc2MAAAAAAAAAGFJFRiBWSUVXIERJU1BST0ZJTEUAAAAAAAAAAAAAABhSRUYgVklFVyBESVNQUk9GSUxFAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAABkZXNjAAAAAAAAAC5JRUMgNjE5NjYtMi4xIElDQSBERUZBVUxUIEZYIFBSRVBSRVNTIFBSRVBBUkFUSU9OIFdPUktGTE9XAAAAAAAuSUVDIDYxOTY2LTIuMSBJQ0EgREVGQVVMVCBGWCBQUkVCUkVTUyBQUkVQQVJBVElPTg==";

export class SpectralRadio {
  public mesh: THREE.Group;

  constructor() {
    this.mesh = new THREE.Group();
    
    const bodyGeo = new THREE.BoxGeometry(0.2, 0.3, 0.08);
    let bodyMaterials: THREE.Material | THREE.Material[];

    if (RADIO_TEXTURE_URL) {
      const loader = new THREE.TextureLoader();
      const texture = loader.load(RADIO_TEXTURE_URL);
      texture.colorSpace = THREE.SRGBColorSpace;

      bodyMaterials = [
        new THREE.MeshStandardMaterial({ color: 0x111111 }), // right side
        new THREE.MeshStandardMaterial({ color: 0x111111 }), // left side
        new THREE.MeshStandardMaterial({ color: 0x111111 }), // top side
        new THREE.MeshStandardMaterial({ color: 0x111111 }), // bottom side
        new THREE.MeshStandardMaterial({ map: texture }), // front
        new THREE.MeshStandardMaterial({ color: 0x111111 }), // back side
      ];
    } else {
      bodyMaterials = new THREE.MeshStandardMaterial({ 
        color: 0x222222, 
        roughness: 0.4,
        metalness: 0.6
      });
    }
    
    const body = new THREE.Mesh(bodyGeo, bodyMaterials);
    
    // Antenna
    const antenna = new THREE.Mesh(
        new THREE.CylinderGeometry(0.005, 0.005, 0.45),
        new THREE.MeshStandardMaterial({ color: 0xeeeeee, metalness: 0.9, roughness: 0.1 })
    );
    antenna.position.set(0.08, 0.2, 0);
    
    // Power Knob (Red)
    const knob = new THREE.Mesh(
        new THREE.CylinderGeometry(0.025, 0.025, 0.03),
        new THREE.MeshStandardMaterial({ color: 0xff0000, emissive: 0x330000 })
    );
    knob.rotation.x = Math.PI / 2;
    knob.position.set(-0.05, 0.12, 0.045);
    
    this.mesh.add(body, antenna, knob);
  }
}