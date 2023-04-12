import * as THREE from 'three';

import eventEmitter from '../event-emitter';
import { env } from '../env';

/**
 * @param {THREE.BufferGeometry} geometry
 * @param {*} material
 * @returns {THREE.Mesh<*, *>}
 */
export function createMesh(geometry, material) {
  return new THREE.Mesh(geometry, material);
}

/**
 * @template T
 * @typedef NonArrayMaterial
 * @type {T extends any[] ? never : T}
 */

/**
 * @template {NonArrayMaterial<import('three').Material>} T
 * @typedef LayerType
 * @property {THREE.Mesh<THREE.BufferGeometry, T>} mesh
 * @property {THREE.BufferGeometry} geometry
 *  */

/**
 * @template {NonArrayMaterial<import('three').Material | import('three').ShaderMaterial>} MaterialType
 * @class Layer
 * @implements {LayerType<MaterialType>}
 */
export class Layer {
  constructor() {
    const material = /** @type {MaterialType} */ (new THREE.Material());

    // noinspection UnnecessaryLocalVariableJS
    const nullObjectMesh = new THREE.Mesh(new THREE.BufferGeometry(), material);
    this.mesh = nullObjectMesh;

    // noinspection UnnecessaryLocalVariableJS
    const nullObjectGeometry = new THREE.BufferGeometry();
    this.geometry = nullObjectGeometry;

    eventEmitter.on('updateLayers', () => {
      this?.update();
    });
  }

  /**
   * @param {THREE.BufferGeometry} geometry
   * @param {MaterialType} material
   *  */
  setMesh(geometry, material) {
    this.mesh = createMesh(geometry, material);
  }

  getGeometry() {
    return new THREE.PlaneGeometry(
      env.viewportResolution.value.width,
      env.viewportResolution.value.height
    );
  }

  update() {
    this.geometry.dispose();
    this.geometry = this.getGeometry();
    this.mesh.geometry = this.geometry;

    if (this.mesh.material instanceof THREE.ShaderMaterial) {
      this.mesh.material.uniforms.u_resolution = env.viewportResolution;
    }
  }
}
