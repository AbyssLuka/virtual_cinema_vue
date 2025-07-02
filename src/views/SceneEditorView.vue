<template>
    <div class="container">
        <div class="object-list">
            <object-tree :cb="detectMesh"></object-tree>
        </div>
        <div class="object-property">
            <div style="width: 100%;height: 100%;">
                <div style="display: flex;">
                    <div @click="properShow = 1"
                         class="properties-tab"
                         :class="[properShow===1?'properties-tab-selected':'']">属性
                    </div>
                    <div @click="properShow = 2"
                         class="properties-tab"
                         :class="[properShow===2?'properties-tab-selected':'']">材质
                    </div>
                    <div @click="properShow = 3"
                         class="properties-tab"
                         :class="[properShow===3?'properties-tab-selected':'']">纹理
                    </div>
                </div>

                <div v-if="properShow === 1" style="overflow: auto; height: calc(100% - 2rem);">
                    <object-property :controls="transformControls"></object-property>
                </div>
                <div v-if="properShow === 2" style="overflow: auto; height: calc(100% - 2rem);">
                    <material-component :controls="transformControls"></material-component>
                </div>
                <div v-if="properShow === 3" style="overflow: auto; height: calc(100% - 2rem);">
                    <texture-component></texture-component>
                </div>
            </div>
        </div>
        <div class="scene-content">
            <div class="operation-container">
                <div class="operation-item ri-2x"
                     @click="[transformStatus = editor.changeTransform()]"
                     :class="{
                                'ri-drag-move-line': transformStatus === 'translate',
                                'ri-loop-right-line': transformStatus === 'rotate',
                                'ri-expand-diagonal-line': transformStatus === 'scale'
                            }"
                ></div>
                <div class="operation-item ri-2x ri-arrow-left-up-box-line"></div>
                <div class="operation-item ri-2x"></div>
                <div class="operation-item ri-2x"></div>
                <div class="operation-item ri-2x"></div>
            </div>
            <div class="editor-canvas-container" ref="canvas-container">
            </div>
            <div class="view-helper" ref="view-helper-container">

            </div>
        </div>
        <div class="title-util">
            <header-menu></header-menu>
        </div>
    </div>
</template>

<script setup lang="ts">
import {
    Clock,
    Object3D,
} from "three";
import {onMounted, onUnmounted, ref, useTemplateRef,} from "vue";
import {detectInit} from "@/components/SceneEditor/ts/DetectModel";
import {CustomViewHelper} from "@/components/SceneEditor/ts/CustomViewHelper";
import ObjectProperty from "@/components/SceneEditor/ObjectProperty.vue";
import HeaderMenu from "@/components/SceneEditor/HeaderMenu.vue";
import ObjectTree from "@/components/SceneEditor/ObjectTree.vue";
import MaterialComponent from "@/components/SceneEditor/MaterialComponent.vue";
import TextureComponent from "@/components/SceneEditor/TextureComponent.vue";
import {saveScene} from "@/components/SceneEditor/ts/AutoSave";
import {editor} from "@/components/SceneEditor/ts/Editor";
import {initKeyBind} from "@/components/SceneEditor/ts/BindKey";

const properShow = ref(1);
const clock = new Clock();

const transformControls = editor.transformControls;

transformControls.addEventListener('object-changed', () => {
    targetObject.value = transformControls.object!;
});

const targetObject = ref<Object3D>(new Object3D());

const detectMesh = (mesh: Object3D) => {
    transformControls.attach(mesh)
}

const canvasContainer = useTemplateRef<HTMLDivElement>("canvas-container");
onMounted(() => {
    canvasContainer.value!.appendChild(editor.renderer.domElement);
    editor.renderer.setSize(canvasContainer.value!.clientWidth, canvasContainer.value!.clientHeight);
    sceneInit();
    editor.renderer.setAnimationLoop(animate);
    windowResizeFn();
    initKeyBind()
});
const {dispose: detectDispose, updateBoxHelperColor} = detectInit(editor);
updateBoxHelperColor(0xffffff);
const sceneInit = () => {
    saveScene.load();
    customViewHelper = new CustomViewHelper(
        editor.renderer.domElement,
        viewHelperContainer.value!,
    );
    customViewHelper.syncCamera(editor.camera, editor.orbitControls);
}

const viewHelperContainer = useTemplateRef<HTMLDivElement>("view-helper-container");
let customViewHelper: CustomViewHelper | null = null;

const windowResizeFn = () => {
    // 更新渲染器比例
    const {clientWidth:w,clientHeight:h} = canvasContainer.value!
    editor.canvasResize(w,h)
}

window.addEventListener('resize', windowResizeFn);
editor.renderer.autoClear = false;
const animate = () => {
    const detail = clock.getDelta();
    editor.renderer.clear();
    editor.renderer.render(editor.scene, editor.camera);
    customViewHelper?.update(detail, editor.renderer);
    transformControls.update(detail);
    editor.camera.updateProjectionMatrix();
};

const transformStatus = ref(transformControls.getMode());
onUnmounted(() => {
editor.dispose();
    window.removeEventListener('resize', windowResizeFn);
    detectDispose();
})

</script>

<style scoped>

.view-helper {
    width: 6rem;
    aspect-ratio: 1/1;
    background: rgba(224, 224, 224, 0.1);
    position: absolute;
    right: 1rem;
    bottom: 1rem;
}

.properties-tab {
    padding: 0 0 0 .5rem;
    width: 3rem;
    height: 2rem;
    display: flex;
    align-items: center;
}

.properties-tab-selected {
    color: orangered;
    background: #dedede;
}

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
        6fr 6fr 4fr;
    grid-template-rows:
        1fr
        6fr
        14fr;
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
    overflow: hidden;
}

.scene-content {
    grid-area: scene-content;
    position: relative;
    overflow: hidden;
}

.object-list {
    grid-area: object-list;
    overflow-x: auto;
    overflow-y: auto;
    background: #ffffff;
}

</style>