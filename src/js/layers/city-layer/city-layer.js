import * as THREE from 'three';

import { Layer } from '../layer';
import { textureLoader } from '../../utils/scene-utils';
import { env } from '../../env';
import vertexShader from '../../shaders/vertex.glsl';
import eventEmitter from '../../event-emitter';

import cityFragmentShader from './shaders/city-fragment.glsl';

/**
 * @typedef {Object} CityLayerType
 * @property {THREE.PlaneGeometry} geometry
 * @property {number} height
 * @property {number} cityAspectRatio
 * @property {THREE.ShaderMaterial} material
 * @property {THREE.Mesh} mesh
 * @property {() => THREE.PlaneGeometry} getGeometry
 * @property {() => number} getHeight
 */

/**
 * @extends {Layer<THREE.ShaderMaterial>}
 * @implements {CityLayerType}
 *  */
class CityLayer extends Layer {
  constructor() {
    super();

    const cityTexture = textureLoader.load('/city.png');
    this.cityAspectRatio = 2136 / 688;

    this.height = -1;
    this.updateHeight();
    this.geometry = this.getGeometry();

    // load river-mask texture
    const riverMaskTexture = textureLoader.load('/river-mask.png');

    // load water-displacement texture
    const waterDisplacementTexture = textureLoader.load(
      '/water-displacement.jpg'
    );

    const uniformsCity = {
      u_texture: { value: cityTexture },
      u_river_mask: { value: riverMaskTexture },
      u_water_displacement: { value: waterDisplacementTexture },
      u_time: { value: 0.0 },
      u_resolution: env.viewportResolution,
    };

    this.material = new THREE.ShaderMaterial({
      transparent: true,
      side: THREE.FrontSide,
      vertexShader,
      fragmentShader: cityFragmentShader,
      uniforms: uniformsCity,
    });

    this.setMesh(this.geometry, this.material);

    this.mesh.position.z = 1;

    this.initialScale = 1.2;

    this.mesh.scale.set(this.initialScale, this.initialScale, 1);

    this.moveToBottom();
  }

  getHeight() {
    const cityAspectScale =
      env.designResolution.value.height /
      env.designResolution.value.width /
      (env.viewportResolution.value.height /
        env.viewportResolution.value.width);

    return (
      (env.designAspectRatio / this.cityAspectRatio) *
      env.viewportResolution.value.height *
      cityAspectScale
    );
  }

  updateHeight() {
    this.height = this.getHeight();
    eventEmitter.emit('cityHeightChange');
  }

  getGeometry() {
    return new THREE.PlaneGeometry(
      env.viewportResolution.value.width,
      this.height
    );
  }

  moveToBottom() {
    this.mesh.position.y =
      this.height / 2 - env.viewportResolution.value.height / 2;
  }

  update() {
    this.updateHeight();
    super.update();
    this.moveToBottom();
  }
}

export default CityLayer;
