<template>
    <div class="file-path">
        <div class="file-path-item">&nbsp;&nbsp;>&nbsp;&nbsp;</div>
        <div title="根目录" style="cursor: pointer;"
             @click="props.pathClick(null,0)">root
        </div>
        <div class="file-path-item">&nbsp;&nbsp;/&nbsp;&nbsp;</div>
        <div v-for="(item,index) in props.pathList" :key="index" style="display: flex;align-items: center;">
            <div class="file-path-item" :title="item.fileName" style="cursor: pointer"
                 @click="props.pathClick(item,index + 1)">{{ item.fileName }}
            </div>
            <div class="file-path-item">&nbsp;&nbsp;/&nbsp;&nbsp;</div>
        </div>
    </div>
</template>

<script setup lang="ts">
import {defineProps, withDefaults} from "vue";
import {I_File} from "@/global/interface";

const props = withDefaults(defineProps<{
    pathList: I_File[],
    pathClick?: (item: I_File | null, index: number) => void,
}>(), {
    pathClick: (item: I_File | null, index: number) => {
        console.log("空函数");
        console.log(item);
        console.log(index);
    }
});
</script>

<style scoped>
.file-path {
    overflow-x: auto;
    user-select: none;
    display: flex;
    height: 50px;
    background: rgba(255, 255, 255, 0.50);
    backdrop-filter: blur(10px);
    align-items: center;
}

.file-path::-webkit-scrollbar {
    display: none;
}

.file-path-item:hover {
    color: orangered;
}

.file-path-item {
    font-size: 12px;
    line-height: 30px;
    text-align: center;
    height: 30px;
    max-width: 160px;
    padding: 0 5px;
    text-overflow: ellipsis;
    white-space: nowrap;
    overflow: hidden;
}

</style>