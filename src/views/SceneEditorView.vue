<template>
    <div class="container">
        <div class="object-list">
        </div>
        <div class="object-property">
            <object-property :controls="transformControls"></object-property>
        </div>
        <div class="scene-content">
            <div class="operation-container">
                <div class="operation-item ri-2x"
                     @click="changeTransform"
                     :class="{
                                'ri-drag-move-line': transformStatus === 'translate',
                                'ri-loop-right-line': transformStatus === 'rotate',
                                'ri-expand-diagonal-line': transformStatus === 'scale'
                            }"
                ></div>
                <div class="operation-item ri-2x"></div>
                <div class="operation-item ri-2x"></div>
                <div class="operation-item ri-2x"></div>
                <div class="operation-item ri-2x"></div>
            </div>
            <div class="editor-canvas-container" ref="canvas-container">
            </div>

        </div>
        <div class="title-util">
            <header-menu></header-menu>
        </div>
    </div>
</template>

<script setup lang="ts">
import {OrbitControls} from "three/examples/jsm/controls/OrbitControls";
import {
    AmbientLight,
    AxesHelper, BoxGeometry,
    Clock, Color, EquirectangularReflectionMapping,
    GridHelper,
    LinearSRGBColorSpace, Mesh, MeshStandardMaterial, Object3D,
    PCFSoftShadowMap,
    PerspectiveCamera,
    WebGLRenderer
} from "three";
import {onMounted, onUnmounted, ref, useTemplateRef,} from "vue";
import {RGBELoader} from "three/examples/jsm/loaders/RGBELoader";

const camera = new PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
const renderer = new WebGLRenderer({antialias: true, alpha: true});
const orbitControls = new OrbitControls(camera, renderer.domElement);
// const transformControls = new TransformControls(camera, renderer.domElement);
const transformControlsClass = new CustomTransformControls(camera, renderer.domElement);
const transformControls = transformControlsClass.controls;
editorScene.add(transformControls.getHelper());
renderer.shadowMap.type = PCFSoftShadowMap;
// render.outputEncoding = LinearEncoding;
renderer.outputColorSpace = LinearSRGBColorSpace;
renderer.shadowMap.enabled = true;
new RGBELoader().loadAsync("/3d/skybox/skydome_hdri-starlight_sky_fullview.hdr",)
    .then((texture) => {
        texture.mapping = EquirectangularReflectionMapping;
        // editorScene.background = texture;
        editorScene.background = new Color(0x575757);
        // editorScene.environment = texture;
    })
const clock = new Clock();
camera.position.set(-5, 5, -5);
transformControls.addEventListener('dragging-changed', (event) => {
    orbitControls.enabled = !event.value;
});

transformControls.addEventListener('object-changed', () => {
    targetObject.value = transformControls.object!;
});

const targetObject = ref<Object3D>(new Object3D());
import ObjectProperty from "@/components/SceneEditor/ObjectProperty.vue";
import {CustomTransformControls} from "@/components/SceneEditor/ts/CustomTransformControls";
import {editorScene, gui, MODEL_LIST} from "@/components/SceneEditor/ts/Global";
import HeaderMenu from "@/components/SceneEditor/HeaderMenu.vue";
import {detectInit} from "@/components/SceneEditor/ts/DetectModel";

const canvasContainer = useTemplateRef<HTMLDivElement>("canvas-container");
onMounted(() => {
    canvasContainer.value!.appendChild(renderer.domElement);
    renderer.setSize(canvasContainer.value!.clientWidth, canvasContainer.value!.clientHeight);
    sceneInit();
    initGui();
    renderer.setAnimationLoop(animate);
    windowResizeFn();
});
const {dispose: detectDispose,updateBoxHelperColor} = detectInit(camera, orbitControls, transformControls, renderer);
updateBoxHelperColor(0xffffff);
const sceneInit = () => {
    editorScene.add(new AxesHelper(5));
    const gridHelper = new GridHelper(10, 10);
    editorScene.add(gridHelper);
    const box = new Mesh(new BoxGeometry(1, 1, 1),
        new MeshStandardMaterial({color: 0x00ff00})
    );
    box.castShadow = true;
    box.receiveShadow = true;
    MODEL_LIST.push(box);
    editorScene.add(box);
    transformControls.attach(box);
    const ambientLight = new AmbientLight(0xffffff, 5);
    editorScene.add(ambientLight)
    gui.add(ambientLight, 'intensity', 0, 10, 0.1).name('Ambient Light Intensity');
}

const initGui = () => {
    // gui.add(transformControls, 'mode', ['translate', 'rotate', 'scale']).name('Transform Mode');
    // property.value!.appendChild(gui.domElement);
}

const windowResizeFn = () => {
    // 更新渲染器比例
    renderer.setSize(canvasContainer.value!.clientWidth, canvasContainer.value!.clientHeight);
    //更新渲染器和设备的像素比
    renderer.setPixelRatio(window.devicePixelRatio);
    const canvas = renderer.domElement;
    //更新宽高比
    camera.aspect = canvas.clientWidth / canvas.clientHeight;
    //更新摄像机的投影矩阵
    camera.updateProjectionMatrix();
}
window.addEventListener('resize', windowResizeFn);

const animate = () => {
    const detail = clock.getDelta();
    renderer.render(editorScene, camera);
    orbitControls.update(detail);
    transformControls.update(detail);
    camera.updateProjectionMatrix();
};

const changeTransform = () => {
    const map = {
        translate: 'rotate',
        rotate: 'scale',
        scale: 'translate'
    } as const;
    transformStatus.value = map[transformControls.getMode()];
    transformControls.setMode(map[transformControls.getMode()]);
}
const transformStatus = ref(transformControls.getMode());
onUnmounted(() => {
    transformControls.dispose();
    orbitControls.dispose();
    renderer.dispose();
    editorScene.clear();
    window.removeEventListener('resize', windowResizeFn);
    detectDispose();
})
</script>

<style scoped>

.operation-item {
    width: 3rem;
    height: 3rem;
    background: rgba(210, 210, 210, 0.2);
    margin: 0.5rem 0;
    display: flex;
    align-items: center;
    justify-content: center;
    user-select: none;
    color: white;
}

.operation-container {
    width: 4rem;
    background: rgba(255, 255, 255, 0.11);
    position: absolute;
    left: 1rem;
    top: 1rem;
    display: flex;
    justify-content: center;
    flex-direction: column;
    align-items: center;
}

.container {
    width: 100%;
    height: 100%;
    display: grid;
    grid-template-columns:
        0.4fr 1.1fr 0.3fr;
    grid-template-rows:
        0.2fr
        1fr
        2.6fr;
    grid-auto-flow: row;
    grid-template-areas:
    "title-util title-util title-util"
    "scene-content scene-content object-list"
    "scene-content scene-content object-property";
}

.editor-canvas-container {
    width: 100%;
    height: 100%;
}

.title-util {
    grid-area: title-util;
    background: #ffffff;
}

.object-property {
    grid-area: object-property;
    background: #ffffff;
}

.scene-content {
    grid-area: scene-content;
    position: relative;
}

.object-list {
    grid-area: object-list;
    background: #a182ff;
}

</style>