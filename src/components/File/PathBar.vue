<template>
    <div class="file-path">
        <div class="file-path-item">&nbsp;>&nbsp;</div>
        <div title="root" style="cursor: pointer;"
             @click="pathClick(0)">root
        </div>
        <div v-for="(item,index) in pathList" :key="index" style="display: flex;align-items: center;">
            <div class="file-path-item" :title="item" style="cursor: pointer"
                 @click="pathClick(index + 1)">{{ item }}
            </div>
            <div class="file-path-item">&nbsp;/&nbsp;</div>
        </div>
    </div>
</template>

<script setup lang="ts">
import {defineProps} from "vue";

const {
  pathList,
  pathClick = (index: number) => {
      console.log("空函数");
      console.log(index);
    }
} = defineProps<{
    pathList: string[],
    pathClick?: (index: number) => void,
}>();
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