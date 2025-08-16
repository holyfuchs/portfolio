import {
  MeshBasicMaterial, PerspectiveCamera,
  Scene, ShaderMaterial, WebGLRenderer
} from "three";
import {
  OrbitControls
} from "three/examples/jsm/controls/OrbitControls";

import type { IWord } from '../interfaces/IWord'
import { Basic } from './Basic'
import Sizes from '../Utils/Sizes'
import { Resources } from './Resources';
import Earth from './Earth'
import Data from './Data'

export default class World {
  public basic: Basic;
  public scene: Scene;
  public camera: PerspectiveCamera;
  public renderer: WebGLRenderer
  public controls: OrbitControls;
  public sizes: Sizes;
  public material: ShaderMaterial | MeshBasicMaterial;
  public resources: Resources;
  public option: IWord;
  public earth: Earth | null = null;

  constructor(option: IWord) {
    this.option = option

    this.basic = new Basic(option.dom)
    this.scene = this.basic.scene
    this.renderer = this.basic.renderer
    this.controls = this.basic.controls
    this.camera = this.basic.camera

    this.sizes = new Sizes({ dom: option.dom })

    this.sizes.$on('resize', () => {
      this.renderer.setSize(Number(this.sizes.viewport.width), Number(this.sizes.viewport.height))
      this.camera.aspect = Number(this.sizes.viewport.width) / Number(this.sizes.viewport.height)
      this.camera.updateProjectionMatrix()
    })

    this.resources = new Resources(async () => {
      await this.createEarth()
      this.render()
    })

    // Configure controls for better mobile handling
    this.controls.enableDamping = true;
    this.controls.dampingFactor = 0.05;
    this.controls.rotateSpeed = 0.5;
    this.controls.enableZoom = true;
    this.controls.enablePan = false; // Disable panning on mobile
    this.controls.minDistance = 120;
    this.controls.maxDistance = 300;
    
    // Prevent default touch behavior
    option.dom.addEventListener('touchmove', (e) => {
      e.preventDefault();
    }, { passive: false });
  }

  async createEarth() {
    this.earth = new Earth({
      images: Data.images,
      flights: Data.flights,
      dom: this.option.dom,
      textures: this.resources.textures,
      earth: {
        radius: 50,
        rotateSpeed: 0.002,
        isRotation: true
      },
      camera: this.camera,
      punctuation: {
        circleColor: 0x3892ff,
        lightColumn: {
          startColor: 0xe4007f,
          endColor: 0xffffff,
        },
      },
      flyLine: {
        color: 0xf3ae76,
        flyLineColor: 0xff7714,
        speed: 0.004,
      }
    })

    this.scene.add(this.earth.group)

    await this.earth.init()

    const loading = document.querySelector('#loading')
    loading?.classList.add('out')

  }

  public render() {
    requestAnimationFrame(this.render.bind(this))
    this.renderer.render(this.scene, this.camera)
    this.controls && this.controls.update()
    this.earth && this.earth.render()
  }
}