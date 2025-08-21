import * as THREE from 'three';
import {
  OrbitControls
} from "three/examples/jsm/controls/OrbitControls";

export class Basic {
  public scene: THREE.Scene;
  public camera: THREE.PerspectiveCamera;
  public renderer: THREE.WebGLRenderer
  public controls: OrbitControls;
  public dom: HTMLElement;
  public previousTimeout: NodeJS.Timeout | null = null;
  public angle: number = 0;

  constructor(dom: HTMLElement) {
    this.dom = dom
    this.initScenes()
    this.setControls()
  }
  initScenes() {
    this.scene = new THREE.Scene();

    this.camera = new THREE.PerspectiveCamera(
      45,
      window.innerWidth / window.innerHeight,
      1,
      100000
    );
    this.camera.position.set(0, 30, -300)


    this.renderer = new THREE.WebGLRenderer({
      alpha: true, 
      antialias: true, 
    });
    this.dom.appendChild(this.renderer.domElement);
    // this.setControls()
  }


  setControls() {
    this.controls = new OrbitControls(this.camera, this.renderer.domElement);
    
    this.controls.autoRotate = true; // Enable auto-rotation
    this.controls.autoRotateSpeed = -1
    this.controls.enableDamping = true;
    this.controls.dampingFactor = 0.05;
    this.controls.enableZoom = true;
    this.controls.minDistance = 100;
    this.controls.maxDistance = 200;
    this.controls.enablePan = false;
    
    // Stop auto-rotation when user starts manually controlling
    this.controls.addEventListener('start', () => {
      if (this.previousTimeout) {
        clearTimeout(this.previousTimeout);
      }
      this.controls.autoRotate = false;
    });
    
    // Re-enable auto-rotation after user stops controlling (with a delay)
    this.controls.addEventListener('end', () => {
      if (this.previousTimeout) {
        clearTimeout(this.previousTimeout);
      }
      this.previousTimeout = setTimeout(() => {
        this.controls.autoRotate = true;
      }, 3000); // 1 second delay before re-enabling
    });
    this.render()
  }

  render() {
    this.controls.update()
    
    if (this.controls.autoRotate) {
      // Slowly move angle towards Math.PI / 2
      const lerpFactor = 0.005; // Adjust for speed of approach
      this.angle += (0 - this.angle) * lerpFactor;
    } else {
      this.angle = Math.PI / 2
    }

    this.controls.maxPolarAngle = Math.PI / 2 + this.angle
    this.controls.minPolarAngle = Math.PI / 2 - this.angle
    
    requestAnimationFrame(() => {
      this.render()
    })
  }


}