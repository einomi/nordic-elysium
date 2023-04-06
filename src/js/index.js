import * as THREE from 'three';
import gsap from 'gsap';

import vertexShader from './shaders/vertex.glsl';
import fragmentShader from './shaders/fragment.glsl';

let elapsedTime = 0;

const canvas = /** @type {HTMLCanvasElement} */ (
  document.querySelector('canvas.webgl')
);

document.addEventListener('DOMContentLoaded', () => {
  const listItems = document.querySelectorAll('[data-list-item]');
  gsap.to(canvas, {
    duration: 1.5,
    autoAlpha: 1,
    ease: 'sine.out',
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

const geometry = new THREE.PlaneGeometry(
  window.innerWidth / 1.5,
  window.innerHeight + 100
);

// change position of plane to right side
geometry.translate(window.innerWidth / 5, 0, 0);

// eslint-disable-next-line sonarjs/prefer-object-literal
const uniforms = {
  u_texture: { value: loader.load('/menu.png') },
  u_time: { value: 0.0 },
  u_resolution: { value: new THREE.Vector2() },
  u_mouse: { value: { x: 0.0, y: 0.0 } },
  u_duration: { value: 8.0 },
};

const material = new THREE.ShaderMaterial({
  uniforms,
  vertexShader,
  fragmentShader,
  transparent: true,
  side: THREE.FrontSide,
  depthWrite: false,
});

// fix transparent invisible bug

const plane = new THREE.Mesh(geometry, material);
scene.add(plane);

const smokeTexture = new THREE.TextureLoader().load('/smoke.png');
// scene.background = smokeTexture;
smokeTexture.encoding = THREE.sRGBEncoding;
const smokeGeometry = new THREE.PlaneGeometry(300, 300);
const smokeMaterial = new THREE.MeshLambertMaterial({
  map: smokeTexture,
  emissive: '#eee',
  opacity: 0.5,
  transparent: true,
  // wireframe: true
});

/** @type {THREE.Mesh[]} */
const smokeElements = [];

for (let smokeIndex = 0; smokeIndex < 20; smokeIndex += 1) {
  const smokeElement = new THREE.Mesh(smokeGeometry, smokeMaterial);
  const scale = Math.max(3, Math.random() * 9);
  smokeElement.scale.set(scale, scale, scale);

  // stick elements to the right side of the screen
  smokeElement.position.x = window.innerWidth / 1.5;
  smokeElement.position.y = Math.random() * 100 - 50;
  smokeElement.position.z = Math.random() * 100 - 50;

  smokeElement.rotation.z = Math.random() * 360;
  scene.add(smokeElement);
  smokeElements.push(smokeElement);
}

onWindowResize();
if ('ontouchstart' in window) {
  document.addEventListener('touchmove', handleTouchMove);
} else {
  window.addEventListener('resize', onWindowResize, false);
  document.addEventListener('mousemove', handleMouseMove);
}

/** @param {MouseEvent} event */
function handleMouseMove(event) {
  uniforms.u_mouse.value.x = event.clientX;
  uniforms.u_mouse.value.y = event.clientY;
}

/** @param {TouchEvent} event */
function handleTouchMove(event) {
  uniforms.u_mouse.value.x = event.touches[0].clientX;
  uniforms.u_mouse.value.y = event.touches[0].clientY;
}

animate();

function onWindowResize() {
  const aspectRatio = window.innerWidth / window.innerHeight;
  let width, height;
  if (aspectRatio >= 1) {
    width = 1;
    height = (window.innerHeight / window.innerWidth) * width;
  } else {
    width = aspectRatio;
    height = 1;
  }
  camera.left = -width;
  camera.right = width;
  camera.top = height;
  camera.bottom = -height;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
  uniforms.u_resolution.value.x = window.innerWidth;
  uniforms.u_resolution.value.y = window.innerHeight;
}

function animate() {
  requestAnimationFrame(animate);

  elapsedTime += clock.getDelta();

  uniforms.u_time.value = elapsedTime;

  smokeElements.forEach((smokeElement) => {
    smokeElement.rotation.z = elapsedTime * 0.12;
  });

  renderer.render(scene, camera);
}
