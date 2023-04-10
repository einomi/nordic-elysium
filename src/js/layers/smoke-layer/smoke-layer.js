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

    this.smokeCount = 1;
    this.positionZ = 11;

    const smokeTexture = new THREE.TextureLoader().load('/smoke.png');
    // scene.background = smokeTexture;
    smokeTexture.encoding = THREE.sRGBEncoding;

    const smokeMinSize = env.viewportResolution.value.height * 0.05;

    const smokeSize =
      Math.random() *
        (smokeMinSize + env.viewportResolution.value.height * 0.2) +
      smokeMinSize;
    const smokeGeometry = new THREE.PlaneGeometry(smokeSize, smokeSize);
    const smokeMaterial = new THREE.MeshLambertMaterial({
      map: smokeTexture,
      emissive: '#eee',
      opacity: 0.1,
      transparent: true,
      // wireframe: true
    });

    for (let smokeIndex = 0; smokeIndex <= this.smokeCount; smokeIndex += 1) {
      const smokeMesh = this.createMesh(smokeGeometry, smokeMaterial);
      const scale = Math.max(4, Math.random() * 9);
      smokeMesh.scale.set(scale, scale, scale);

      // stick elements to the right side of the screen
      smokeMesh.position.x =
        env.viewportResolution.value.width / 2 - smokeSize / 4;
      smokeMesh.position.y =
        -env.viewportResolution.value.height / 2 + smokeSize / 2;
      smokeMesh.position.z = this.positionZ;

      smokeMesh.rotation.z = Math.random() * 360;
      this.addMesh(smokeMesh);
    }
  }
}

export default SmokeLayer;
