import * as THREE from 'three';

import { Layer } from '../layer';
import vertexShader from '../../shaders/vertex.glsl';
import { textureLoader } from '../../utils/scene-utils';
import { env } from '../../env';

import bgFragmentShader from './shaders/landscape-fragment.glsl';

/** @extends {Layer<THREE.ShaderMaterial>} */
class LandscapeLayer extends Layer {
  constructor() {
    super();

    const uniformsBackground = {
      u_texture: { value: textureLoader.load('/scenery.jpg') },
      u_time: { value: 0.0 },
      u_resolution: env.viewportResolution,
      u_mouse: { value: { x: 0.0, y: 0.0 } },
      u_duration: { value: 8.0 },
      u_texture_width: { value: 2136 },
      u_texture_height: { value: 1113 },
    };

    const material = new THREE.ShaderMaterial({
      uniforms: uniformsBackground,
      vertexShader,
      fragmentShader: bgFragmentShader,
      transparent: false,
      side: THREE.FrontSide,
    });

    this.geometry = new THREE.PlaneGeometry(
      env.viewportResolution.value.width,
      env.viewportResolution.value.height
    );

    this.setMesh(this.geometry, material);
  }
}

export default LandscapeLayer;
