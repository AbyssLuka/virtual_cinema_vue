<template>
    <div class="preview-material-container">
        <div style="width: calc(100%);aspect-ratio: 1;" ref="material-preview">

        </div>
        <div class="controls-plane-container">
            <div class="controls-item ri-square-line" @click="changePreviewMesh('plane')"></div>
            <div class="controls-item ri-circle-line" @click="changePreviewMesh('sphere')"></div>
            <div class="controls-item ri-instance-line" @click="changePreviewMesh('cube')"></div>
            <div class="controls-item ri-fullscreen-line" @click="openWindow"></div>
        </div>
    </div>
</template>

<script setup lang="ts">
import {onMounted, useTemplateRef, watch} from "vue";
import {PreviewMaterial, PreviewType} from "@/components/SceneEditor/ts/PreviewMaterial";
import {Material} from "three";
import createPopUps from "@/util/createPopUps";

const materialPreEl = useTemplateRef<HTMLElement>("material-preview")
const previewMaterial = new PreviewMaterial();

onMounted(() => {
    materialPreEl.value!.appendChild(previewMaterial.domElement);
    loadMaterial();
})

const props = defineProps<{
    material?: Material | Material[] | null
}>();

watch(props, (newVal) => {
    loadMaterial(newVal.material)
})

const loadMaterial = (material?: Material | Material[] | null) => {
    if (!material) return;
    const {clientWidth: w, clientHeight: h} = materialPreEl.value!
    previewMaterial.material = material
    previewMaterial.render(w, h);
}

const changePreviewMesh = (type: PreviewType) => {
    previewMaterial.meshType = type;
}
import MaterialPreviewPopups from "./popups/MaterialPreviewPopups.vue";

const openWindow = () => {
    createPopUps(MaterialPreviewPopups, {
        data: {
            scene: previewMaterial.scene,
        },
        title: "Preview",
    })
}

</script>

<style scoped>
.preview-material-container {
    width: 100%;
    height: 100%;
    display: flex;
}

.controls-plane-container {

}

.controls-item {
    width: 2rem;
    height: 2rem;
    display: flex;
    align-items: center;
    justify-content: center;
    border: .1rem solid black;
    margin: 0 0 .1rem 0;
}
</style>