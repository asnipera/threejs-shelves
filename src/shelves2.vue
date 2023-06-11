<template>
  <div id="container"></div>
</template>

<script setup lang="ts">
import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";
import { DRACOLoader } from "three/examples/jsm/loaders/DRACOLoader.js";
import { onMounted } from "vue";
const objects: any[] = [];
let renderer: THREE.WebGLRenderer,
  stats: { update: () => void },
  scene: THREE.Scene,
  camera: THREE.PerspectiveCamera;
onMounted(() => {
  init();
  animate();
});
function init() {
  const container = document.getElementById("container");
  scene = new THREE.Scene();
  scene.background = new THREE.Color(0xffffff);
  camera = new THREE.PerspectiveCamera(
    45,
    window.innerWidth / window.innerHeight,
    1,
    10000
  );
  camera.position.set(50, 80, 200);
  camera.lookAt(0, 0, 0);
  const directionalLight = new THREE.DirectionalLight(0xffffff, 0.6);
  directionalLight.position.set(0.75, 0.75, 1.0).normalize();
  directionalLight.castShadow = true;
  scene.add(directionalLight);

  const ambientLight = new THREE.AmbientLight(0xffffff, 0.2);
  scene.add(ambientLight);
  const hemiLight = new THREE.HemisphereLight(0xffffff, 0x444444);
  hemiLight.position.set(0, 20, 0);
  scene.add(hemiLight);

  const dirLight = new THREE.DirectionalLight(0xffffff);
  dirLight.position.set(3, 10, 10);
  dirLight.castShadow = true;
  dirLight.shadow.camera.top = 2;
  dirLight.shadow.camera.bottom = -2;
  dirLight.shadow.camera.left = -2;
  dirLight.shadow.camera.right = 2;
  dirLight.shadow.camera.near = 0.1;
  dirLight.shadow.camera.far = 40;
  scene.add(dirLight);

  const helper = new THREE.GridHelper(200, 20);
  helper.receiveShadow = true;
  scene.add(helper);
  const loader = new GLTFLoader();
  loader.load("/shelves.glb", function (gltf) {
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
    gltf.scene.scale.set(0.2, 0.2, 0.2);
    gltf.scene.position.set(0, 0, 10);
    scene.add(gltf.scene);
    render();
  });
  renderer = new THREE.WebGLRenderer({ antialias: true });
  renderer.setPixelRatio(window.devicePixelRatio);
  renderer.setSize(window.innerWidth, window.innerHeight);
  container?.appendChild(renderer.domElement);
  const controls = new OrbitControls(camera, renderer.domElement);
  // drawShelves(10, 10, scene);
  window.addEventListener("click", onWindowClick);
}

function onWindowClick(event: any) {
  const pointer = new THREE.Vector2();
  pointer.set(
    (event.clientX / window.innerWidth) * 2 - 1,
    -(event.clientY / window.innerHeight) * 2 + 1
  );
  const raycaster = new THREE.Raycaster();
  raycaster.setFromCamera(pointer, camera);
  const intersects = raycaster.intersectObjects(objects, false);
  if (intersects.length > 0) {
    console.log(intersects[0].object.userData);
  }
}

function addVoxel(
  scene: {
    add: (
      arg0: THREE.Mesh<THREE.BoxGeometry, THREE.MeshLambertMaterial>
    ) => void;
  },
  position: THREE.Vector3
) {
  const map = new THREE.TextureLoader().load("/square-outline-textured.png");
  map.colorSpace = THREE.SRGBColorSpace;
  const cubeGeo = new THREE.BoxGeometry(50, 50, 50);
  cubeGeo.userData = { URL: "https://www.google.com" };
  const cubeMaterial = new THREE.MeshLambertMaterial({
    color: 0xfeb74c,
    map: map,
  });

  const cube = new THREE.Mesh(cubeGeo, cubeMaterial);
  cube.position.copy(position).add(new THREE.Vector3(25, 25, 25));
  objects.push(cube);
  scene.add(cube);
}

function drawShelves(colCount: number, rowCount: number, scene: THREE.Scene) {
  let xDiff = -300;
  for (let i = 0; i < colCount; i++) {
    addVoxel(scene, new THREE.Vector3(xDiff, 0, 50));
    let yDiff = 50;
    for (let i = 0; i < rowCount; i++) {
      addVoxel(scene, new THREE.Vector3(xDiff, yDiff, 50));
      yDiff += 50;
    }
    xDiff += 50;
  }
}

function animate() {
  requestAnimationFrame(animate);

  render();
}

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
