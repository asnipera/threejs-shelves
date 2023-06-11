<template>
  <div id="container"></div>
</template>

<script setup lang="ts">
import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";
import { DRACOLoader } from "three/examples/jsm/loaders/DRACOLoader.js";
import { onMounted, render } from "vue";
import { Renderer } from "troisjs";

onMounted(() => {
  const scene = new THREE.Scene();
  const geometry = new THREE.BoxGeometry(40, 100, 40);
  const material = new THREE.MeshBasicMaterial({
    color: 0xb9d3ff,
    side: THREE.DoubleSide,
  });
  const cube = new THREE.Mesh(geometry, material);
  // scene.add(cube);
  const loader = new GLTFLoader();
  loader.load("/box/scene.gltf", function (gltf) {
    let i = 0;
    gltf.scene.traverse(function (child) {
      if (child.type === "Mesh") {
        i++;

        (child as any).material = new THREE.MeshLambertMaterial({
          color: 0xfeb74c,
        });
        child.castShadow = true;
        child.receiveShadow = true;
      }
    });
    console.log(i);
    gltf.scene.scale.set(40, 40, 40);
    gltf.scene.position.set(0, 0, 10);
    scene.add(gltf.scene);
  });
  // cube.castShadow = true;
  const planeGeometry = new THREE.PlaneGeometry(1000, 1000);
  const planeMaterial = new THREE.MeshStandardMaterial({
    color: 0xffffff,
    side: THREE.DoubleSide,
  });
  const planeMesh = new THREE.Mesh(planeGeometry, planeMaterial);
  planeMesh.receiveShadow = true;
  planeMesh.rotation.x = Math.PI / 2;
  planeMesh.position.y = -50;
  scene.add(planeMesh);

  const directionalLight = new THREE.DirectionalLight(0xffffff);
  directionalLight.position.set(80, 50, 50);
  scene.add(directionalLight);
  directionalLight.castShadow = true;
  // directionalLight.shadow.camera.near = 2.1;
  // directionalLight.shadow.camera.far = 300;
  directionalLight.shadow.camera.left = -50;
  // directionalLight.shadow.camera.right = 150;
  directionalLight.shadow.camera.top = 100;
  // directionalLight.shadow.camera.bottom = -150;
  const camera = new THREE.PerspectiveCamera(
    75,
    window.innerWidth / window.innerHeight,
    0.1,
    1000
  );
  camera.position.set(-60, 40, 100);
  camera.lookAt(scene.position);

  const renderer = new THREE.WebGLRenderer({ antialias: true });
  renderer.setSize(window.innerWidth, window.innerHeight);
  document.getElementById("container")?.appendChild(renderer.domElement);
  // const axisHelper = new THREE.AxesHelper(1000);
  // scene.add(axisHelper);
  renderer.shadowMap.enabled = true;
  const controls = new OrbitControls(camera, renderer.domElement);
  function animate() {
    requestAnimationFrame(animate);
    cube.rotation.x += 0.01;
    cube.rotation.y += 0.01;
    renderer.render(scene, camera);
  }
  animate();
  // const controls = new OrbitControls(camera, renderer.domElement);
});
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
