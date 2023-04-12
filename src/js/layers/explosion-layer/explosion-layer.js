import * as THREE from 'three';

import { Layer } from '../layer';
import { textureLoader } from '../../utils/scene-utils';
import { env } from '../../env';
import eventEmitter from '../../event-emitter';

/** @extends {Layer<THREE.MeshBasicMaterial>} */
class ExplosionLayer extends Layer {
  /** @param {{cityLayer: import('../city-layer/city-layer').default}} params */
  constructor({ cityLayer }) {
    super();

    this.cityLayer = cityLayer;
    this.initialY = 0;

    const explosionTexture = textureLoader.load('/explosion.png');

    this.height = this.getHeight();
    this.geometry = this.getGeometry();

    const explosionMaterial = new THREE.MeshBasicMaterial({
      transparent: true,
      map: explosionTexture,
      side: THREE.FrontSide,
    });

    this.setMesh(this.geometry, explosionMaterial);

    this.mesh.position.z = 0;

    this.initialScale = this.getInitialScale();
    this.setScale();

    this.setPositionY();
    eventEmitter.on('cityHeightChange', () => {
      this.setPositionY();
    });
  }

  getHeight() {
    const explosionTextureAspectRatio = env.designResolution.value.width / 514;
    const explosionAspectScale =
      env.designResolution.value.height /
      env.designResolution.value.width /
      (env.viewportResolution.value.height /
        env.viewportResolution.value.width);
    return (
      (env.designAspectRatio / explosionTextureAspectRatio) *
      env.viewportResolution.value.height *
      explosionAspectScale
    );
  }

  getGeometry() {
    return new THREE.PlaneGeometry(
      env.viewportResolution.value.width,
      this.height
    );
  }

  getInitialScale() {
    return env.isPortrait ? 2.0 : 1.5;
  }

  setScale() {
    this.mesh.scale.set(this.initialScale, this.initialScale, 1);
  }

  setPositionY() {
    this.initialY =
      this.height / 2 -
      env.viewportResolution.value.height / 2 +
      this.cityLayer.height -
      env.viewportResolution.value.width * 0.07;
    this.mesh.position.y = this.initialY;
  }

  update() {
    this.height = this.getHeight();
    super.update();
    this.setPositionY();
    this.initialScale = this.getInitialScale();
    this.setScale();
  }
}

export default ExplosionLayer;
