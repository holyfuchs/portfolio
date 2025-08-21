import {
  BufferAttribute, BufferGeometry, Color, DoubleSide, Group, Material, Mesh, MeshBasicMaterial, NormalBlending,
  Object3D,
  Points, PointsMaterial, ShaderMaterial,
  SphereGeometry, Sprite, SpriteMaterial, Texture, TextureLoader, Vector3, Vector2, MeshLambertMaterial, MeshStandardMaterial
} from "three";
import * as THREE from "three";

// import html2canvas from "html2canvas";

import { createLightPillar, createPointMesh, createWaveMesh, getCirclePoints, lon2xyz } from "../Utils/common";
import gsap from "gsap";
import { flyArc } from "../Utils/arc";

export type punctuation = {
  circleColor: number,
  lightColumn: {
    startColor: number,
    endColor: number,
  },
}

type options = {
  images: {
    name: string,
    url: string,
    N: number,
    E: number,
  }[],
  flights: {
    start: {
      N: number,
      E: number,
    },
    ends: {
      N: number,
      E: number,
    }[],
  }[],
  dom: HTMLElement,
  textures: Record<string, Texture>,
  earth: {
    radius: number,
    rotateSpeed: number,
  },
  camera: THREE.Camera,
  punctuation: punctuation,
  flyLine: {
    color: number, 
    speed: number, 
    flyLineColor: number 
  },
}
type uniforms = {
  map: { value: Texture },
}

export default class earth {

  public group: Group;
  public earthGroup: Group;

  public around: BufferGeometry
  public aroundPoints: Points<BufferGeometry, PointsMaterial>;

  public options: options;
  public uniforms: uniforms
  public timeValue: number;

  public earth: Mesh<SphereGeometry, ShaderMaterial>;
  public punctuationMaterial: MeshBasicMaterial;
  public markupPoint: Group;
  public waveMeshArr: Object3D[];

  public circleLineList: any[];
  public circleList: any[];
  public x: number;
  public n: number;
  public flyLineArcGroup: Group;
  public locationSprites: Group;
  public camera: THREE.Camera;

  constructor(options: options) {

    this.options = options;
    this.camera = options.camera;  // Add this line to store the camera reference

    this.group = new Group()
    this.group.name = "group";
    this.group.scale.set(0, 0, 0)
    this.earthGroup = new Group()
    this.group.add(this.earthGroup)
    this.earthGroup.name = "EarthGroup";

    this.markupPoint = new Group()
    this.markupPoint.name = "markupPoint"
    this.waveMeshArr = []

    this.circleLineList = []
    this.circleList = [];
    this.x = 0;
    this.n = 0;

    // this.isRotation = this.options.earth.isRotation

    this.timeValue = 1
    this.uniforms = {
      map: {
        value: null,
      },
    };

    this.locationSprites = new Group();
    this.locationSprites.name = "locationSprites";
    this.earthGroup.add(this.locationSprites);

  }

  async init(): Promise<void> {
    return new Promise(async (resolve) => {

      this.createEarth(); 
      this.createStars(); 
      this.createEarthGlow() 
      this.createEarthAperture() 
      await this.createMarkupPoint() 
      await this.creteImages() 
      this.createFlyLine() 

      this.show()
      resolve()
    })
  }


  createEarth() {
    const earth_geometry = new SphereGeometry(
      this.options.earth.radius,
      32,
      32
    );

    this.uniforms.map.value = this.options.textures.earth;

    this.options.textures.earth.colorSpace = THREE.SRGBColorSpace;
    const earth_material = new MeshBasicMaterial({
      map: this.options.textures.earth,
    });

    this.earth = new Mesh(earth_geometry, earth_material);
    this.earth.name = "earth";
    this.earthGroup.add(this.earth);

  }

