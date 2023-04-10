import * as THREE from 'three';

class Layer {
  constructor() {
    // pass
  }

  /**
   * @param {THREE.BufferGeometry} geometry
   * @param {THREE.Material} material
   *  */
  createMesh(geometry, material) {
    return new THREE.Mesh(geometry, material);
  }
}

export default Layer;
