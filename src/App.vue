<template>
  <div class="shelve-title">架子ID：{{ currentShelveId }}</div>
  <div id="container"></div>
</template>

<script setup lang="ts">
import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";
import { onMounted } from "vue";
import { GUI } from "three/examples/jsm/libs/lil-gui.module.min.js";
import { ref } from "vue";

let renderer: THREE.WebGLRenderer,
  scene: THREE.Scene,
  camera: THREE.PerspectiveCamera;
const currentShelveId = ref();

onMounted(() => {
  init();
  animate();
});

function init() {
  const container = document.getElementById("container");
  scene = new THREE.Scene();
  scene.background = new THREE.Color(0xd0d0d1);
  scene.fog = new THREE.Fog(0xa0a0a0, 1, 1000);
  camera = new THREE.PerspectiveCamera(
    75,
    window.innerWidth / window.innerHeight,
    10,
    1000
  );
  camera.position.set(80, 60, 40);
  camera.lookAt(0, 0, 0);

  const hemiLight = new THREE.HemisphereLight(0xffffff, 0xc6c7c7, 0.4);
  hemiLight.groundColor = new THREE.Color(0xeaeaea);
  hemiLight.position.set(35, 60, -10);
  scene.add(hemiLight);
  // const helper1 = new THREE.HemisphereLightHelper(hemiLight, 5);
  // helper1.visible = false;
  // scene.add(helper1);
  //

  const dirLight = new THREE.DirectionalLight(0xffffff);
  dirLight.color.setHSL(0.1, 1, 0.95);
  dirLight.position.set(50, 100, 5);
  // dirLight.position.multiplyScalar(30);
  scene.add(dirLight);
  dirLight.castShadow = true;

  dirLight.shadow.mapSize.width = 2048;
  dirLight.shadow.mapSize.height = 2048;
  // const helper2 = new THREE.DirectionalLightHelper(dirLight, 15, 0xff0000);
  const helper2 = new THREE.DirectionalLightHelper(dirLight, 5, 0xff0000);
  helper2.visible = false;
  scene.add(helper2);
  const d = 50;

  dirLight.shadow.camera.left = -d;
  dirLight.shadow.camera.right = d;
  dirLight.shadow.camera.top = d;

  const planeGeometry = new THREE.PlaneGeometry(1000, 1000);
  planeGeometry.name = "xxx";
  const planeMaterial = new THREE.MeshLambertMaterial({
    color: 0x4f4f50,
    side: THREE.DoubleSide,
  });
  const planeMesh = new THREE.Mesh(planeGeometry, planeMaterial);
  planeMesh.name = "floor";
  planeMesh.receiveShadow = true;
  planeMesh.rotation.x = Math.PI / 2;
  scene.add(planeMesh);
  const helper = new THREE.GridHelper(200, 20);
  scene.add(helper);
  const axisHelper = new THREE.AxesHelper(1000);
  scene.add(axisHelper);
  const loader = new GLTFLoader();
  loader.load(import.meta.env.BASE_URL + "box/scene.gltf", function (gltf) {
    gltf.scene.userData.isContainer = true;
    gltf.userData.xxx = true;
    gltf.scene.traverse(function (child) {
      if (
        child.type === "Mesh" &&
        !child.name.includes("KALLAX__42x42_KALLAX_SCREW_0") &&
        !child.name.includes("KALLAX__42x42_KALLAX_SCREW_HOLE_0")
      ) {
        (child as any).material = new THREE.MeshLambertMaterial({
          color: 0xffffff,
          side: THREE.FrontSide,
        });
        child.castShadow = true;
        child.receiveShadow = true;
      }
    });
    var box = new THREE.Box3().setFromObject(gltf.scene);
    const scale = 40;
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
    // scene.add(gltf.scene);
  });
  renderer = new THREE.WebGLRenderer({
    logarithmicDepthBuffer: true,
    antialias: true, // true/false表示是否开启反锯齿
    alpha: true, // true/false 表示是否可以设置背景色透明
    precision: "mediump", // highp/mediump/lowp 表示着色精度选择
    premultipliedAlpha: true, // true/false 表示是否可以设置像素深度（用来度量图像的分辨率）
  });
  renderer.setPixelRatio(window.devicePixelRatio);
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.shadowMap.enabled = true;
  renderer.setClearColor(0xffffff);
  container?.appendChild(renderer.domElement);
  const controls = new OrbitControls(camera, renderer.domElement);
  window.addEventListener("mousemove", onWindowClick);
}

function removeBox() {
  [...scene.children].forEach((obj) => {
    if (obj.userData.isContainer) {
      scene.remove(obj);
    }
  });
}

let boxHelpers: Record<string, THREE.BoxHelper>[] = [];

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
  boxHelpers = [];
  for (let i = 0; i < colCount; i++) {
    for (let j = 0; j < rowCount; j++) {
      const box = gltf.scene.clone();
      box.position.set(
        0,
        realHeight * j,
        (i + 0.5 - 0.5 * colCount) * realWidth
      );
      box.userData.id = `${i}-${j}`;
      // boxHelpers.push(new THREE.BoxHelper(box, 0x000000));
      boxHelpers.push({
        [box.userData.id]: box,
      });

      scene.add(box);
    }
  }
}

function getContainerObjByChild(obj: any) {
  if (obj.userData.isContainer) return obj;
  else if (obj.parent != null) return getContainerObjByChild(obj.parent);
  else return null;
}
const bHelper = new THREE.BoxHelper(new THREE.Mesh(), 0x00ffff);
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
      const id = intersectedObj.userData.id;
      if (id) {
        currentShelveId.value = id;
        const boxHelper = boxHelpers.find((helper) => helper[id]);
        if (boxHelper) {
          const box = boxHelper[id];
          const helper = bHelper.setFromObject(box);
          scene.add(helper);
        }
      } else {
        scene.remove(bHelper);
      }
    }
  }
}

function animate() {
  requestAnimationFrame(animate);
  // composer.render();
  render();
}

function render() {
  renderer.render(scene, camera);
}

const settings = {
  rowCount: 3,
  colCount: 6,
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
.shelve-title {
  position: absolute;
  top: 50px;
  left: 50px;
  z-index: 100;
  background: #fff;
  padding: 20px;
  font-size: 26px;
  border-radius: 5px;
  box-shadow: 0 0 5px #000;
  color: #000;
  font-weight: bold;
  cursor: pointer;
}
</style>
