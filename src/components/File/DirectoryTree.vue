<template>
    <div class="tree-view-container">
        <div class="vert-center">
            <div class="title-icon">
                <div class="title-icon-wire-first"></div>
            </div>
            <div :class="[state.fileTypeIcon]"
                 style="cursor: pointer"></div>
            <div class="tree-item-title"
                 @click="[openNode(props.dir,[]),openDir()]">{{ props.dir.title }}
            </div>
        </div>
        <div v-show="state.treeItemShow" class="tree-comment">
            <directory-tree v-for="(item_,index) in props.dir.subDirectory" :key="index"
                            :class="[props.dir.subDirectory.length-1!==index ?
                            'tree-sub-directory':'tree-sub-directory-last']"
                            :dir="item_"
                            :path-index="index"
                            :treeClick="openNode">
            </directory-tree>
        </div>
    </div>
</template>

<script setup lang="ts">
import {fileTypeList} from "@/global/global";
import {reactive, defineProps, onMounted, watch, withDefaults} from "vue";
import {I_TreeNode} from "@/global/interface";

const state = reactive<{
    fileTypeIcon: string,
    treeItemShow: boolean,
}>({
    fileTypeIcon: "",
    treeItemShow: false,
});

const props = withDefaults(defineProps<{
    dir: I_TreeNode,
    pathIndex?: number,
    treeClick?: (data: I_TreeNode, indexList: number[]) => void;
}>(), {
    pathIndex: 0,
    treeClick: (data: I_TreeNode, indexList: number[]) => {
        console.log("空函数");
        console.log(data);
        console.log(indexList);
    }
});

watch(() => props.dir, (newObj) => {
    state.treeItemShow = newObj?.show as boolean;
}, {immediate: true});

onMounted(() => {
    loadIcon();
});

function openDir() {
    //打开文件夹并更新图标
    if (props.dir?.type === "directory") {
        if (!state.treeItemShow) {
            state.fileTypeIcon = "ri-folder-open-fill";
        } else {
            state.fileTypeIcon = "ri-folder-fill";
        }
        state.treeItemShow = !state.treeItemShow;
    }
}

function loadIcon() {
    // 加载图标
    let fileType = props.dir?.type;
    if (fileTypeList.package.includes(fileType)) {
        state.fileTypeIcon = "ri-folder-zip-fill";
    } else if (fileTypeList.audio.includes(fileType)) {
        state.fileTypeIcon = "ri-file-music-fill";
    } else if (fileTypeList.video.includes(fileType)) {
        state.fileTypeIcon = "ri-movie-fill";
    } else if (fileTypeList.image.includes(fileType)) {
        state.fileTypeIcon = "ri-image-fill";
    } else if (fileTypeList.document.includes(fileType)) {
        state.fileTypeIcon = "ri-file-text-fill";
    } else if (fileTypeList.link.includes(fileType)) {
        state.fileTypeIcon = "ri-link";
    } else if (fileTypeList.directory.includes(fileType)) {
        state.fileTypeIcon = "ri-folder-fill";
    } else {
        state.fileTypeIcon = "ri-file-fill";
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