import * as THREE from 'three';

import { LayerMultiMesh } from '../layer-multi-mesh';
import { env } from '../../env';
import { textureLoader } from '../../utils/scene-utils';

// create type using jsdoc
/**
 * @typedef SmokeLayerType
 * @property {number} positionZ
 */

/**
 * @class SmokeLayer
 * @extends LayerMultiMesh
 * @implements SmokeLayerType
 */
class SmokeLayer extends LayerMultiMesh {
  constructor() {
    super();

    this.smokeCount = 2;
    this.positionZ = 11;

    const smokeTexture = textureLoader.load('/smoke.png');
    // scene.background = smokeTexture;
    smokeTexture.encoding = THREE.sRGBEncoding;

    this.material = new THREE.MeshLambertMaterial({
      map: smokeTexture,
      emissive: '#eee',
      opacity: 0.1,
      transparent: true,
    });

    this.createMeshes();
  }

  createMeshes() {
    for (let smokeIndex = 0; smokeIndex <= this.smokeCount; smokeIndex += 1) {
      const scale = this.getScale(smokeIndex);
      const smokeSize = this.getSize(smokeIndex);
      const geometry = this.getGeometry(smokeSize);
      const smokeMesh = this.createMesh(geometry, this.material);

      smokeMesh.scale.set(scale, scale, 1);

      // stick elements to the right side of the screen
      smokeMesh.position.x = this.getPositionX(smokeSize, smokeIndex);
      smokeMesh.position.y = this.getPositionY(smokeSize, smokeIndex);
      smokeMesh.position.z = this.positionZ;

      this.addMesh(smokeMesh);
    }
  }

  /** @param {number} index */
  getScale(index) {
    return 7 + index;
  }

  /** @param {number} index */
  getSize(index) {
    return (
      env.viewportResolution.value.width * 0.05 +
      index * env.viewportResolution.value.width * 0.015
    );
  }

  /** @param {number} size */
  getGeometry(size) {
    return new THREE.PlaneGeometry(size, size);
  }

  /**
   * @param {number} size
   * @param {number} index
   */
  getPositionX(size, index) {
    return (
      env.viewportResolution.value.width / 2 -
      size / 4 +
      index * env.viewportResolution.value.width * 0.001
    );
  }

  /**
   * @param {number} size
   * @param {number} index
   */
  getPositionY(size, index) {
    return (
      -env.viewportResolution.value.height / 2 -
      size / 2 +
      index * env.viewportResolution.value.height * 0.3
    );
  }

  update() {
    this.meshes.forEach((mesh, index) => {
      // update geometry
      const smokeSize = this.getSize(index);
      mesh.geometry = this.getGeometry(smokeSize);
      mesh.position.x = this.getPositionX(smokeSize, index);
      mesh.position.y = this.getPositionY(smokeSize, index);
    });
  }
}

export default SmokeLayer;
