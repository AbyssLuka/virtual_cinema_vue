<template>
    <div class="comic-detail-view">
        <div class="comic-detail-container" style="display: flex">
            <div class="comic-cover-container">
                <img :src="api.fileUrl(cover)"
                     alt=""
                     class="comic-cover"/>
            </div>
            <div class="comic-cover-info-container">
                <h2 class="comic-title">标题：{{ comicObj.title }}</h2>
                <h2>标签</h2>
                <h2>页数</h2>
                <h2>时间</h2>
                <div class="horiz">
                    <div class="luka-button">收藏</div>
                    <div class="luka-button">下载</div>
                </div>
            </div>
        </div>
        <div class="comic-detail-container">
            <div class="comic-page-container">
                <img :src="api.thumbnailUrl(image.fileUuid)"
                     v-for="(image,index) in comicObj.fileList"
                     :key="index"
                     class="comic-page"/>
            </div>
        </div>
    </div>
</template>
<script setup lang="ts">
import {reactive, onBeforeMount, ref} from "vue";
import {useRoute} from "vue-router";
import api from "@/request/api";
import {I_Detail_, I_ResData} from "@/global/interface";

const cover = ref("")
const comicObj = reactive<I_Detail_>({
    id: -1,
    clicks: -1,
    createTime: "0000-00-00",
    info: "",
    pathUuid: "",
    title: "",
    uuid: "",
    fileList: [],
});

onBeforeMount(async () => {
    await init();
});

const route = useRoute();

async function init(): Promise<void> {
    let uuid: string = route.query.data as string;
    let promise: I_ResData<I_Detail_ | null> = await api.comicApi(uuid);
    if (promise.data) {
        comicObj.uuid = promise.data.uuid;
        comicObj.clicks = promise.data.clicks;
        comicObj.id = promise.data.id;
        comicObj.info = promise.data.info;
        comicObj.createTime = promise.data.createTime;
        comicObj.fileList = promise.data.fileList;
        comicObj.pathUuid = promise.data.pathUuid;
        comicObj.title = promise.data.title;
        cover.value = comicObj.fileList[0].fileUuid;
    }
}


</script>

<style scoped>

@media (max-width: 500px) {
    .comic-page-container {
        grid-template-columns: repeat(2, 44%);
    }

    .comic-detail-container {
        width: 100vw;
    }
}

@media (min-width: 500px) and (max-width: 772px) {
    .comic-page-container {
        grid-template-columns: repeat(3, 30%);
    }

    .comic-detail-container {
        width: 100vw;
    }
}

@media (min-width: 772px) and (max-width: 980px) {
    .comic-page-container {
        grid-template-columns: repeat(4, 23%);
    }

    .comic-detail-container {
        width: 100vw;
    }
}

@media (min-width: 980px) and (max-width: 1200px) {
    .comic-page-container {
        grid-template-columns: repeat(5, calc(100% / 6));
    }

    .comic-detail-container {
        width: 1200px;
    }
}

@media (min-width: 1200px) {
    .comic-page-container {
        grid-template-columns: repeat(5, calc(100% / 6));
    }

    .comic-detail-container {
        width: 1200px;
    }
}

.comic-page-container {
    width: 100%;
    height: auto;
    display: grid;
    grid-gap: 10px;
    justify-content: center;
}

.comic-detail-container {
    height: auto;
    background: rgba(255, 255, 255, 0.5);
    margin: 10px 0;
    padding: 15px 0;
}

.comic-cover-info-container {
    width: 60%;
    height: 100%;
}


.comic-page {
    height: 100%;
    width: 100%;
    object-fit: cover;
}

.comic-detail-view {
    width: 100vw;
    height: 100%;
    display: flex;
    flex-direction: column;
    align-items: center;
    overflow-y: auto;

}

.comic-cover-container {
    width: 40%;
    height: auto;
    display: flex;
    justify-content: center;
    margin: 10px 0;
}

.comic-cover {
    width: 240px;
    height: 320px;
    background: black;

}
</style>