<template>
    <div class="tree-view-container"
         @dragover.prevent
         @dragenter.stop="dragenterFn"
         @dragleave.stop="dragleaveFn"
         @dragstart.stop="dragstartFn"
         draggable="true"
         :style="[globalData.enterNode === dirNode.uuid?'border:black solid .1rem':'']"
         @drop.stop="dropFn">
        <div class="vert-center">
            <div class="title-icon">
                <div :class="[treeItemShow?'ri-play-line':'ri-play-fill']"
                     :style="treeItemShow?'transform:rotate(90deg)':''"
                     style="width: 1rem;transition: .1s"
                     v-show="dirNode.subDir.length > 0"
                >
                </div>
            </div>
            <div :class="[fileTypeIcon]"
                 style="cursor: pointer;"></div>
            <div class="tree-item-title"
                 :style="[globalData.clickNode === dirNode.uuid?'color:orangered':'']"
                 @click="titleClick"
            >{{ dirNode.title }}
            </div>
        </div>
        <div v-show="treeItemShow" class="tree-comment">
            <dir-tree-node
                v-for="(fileItem,index) in dirNode.subDir"
                :key="fileItem.uuid"
                class="tree-sub-directory"
                :dir-node="fileItem"
                :path-index="index"
                :globalData="globalData"
                :treeClick="openNode">
            </dir-tree-node>
        </div>
    </div>
</template>

<script setup lang="ts">
import {fileTypes, iconMap} from "@/global/global";
import {defineProps, onMounted, watch, withDefaults, ref} from "vue";
import {I_TreeNode} from "@/global/interface";

const fileTypeIcon = ref("");
const treeItemShow = ref(false);

const props = withDefaults(defineProps<{
    dirNode: I_TreeNode,
    pathIndex?: number,
    treeClick?: (data: I_TreeNode, indexList: number[]) => void;
    globalData: {
        clickNode: string
        enterNode: string
        dragNode: I_TreeNode | undefined,

        enterNodeFn: (uuid: string) => void
        dragNodeFn: (dirNode: I_TreeNode) => void
        clickNodeFn: (uuid: string) => void
        dropCallback: (start: I_TreeNode, end: I_TreeNode) => void,
    }
}>(), {
    pathIndex: 0,
    treeClick: () => {
    },
});

watch(() => props.dirNode, (newObj) => {
    treeItemShow.value = !!newObj.show;
}, {immediate: true});

onMounted(() => {
    loadIcon();
});

const openDir = () => {
    //打开文件夹并更新图标
    if (props.dirNode.subDir.length > 0 && !props.dirNode.icon) {
        if (!treeItemShow.value) {
            fileTypeIcon.value = "ri-folder-open-fill";
        } else {
            fileTypeIcon.value = "ri-folder-fill";
        }
    }
    treeItemShow.value = !treeItemShow.value;
}

const loadIcon = () => {
    // 加载图标
    const fileType = props.dirNode.type.toLowerCase();
    const type = fileTypes[fileType];
    fileTypeIcon.value = iconMap[type] || "ri-file-fill";
    fileTypeIcon.value = props.dirNode.icon ? props.dirNode.icon : fileTypeIcon.value;
}

const openNode = (data: I_TreeNode, pathIndex: number[]) => {
    pathIndex.push(props.pathIndex);
    props.treeClick(data, pathIndex);
}

const titleClick = () => {
    openNode(props.dirNode, [])
    openDir()
    props.globalData.clickNodeFn(props.dirNode.uuid);
}

const dragstartFn = (_event: DragEvent) => {
    props.globalData.dragNodeFn(props.dirNode);
}
const dragenterFn = (_event: DragEvent) => {
    props.globalData.enterNodeFn(props.dirNode.uuid)
}
const dragleaveFn = (_event: DragEvent) => {
    // props.globalData.enterNodeFn(Math.random().toString(16))
}

const dropFn = (_event: DragEvent) => {
    props.globalData.enterNodeFn(Math.random().toString(16))
    if (props.globalData.dragNode?.uuid === props.dirNode.uuid) {
        return
    }
    props.globalData.dropCallback(<I_TreeNode>props.globalData.dragNode, props.dirNode)
}

</script>

<style scoped>
.title-icon {
    width: 1rem;
    height: 1rem;
}

.tree-comment {
    animation: tree .8s forwards;
}

@keyframes tree {
    from {
        opacity: 0;
    }
    to {
        opacity: 1;
    }
}

.tree-sub-directory {
    border: 0;
    margin: 0 20px;
}

.tree-item-title {
    user-select: none;
    white-space: nowrap;
}

.tree-item-title:hover {
    color: orangered;
}

.tree-view-container {
    width: auto;
    height: auto;
    border: solid transparent .1rem;
}

</style>