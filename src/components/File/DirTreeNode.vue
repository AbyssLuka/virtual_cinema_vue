<template>
    <div class="tree-view-container">
        <div class="vert-center">
            <div class="title-icon">
                <div :class="[
                     treeItemShow?'ri-play-line':'',
                     dir.type === 'directory'?'ri-play-fill':''
                ]"
                     :style="treeItemShow?'transform:rotate(90deg)':''"
                     style="width: 1rem;transition: .1s"
                >
                </div>
            </div>
            <div :class="[fileTypeIcon]"
                 style="cursor: pointer;"></div>
            <div class="tree-item-title"
                 :style="[currentNode === dir.uuid?'color:orangered':'']"
                 @click="[
                     openNode(props.dir,[]),
                     openDir(),
                     props.updateCurNode(dir.uuid)]"
            >{{ dir.title }}
            </div>
        </div>
        <div v-show="treeItemShow" class="tree-comment">
            <dir-tree-node v-for="(fileItem,index) in dir.subDir"
                           :key="index"
                           class="tree-sub-directory"
                           :dir="fileItem"
                           :path-index="index"
                           :update-cur-node="updateCurNode"
                           :current-node="props.currentNode"
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
    dir: I_TreeNode,
    pathIndex?: number,
    treeClick?: (data: I_TreeNode, indexList: number[]) => void;
    updateCurNode: (uuid: string) => void;
    currentNode: string,
}>(), {
    pathIndex: 0,
    treeClick: () => {
        //
    },
});

watch(() => props.dir, (newObj) => {
    treeItemShow.value = newObj.show;
}, {immediate: true});

onMounted(() => {
    loadIcon();
});

const openDir = () => {
    //打开文件夹并更新图标
    if (props.dir.type === "directory") {
        fileTypeIcon.value = !treeItemShow.value ? "ri-folder-open-fill" : "ri-folder-fill";
        treeItemShow.value = !treeItemShow.value;
    }
}

const loadIcon = () => {
    // 加载图标
    const fileType = props.dir.type.toLowerCase();
    const type = fileTypes[fileType];
    fileTypeIcon.value = iconMap[type] || "ri-file-fill";
}

const openNode = (data: I_TreeNode, pathIndex: number[]) => {
    pathIndex.push(props.pathIndex);
    props.treeClick(data, pathIndex);
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
}

</style>