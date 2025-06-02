<template>
    <div class="header-menu-container">
        <div class="util-item"
             tabindex="-1"
             v-for="(menuItem, index) in menuOptions"
             :key="index"
             @click="showMenu(index)"
        >
            <div>{{ menuItem.name }}</div>
            <div class="util-item-menu">
                <div v-for="(item, index) in menuItem.options"
                     :key="index"
                     @click.stop="item.action()"
                >
                    {{ item.name }}
                </div>
            </div>
        </div>
    </div>
</template>

<script setup lang="ts">
import {ref} from "vue";
import {editorScene, gui, MODEL_LIST} from "@/components/SceneEditor/ts/Global";
import {GLTFLoader} from "three/examples/jsm/loaders/GLTFLoader";
import {Mesh, SpotLight, SpotLightHelper} from "three";

const showIndex = ref(-1)
const showMenu = (index: number) => {
    showIndex.value = index;
}
const openFileEl = document.createElement("input");
openFileEl.setAttribute("type", "file");
openFileEl.addEventListener("change", (event) => {
    const file = (<HTMLInputElement>event.target).files?.[0];
    if (!file) return;
    const reader = new FileReader();
    const gltfLoader = new GLTFLoader();
    reader.onloadend = async () => {
        const result = reader.result;
        const gltf = await gltfLoader.parseAsync(<string>result, "");
        const object = gltf.scene;
        object.traverse((child) => {
            if ((child) instanceof Mesh) {
                child.castShadow = true;
                child.receiveShadow = true;
                MODEL_LIST.push(child);
            }
        });
        editorScene.add(object);
    }
    reader.readAsArrayBuffer(file);
});
const addFile = () => {
    openFileEl.click();
}

const menuOptions = [
    {
        name: "文件",
        options: [
            {name: "新建", action: addFile},
            {name: "打开", action: () => console.log("打开")},
            {name: "保存", action: () => console.log("保存")},
            {name: "导入", action: () => console.log("导入")},
            {name: "导出", action: () => console.log("导出")}
        ]
    },
    {name: "编辑", options: []},
    {
        name: "添加",
        options: [
            {name: "立方体", action: () => console.log("添加立方体")},
            {name: "球体", action: () => console.log("添加球体")},
            {name: "平面", action: () => console.log("添加平面")},
            {name: "圆柱体", action: () => console.log("添加圆柱体")},
            {name: "圆环", action: () => console.log("添加圆环")},
            {name: "圆锥", action: () => console.log("添加圆锥")},
            {
                name: "聚光灯", action: () => {
                    const light = new SpotLight(0xffffff, 10000);
                    const spotLightHelper = new SpotLightHelper(light);
                    light.position.set(0, 30, 0);
                    light.castShadow = true;
                    editorScene.add(light);
                    editorScene.add(spotLightHelper);
                    gui.add(light, "intensity", 0, 10, 0.1).name("聚光灯强度");
                    gui.add(light, "distance", 0, 100, 1).name("聚光灯距离");
                    gui.add(light, "angle", 0, Math.PI / 2, 0.1).name("聚光灯角度");
                    gui.add(light, "penumbra", 0, 1, 0.1).name("聚光灯边缘");
                    gui.add(light, "decay", 0, 2, 0.1).name("衰减");
                    gui.add(light, "castShadow").name("投射阴影");
                    gui.add(light.position, "x",0,50,1).name("x");
                    gui.add(light.position, "y",0,50,1).name("y");
                    gui.add(light.position, "z",0,50,1).name("z");
                    gui.add(spotLightHelper, "visible").name("显示辅助线");
                    gui.add(spotLightHelper, "update").name("更新辅助线");
                    gui.add(spotLightHelper, "dispose").name("删除辅助线");
                }
            },
        ]
    },
    {name: "视图", options: []},
    {name: "帮助", options: []}
] as const;

</script>

<style scoped>
.util-item-menu {
    position: absolute;
    top: 1.5rem;
    left: 0;
    background: white;
    width: 5rem;
    display: none;
}

.util-item-menu div {
    margin: .4rem;
}

.util-item-menu div:hover {
    color: orangered;
}

.header-menu-container {
    width: 100%;
    height: 100%;
    display: flex;
    align-items: center;
}

.util-item {
    margin: 0 1rem;
    position: relative;
}

.util-item:focus > .util-item-menu {
    display: block;
}

.util-item:hover {
    cursor: pointer;
}

</style>