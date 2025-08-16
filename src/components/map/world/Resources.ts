
import { LoadingManager, Texture, TextureLoader } from 'three';
import { resources } from './Assets'
export class Resources {
  private manager: LoadingManager
  private callback: () => void;
  private textureLoader!: InstanceType<typeof TextureLoader>;
  public textures: Record<string, Texture>;
  constructor(callback: () => void) {
    this.callback = callback 

    this.textures = {} 

    this.setLoadingManager()
    this.loadResources()
  }

  private setLoadingManager() {

    this.manager = new LoadingManager()
    this.manager.onStart = () => {
      console.log('start loading resources')
    }
    this.manager.onLoad = () => {
      this.callback()
    }
    this.manager.onProgress = (url) => {
      console.log(`loading ${url}`)
    }

    this.manager.onError = url => {
      console.log('load failed: ' + url)
    }

  }

  private loadResources(): void {
    this.textureLoader = new TextureLoader(this.manager)
    resources.textures?.forEach((item) => {
      this.textureLoader.load(item.url, (t) => {
        this.textures[item.name] = t
      })
    })
  }
}
