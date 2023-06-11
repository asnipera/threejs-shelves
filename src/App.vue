<template>
  <button @click="removeBox">remove</button>
  <div id="container"></div>
</template>

<script setup lang="ts">
import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";
import { onMounted } from "vue";
import { GUI } from "three/examples/jsm/libs/lil-gui.module.min.js";

let renderer: THREE.WebGLRenderer,
  scene: THREE.Scene,
  camera: THREE.PerspectiveCamera;
const objects: any[] = [];
onMounted(() => {
  init();
  animate();
});
function init() {
  const container = document.getElementById("container");
  scene = new THREE.Scene();
  scene.background = new THREE.Color(0xffffff);
  camera = new THREE.PerspectiveCamera(
    75,
    window.innerWidth / window.innerHeight,
    0.1,
    1000
  );
  camera.position.set(60, 40, -20);
  camera.lookAt(0, 0, 0);
  const directionalLight = new THREE.DirectionalLight(0xffffff, 1);
  directionalLight.position.set(30, 40, 40);
  scene.add(directionalLight);
  directionalLight.castShadow = true;
  directionalLight.shadow.camera.near = 2.1;
  directionalLight.shadow.camera.far = 300;
  directionalLight.shadow.camera.left = -50;
  directionalLight.shadow.camera.right = 150;
  directionalLight.shadow.camera.top = 100;
  // Create an ambient light
  const ambientLight = new THREE.AmbientLight(0xffffff, 0.45);
  ambientLight.position.set(20, 20, 20);

  scene.add(ambientLight);
  const planeGeometry = new THREE.PlaneGeometry(1000, 1000);
  const planeMaterial = new THREE.MeshLambertMaterial({
    color: 0xffffff,
    side: THREE.DoubleSide,
  });
  const planeMesh = new THREE.Mesh(planeGeometry, planeMaterial);
  planeMesh.receiveShadow = true;
  planeMesh.rotation.x = Math.PI / 2;
  scene.add(planeMesh);
  const helper = new THREE.GridHelper(200, 20);
  scene.add(helper);
  const axisHelper = new THREE.AxesHelper(1000);
  scene.add(axisHelper);
  const loader = new GLTFLoader();
  loader.load("/box/scene.gltf", function (gltf) {
    gltf.scene.userData.isContainer = true;
    gltf.scene.traverse(function (child) {
      if (child.type === "Mesh") {
        (child as any).material = new THREE.MeshLambertMaterial({
          color: 0xb1753d,
          side: THREE.FrontSide,
        });
        child.castShadow = true;
        child.receiveShadow = true;
      }
    });
    var box = new THREE.Box3().setFromObject(gltf.scene);
    const scale = 20;
    var width = box.max.x - box.min.x;
    var height = box.max.y - box.min.y;
    gltf.scene.scale.set(scale, scale, scale);
    const realWidth = width * scale;
    const realHeight = height * scale;
    drawShelves(
      settings.rowCount,
      settings.colCount,
      gltf,
      realWidth,
      realHeight
    );
  });
  renderer = new THREE.WebGLRenderer({ antialias: true });
  renderer.setPixelRatio(window.devicePixelRatio);
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.shadowMap.enabled = true;
  renderer.setClearColor(0xffffff);
  container?.appendChild(renderer.domElement);
  const controls = new OrbitControls(camera, renderer.domElement);
  window.addEventListener("click", onWindowClick);
}

function removeBox() {
  [...scene.children].forEach((obj, index) => {
    if (obj.userData.isContainer) {
      scene.remove(obj);
    }
  });
}

function drawShelves(
  rowCount: number,
  colCount: number,
  gltf?: any,
  realWidth?: number,
  realHeight?: number
) {
  if (gltf && realWidth && realHeight) {
    settings.rowCount = rowCount;
    settings.colCount = colCount;
    settings.gltf = gltf;
    settings.realWidth = realWidth;
    settings.realHeight = realHeight;
  }
  realWidth = realWidth ?? settings.realWidth;
  realHeight = realHeight ?? settings.realHeight;
  gltf = gltf ?? settings.gltf;
  for (let i = 0; i < colCount; i++) {
    for (let j = 0; j < rowCount; j++) {
      const box = gltf.scene.clone();
      box.position.set(
        0,
        realHeight * j,
        (i + 0.5 - 0.5 * colCount) * realWidth
      );
      box.userData.id = `${i}-${j}`;
      scene.add(box);
    }
  }
}

function getContainerObjByChild(obj: any) {
  if (obj.userData.isContainer) return obj;
  else if (obj.parent != null) return getContainerObjByChild(obj.parent);
  else return null;
}

function onWindowClick(event: any) {
  const pointer = new THREE.Vector2();
  pointer.set(
    (event.clientX / window.innerWidth) * 2 - 1,
    -(event.clientY / window.innerHeight) * 2 + 1
  );
  const raycaster = new THREE.Raycaster();
  raycaster.setFromCamera(pointer, camera);
  const intersects = raycaster.intersectObjects(scene.children, true);
  // Get the intersected object
  if (intersects && intersects.length > 0) {
    const intersectedObj = getContainerObjByChild(intersects[0].object);
    if (intersectedObj) {
      console.log(intersectedObj.userData);
    }
  }
}

function animate() {
  requestAnimationFrame(animate);

  render();
}

function render() {
  renderer.render(scene, camera);
}

const settings = {
  colCount: 3,
  rowCount: 2,
  realWidth: 0,
  realHeight: 0,
  gltf: null,
};
function createPanel() {
  const panel = new GUI({
    width: 310,
  });
  panel.add(settings, "rowCount").onChange((count: number) => {
    removeBox();
    settings.rowCount = count;
    drawShelves(count, settings.colCount);
  });
  panel.add(settings, "colCount").onChange((count: number) => {
    removeBox();
    settings.colCount = count;
    drawShelves(settings.rowCount, count);
  });
}
createPanel();
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
