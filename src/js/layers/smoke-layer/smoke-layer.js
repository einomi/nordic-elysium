import * as THREE from 'three';

import { LayerMultiMesh } from '../layer';
import { env } from '../../env';

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

    const smokeTexture = new THREE.TextureLoader().load('/smoke.png');
    // scene.background = smokeTexture;
    smokeTexture.encoding = THREE.sRGBEncoding;

    const smokeMaterial = new THREE.MeshLambertMaterial({
      map: smokeTexture,
      emissive: '#eee',
      opacity: 0.1,
      transparent: true,
    });

    for (let smokeIndex = 0; smokeIndex <= this.smokeCount; smokeIndex += 1) {
      const scale = 7 + smokeIndex;
      const smokeSize =
        env.viewportResolution.value.width * 0.05 +
        smokeIndex * env.viewportResolution.value.width * 0.015;
      const smokeGeometry = new THREE.PlaneGeometry(smokeSize, smokeSize);
      const smokeMesh = this.createMesh(smokeGeometry, smokeMaterial);

      smokeMesh.scale.set(scale, scale, scale);

      // stick elements to the right side of the screen
      smokeMesh.position.x =
        env.viewportResolution.value.width / 2 -
        smokeSize / 4 +
        smokeIndex * env.viewportResolution.value.width * 0.001;
      smokeMesh.position.y =
        -env.viewportResolution.value.height / 2 +
        smokeSize / 2 -
        smokeIndex * env.viewportResolution.value.height * 0.05;
      smokeMesh.position.z = this.positionZ;

      this.addMesh(smokeMesh);
    }
  }
}

export default SmokeLayer;
