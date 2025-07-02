<template>
    <div class="object-property-container">
        <div v-for="(value, key) in object3DProps"
             :key="key"
             class="object-property-content">
            <div class="object-property-title">{{ key }}</div>
            <div class="object-property-content">
                <div v-if="value.readonly">{{ value.data }}</div>
                <input v-else-if="value.type === Object3DPropertyType.String" type="text" v-model="value.data"/>
                <input v-else-if="value.type === Object3DPropertyType.Number" type="number" v-model.number="value.data"
                       step="0.01"/>
                <input v-else-if="value.type === Object3DPropertyType.Boolean" type="checkbox" v-model="value.data"/>
                <button v-else-if="value.type === Object3DPropertyType.Object" @click="openJsonPopups(value.data)">
                    Edit
                </button>
                <div class="object-property-content"
                     v-else-if="(value.type === Object3DPropertyType.Vector3||value.type ===Object3DPropertyType.Euler)">
                    <number-input class="number-input" v-model="(<Vector3>value.data).x" title="x"></number-input>
                    <number-input class="number-input" v-model="(<Vector3>value.data).y" title="y"></number-input>
                    <number-input class="number-input" v-model="(<Vector3>value.data).z" title="z"></number-input>
                </div>
            </div>
        </div>
    </div>
</template>

<script setup lang="ts">

import NumberInput from "@/components/SceneEditor/NumberInput.vue";
import {defineProps, onMounted, reactive, ref, watch} from "vue";
import {TransformControls} from "three/examples/jsm/controls/TransformControls";
import {I_Object3D, Object3DProperty, Object3DPropertyType} from "@/components/SceneEditor/ts/interface/MeshInterface";
import {createObject3D} from "@/components/SceneEditor/ts/interface/MeshImpl";
import {Object3D, Vector3} from "three";
import {MaterialPropertyType} from "@/components/SceneEditor/ts/interface/MaterialInterface";
import createPopUps from "@/util/createPopUps";

const {controls} = defineProps<{
    controls: TransformControls
}>()

const object3DProps = ref<I_Object3D|undefined>()

const loadObjectProperty = (object: Object3D) => {
    if (!controls.object) return;
    object3DProps.value = createObject3D(object);
}
import JsonEditorPopups from "@/components/SceneEditor/popups/JsonEditorPopups.vue";
const openJsonPopups = (value:Object) =>{
    createPopUps(JsonEditorPopups,{
        title:"Json",
        data:{
            jsonStr:JSON.stringify(value,null, 2)
        }
    })
}

onMounted(() => {
    loadObjectProperty(controls.object);
});
controls.addEventListener("object-changed", (event) => {
    const object = event.target.object;
    loadObjectProperty(object);
});

const updateObject3DProps = () => {
    if (!controls.object) return;
    object3DProps.value = createObject3D(controls.object);
}

controls.addEventListener("change", (event) => {
    const object = event.target.object;
    if (!object) {
        object3DProps.value = undefined;
        return;
    }
    updateObject3DProps()
})
</script>

<style scoped>
.number-input {
    margin: .2rem 0;
}

.object-property-content {
    display: flex;
    width: calc(100% - 4rem);
}

.object-property-container {
    display: flex;
    flex-direction: column;
    width: 100%;
    height: 100%;
    overflow: auto;
}

.object-property-title {
    width: 10rem;
    margin: .2rem;
    text-overflow:ellipsis;
    overflow:hidden;
}

.object-property-container > div {
    display: flex;
}
</style>