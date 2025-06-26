<template>
    <div class="object-tree-container">
        <dir-tree
            class="tree-container"
            :dir="dirTree"
            :tree-click="treeClick"
            :drop-callback="dropCallback"
        ></dir-tree>
    </div>
</template>

<script setup lang="ts">
import DirTree from "@/components/File/DirTree.vue";
import {markRaw, ref} from "vue";
import {Object3D, Scene} from "three";
import {I_TreeNode} from "@/global/interface";
import {editor} from "@/components/SceneEditor/ts/Editor";
// import {editorScene} from "@/components/SceneEditor/ts/Global";

const props = defineProps<{
    cb: (obj: Object3D) => void;
}>()

const dirTree = ref<I_TreeNode[]>([
    {
        title: "Scene",
        uuid: editor.scene.uuid,
        show: true,
        type: "directory",
        data: markRaw(editor.scene),
        subDir: []
    },
    {
        title: "Camera",
        uuid: "camera",
        type: "file",
        icon: "ri-vidicon-2-line",
        subDir: []
    },
]);

editor.addEventListener("model-add", (newModel) => {
    const createIcon = (type: string) => {
        return (Object.entries({
            "Mesh": "ri-box-3-line",
            "Group": "ri-archive-2-line",
            "Light": "ri-lightbulb-line",
            "Camera": "ri-camera-line",
            "Helper": "ri-grid-line",
        }).find(([key]) => type.includes(key)) || [])[1];
    }
    const dfs = (child: Object3D, dir: I_TreeNode) => {
        const newDir: I_TreeNode = {
            data: markRaw(child),
            uuid: child.uuid,
            subDir: [],
            title: child.name ? child.name : child.constructor.name,
            type: child.children.length > 0 ? "directory" : "",
            icon: createIcon(child.constructor.name),
        };
        dir.subDir.push(newDir);
        child.children.forEach((child) => {
            dfs(child, newDir);
        });
    }
    if (!newModel) return;
    dfs(newModel, dirTree.value[0]);
})

const treeClick = (node: I_TreeNode) => {
    console.log(node)
    //TODO:过滤Helper
    if (node.data instanceof Scene) return;
    if (node.data?.constructor.name.includes('Helper')) return;
    props.cb(<Object3D>node.data);
};

const dropCallback = (start: I_TreeNode, end: I_TreeNode) => {
    console.log(start.title, end.title)
    const startObject: Object3D = start.data;
    const endObject: Object3D = end.data;
    if (
        ((startObject) instanceof Object3D) &&
        ((endObject) instanceof Object3D)
    ) {
        dfsRemove(dirTree.value[0], start.uuid)
        endObject.add(startObject);
        if (!(endObject instanceof Scene)) { //防止与场景对象的监听事件冲突
            console.log("endObject instanceof Scene")
            end.subDir.push(start);
        }
    }
}

const dfsRemove = (node: I_TreeNode, uuid: string) => {
    node.subDir.forEach((item, index) => {
        console.log(item.uuid, uuid)
        if (item.uuid === uuid) {
            node.subDir.splice(index, 1);
        } else {
            dfsRemove(item, uuid)
        }
    })
}

editor.addEventListener("model-remove", (removedModel) => {
    if (!removedModel) return;
    dfsRemove(dirTree.value[0], removedModel.uuid);
});

</script>

<style scoped>
.object-tree-container, .tree-container {
    width: 100%;
    height: 100%;
}
</style>