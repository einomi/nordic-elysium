import * as THREE from 'three';

/**
 * @param {THREE.BufferGeometry} geometry
 * @param {THREE.Material} material
 *  */
function createMesh(geometry, material) {
  return new THREE.Mesh(geometry, material);
}

/**
 * @typedef LayerType
 * @property {THREE.Mesh} mesh
 *  */

/**
 * @class Layer
 * @implements {LayerType}
 */
export class Layer {
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
    this.mesh = createMesh(geometry, material);
  }
}

/** @typedef LayerMultiMeshType
 * @property {THREE.Mesh[]} meshes[]
 * */

/**
 * @class LayerMultiMesh
 * @implements {LayerMultiMeshType}
 */
export class LayerMultiMesh {
  constructor() {
    /** @type {THREE.Mesh[]} */
    this.meshes = [];
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
}
