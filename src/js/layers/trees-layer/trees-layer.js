import * as THREE from 'three';

import { Layer } from '../layer';
import { env } from '../../env';

class TreesLayer extends Layer {
  constructor() {
    super();

    const treesTexture = new THREE.TextureLoader().load('/trees.png');

    const treesGeometry = new THREE.PlaneGeometry(
      env.viewportResolution.value.width,
      env.viewportResolution.value.height
    );

    const treesMaterial = new THREE.MeshBasicMaterial({
      map: treesTexture,
      transparent: true,
      side: THREE.FrontSide,
    });

    treesMaterial.map?.repeat.set(
      1,
      (env.designAspectRatio * env.viewportResolution.value.height) /
        env.viewportResolution.value.width
    );

    this.setMesh(treesGeometry, treesMaterial);

    // scale up trees
    const treesScaleTo = 1.1;
    this.mesh.scale.set(treesScaleTo, treesScaleTo, 1);
    this.mesh.position.y =
      (env.viewportResolution.value.height * (treesScaleTo - 1)) / 2;
    this.mesh.position.z = 10;
  }
}

export default TreesLayer;
