<template>
    <div class="image-content center">
        <img class="image-view" :src="imageUrl" alt="" @dblclick="props.fullScreen()" ref="imageDom"/>
        <div style="height: 10px;color: #111111;font-weight: bold">{{index}}</div>
        <div class="pre-image ri-arrow-left-s-line center ri-5x"
             @click="preImage()" v-show="index > 0"></div>
        <div class="next-image ri-arrow-right-s-line center ri-5x"
             @click="nextImage()" v-show="index < state.imageList.length - 1"></div>
    </div>
</template>

<script setup lang="ts">
import {reactive, watch, defineProps, withDefaults,ref} from "vue"
import {I_File} from "@/global/interface";
import api from "@/request/api";

interface I_PropsData {
    list: I_File[],
    defaultIndex: number,
}

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

const state = reactive<{
    imageList: I_File[],
}>({
    imageList: [],
});

const imageDom = ref();
const imageUrl = ref("");
const imageTitle = ref("");
const index = ref(0);

watch(() => props.data, (newImgObj: I_PropsData) => {
    index.value = newImgObj.defaultIndex;
    imageTitle.value = newImgObj.list[index.value].fileName;
    imageUrl.value = api.fileUrl(newImgObj.list[index.value].fileUuid);
    state.imageList = newImgObj.list
}, {immediate: true});

function preImage() {
    imageTitle.value = state.imageList[--index.value].fileName;
    imageUrl.value = "data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7";
    setTimeout(()=>{
        imageUrl.value = api.fileUrl(state.imageList[index.value].fileUuid);
    },50)
    props.updateTitle(imageTitle.value);
}

function nextImage() {
    imageTitle.value = state.imageList[++index.value].fileName;
    imageUrl.value = "data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7";
    setTimeout(()=> {
        imageUrl.value = api.fileUrl(state.imageList[index.value].fileUuid);
    },50)
    props.updateTitle(imageTitle.value);
}
</script>

<style scoped>
.image-content {
    position: relative;
    width: 100%;
    height: 100%
}

.image-view {
    width: auto;
    height: calc(100% - 30px);
}

.next-image {
    width: 30px;
    height: 80px;
    position: absolute;
    right: 10px;
    cursor: pointer;
}

.pre-image {
    width: 30px;
    height: 80px;
    position: absolute;
    left: 10px;
    cursor: pointer;
}

.next-image:hover, .pre-image:hover {
    color: orangered;
}
</style>