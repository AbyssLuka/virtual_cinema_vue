<template>
    <div class="preview-material-window"
         ref="preview-material-window">

    </div>
</template>

<script setup lang="ts">
import {WindowProps} from "@/util/createPopUps";
import {onMounted, onUnmounted, useTemplateRef} from "vue";
import {PerspectiveCamera, Scene, WebGLRenderer} from "three";
import {OrbitControls} from "three/examples/jsm/controls/OrbitControls";

const container = useTemplateRef<HTMLElement>("preview-material-window")
const props = defineProps<WindowProps<{
    scene: Scene,
}>>();
const renderer = new WebGLRenderer();
const camera = new PerspectiveCamera(
    75, 1, 0.1, 128
);
camera.position.set(1, 2, 1);
const orbitControls = new OrbitControls(camera, renderer.domElement);
const scene = props.data.scene.clone();
onMounted(() => {
    scene.add(orbitControls.object);
    container.value!.appendChild(renderer.domElement);
    renderer.setSize(container.value!.clientWidth, container.value!.clientHeight);
    resizeObserver.observe(container.value!)
    renderer.setAnimationLoop(animeLoop);
});
const resizeObserver = new ResizeObserver(()=>{
    containerResize();
});
const containerResize = () => {
    renderer.setSize(container.value!.clientWidth, container.value!.clientHeight);
    const {clientWidth: w, clientHeight: h} = renderer.domElement;
    camera.aspect = w / h
    camera.updateProjectionMatrix();

}
const animeLoop = () => {
    renderer.render(scene, camera)
}
onUnmounted(() => {
    resizeObserver.disconnect();
});
</script>

<style scoped>
.preview-material-window {
    width: 100%;
    height: 100%;
}
</style>