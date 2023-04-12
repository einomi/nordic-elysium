import * as THREE from 'three';

import ExplosionLayer from './layers/explosion-layer/explosion-layer';
import TreesLayer from './layers/trees-layer/trees-layer';
import SmokeLayer from './layers/smoke-layer/smoke-layer';
import MenuLayer from './layers/menu-layer/menu-layer';
import CityLayer from './layers/city-layer/city-layer';
import LandscapeLayer from './layers/landscape-layer/landscape-layer';
import { animateTextElements } from './modules/text-animation';
import { env } from './env';
import eventEmitter from './event-emitter';

const scene = new THREE.Scene();

let elapsedTime = 0;
let lastFrameTime = 0;

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

const explosionLayer = new ExplosionLayer({ cityLayer });
scene.add(explosionLayer.mesh);
/***** END LAYERS INIT *****/

document.addEventListener('DOMContentLoaded', () => {
  animateTextElements(menuLayer);
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

if ('ontouchstart' in window) {
  document.addEventListener('touchmove', handleTouchMove);
} else {
  document.addEventListener('mousemove', handleMouseMove);
}

/** @param {MouseEvent} _event */
function handleMouseMove(_event) {
  // pass
}

/** @param {TouchEvent} _event */
function handleTouchMove(_event) {
  // pass
}

animate();

eventEmitter.on('envUpdated', () => {
  renderer.setSize(
    env.viewportResolution.value.width,
    env.viewportResolution.value.height
  );

  updateCamera();

  cityLayer.mesh.material.uniforms.u_resolution = env.viewportResolution;
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
  landscapeLayer.mesh.material.uniforms.u_time.value = elapsedTime;
  cityLayer.mesh.material.uniforms.u_time.value = elapsedTime;

  smokeLayer.meshes.forEach((mesh, index) => {
    mesh.rotation.z = elapsedTime * 0.08 + index * 0.5;
    mesh.position.z =
      smokeLayer.positionZ + (1 + Math.sin(elapsedTime * 0.1)) * 30;
  });

  treesLayer.mesh.position.x = -Math.sin(elapsedTime * 0.1) * 20;

  cityLayer.mesh.position.x = Math.sin(elapsedTime * 0.07) * 50;

  explosionLayer.mesh.position.x = Math.sin(elapsedTime * 0.01) * 10;
  explosionLayer.mesh.scale.set(
    explosionLayer.initialScale + Math.sin(elapsedTime * 0.1) * 0.1,
    explosionLayer.initialScale + Math.sin(elapsedTime * 0.1) * 0.1,
    1
  );

  renderer.render(scene, camera);
}
