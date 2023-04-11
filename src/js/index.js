import * as THREE from 'three';

import ExplosionLayer from './layers/explosion-layer/explosion-layer';
import TreesLayer from './layers/trees-layer/trees-layer';
import SmokeLayer from './layers/smoke-layer/smoke-layer';
import MenuLayer from './layers/menu-layer/menu-layer';
import CityLayer from './layers/city-layer/city-layer';
import LandscapeLayer from './layers/landscape-layer/landscape-layer';
import { animateTextElements } from './modules/text-animation';

const scene = new THREE.Scene();

let elapsedTime = 0;
let lastFrameTime = 0;

const windowWidth = window.innerWidth;
const windowHeight = window.innerHeight;

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

const explosionLayer = new ExplosionLayer({ cityHeight: cityLayer.height });
scene.add(explosionLayer.mesh);
/***** END LAYERS INIT *****/

document.addEventListener('DOMContentLoaded', () => {
  animateTextElements(menuLayer);
});

const camera = new THREE.PerspectiveCamera(
  75,
  windowWidth / windowHeight,
  0.1,
  1000
);

const cameraDistance = 600;
camera.position.z = cameraDistance;

// set field of view to be able to use pixels for all sizes
camera.fov = 2 * Math.atan(windowHeight / 2 / cameraDistance) * (180 / Math.PI);

const renderer = new THREE.WebGLRenderer({
  canvas,
  antialias: true,
  alpha: false,
});
renderer.setPixelRatio(window.devicePixelRatio || 1);
renderer.setSize(windowWidth, windowHeight);

const clock = new THREE.Clock();

if ('ontouchstart' in window) {
  document.addEventListener('touchmove', handleTouchMove);
} else {
  window.addEventListener('resize', onWindowResize, false);
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

function onWindowResize() {
  const newWindowWidth = window.innerWidth;
  const newWindowHeight = window.innerHeight;
  renderer.setSize(newWindowWidth, newWindowHeight);
  menuLayer.mesh.material.uniforms.u_resolution.value.x = newWindowWidth;
  menuLayer.mesh.material.uniforms.u_resolution.value.y = newWindowHeight;
  landscapeLayer.mesh.material.uniforms.u_resolution.value.x = newWindowWidth;
  landscapeLayer.mesh.material.uniforms.u_resolution.value.y = newWindowHeight;
  cityLayer.mesh.material.uniforms.u_resolution.value.x = newWindowWidth;
  cityLayer.mesh.material.uniforms.u_resolution.value.y = newWindowHeight;
}

onWindowResize();

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