  createStars() {

    const vertices = []
    const colors = []
    for (let i = 0; i < 500; i++) {
      const vertex = new Vector3();
      vertex.x = 800 * Math.random() - 300;
      vertex.y = 800 * Math.random() - 300;
      vertex.z = 800 * Math.random() - 300;
      vertices.push(vertex.x, vertex.y, vertex.z);
      colors.push(new Color(1, 1, 1));
    }

    this.around = new BufferGeometry()
    this.around.setAttribute("position", new BufferAttribute(new Float32Array(vertices), 3));
    this.around.setAttribute("color", new BufferAttribute(new Float32Array(colors), 3));

    const aroundMaterial = new PointsMaterial({
      size: 2,
      sizeAttenuation: true, 
      color: 0x4d76cf,
      transparent: true,
      opacity: 1,
      map: this.options.textures.gradient,
    });

    this.aroundPoints = new Points(this.around, aroundMaterial);
    this.aroundPoints.name = "stars";
    this.aroundPoints.scale.set(1, 1, 1);
    this.group.add(this.aroundPoints);
  }

  createEarthGlow() {
    const R = this.options.earth.radius; 

    const texture = this.options.textures.glow; 

    const spriteMaterial = new SpriteMaterial({
      map: texture, 
      color: 0x4390d1,
      transparent: true, 
      opacity: 1, 
      depthWrite: false, 
    });

    const sprite = new Sprite(spriteMaterial);
    sprite.scale.set(R * 3.0, R * 3.0, 1); 
    this.earthGroup.add(sprite);
  }

  createEarthAperture() {

    const vertexShader = [
      "varying vec3	vVertexWorldPosition;",
      "varying vec3	vVertexNormal;",
      "varying vec4	vFragColor;",
      "void main(){",
      "	vVertexNormal	= normalize(normalMatrix * normal);",
      "	vVertexWorldPosition	= (modelMatrix * vec4(position, 1.0)).xyz;", 
      "	// set gl_Position",
      "	gl_Position	= projectionMatrix * modelViewMatrix * vec4(position, 1.0);",
      "}",
    ].join("\n");

    const AeroSphere = {
      uniforms: {
        coeficient: {
          type: "f",
          value: 1.0,
        },
        power: {
          type: "f",
          value: 3,
        },
        glowColor: {
          type: "c",
          value: new Color(0x4390d1),
        },
      },
      vertexShader: vertexShader,
      fragmentShader: [
        "uniform vec3	glowColor;",
        "uniform float	coeficient;",
        "uniform float	power;",

        "varying vec3	vVertexNormal;",
        "varying vec3	vVertexWorldPosition;",

        "varying vec4	vFragColor;",

        "void main(){",
        "	vec3 worldCameraToVertex = vVertexWorldPosition - cameraPosition;", 
        "	vec3 viewCameraToVertex	= (viewMatrix * vec4(worldCameraToVertex, 0.0)).xyz;", 
        "	viewCameraToVertex= normalize(viewCameraToVertex);", 
        "	float intensity	= pow(coeficient + dot(vVertexNormal, viewCameraToVertex), power);",
        "	gl_FragColor = vec4(glowColor, intensity);",
        "}",
      ].join("\n"),
    };
    const material1 = new ShaderMaterial({
      uniforms: AeroSphere.uniforms,
      vertexShader: AeroSphere.vertexShader,
      fragmentShader: AeroSphere.fragmentShader,
      blending: NormalBlending,
      transparent: true,
      depthWrite: false,
    });
    const sphere = new SphereGeometry(
      this.options.earth.radius + 0,
      50,
      50
    );
    const mesh = new Mesh(sphere, material1);
    this.earthGroup.add(mesh);
  }

