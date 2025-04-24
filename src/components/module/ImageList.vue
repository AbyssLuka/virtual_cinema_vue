<template>
    <div class="item-img-container">
        <div class="item-image"
             v-for="(imageObject,index) in imageList" :key="index">
            <img alt="" v-img-lazy :src="api.thumbnailUrl(imageObject.fileUuid)" class="image"
                 @click="openImage(imageObject)"
            />
        </div>
    </div>
</template>

<script setup lang="ts">
import {fileTypeList} from "@/global/global";
import {defineProps, watch, ref} from "vue"
import ImagePopUps from "@/components/File/PopUps/ImagePopUps.vue";
import createPopUps from "@/util/createPopUps";
import api from "@/request/api";
import {I_File} from "@/global/interface";

const imageList = ref<I_File[]>([]);
const props = defineProps<{
    fileList: I_File[],
    size: number,
}>();

watch(() => props.fileList, () => {
    imageList.value = props.fileList.filter((fileItem: I_File) => fileTypeList.image.includes(fileItem.fileType)).splice(0, props.size);
}, {immediate: true});

const openImage = (imgObj: I_File) => {
    createPopUps(ImagePopUps, {
        title: imgObj.fileType,
        popUpsId: "image",
        data: {
            list: [imgObj],
            defaultIndex: 0
        }
    });
}
</script>

<style scoped>

@media (max-width: 768px) {
    .item-image {
        width: 60px;
        height: 60px;
    }
}

@media (min-width: 768px) {

    .item-image {
        width: 100px;
        height: 100px;
    }
}

.item-image {
    overflow: hidden;
    border: 5px black solid;
    margin: 0 0 0 18px;
}

.image {
    width: 100%;
    height: 100%;
    object-fit: cover;
    transform: scale(1);
    transition: .3s;
}

.image:hover {
    transform: scale(1.1);
}

.item-img-container {
    display: flex;
    width: 100%;
    overflow-x: auto;
}

.item-img-container::-webkit-scrollbar {
    display: none;
}
</style>