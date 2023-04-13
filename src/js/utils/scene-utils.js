import * as THREE from 'three';
import gsap from 'gsap';

import eventEmitter from '../event-emitter';

const manager = new THREE.LoadingManager();

const loaderEl = document.querySelector('[data-loader]');
const loaderTextEl = document.querySelector('[data-loader-text]');

// eslint-disable-next-line no-undef
const isLoaderHidden = process.env.IS_LOADER_HIDDEN === 'true';

/**
 * @param {string} url
 * @param {number} itemsLoaded
 * @param {number} itemsTotal
 *  */
manager.onProgress = function (url, itemsLoaded, itemsTotal) {
  if (isLoaderHidden) {
    return;
  }

  gsap.to(loaderTextEl, {
    duration: 0.25,
    alpha: 0,
    ease: 'sine.out',
    overwrite: true,
  });
  const filename = url.startsWith('/') ? url.slice(1) : url;

  const message = `Loading file: ${filename}. Loaded ${itemsLoaded} of ${itemsTotal} files.`;
  if (!loaderTextEl) {
    return;
  }
  gsap.to(loaderTextEl, {
    duration: 0.8,
    alpha: 1,
    overwrite: false,
    delay: 0.15,
    ease: 'sine.out',
  });
  loaderTextEl.innerHTML = message;
};

manager.onLoad = function () {
  if (isLoaderHidden) {
    return;
  }

  gsap.to(loaderTextEl, { alpha: 0, duration: 0.35, overwrite: true });
  gsap.to(loaderEl, {
    duration: 1.4,
    autoAlpha: 0,
    ease: 'sine.inOut',
    delay: 0.2,
    overwrite: true,
  });

  eventEmitter.emit('loader:hide');
};

if (isLoaderHidden) {
  gsap.set(loaderEl, { autoAlpha: 0 });
  setTimeout(() => {
    eventEmitter.emit('loader:hide');
  });
}

export const textureLoader = new THREE.TextureLoader(manager);
