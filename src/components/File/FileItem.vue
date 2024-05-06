<template>
    <div class="file-item-box" @click="nextFile(data)" :title="data.fileName">
        <i class="file-item-ico ri-2x" :class="[data.icon]"></i>
        <div class="file-item-info-box">
            <div class="file-item-name"> {{ data.fileName }}</div>
            <div class="file-item-text">大小：{{ data.fileSize }}</div>
            <div class="file-item-text">时间：{{ data.lastEditTime }}</div>
        </div>
    </div>
</template>

<script setup lang="ts">
import {defineProps} from "vue";
import {I_File} from "@/global/interface";

defineProps<{
    data: I_File,
    nextFile: (file: I_File) => Promise<void>,
}>();

</script>

<style scoped>

@media (max-width: 768px) {
    .file-item-box {
        width: calc(100% - 40px);
        height: 70px;
        margin: 5px 20px;
    }
}

@media (min-width: 768px) and (max-width: 1400px) {
    .file-item-box {
        width: 240px;
        height: 70px;
        margin: 10px 20px;
    }
}

@media (min-width: 1400px ) {
    .file-item-box {
        width: 240px;
        height: 70px;
        margin: 10px 20px;
    }
}

.file-item-box {
    cursor: pointer;
    background: white;
    box-shadow: 3px 3px 3px rgba(50, 50, 50, 0.5);
    display: flex;
    align-items: center;
}

.file-item-info-box {
    width: calc(100% - 70px);
    height: 50px;
}

.file-item-info-box:hover {
    color: orangered;
}

.file-item-ico {
    width: 50px;
    height: 50px;
    display: flex;
    justify-content: center;
    align-items: center;
    border: 2px solid white;
    margin: 0 10px;
}

.file-item-name {
    text-overflow: ellipsis;
    white-space: nowrap;
    overflow: hidden;
}

.file-item-text {
    font-size: 12px;
    color: #5d5d5d;
}
</style>