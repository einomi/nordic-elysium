import * as THREE from 'three';
import gsap from 'gsap';

import ExplosionLayer from './layers/explosion-layer/explosion-layer';
import TreesLayer from './layers/trees-layer/trees-layer';
import SmokeLayer from './layers/smoke-layer/smoke-layer';
import MenuLayer from './layers/menu-layer/menu-layer';
import CityLayer from './layers/city-layer/city-layer';
import LandscapeLayer from './layers/landscape-layer/landscape-layer';
import { animateTextElements } from './modules/text-animation';
import { env } from './env';
import eventEmitter from './event-emitter';
import { throttle } from './utils/throttle';

const scene = new THREE.Scene();

let elapsedTime = 0;
let lastFrameTime = 0;

const mouse = new THREE.Vector2();

const canvas = /** @type {HTMLCanvasElement} */ (
  document.querySelector('canvas.webgl')
);

/***** LAYERS INIT *****/
const menuLayer = new MenuLayer();
scene.add(menuLayer.mesh);

const landscapeLayer = new LandscapeLayer();
scene.add(landscapeLayer.mesh);

const smokeLayer = new SmokeLayer();
smokeLayer.meshes.forEach((mesh) => {
  scene.add(mesh);
});

const treesLayer = new TreesLayer();
scene.add(treesLayer.mesh);

const cityLayer = new CityLayer();
scene.add(cityLayer.mesh);

/** @type {ExplosionLayer | null} */
let explosionLayer = null;
eventEmitter.on('imageFormatsSupportDetected', () => {
  explosionLayer = new ExplosionLayer({ cityLayer });
  scene.add(explosionLayer.mesh);
});
/***** END LAYERS INIT *****/

eventEmitter.on('loader:hide', () => {
  setTimeout(() => {
    animateTextElements(menuLayer);
  }, 350);
});

document.addEventListener('DOMContentLoaded', () => {
  const menuButtons = /** @type {NodeListOf<HTMLButtonElement>} */ (
    document.querySelectorAll('[data-menu-button]')
  );
  // add timeout id type using jsdoc
  /** @type {ReturnType<typeof setTimeout>} */
  let timeoutId;
  let multiplier = 0;
  menuButtons.forEach((button) => {
    button.addEventListener('click', () => {
      clearTimeout(timeoutId);
      gsap.to(menuLayer.mesh.material.uniforms.u_inflate, {
        value: 2 + multiplier,
        duration: 0.25,
        ease: 'power1.out',
        overwrite: true,
      });
      multiplier = multiplier < 4 ? multiplier + 1 : multiplier;
      // eslint-disable-next-line max-nested-callbacks
      timeoutId = setTimeout(() => {
        gsap.to(menuLayer.mesh.material.uniforms.u_inflate, {
          value: 0,
          duration: 0.55,
          ease: 'sine.in',
          overwrite: true,
        });
      }, 250);

      // eslint-disable-next-line max-nested-callbacks
      setTimeout(() => {
        multiplier = 0;
      }, 800);
    });
  });
});

const camera = new THREE.PerspectiveCamera(75, 1, 0.1, 1000);

function updateCamera() {
  const cameraDistance = 600;
  // set aspect
  camera.aspect =
    env.viewportResolution.value.width / env.viewportResolution.value.height;
  // set field of view to be able to use pixels for all sizes
  camera.fov =
    2 *
    Math.atan(env.viewportResolution.value.height / 2 / cameraDistance) *
    (180 / Math.PI);
  camera.position.z = cameraDistance;
  camera.updateProjectionMatrix();
}

updateCamera();

const renderer = new THREE.WebGLRenderer({
  canvas,
  antialias: true,
  alpha: false,
});
renderer.setPixelRatio(window.devicePixelRatio || 1);
renderer.setSize(
  env.viewportResolution.value.width,
  env.viewportResolution.value.height
);

const clock = new THREE.Clock();

const mouseThrottlingDelay = 3;
if ('ontouchstart' in window) {
  document.addEventListener(
    'touchmove',
    throttle(handleTouchMove, mouseThrottlingDelay)
  );
} else {
  document.addEventListener(
    'mousemove',
    throttle(handleMouseMove, mouseThrottlingDelay)
  );
}

/**
 * @param {number} nextVal
 *  */
function getLerpedMousePosition(nextVal) {
  return THREE.MathUtils.lerp(mouse.x, nextVal, 0.03);
}

/** @param {MouseEvent} event */
function handleMouseMove(event) {
  mouse.x = getLerpedMousePosition(event.clientX);
  mouse.y = getLerpedMousePosition(event.clientY);
}

/** @param {TouchEvent} _event */
function handleTouchMove(_event) {
  mouse.x = getLerpedMousePosition(_event.touches[0].clientX);
  mouse.y = getLerpedMousePosition(_event.touches[0].clientY);
}

eventEmitter.on('envUpdated', () => {
  renderer.setSize(
    env.viewportResolution.value.width,
    env.viewportResolution.value.height
  );

  updateCamera();

  eventEmitter.emit('updateLayers');
});

function animate() {
  requestAnimationFrame(animate);

  elapsedTime += clock.getDelta();

  // setting FPS
  if (clock.getElapsedTime() - lastFrameTime < 1 / 25) {
    return;
  }

  lastFrameTime = clock.getElapsedTime();

  menuLayer.mesh.material.uniforms.u_time.value = elapsedTime;
  menuLayer.mesh.material.uniforms.u_mouse.value = mouse;

  landscapeLayer.mesh.material.uniforms.u_time.value = elapsedTime;
  cityLayer.mesh.material.uniforms.u_time.value = elapsedTime;

  smokeLayer.meshes.forEach((mesh, index) => {
    mesh.rotation.z = elapsedTime * 0.08 + index * 0.5;
    mesh.position.z =
      smokeLayer.positionZ + (1 + Math.sin(elapsedTime * 0.1)) * 30;
  });

  treesLayer.mesh.position.x = -Math.sin(elapsedTime * 0.2) * 20;

  const cityPeriod = 0.07;
  cityLayer.mesh.position.x = Math.sin(elapsedTime * cityPeriod) * 50;
  const cityScaleTo =
    cityLayer.initialScale + Math.sin(elapsedTime * cityPeriod) * 0.1;
  // animate city scale
  cityLayer.mesh.scale.set(cityScaleTo, cityScaleTo, 1);

  if (explosionLayer) {
    explosionLayer.mesh.position.x = -Math.sin(elapsedTime * 0.03) * 30;
    const explosionPeriod = 0.1;
    explosionLayer.mesh.position.y =
      explosionLayer.initialY + Math.sin(elapsedTime * explosionPeriod) * 25;
    const explosionScaleTo =
      explosionLayer.initialScale +
      Math.sin(elapsedTime * explosionPeriod) * 0.1;
    explosionLayer.mesh.scale.set(explosionScaleTo, explosionScaleTo, 1);
  }

  renderer.render(scene, camera);
}

animate();
