interface ITextures {
  name: string
  url: string
}

export interface IResources {
  textures?: ITextures[],
}

const filePath = '/map_icons/'
const fileSuffix = [
  'gradient',
  'redCircle',
  "label",
  "aperture",
  'glow',
  'light_column',
]

const textures = fileSuffix.map(item => {
  return {
    name: item,
    url: filePath + item + '.png'
  }
})

textures.push({
  name: 'earth',
  url: filePath + 'earth.jpg'
})

const resources: IResources = {
  textures
}


export {
  resources
}