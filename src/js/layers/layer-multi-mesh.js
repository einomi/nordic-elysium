/** @typedef LayerMultiMeshType
 * @property {THREE.Mesh[]} meshes[]
 * */

import eventEmitter from '../event-emitter';

import { createMesh } from './layer';

/**
 * @class LayerMultiMesh
 * @implements {LayerMultiMeshType}
 */
export class LayerMultiMesh {
  constructor() {
    /** @type {THREE.Mesh[]} */
    this.meshes = [];

    eventEmitter.on('updateLayers', () => {
      this?.update();
    });
  }

  /**
   * @param {THREE.BufferGeometry} geometry
   * @param {THREE.Material} material
   */
  createMesh(geometry, material) {
    return createMesh(geometry, material);
  }

  /**
   * @param {THREE.Mesh} mesh
   */
  addMesh(mesh) {
    this.meshes.push(mesh);
  }

  update() {
    // pass
  }
}
