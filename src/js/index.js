import * as THREE from 'three';
import gsap from 'gsap';

import vertexShader from './shaders/vertex.glsl';
import bgFragmentShader from './shaders/bg-fragment.glsl';
import ExplosionLayer from './layers/explosion-layer/explosion-layer';
import TreesLayer from './layers/trees-layer/trees-layer';
import SmokeLayer from './layers/smoke-layer/smoke-layer';
import MenuLayer from './layers/menu-layer/menu-layer';
import CityLayer from './layers/city-layer/city-layer';

const loader = new THREE.TextureLoader();
const scene = new THREE.Scene();

let elapsedTime = 0;
let lastFrameTime = 0;

const windowWidth = window.innerWidth;
const windowHeight = window.innerHeight;

const canvas = /** @type {HTMLCanvasElement} */ (
  document.querySelector('canvas.webgl')
);

const resolution = {
  value: new THREE.Vector2(windowWidth, windowHeight),
};

/***** MENU LAYER *****/
const menuLayer = new MenuLayer();
scene.add(menuLayer.mesh);
/***** END MENU LAYER *****/

document.addEventListener('DOMContentLoaded', () => {
  const titleEl = document.querySelector('[data-title]');

  if (!titleEl) {
    throw new Error('No title element found');
  }

  const titleSource = titleEl.querySelector('[data-source]');
  const titleLetters = titleEl.querySelector('[data-letters]');

  if (!titleLetters) {
    throw new Error('No title letters found');
  }

  if (!titleSource) {
    throw new Error('No title source found');
  }

  // break into letters, get text from source and put into letters element
  const letters = (titleSource.textContent || '').split('');
  titleLetters.innerHTML = letters
    .map((letter) => `<span>${letter}</span>`)
    .join('');

  // get spans
  const spans = titleLetters.querySelectorAll('span');

  gsap.set(titleLetters, { alpha: 1 });
  gsap.set(spans, { alpha: 0 });

  gsap.to(spans, {
    duration: 1.5,
    alpha: 1,
    ease: 'sine.out',
    stagger: 0.05,
    delay: 0.3,
  });

  const listItems = document.querySelectorAll('[data-list-item]');
  gsap.to(menuLayer.opacity, {
    duration: 1.5,
    value: 1,
    ease: 'sine.out',
    delay: 0.3,
  });

  gsap.fromTo(
    listItems,
    {
      autoAlpha: 0,
      x: 20,
    },
    {
      duration: 1,
      autoAlpha: 1,
      x: 0,
      stagger: 0.15,
      ease: 'sine.out',
      delay: 0.3,
    }
  );
});

// set perspective camera
const camera = new THREE.PerspectiveCamera(
  75,
  windowWidth / windowHeight,
  0.1,
  1000
);

const cameraDistance = 600;
camera.position.z = cameraDistance;
// set fov as in pixels
camera.fov = 2 * Math.atan(windowHeight / 2 / cameraDistance) * (180 / Math.PI);

const renderer = new THREE.WebGLRenderer({
  canvas,
  antialias: true,
  alpha: true,
});
// set device pixel ratio
renderer.setPixelRatio(window.devicePixelRatio || 1);
renderer.setSize(windowWidth, windowHeight);

const clock = new THREE.Clock();

// load mask texture
const maskTexture = loader.load('/mask2.png');

// load texture scenery.jpg and set it as background of the scene, use shader material
// eslint-disable-next-line sonarjs/prefer-object-literal
const uniformsBackground = {
  u_texture: { value: loader.load('/scenery.jpg') },
  u_mask: { value: maskTexture },
  u_time: { value: 0.0 },
  u_resolution: resolution,
  u_mouse: { value: { x: 0.0, y: 0.0 } },
  u_duration: { value: 8.0 },
};

const materialBackground = new THREE.ShaderMaterial({
  uniforms: uniformsBackground,
  vertexShader,
  fragmentShader: bgFragmentShader,
  transparent: false,
  side: THREE.FrontSide,
});

const geometryBackground = new THREE.PlaneGeometry(windowWidth, windowHeight);

const planeBackground = new THREE.Mesh(geometryBackground, materialBackground);
scene.add(planeBackground);

/***** SMOKE IN RIGHT-BOTTOM CORNER *****/
const smokeLayer = new SmokeLayer();
smokeLayer.meshes.forEach((mesh) => {
  scene.add(mesh);
});
/***** END SMOKE IN RIGHT-BOTTOM CORNER *****/

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

/***** TREES *****/
const treesLayer = new TreesLayer();
scene.add(treesLayer.mesh);
/***** END TREES *****/

/***** CITY LAYER *****/
const cityLayer = new CityLayer();
scene.add(cityLayer.mesh);
/***** END CITY LAYER *****/

/***** EXPLOSION LAYER *****/
const explosionLayer = new ExplosionLayer({ cityHeight: cityLayer.height });
scene.add(explosionLayer.mesh);
/***** END EXPLOSION LAYER *****/

animate();

function onWindowResize() {
  const newWindowWidth = window.innerWidth;
  const newWindowHeight = window.innerHeight;
  renderer.setSize(newWindowWidth, newWindowHeight);
  menuLayer.mesh.material.uniforms.u_resolution.value.x = newWindowWidth;
  menuLayer.mesh.material.uniforms.u_resolution.value.y = newWindowHeight;
  uniformsBackground.u_resolution.value.x = newWindowWidth;
  uniformsBackground.u_resolution.value.y = newWindowHeight;
  cityLayer.mesh.material.uniforms.u_resolution.value.x = newWindowWidth;
  cityLayer.mesh.material.uniforms.u_resolution.value.y = newWindowHeight;
}

onWindowResize();

function animate() {
  requestAnimationFrame(animate);

  elapsedTime += clock.getDelta();

  if (clock.getElapsedTime() - lastFrameTime < 1 / 25) {
    return;
  }

  lastFrameTime = clock.getElapsedTime();

  menuLayer.mesh.material.uniforms.u_time.value = elapsedTime;
  uniformsBackground.u_time.value = elapsedTime;
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