  async createMarkupPoint() {

    await Promise.all(this.options.flights.map(async (item) => {

      const radius = this.options.earth.radius;
      const lon = item.start.E; 
      const lat = item.start.N; 

      this.punctuationMaterial = new MeshBasicMaterial({
        color: this.options.punctuation.circleColor,
        map: this.options.textures.label,
        transparent: true, 
        depthWrite: false, 
      });

      const mesh = createPointMesh({ radius, lon, lat, material: this.punctuationMaterial }); 
      this.markupPoint.add(mesh);
      const LightPillar = createLightPillar({
        radius: this.options.earth.radius,
        lon,
        lat,
        index: 0,
        textures: this.options.textures,
        punctuation: this.options.punctuation,
      }); 
      this.markupPoint.add(LightPillar);
      const WaveMesh = createWaveMesh({ radius, lon, lat, textures: this.options.textures }); 
      this.markupPoint.add(WaveMesh);
      this.waveMeshArr.push(WaveMesh);

      await Promise.all(item.ends.map((obj) => {
        const lon = obj.E; 
        const lat = obj.N; 
        const mesh = createPointMesh({ radius, lon, lat, material: this.punctuationMaterial }); 
        this.markupPoint.add(mesh);
        const LightPillar = createLightPillar({
          radius: this.options.earth.radius,
          lon,
          lat,
          index: 1,
          textures: this.options.textures,
          punctuation: this.options.punctuation
        }); 
        this.markupPoint.add(LightPillar);
        const WaveMesh = createWaveMesh({ radius, lon, lat, textures: this.options.textures }); 
        this.markupPoint.add(WaveMesh);
        this.waveMeshArr.push(WaveMesh);
      }))
      this.earthGroup.add(this.markupPoint)
    }))
  }

  async creteImages() {
    await Promise.all(this.options.images.map(async item => {
      let cityArray = [];
      cityArray.push(item);
      await Promise.all(cityArray.map(async e => {
        const p = lon2xyz(this.options.earth.radius * 1.001, e.E, e.N);
        
        // Load the location image
        const imageUrl = `/locations/${e.name.toLowerCase()}.jpg`;
        const texture = await new Promise<THREE.Texture>((resolve, reject) => {
          new TextureLoader().load(
            imageUrl,
            (texture) => {
              // Create a canvas to modify the image
              const canvas = document.createElement('canvas');
              const ctx = canvas.getContext('2d');
              const img = texture.image;
              
              // Set canvas size to match image
              canvas.width = img.width;
              canvas.height = img.height;
              
              // Draw the original image
              ctx.drawImage(img, 0, 0);
              
              // Create radial gradient for fade effect
              const gradient = ctx.createRadialGradient(
                canvas.width / 2, canvas.height / 2, 0,
                canvas.width / 2, canvas.height / 2, canvas.width / 2
              );
              gradient.addColorStop(0, 'rgba(255,255,255,1)');
              gradient.addColorStop(0.5, 'rgba(255,255,255,1)');
              gradient.addColorStop(0.8, 'rgba(255,255,255,.2)');
              gradient.addColorStop(1, 'rgba(255,255,255,0)');
              
              // Apply the gradient as a mask
              ctx.globalCompositeOperation = 'destination-in';
              ctx.fillStyle = gradient;
              ctx.fillRect(0, 0, canvas.width, canvas.height);
              
              // Create new texture from canvas
              const newTexture = new THREE.Texture(canvas);
              newTexture.needsUpdate = true;
              newTexture.colorSpace = THREE.SRGBColorSpace;
              resolve(newTexture);
            },
            undefined,
            (error) => {
              console.error(error)
            }
          );
        });
        
        const material = new SpriteMaterial({
          map: texture,
          transparent: true,
        });

        const sprite = new Sprite(material);
        const aspectRatio = texture.image.width / texture.image.height;
        const baseScale = 10; 
        sprite.scale.set(baseScale * aspectRatio, baseScale, 1);
        sprite.position.set(p.x * 1.3, p.y * 1.3, p.z * 1.3);
        sprite.userData.baseScale = baseScale;
        sprite.userData.aspectRatio = aspectRatio;
        this.locationSprites.add(sprite);  // Add to locationSprites group instead of earth
      }));
    }));
  }

