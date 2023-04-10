import * as THREE from 'three';

/**
 * @typedef LayerType
 * @property {THREE.Mesh} mesh
 *  */

/**
 * @class Layer
 * @implements {LayerType}
 */
class Layer {
  constructor() {
    // noinspection UnnecessaryLocalVariableJS
    const nullObjectMesh = new THREE.Mesh();
    this.mesh = nullObjectMesh;
  }

  /**
   * @param {THREE.BufferGeometry} geometry
   * @param {THREE.Material} material
   *  */
  setMesh(geometry, material) {
    this.mesh = new THREE.Mesh(geometry, material);
  }
}

export default Layer;
