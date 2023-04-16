import * as THREE from 'three';

import { Layer } from '../layer';
import { env } from '../../env';
import { textureLoader } from '../../utils/scene-utils';

/** @extends {Layer<THREE.MeshBasicMaterial>} */
class TreesLayer extends Layer {
  constructor() {
    super();

    const treesTexture = textureLoader.load(
      env.getFileNameWithModernImageFormat('/trees.png')
    );

    this.geometry = new THREE.PlaneGeometry(
      env.viewportResolution.value.width,
      env.viewportResolution.value.height
    );

    this.material = new THREE.MeshBasicMaterial({
      map: treesTexture,
      transparent: true,
      side: THREE.FrontSide,
    });

    this.setTextureRepeat();

    this.setMesh(this.geometry, this.material);

    this.treesScaleTo = 1.1;
    this.setSetScale();
    this.setPositionY();
    this.mesh.position.z = 10;
  }

  setSetScale() {
    this.mesh.scale.set(this.treesScaleTo, this.treesScaleTo, 1);
  }

  setPositionY() {
    this.mesh.position.y =
      (env.viewportResolution.value.height * (this.treesScaleTo - 1)) / 2;
  }

  setTextureRepeat() {
    this.material.map?.repeat.set(
      1,
      (env.designAspectRatio * env.viewportResolution.value.height) /
        env.viewportResolution.value.width
    );
  }

  update() {
    super.update();
    this.setTextureRepeat();
    this.setSetScale();
    this.setPositionY();
  }
}

export default TreesLayer;
