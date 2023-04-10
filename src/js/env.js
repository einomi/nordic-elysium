import * as THREE from 'three';

import { throttle } from './utils/throttle';

/**
 * @typedef {Object} EnvType
 * @property {{value: THREE.Vector2}} designResolution
 * @property {number} designAspectRatio
 * @property {{value: THREE.Vector2}} viewportResolution
 * @property {number} viewportAspectRatio
 * @property {boolean} isPortrait
 */

// add type to Env class

/**
 * @class
 * @implements {EnvType}
 */
class Env {
  constructor() {
    const updateEnvValues = () => {
      const windowWidth = window.innerWidth;
      const windowHeight = window.innerHeight;

      this.viewportResolution = {
        value: new THREE.Vector2(windowWidth, windowHeight),
      };
      this.viewportAspectRatio =
        this.viewportResolution.value.width /
        this.viewportResolution.value.height;

      this.isPortrait = this.viewportAspectRatio < 1;
    };

    this.designResolution = {
      value: new THREE.Vector2(2136, 1113),
    };
    this.designAspectRatio =
      this.designResolution.value.width / this.designResolution.value.height;

    updateEnvValues();

    window.addEventListener(
      'resize',
      throttle(() => {
        updateEnvValues();
      }, 100)
    );
  }
}

/** @type {EnvType} */
export const env = new Env();
