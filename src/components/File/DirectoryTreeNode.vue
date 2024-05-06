<template>
    <div class="tree-view-container">
        <div class="vert-center">
            <div class="title-icon">
                <div class="title-icon-wire-first"></div>
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
            <directory-tree-node v-for="(fileItem,index) in dir.subDirectory" :key="index"
                            :class="[dir.subDirectory.length-1!==index ?
                            'tree-sub-directory':'tree-sub-directory-last']"

                            :dir="fileItem"
                            :path-index="index"
                            :update-cur-node="updateCurNode"
                            :current-node="props.currentNode"
                            :treeClick="openNode">
            </directory-tree-node>
        </div>
    </div>
</template>

<script setup lang="ts">
import {fileTypeList} from "@/global/global";
import {defineProps, onMounted, watch, withDefaults, ref} from "vue";
import {I_TreeNode} from "@/global/interface";

const fileTypeIcon = ref("");
const treeItemShow = ref(false);

const props = withDefaults(defineProps<{
    dir: I_TreeNode,
    pathIndex?: number,
    treeClick?: (data: I_TreeNode, indexList: number[]) => void;
    updateCurNode: (uuid:string) => void;
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

function openDir() {
    //打开文件夹并更新图标
    if (props.dir.type === "directory") {
        fileTypeIcon.value = !treeItemShow.value ? "ri-folder-open-fill" : "ri-folder-fill";
        treeItemShow.value = !treeItemShow.value;
    }
}

function loadIcon() {
    // 加载图标
    let fileType = props.dir?.type?.toLowerCase();
    if (fileTypeList.package.includes(fileType)) {
        fileTypeIcon.value = "ri-folder-zip-fill";
    } else if (fileTypeList.audio.includes(fileType)) {
        fileTypeIcon.value = "ri-file-music-fill";
    } else if (fileTypeList.video.includes(fileType)) {
        fileTypeIcon.value = "ri-movie-fill";
    } else if (fileTypeList.image.includes(fileType)) {
        fileTypeIcon.value = "ri-image-fill";
    } else if (fileTypeList.document.includes(fileType)) {
        fileTypeIcon.value = "ri-file-text-fill";
    } else if (fileTypeList.link.includes(fileType)) {
        fileTypeIcon.value = "ri-link";
    } else if (fileTypeList.directory.includes(fileType)) {
        fileTypeIcon.value = "ri-folder-fill";
    } else {
        fileTypeIcon.value = "ri-file-fill";
    }
}

function openNode(data: I_TreeNode, pathIndex: number[]) {
    pathIndex.push(props.pathIndex);
    props.treeClick(data, pathIndex);
}

</script>

<style scoped>
.title-icon {
    width: 15px;
    height: 20px;
}

.title-icon-wire-first {
    width: 15px;
    height: 10px;
    border: 0;
    border-bottom: 2px solid black;
    border-left: 2px solid black;
    position: relative;
    left: -2px;
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
    border-left: 2px solid black;
    margin: 0 20px;
}

.tree-sub-directory-last {
    border: 0;
    border-left: 2px solid transparent;
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