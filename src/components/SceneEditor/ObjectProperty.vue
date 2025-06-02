<template>
    <div class="object-property">
        <div class="object-property-title">position</div>
        <div class="object-property-content">
            <number-input class="number-input" v-model="position.x" title="x"></number-input>
            <number-input class="number-input" v-model="position.y" title="y"></number-input>
            <number-input class="number-input" v-model="position.z" title="z"></number-input>
        </div>
        <div class="object-property-title">rotation</div>
        <div class="object-property-content">
            <number-input class="number-input" v-model="rotation.x" title="x"></number-input>
            <number-input class="number-input" v-model="rotation.y" title="y"></number-input>
            <number-input class="number-input" v-model="rotation.z" title="z"></number-input>
        </div>
        <div class="object-property-title">scale</div>
        <div class="object-property-content">
            <number-input class="number-input" v-model="scale.x" title="x"></number-input>
            <number-input class="number-input" v-model="scale.y" title="y"></number-input>
            <number-input class="number-input" v-model="scale.z" title="z"></number-input>
        </div>
    </div>
</template>

<script setup lang="ts">

import NumberInput from "@/components/SceneEditor/NumberInput.vue";
import {Object3D} from "three";
import {computed, defineProps, ref, watch} from "vue";
import {TransformControls} from "three/examples/jsm/controls/TransformControls";

const {controls} = defineProps<{
    controls: TransformControls
}>()


const {x: px, y: py, z: pz} = {x: 0, y: 0, z: 0};
const {x: rx, y: ry, z: rz} = {x: 0, y: 0, z: 0};
const {x: sx, y: sy, z: sz} = {x: 0, y: 0, z: 0};

const position = ref({x: px, y: py, z: pz});
const rotation = ref({x: rx, y: ry, z: rz});
const scale = ref({x: sx, y: sy, z: sz});
watch(position, (newVal) => {
    controls.object.position.set(newVal.x, newVal.y, newVal.z);
}, {deep: true});
watch(rotation, (newVal) => {
    controls.object.rotation.set(newVal.x, newVal.y, newVal.z);
}, {deep: true});
watch(scale, (newVal) => {
    controls.object.scale.set(newVal.x, newVal.y, newVal.z);
}, {deep: true});
controls.addEventListener("change", (event) => {
    const object = event.target.object;
    if (!object) return;
    position.value = {x: object.position.x, y: object.position.y, z: object.position.z};
    rotation.value = {x: object.rotation.x, y: object.rotation.y, z: object.rotation.z};
    scale.value = {x: object.scale.x, y: object.scale.y, z: object.scale.z};
})
</script>

<style scoped>
.number-input{
    margin: 10px 0;
}
</style>