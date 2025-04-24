<template>
    <div class="list-item"
         :style="[props.choosePlayer === model.fileName?
                         'box-shadow: 1px 2px 4px 0 rgba(255, 0, 0, 0.25)':
                         'box-shadow: 1px 2px 4px 0 rgba(0, 0, 0, 0.25)']"
         v-for="(model,modelIndex) in props.modelList"
         :key="modelIndex">

        <div style="display: flex;justify-content: flex-end;">
            <div class="ri-2x full-button"
                 v-for="(obj,manipulateIndex) in props.manipulate"
                 :class="obj.icon"
                 :key="manipulateIndex"
                 :title="obj.title"
                 @click="obj.func(modelIndex)">
            </div>
        </div>
        <div class="model-item-content"
             :ref="modelRef"
             :value="model.fileName">
        </div>
        <div class="model-title"
             :style="[props.choosePlayer === model.fileName?'color:orangered':'']"
             @click="props.titleClick(model.fileName)"
        >{{ model.fileName }}
        </div>
    </div>
</template>

<script setup lang="ts">
import {DirectionalLight, HemisphereLight, Object3D, PerspectiveCamera, Scene, Vector3} from "three";
import {OrbitControls} from "three/examples/jsm/controls/OrbitControls";
import {GLTFLoader} from "three/examples/jsm/loaders/GLTFLoader";
import {MODEL_BASE_URL} from "@/global/global";
import {defineProps, withDefaults} from "vue"
import {I_ModelEntity} from "@/components/ThreeJs/ts/GameInterface"

const props = withDefaults(defineProps<{
    sceneCallback?: (scene: Scene) => void,
    modelCallback?: (object3D: Object3D) => void,
    openDetail?: (index: number) => void,
    titleClick?: (file_name: string) => void,
    choosePlayer?: string,
    modelList: I_ModelEntity[],
    manipulate?: {
        icon: string,
        title: string,
        func: (index: number) => void,
    }[],
}>(), {
    sceneCallback: () => {
        console.log("callback undefined");
    },
    modelCallback: () => {
        console.log("modelCallback undefined");
    },
    manipulate: () => [],
    titleClick: () => {
        console.log("titleClick undefined");
    },
    modelList: () => [],
    choosePlayer: "",
});

let count = 0;

const modelRef = (el: any) => {
    if (!el || props.modelList.length === count) return;
    el = <HTMLElement>el;
    count++;
    const scene = new Scene();
    scene.userData.element = el;
    const modelName = el && el.getAttribute("value");
    const camera = new PerspectiveCamera(50, 1, 0.1, 10);
    camera.position.x = -.5;
    camera.position.y = .5;
    camera.position.z = -.6;
    scene.userData.camera = camera;

    const controls = new OrbitControls(scene.userData.camera, scene.userData.element);
    controls.minDistance = .5;
    controls.maxDistance = 1;

    controls.enablePan = false;
    // controls.enableZoom = false;
    controls.target = new Vector3(0, .25, 0);
    controls.update();
    scene.userData.controls = controls;

    new GLTFLoader().load(MODEL_BASE_URL + modelName, (gltf) => {
        scene.add(gltf.scene);
        props.modelCallback(gltf.scene);
    });

    scene.add(new HemisphereLight(0xaaaaaa, 0x444444));
    const light = new DirectionalLight(0xffffff, 5);
    light.position.set(-1, 10, -1);
    scene.add(light);
    props.sceneCallback(scene);
}
</script>

<style scoped>
.model-title {
    color: #888;
    font-family: sans-serif;
    font-size: large;
    width: 200px;
    margin-top: 0.5em;
    cursor: pointer;
}

.model-item-content {
    width: 200px;
    height: 200px;
    cursor: move;
}

.list-item {
    display: block;
    margin: 1em;
    padding: 1em;
}


.full-button {
    cursor: pointer;
    user-select: none;
}

.list-item:hover .model-title {
    color: orangered;
}

.model-title {
    color: #888;
    font-family: sans-serif;
    font-size: large;
    width: 200px;
    margin-top: 0.5em;
    cursor: pointer;
}

.model-item-content {
    width: 200px;
    height: 200px;
    cursor: move;
}
</style>