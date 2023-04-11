import * as THREE from 'three';

import { Layer } from '../layer';
import { textureLoader } from '../../utils/scene-utils';
import { env } from '../../env';
import vertexShader from '../../shaders/vertex.glsl';

import cityFragmentShader from './shaders/city-fragment.glsl';

/** @extends {Layer<THREE.ShaderMaterial>} */
class CityLayer extends Layer {
  constructor() {
    super();

    const cityTexture = textureLoader.load('/city.png');
    const cityAspectRatio = 2136 / 688;

    const cityAspectScale =
      env.designResolution.value.height /
      env.designResolution.value.width /
      (env.viewportResolution.value.height /
        env.viewportResolution.value.width);

    this.height =
      (env.designAspectRatio / cityAspectRatio) *
      env.viewportResolution.value.height *
      cityAspectScale;

    const cityGeometry = new THREE.PlaneGeometry(
      env.viewportResolution.value.width,
      this.height
    );

    // load river-mask texture
    const riverMaskTexture = new THREE.TextureLoader().load('/river-mask.png');

    // load water-displacement texture
    const waterDisplacementTexture = new THREE.TextureLoader().load(
      '/water-displacement.jpg'
    );

    const uniformsCity = {
      u_texture: { value: cityTexture },
      u_river_mask: { value: riverMaskTexture },
      u_water_displacement: { value: waterDisplacementTexture },
      u_time: { value: 0.0 },
      u_resolution: env.viewportResolution,
      u_scene_resolution: env.designResolution,
      u_scene_aspect_ratio: { value: env.designAspectRatio },
      u_viewport_aspect_ratio: { value: env.viewportAspectRatio },
    };

    const cityMaterial = new THREE.ShaderMaterial({
      transparent: true,
      side: THREE.FrontSide,
      vertexShader,
      fragmentShader: cityFragmentShader,
      uniforms: uniformsCity,
    });

    this.setMesh(cityGeometry, cityMaterial);

    // move to the bottom
    this.mesh.position.y =
      this.height / 2 - env.viewportResolution.value.height / 2;

    this.mesh.position.z = 1;

    this.mesh.scale.set(1.1, 1.1, 1);
  }
}

export default CityLayer;
