<template>
    <div class="tree-view-container">
        <dir-tree-node
            v-for="dirItem in dir"
            :dir-node="dirItem"
            :key="dirItem.uuid"
            :tree-click="treeClick"
            :global-data="globalData"
        >
        </dir-tree-node>
    </div>
</template>

<script setup lang="ts">
import {defineProps, reactive} from "vue";
import {I_TreeNode} from "@/global/interface";
import DirTreeNode from "@/components/File/DirTreeNode.vue";

const {
    dropCallback = (_: I_TreeNode, __: I_TreeNode) => console.log("None Fn!"),
    treeClick = () => console.log("None Fn!")
} = defineProps<{
    dir: I_TreeNode[],
    treeClick?: (data: I_TreeNode, indexList: number[]) => void;
    dropCallback?: (start: I_TreeNode, end: I_TreeNode) => void,
}>()

const dragNodeFn = (dirNode: I_TreeNode) => {
    globalData.dragNode = dirNode;
}
const clickNodeFn = (uuid: string) => {
    globalData.clickNode = uuid;
}
const enterNodeFn = (uuid: string) => {
    globalData.enterNode = uuid;
}

const globalData = reactive<{
    clickNode: string
    enterNode: string
    dragNode: I_TreeNode | undefined,

    enterNodeFn: (uuid: string) => void
    dragNodeFn: (dirNode: I_TreeNode) => void
    clickNodeFn: (uuid: string) => void
    dropCallback: (start: I_TreeNode, end: I_TreeNode) => void,
}>({
    clickNode: Math.random().toString(16),
    enterNode: Math.random().toString(16),
    dragNode: undefined,

    enterNodeFn,
    dragNodeFn,
    clickNodeFn,
    dropCallback,
})

</script>

<style scoped>
/**/
</style>