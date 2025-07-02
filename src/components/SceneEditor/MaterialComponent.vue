<template xmlns="http://www.w3.org/1999/html">
    <div class="object-property-container">
        <div style="width: 100%;flex-direction: column">
            <div class="object-property-title" @click="addMaterial">新建材质</div>
            <div class="material-list-container">
                <div v-for="(material,materialIndex) in materialList"
                     :key="material.uuid"
                     :style="[currentMaterial === materialIndex ? {color: 'orangered'} : {}]"
                     style="justify-content: space-between;display: flex; cursor: pointer"
                     @click="selectMaterial(materialIndex)"
                >
                    {{ material.name ? material.name : `Material ${materialIndex + 1}` }}
                    <span
                        style="margin: 0 1rem;border: .1rem solid black;width: 1rem;height: 1rem;display: flex;align-items: center;justify-content: center;"
                        class="ri-subtract-line"
                        @click.stop="removeMaterial(materialIndex)"></span>
                </div>
            </div>
        </div>
        <div style="width: 16rem;display: flex;flex-direction: column">
            <div class="object-property-title">材质预览</div>
            <material-preview :material="preview" style="margin: 0 .5rem"></material-preview>
        </div>
        <div v-for="(value, key) in object3DProps"
             :key="key"
             class="object-property-content">
            <div class="object-property-title">{{ key }}</div>
            <div class="object-property-content">
                <div v-if="value.readonly">{{ value.data }}</div>
                <input v-else-if="value.type === MaterialPropertyType.String" type="text" v-model="value.data"/>
                <input v-else-if="value.type === MaterialPropertyType.Number" type="number" v-model.number="value.data" step="0.01"/>
                <input v-else-if="value.type === MaterialPropertyType.Boolean" type="checkbox" v-model="value.data"/>
                <input v-else-if="value.type === MaterialPropertyType.Color" type="color" v-model="value.data"/>
                <button v-else-if="value.type === MaterialPropertyType.Object" @click="openJsonPopups(value.data)"></button>
                <select v-else-if="value.type === MaterialPropertyType.Select" v-model="value.data">
                    <option v-for="option in value.options" :key="option.value" :value="option.value">
                        {{ option.label }}
                    </option>
                </select>
            </div>
        </div>
    </div>
</template>

<script setup lang="ts">
import {markRaw, onMounted, onUnmounted, ref, useTemplateRef} from "vue";
import {Material, Mesh, MeshStandardMaterial, Object3D} from "three";
import {TransformControls} from "three/examples/jsm/controls/TransformControls";
import {Event} from "three/src/core/EventDispatcher";
import {createMaterial} from "@/components/SceneEditor/ts/interface/MaterialImpl";
import {MaterialPropertyType} from "@/components/SceneEditor/ts/interface/MaterialInterface";
import {PreviewMaterial} from "@/components/SceneEditor/ts/PreviewMaterial";
import MaterialPreview from "@/components/SceneEditor/MaterialPreview.vue";
import createPopUps from "@/util/createPopUps";
import JsonEditorPopups from "@/components/SceneEditor/popups/JsonEditorPopups.vue";

const props = defineProps<{
    controls: TransformControls
}>();

const objectChanged = (event: Event<"object-changed", TransformControls>) => {
    const object = event.target.object;
    loadMaterial(object)
}

const openJsonPopups = (value:Object) =>{
    createPopUps(JsonEditorPopups,{
        title:"Json",
        data:{
            jsonStr:JSON.stringify(value,null, 2)
        }
    })
}

const updateObject3DProps = () => {
    if (materialList.value.length > 0 && materialList.value[currentMaterial.value]) {
        object3DProps.value = createMaterial(materialList.value[currentMaterial.value]);
    } else {
        object3DProps.value = {};
    }
}

const selectMaterial = (index: number) => {
    currentMaterial.value = index;
    updateObject3DProps();
}

const preview = ref<Material|Material[]>(new Material())

const loadMaterial = (object: Object3D | null) => {
    if (!object || !((object) instanceof Mesh)) {
        materialList.value = [];
        object3DProps.value = {};
        return;
    }
    materialList.value = [];
    const materials = object.material;
    if (Array.isArray(materials)) {
        for (const material of materials) {
            material.name = material.name || `Material ${material.id}`;
            materialList.value.push(material);
        }
    } else {
        materials.name = materials.name || `Material ${materials.id}`;
        materialList.value.push(materials);
    }
    currentMaterial.value = 0;
    updateObject3DProps();
    preview.value = materials;
}

let object3DProps = ref()
props.controls.addEventListener('object-changed', objectChanged);

const materialList = ref<Material[]>([]);
const currentMaterial = ref(0);

onMounted(() => {
    loadMaterial(props.controls.object!);
})

const addMaterial = () => {
    const mesh = props.controls.object as Mesh;
    if (!mesh) return;

    const material = new MeshStandardMaterial();
    material.name = `Material ${materialList.value.length + 1}`;

    if (Array.isArray(mesh.material)) {
        mesh.material.push(material);
    } else {
        mesh.material = [mesh.material, material];
    }
    //reload
    loadMaterial(mesh);
    selectMaterial(materialList.value.length - 1);
}

const removeMaterial = (index: number) => {
    const mesh = props.controls.object as Mesh;
    if (!mesh) return;
    if (!Array.isArray(mesh.material)) return;
    if (mesh.material.length <= 1) return;

    mesh.material.splice(index, 1);

    if (mesh.material.length === 1) {
        mesh.material = mesh.material[0];
    }
    
    loadMaterial(mesh);

    if (currentMaterial.value >= index) {
        currentMaterial.value = Math.max(0, materialList.value.length - 1);
    }
    selectMaterial(currentMaterial.value);
}
onUnmounted(()=>{
    props.controls.removeEventListener('object-changed', objectChanged);
})
</script>

<style scoped>

.object-property-content {
    display: flex;
    width: calc(100% - 4rem);
}

.object-property-container {
    display: flex;
    flex-direction: column;
    width: 100%;
    height: 100%;
}

.object-property-title {
    display: flex;
    align-items: center;
    width: 10rem;
    margin: .2rem;
}

.object-property-container > div {
    display: flex;
}

.material-list-container {
    border: .1rem solid black;
    padding: .5rem;
    margin: .5rem;
    width: calc(100% - 2rem);
}

</style>