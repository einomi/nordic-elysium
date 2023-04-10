import * as THREE from 'three';
import gsap from 'gsap';

import vertexShader from './shaders/vertex.glsl';
import menuFragmentShader from './shaders/menu-fragment.glsl';
import bgFragmentShader from './shaders/bg-fragment.glsl';
import cityFragmentShader from './shaders/city-fragment.glsl';

let elapsedTime = 0;
let lastFrameTime = 0;

const windowWidth = window.innerWidth;
const windowHeight = window.innerHeight;

const SCENE_ASPECT_RATIO = 2136 / 1113;
const VIEWPORT_ASPECT_RATIO = windowWidth / windowHeight;
const IS_PORTRAIT = VIEWPORT_ASPECT_RATIO < 1;

const canvas = /** @type {HTMLCanvasElement} */ (
  document.querySelector('canvas.webgl')
);

const menuBackgroundOpacity = {
  value: 0,
};

const resolution = {
  value: new THREE.Vector2(windowWidth, windowHeight),
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

function getMenuGeometry() {
  const isPortrait = windowHeight > windowWidth;
  const width = isPortrait ? windowWidth : windowWidth / 1.5;
  const height = isPortrait ? windowHeight / 1.5 : windowHeight + 100;

  const menuGeometry = new THREE.PlaneGeometry(width, height);

  // change position of plane to right side
  menuGeometry.translate(windowWidth / 5, 0, 0);

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

const smokeMinSize = windowHeight * 0.05;

const smokeSize =
  Math.random() * (smokeMinSize + windowHeight * 0.2) + smokeMinSize;
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
  smokeElement.position.x = windowWidth / 2 - (Math.random() * windowWidth) / 3;
  smokeElement.position.y = -(Math.random() * windowHeight) / 2;
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

const treesGeometry = new THREE.PlaneGeometry(windowWidth, windowHeight);

const treesMaterial = new THREE.MeshBasicMaterial({
  map: treesTexture,
  transparent: true,
  side: THREE.FrontSide,
});

treesMaterial.map?.repeat.set(
  1,
  (SCENE_ASPECT_RATIO * windowHeight) / windowWidth
);

const trees = new THREE.Mesh(treesGeometry, treesMaterial);

// scale up trees
const treesScaleTo = 1.1;
trees.scale.set(treesScaleTo, treesScaleTo, 1);
trees.position.y = (windowHeight * (treesScaleTo - 1)) / 2;
trees.position.z = 10;

scene.add(trees);
/***** END TREES *****/

/***** CITY LAYER *****/
const cityTexture = new THREE.TextureLoader().load('/city.png');
const cityAspectRatio = 2136 / 688;

const cityAspectScale =
  sceneResolution.value.y /
  sceneResolution.value.x /
  (resolution.value.y / resolution.value.x);

const cityHeight =
  (SCENE_ASPECT_RATIO / cityAspectRatio) * windowHeight * cityAspectScale;

const cityGeometry = new THREE.PlaneGeometry(windowWidth, cityHeight);

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

// move to the bottom
city.position.y = cityHeight / 2 - windowHeight / 2;

city.position.z = 1;

city.scale.set(1.1, 1.1, 1);

scene.add(city);
/***** END CITY LAYER *****/

/***** EXPLOSION LAYER *****/
const explosionTexture = new THREE.TextureLoader().load('/explosion.png');
const explosionTextureAspectRatio = 2136 / 514;

const explosionAspectScale =
  sceneResolution.value.y /
  sceneResolution.value.x /
  (resolution.value.y / resolution.value.x);

const explosionHeight =
  (SCENE_ASPECT_RATIO / explosionTextureAspectRatio) *
  windowHeight *
  explosionAspectScale;

const explosionGeometry = new THREE.PlaneGeometry(windowWidth, explosionHeight);

// standard material
const explosionMaterial = new THREE.MeshBasicMaterial({
  transparent: true,
  map: explosionTexture,
  side: THREE.FrontSide,
});

const explosion = new THREE.Mesh(explosionGeometry, explosionMaterial);

explosion.position.y =
  explosionHeight / 2 - windowHeight / 2 + cityHeight - windowWidth * 0.1;

explosion.position.z = 0;

const explosionScale = IS_PORTRAIT ? 2.0 : 1.1;

explosion.scale.set(explosionScale, explosionScale, 1);

scene.add(explosion);
/***** END EXPLOSION LAYER *****/

animate();

function onWindowResize() {
  const newWindowWidth = window.innerWidth;
  const newWindowHeight = window.innerHeight;

  const aspectRatio = newWindowWidth / newWindowHeight;
  let width, height;
  if (aspectRatio >= 1) {
    width = 1;
    height = (newWindowHeight / newWindowWidth) * width;
  } else {
    width = aspectRatio;
    height = 1;
  }
  camera.left = -width;
  camera.right = width;
  camera.top = height;
  camera.bottom = -height;
  camera.updateProjectionMatrix();
  renderer.setSize(newWindowWidth, newWindowHeight);
  menuUniforms.u_resolution.value.x = newWindowWidth;
  menuUniforms.u_resolution.value.y = newWindowHeight;
  uniformsBackground.u_resolution.value.x = newWindowWidth;
  uniformsBackground.u_resolution.value.y = newWindowHeight;
  uniformsCity.u_resolution.value.x = newWindowWidth;
  uniformsCity.u_resolution.value.y = newWindowHeight;
}

onWindowResize();

function animate() {
  requestAnimationFrame(animate);

  elapsedTime += clock.getDelta();

  if (clock.getElapsedTime() - lastFrameTime < 1 / 25) {
    return;
  }

  lastFrameTime = clock.getElapsedTime();

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
