<template>
    <div class="tree-view-container">
        <dir-tree-node v-for="dirItem in dir"
            :dir="dirItem"
            :tree-click="treeClick"
            :current-node="currentNode"
            :path-index="0"
            :update-cur-node="(uuid)=>{
                currentNode = uuid;
            }">
        </dir-tree-node>
    </div>
</template>

<script setup lang="ts">
import {defineProps, withDefaults, ref} from "vue";
import {I_TreeNode} from "@/global/interface";
import DirTreeNode from "@/components/File/DirTreeNode.vue";

withDefaults(defineProps<{
    dir: I_TreeNode[],
    treeClick?: (data: I_TreeNode, indexList: number[]) => void;
}>(), {
    treeClick: () => {
        //
    },
});

const currentNode = ref("root");

</script>

<style scoped>
/**/
</style>