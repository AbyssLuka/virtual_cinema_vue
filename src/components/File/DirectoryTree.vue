<template>
    <div class="tree-view-container">
        <directory-tree-node
            :dir="dir"
            :tree-click="treeClick"
            :current-node="currentNode"
            :path-index="0"
            :update-cur-node="(uuid:string)=>{
                currentNode = uuid;
            }">
        </directory-tree-node>
    </div>
</template>

<script setup lang="ts">
import {defineProps, withDefaults, ref} from "vue";
import {I_TreeNode} from "@/global/interface";
import DirectoryTreeNode from "@/components/File/DirectoryTreeNode.vue";

withDefaults(defineProps<{
    dir: I_TreeNode,
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