  createFlyLine() {

    this.flyLineArcGroup = new Group();
    this.flyLineArcGroup.userData['flyLineArray'] = []
    this.earthGroup.add(this.flyLineArcGroup)

    this.options.flights.forEach((flight) => {
      flight.ends.forEach(item => {

        const arcline = flyArc(
          this.options.earth.radius,
          flight.start.E,
          flight.start.N,
          item.E,
          item.N,
          this.options.flyLine
        );

        this.flyLineArcGroup.add(arcline); 
        this.flyLineArcGroup.userData['flyLineArray'].push(arcline.userData['flyLine'])
      });

    })

  }

  show() {
    gsap.to(this.group.scale, {
      x: 1,
      y: 1,
      z: 1,
      duration: 2,
      ease: "Quadratic",
    })
  }

  render() {

    this.flyLineArcGroup?.userData['flyLineArray']?.forEach(fly => {
      fly.rotation.z += this.options.flyLine.speed; 
      if (fly.rotation.z >= fly.flyEndAngle) fly.rotation.z = 0;
    })

    if (this.locationSprites && this.camera) {
        const cameraPosition = new Vector3();
        const cameraDirection = new Vector3();
        this.camera.getWorldPosition(cameraPosition);
        this.camera.getWorldDirection(cameraDirection);
        
        let closestSprite: Sprite | null = null;
        let closestDistance = Infinity;
        
        // Temporary vector for world position calculations
        const worldPosition = new Vector3();
        const toSprite = new Vector3();
        
        // Find the closest sprite based on angle to camera view direction
        this.locationSprites.children.forEach((sprite: Sprite) => {
            // Get sprite's world position accounting for all parent transformations
            sprite.getWorldPosition(worldPosition);
            
            // Calculate vector from camera to sprite using world position
            toSprite.copy(worldPosition).sub(cameraPosition).normalize();
            
            // Calculate angle between camera direction and sprite direction
            const angle = cameraDirection.angleTo(toSprite);
            
            // Calculate distance factor (combination of angle and actual distance)
            const actualDistance = worldPosition.distanceTo(cameraPosition);
            const distanceFactor = angle * actualDistance;
            
            if (distanceFactor < closestDistance && distanceFactor < 20) {
                closestDistance = distanceFactor;
                closestSprite = sprite;
            }
        });
        
        // Scale sprites based on distance
        this.locationSprites.children.forEach((sprite: Sprite) => {
            const baseScale = sprite.userData.baseScale;
            const aspectRatio = sprite.userData.aspectRatio;
            
            if (sprite === closestSprite) {
                // Make closest sprite larger with a more dramatic scale
                sprite.scale.set(baseScale * 3 * aspectRatio, baseScale * 3, 1);
            } else {
                // Make other sprites smaller than the base scale
                const targetScale = baseScale * 0.7;
                const currentScale = sprite.scale.y;
                const newScale = THREE.MathUtils.lerp(currentScale, targetScale, 0.1);
                sprite.scale.set(newScale * aspectRatio, newScale, 1);
            }
        });
    }

    if (this.waveMeshArr.length) {
      this.waveMeshArr.forEach((mesh: Mesh) => {
        mesh.userData['scale'] += 0.007;
        mesh.scale.set(
          mesh.userData['size'] * mesh.userData['scale'],
          mesh.userData['size'] * mesh.userData['scale'],
          mesh.userData['size'] * mesh.userData['scale']
        );
        if (mesh.userData['scale'] <= 1.5) {
          (mesh.material as Material).opacity = (mesh.userData['scale'] - 1) * 2; 
        } else if (mesh.userData['scale'] > 1.5 && mesh.userData['scale'] <= 2) {
          (mesh.material as Material).opacity = 1 - (mesh.userData['scale'] - 1.5) * 2; 
        } else {
          mesh.userData['scale'] = 1;
        }
      });
    }

  }

}