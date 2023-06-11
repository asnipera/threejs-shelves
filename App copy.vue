<template>
  <div id="container"></div>
</template>

<script setup lang="ts">
import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";
import { DRACOLoader } from "three/examples/jsm/loaders/DRACOLoader.js";
import { onMounted } from "vue";
import { data } from "./src/data";
const objects: any[] = [];
let renderer: THREE.WebGLRenderer,
  stats: { update: () => void },
  scene: THREE.Scene,
  camera: THREE.PerspectiveCamera;
onMounted(() => {
  init();
  render();
});

function init() {
  camera = new THREE.PerspectiveCamera(
    45,
    window.innerWidth / window.innerHeight,
    0.1,
    100
  );
  camera.position.set(1.5, 4, 9);

  scene = new THREE.Scene();
  scene.background = new THREE.Color(0xffffff);

  //

  // const dracoLoader = new DRACOLoader();
  // dracoLoader.setDecoderPath(
  //   "../node_modules/three/examples/jsm/libs/draco/gltf/"
  // );

  const loader = new GLTFLoader();
  // loader.setDRACOLoader(dracoLoader);
  loader.load("/steel_frame_shelves_01_4k.glb", function (gltf) {
    scene.add(gltf.scene);
    render();
  });

  //

  renderer = new THREE.WebGLRenderer({ antialias: true });
  renderer.setPixelRatio(window.devicePixelRatio);
  renderer.setSize(window.innerWidth, window.innerHeight);
  document.body.appendChild(renderer.domElement);

  const controls = new OrbitControls(camera, renderer.domElement);
  controls.addEventListener("change", render);
  controls.target.set(0, 2, 0);
  controls.update();

  window.addEventListener("resize", onWindowResize);
}

function onWindowResize() {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();

  renderer.setSize(window.innerWidth, window.innerHeight);

  render();
}

//

function render() {
  renderer.render(scene, camera);
}
</script>

<style>
body,
html {
  margin: 0;
}
canvas {
  display: block;
}
</style>
