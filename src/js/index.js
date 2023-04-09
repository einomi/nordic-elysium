import * as THREE from 'three';
import gsap from 'gsap';

import vertexShader from './shaders/vertex.glsl';
import menuFragmentShader from './shaders/menu-fragment.glsl';
import bgFragmentShader from './shaders/bg-fragment.glsl';
import cityFragmentShader from './shaders/city-fragment.glsl';

let elapsedTime = 0;

const SCENE_ASPECT_RATIO = 2136 / 1113;
const VIEWPORT_ASPECT_RATIO = window.innerWidth / window.innerHeight;
const IS_PORTRAIT = VIEWPORT_ASPECT_RATIO < 1;

const canvas = /** @type {HTMLCanvasElement} */ (
  document.querySelector('canvas.webgl')
);

const menuBackgroundOpacity = {
  value: 0,
};

const resolution = {
  value: new THREE.Vector2(window.innerWidth, window.innerHeight),
};

const sceneResolution = {
  value: new THREE.Vector2(2136, 1113),
};

document.addEventListener('DOMContentLoaded', () => {
  const titleEl = document.querySelector('[data-title]');

  const titleSource = titleEl.querySelector('[data-source]');
  const titleLetters = titleEl.querySelector('[data-letters]');

  // break into letters, get text from source and put into letters element
  const letters = titleSource.textContent.split('');
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
  gsap.to(menuBackgroundOpacity, {
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

const loader = new THREE.TextureLoader();
const scene = new THREE.Scene();
// set perspective camera
const camera = new THREE.PerspectiveCamera(
  75,
  window.innerWidth / window.innerHeight,
  0.1,
  1000
);

const cameraDistance = 600;
camera.position.z = cameraDistance;
// set fov as in pixels
camera.fov =
  2 * Math.atan(window.innerHeight / 2 / cameraDistance) * (180 / Math.PI);

const renderer = new THREE.WebGLRenderer({
  canvas,
  antialias: true,
  alpha: true,
});
// set device pixel ratio
renderer.setPixelRatio(window.devicePixelRatio || 1);
renderer.setSize(window.innerWidth, window.innerHeight);

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

const geometryBackground = new THREE.PlaneGeometry(
  window.innerWidth,
  window.innerHeight
);

const planeBackground = new THREE.Mesh(geometryBackground, materialBackground);
scene.add(planeBackground);

function getMenuGeometry() {
  const isPortrait = window.innerHeight > window.innerWidth;
  const width = isPortrait ? window.innerWidth : window.innerWidth / 1.5;
  const height = isPortrait
    ? window.innerHeight / 1.5
    : window.innerHeight + 100;

  const menuGeometry = new THREE.PlaneGeometry(width, height);

  // change position of plane to right side
  menuGeometry.translate(window.innerWidth / 5, 0, 0);

  return menuGeometry;
}

const menuGeometry = getMenuGeometry();

// eslint-disable-next-line sonarjs/prefer-object-literal
const menuUniforms = {
  u_texture: { value: loader.load('/menu3.png') },
  u_time: { value: 0.0 },
  u_mouse: { value: { x: 0.0, y: 0.0 } },
  u_duration: { value: 8.0 },
  u_opacity: menuBackgroundOpacity,
  u_resolution: resolution,
};

const menuMaterial = new THREE.ShaderMaterial({
  uniforms: menuUniforms,
  vertexShader,
  fragmentShader: menuFragmentShader,
  transparent: true,
  side: THREE.FrontSide,
  depthWrite: false,
});

// fix transparent invisible bug

const menu = new THREE.Mesh(menuGeometry, menuMaterial);
menu.position.z = 2;
scene.add(menu);

const smokeTexture = new THREE.TextureLoader().load('/smoke.png');
// scene.background = smokeTexture;
smokeTexture.encoding = THREE.sRGBEncoding;

const smokeMinSize = window.innerHeight * 0.05;

const smokeSize =
  Math.random() * (smokeMinSize + window.innerHeight * 0.2) + smokeMinSize;
const smokeGeometry = new THREE.PlaneGeometry(smokeSize, smokeSize);
const smokeMaterial = new THREE.MeshLambertMaterial({
  map: smokeTexture,
  emissive: '#eee',
  opacity: 0.1,
  transparent: true,
  // wireframe: true
});

/** @type {THREE.Mesh[]} */
const smokeElements = [];

for (let smokeIndex = 0; smokeIndex < 3; smokeIndex += 1) {
  const smokeElement = new THREE.Mesh(smokeGeometry, smokeMaterial);
  const scale = Math.max(4, Math.random() * 9);
  smokeElement.scale.set(scale, scale, scale);

  // stick elements to the right side of the screen
  smokeElement.position.x =
    window.innerWidth / 2 - (Math.random() * window.innerWidth) / 3;
  smokeElement.position.y = -(Math.random() * window.innerHeight) / 2;
  smokeElement.position.z = 100 + Math.random() * 100 - 50;

  smokeElement.rotation.z = Math.random() * 360;
  scene.add(smokeElement);
  smokeElements.push(smokeElement);
}

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
const treesTexture = new THREE.TextureLoader().load('/trees.png');

const treesGeometry = new THREE.PlaneGeometry(
  window.innerWidth,
  window.innerHeight
);

const treesMaterial = new THREE.MeshBasicMaterial({
  map: treesTexture,
  transparent: true,
  side: THREE.FrontSide,
});

treesMaterial.map?.repeat.set(
  1,
  (SCENE_ASPECT_RATIO * window.innerHeight) / window.innerWidth
);

const trees = new THREE.Mesh(treesGeometry, treesMaterial);

// scale up trees
const treesScaleTo = 1.1;
trees.scale.set(treesScaleTo, treesScaleTo, 1);
trees.position.y = (window.innerHeight * (treesScaleTo - 1)) / 2;
trees.position.z = 10;

scene.add(trees);
/***** END TREES *****/

/***** CITY LAYER *****/
const cityTexture = new THREE.TextureLoader().load('/city.png');
const cityGeometry = new THREE.PlaneGeometry(
  window.innerWidth,
  window.innerHeight
);

// load river-mask texture
const riverMaskTexture = new THREE.TextureLoader().load('/river-mask.png');

// load water-displacement texture
const waterDisplacementTexture = new THREE.TextureLoader().load(
  '/water-displacement.jpg'
);

const uniformsCity = {
  u_texture: { value: cityTexture },
  u_river_mask: { value: riverMaskTexture },
  u_water_displacement: { value: waterDisplacementTexture },
  u_time: { value: 0.0 },
  u_resolution: resolution,
  u_scene_resolution: sceneResolution,
  u_scene_aspect_ratio: { value: SCENE_ASPECT_RATIO },
  u_viewport_aspect_ratio: { value: VIEWPORT_ASPECT_RATIO },
};

const cityMaterial = new THREE.ShaderMaterial({
  transparent: true,
  side: THREE.FrontSide,
  vertexShader,
  fragmentShader: cityFragmentShader,
  uniforms: uniformsCity,
});

const city = new THREE.Mesh(cityGeometry, cityMaterial);
city.position.z = 1;

city.scale.set(1.1, 1.1, 1);

scene.add(city);
/***** END CITY LAYER *****/

/***** EXPLOSION LAYER *****/
const explosionTexture = new THREE.TextureLoader().load('/explosion.png');
const explosionTextureAspectRatio = 2136 / 514;

const explosionGeometry = new THREE.PlaneGeometry(
  window.innerWidth,
  ((SCENE_ASPECT_RATIO / explosionTextureAspectRatio) *
    window.innerHeight *
    (sceneResolution.value.y / sceneResolution.value.x)) /
    (resolution.value.y / resolution.value.x)
);

// standard material
const explosionMaterial = new THREE.MeshBasicMaterial({
  transparent: true,
  map: explosionTexture,
  side: THREE.FrontSide,
});

const explosion = new THREE.Mesh(explosionGeometry, explosionMaterial);

const explosionAspectScale =
  (resolution.value.y * (sceneResolution.value.y / sceneResolution.value.x)) /
  (resolution.value.y / resolution.value.x);

explosion.position.y = (IS_PORTRAIT ? -0.1 : 0.28) * explosionAspectScale;

explosion.position.z = 0;

const explosionScale = IS_PORTRAIT ? 2.0 : 1.1;

// scale up
explosion.scale.set(explosionScale, explosionScale, 1);

// add explosion
scene.add(explosion);
/***** END EXPLOSION LAYER *****/

animate();

function onWindowResize() {
  const windowWidth = window.innerWidth;
  const windowHeight = window.innerHeight;

  const aspectRatio = windowWidth / windowHeight;
  let width, height;
  if (aspectRatio >= 1) {
    width = 1;
    height = (windowHeight / windowWidth) * width;
  } else {
    width = aspectRatio;
    height = 1;
  }
  camera.left = -width;
  camera.right = width;
  camera.top = height;
  camera.bottom = -height;
  camera.updateProjectionMatrix();
  renderer.setSize(windowWidth, windowHeight);
  menuUniforms.u_resolution.value.x = windowWidth;
  menuUniforms.u_resolution.value.y = windowHeight;
  uniformsBackground.u_resolution.value.x = windowWidth;
  uniformsBackground.u_resolution.value.y = windowHeight;
  uniformsCity.u_resolution.value.x = windowWidth;
  uniformsCity.u_resolution.value.y = windowHeight;
}

onWindowResize();

function animate() {
  requestAnimationFrame(animate);

  elapsedTime += clock.getDelta();

  menuUniforms.u_time.value = elapsedTime;
  uniformsBackground.u_time.value = elapsedTime;
  uniformsCity.u_time.value = elapsedTime;

  smokeElements.forEach((smokeElement) => {
    smokeElement.rotation.z = elapsedTime * 0.12;
  });

  // move right to left trees using sin
  trees.position.x = -Math.sin(elapsedTime * 0.1) * 20;

  city.position.x = Math.sin(elapsedTime * 0.07) * 50;

  // move explosion
  explosion.position.x = Math.sin(elapsedTime * 0.01) * 15;

  // change explosion scale
  explosion.scale.set(
    explosionScale + Math.sin(elapsedTime * 0.1) * 0.1,
    explosionScale + Math.sin(elapsedTime * 0.1) * 0.1,
    1
  );

  renderer.render(scene, camera);
}
