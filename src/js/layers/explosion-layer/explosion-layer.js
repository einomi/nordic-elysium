import * as THREE from 'three';

import Layer from '../layer';
import { textureLoader } from '../../utils/scene-utils';
import { env } from '../../env';

class ExplosionLayer extends Layer {
  /** @param {{cityHeight: number}} params */
  constructor({ cityHeight }) {
    super();

    const explosionTexture = textureLoader.load('/explosion.png');
    const explosionTextureAspectRatio = env.designResolution.value.width / 514;

    const explosionAspectScale =
      env.designResolution.value.height /
      env.designResolution.value.width /
      (env.viewportResolution.value.height /
        env.viewportResolution.value.width);

    const explosionHeight =
      (env.designAspectRatio / explosionTextureAspectRatio) *
      env.viewportResolution.value.height *
      explosionAspectScale;

    const explosionGeometry = new THREE.PlaneGeometry(
      env.viewportResolution.value.width,
      explosionHeight
    );

    const explosionMaterial = new THREE.MeshBasicMaterial({
      transparent: true,
      map: explosionTexture,
      side: THREE.FrontSide,
    });

    this.setMesh(explosionGeometry, explosionMaterial);

    this.mesh.position.y =
      explosionHeight / 2 -
      env.viewportResolution.value.height / 2 +
      cityHeight -
      env.viewportResolution.value.width * 0.1;

    this.mesh.position.z = 0;

    this.initialScale = env.isPortrait ? 2.0 : 1.1;

    this.mesh.scale.set(this.initialScale, this.initialScale, 1);
  }
}

export default ExplosionLayer;
