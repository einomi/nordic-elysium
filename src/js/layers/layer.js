import * as THREE from 'three';

/**
 * @param {THREE.BufferGeometry} geometry
 * @param {*} material
 * @returns {THREE.Mesh<*, *>}
 */
function createMesh(geometry, material) {
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
 *  */

/**
 * @template {NonArrayMaterial<import('three').Material>} MaterialType
 * @class Layer
 * @implements {LayerType<MaterialType>}
 */
export class Layer {
  constructor() {
    const material = /** @type {MaterialType} */ (new THREE.Material());

    // noinspection UnnecessaryLocalVariableJS
    const nullObjectMesh = new THREE.Mesh(new THREE.BufferGeometry(), material);
    this.mesh = nullObjectMesh;
  }

  /**
   * @param {THREE.BufferGeometry} geometry
   * @param {MaterialType} material
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
