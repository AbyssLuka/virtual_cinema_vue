<template>
    <div v-for="(anime,index) in collectList" :key="index" class="collect-list box">
        <div class="luka-title collect-title" @click="toDetail(anime['videoViewData']['uuid'])">
            {{ anime["videoViewData"]["title"] }}
        </div>
        <image-list class="image-list" :size="4" :fileList="anime['videoViewData']['fileList']"></image-list>
        <div class="luka-title" style="display: flex;justify-content: flex-end;">
            {{ anime["videoViewData"]["createTime"] }}
        </div>
    </div>
</template>

<script setup lang="ts">
import api from "@/request/api";
import ImageList from "@/components/module/ImageList.vue";
import {useRouter} from "vue-router";
import {onMounted, ref} from "vue";


const router = useRouter();
const collectList = ref([]);
onMounted(() => {
    api.collectListApi(1, 10).then((res) => {
        if (res.data) collectList.value = res.data.content;
    });
});

const toDetail = (uuid: string) => {
    router.push({
        name: "VideoDetailView",
        query: {data: uuid,}
    })
}
</script>

<style scoped>
.luka-title {
    cursor: pointer;
}

.luka-title:hover {
    color: orangered;
}

.collect-list {
    width: 100%;
    height: auto;
    margin: 10px 0;
}

.image-list {
    margin: 10px 0;
}
</style>