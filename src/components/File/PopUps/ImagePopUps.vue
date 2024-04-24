<template>
    <div class="image-content center">
        <img class="image-view" :src="state.imageUrl" alt="" @dblclick="props.fullScreen()"/>
        <div class="pre-image ri-arrow-left-s-line center ri-2x"
             @click="preImage()" v-show="state.index > 0"></div>
        <div class="next-image ri-arrow-right-s-line center ri-2x"
             @click="nextImage()" v-show="state.index < state.imageList.length - 1"></div>
    </div>
</template>

<script setup lang="ts">
import {baseUrl} from "@/global/global"
import {reactive, watch, defineProps, withDefaults} from "vue"
import {I_File} from "@/global/interface";

interface I_PropsData {
    list: I_File[],
    defaultIndex: number,
}

const state = reactive<{
    imageUrl: string,
    imageTitle: string,
    index: number,
    imageList: I_File[],
    nextImageStatus: boolean,
    preImageStatus: boolean,
}>({
    imageUrl: "",
    imageTitle: "",
    index: 0,
    imageList: [],
    nextImageStatus: false,
    preImageStatus: false,
});

const props = withDefaults(defineProps<{
    data: I_PropsData,
    updateTitle?: (title: string) => void,
    fullScreen?: (status?: boolean) => void,
}>(), {
    updateTitle: (title: string) => console.log(title),
    fullScreen: (status?: boolean) => {
        console.log("updateFullScreen函数为undefined！！！");
        console.log(status);
    },
});

watch(() => props.data, (newImgObj: I_PropsData) => {
    state.index = newImgObj.defaultIndex;
    state.imageTitle = newImgObj.list[state.index].fileName;
    state.imageUrl = baseUrl + "/file/" + newImgObj.list[state.index].fileUuid;
    state.imageList = newImgObj.list
}, {immediate: true});

function preImage() {
    state.imageTitle = state.imageList[--state.index].fileName;
    state.imageUrl = baseUrl + "/file/" + state.imageList[state.index].fileUuid;
    props.updateTitle(state.imageTitle);
}

function nextImage() {
    state.imageTitle = state.imageList[++state.index].fileName;
    props.updateTitle(state.imageTitle);
    state.imageUrl = baseUrl + "/file/" + state.imageList[state.index].fileUuid;
}
</script>

<style scoped>
.image-content {
    position: relative;
    width: 100%;
    height: 100%;
}

.image-view {
    width: auto;
    height: 100%;
}

.next-image {
    width: 30px;
    height: 80px;
    position: absolute;
    right: 10px;
    border: 2px solid #c3c3c3;
    cursor: pointer;
}

.pre-image {
    width: 30px;
    height: 80px;
    position: absolute;
    left: 10px;
    border: 2px solid #c3c3c3;
    cursor: pointer;
}

.next-image:hover, .pre-image:hover {
    background: black;
}
</style>