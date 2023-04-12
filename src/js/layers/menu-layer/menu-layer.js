import * as THREE from 'three';

import { Layer } from '../layer';
import { textureLoader } from '../../utils/scene-utils';
import { env } from '../../env';
import vertexShader from '../../shaders/vertex.glsl';

import menuFragmentShader from './shaders/menu-fragment.glsl';

/**
 * @extends {Layer<THREE.ShaderMaterial>}
 *  */
class MenuLayer extends Layer {
  constructor() {
    super();

    this.opacity = {
      value: 0,
    };

    this.geometry = this.getGeometry();

    // eslint-disable-next-line sonarjs/prefer-object-literal
    const menuUniforms = {
      u_texture: { value: textureLoader.load('/menu3.png') },
      u_time: { value: 0.0 },
      u_mouse: { value: { x: 0.0, y: 0.0 } },
      u_duration: { value: 8.0 },
      u_opacity: this.opacity,
      u_resolution: env.viewportResolution,
    };

    this.material = new THREE.ShaderMaterial({
      uniforms: menuUniforms,
      vertexShader,
      fragmentShader: menuFragmentShader,
      transparent: true,
      side: THREE.FrontSide,
      depthWrite: false,
    });

    this.setMesh(this.geometry, this.material);
    this.mesh.position.z = 2;
  }

  getGeometry() {
    const isPortrait =
      env.viewportResolution.value.height > env.viewportResolution.value.width;
    const width = isPortrait
      ? env.viewportResolution.value.width
      : env.viewportResolution.value.width / 1.5;
    const height = isPortrait
      ? env.viewportResolution.value.height / 1.5
      : env.viewportResolution.value.height + 100;

    const geometry = new THREE.PlaneGeometry(width, height);

    // change position of plane to right side
    geometry.translate(env.viewportResolution.value.width / 5, 0, 0);

    return geometry;
  }

  // update() {
  //   super.update();
  // }
}

export default MenuLayer;
