<template>
    <div class="view-container">
        <div class="content">
            <div style="display: flex;align-items: center;">
                <div>类型</div>
                <bread-crumbs class="bread-crumbs" :in-list="state.breadCrumbs" :symbol="'|'"></bread-crumbs>
            </div>
            <div class="comic-content-container">
                <div v-for="(object,index) in state.comicList" :key="index" class="comic-container"
                     @click="toDetail(object.uuid)">
                    <div class="comic-cover-container">
                        <img :src="api.thumbnailUrl(object.fileList[0].fileUuid)" alt="" class="comic-cover"/>
                    </div>
                    <div class="luka-title" :title="object.title">{{object.title}}</div>
                </div>
            </div>
        </div>
    </div>
</template>

<script setup lang="ts">
    import BreadCrumbs from "@/components/module/BreadCrumbs.vue"
    import {reactive, onBeforeMount} from "vue";
    import {useRouter} from "vue-router";
    import api from "@/request/api";
    import {I_Detail_} from "@/global/interface";

    interface I_BreadCrumbs {
        title: string,
        path: string,
    }

    const state = reactive<{
        breadCrumbs: I_BreadCrumbs[],
        comicList: I_Detail_[],
    }>({
        comicList: [],
        breadCrumbs: [
            {title: "第一章", path: ""},
            {title: "第一章", path: ""},
            {title: "第一章", path: ""},
            {title: "第一章", path: ""},
            {title: "第一章", path: ""},
        ],
    });

    onBeforeMount(async () => {
        let resData = await api.comicListApi(0, 10);
        if (resData.data !== null) {
            state.comicList = resData.data.content;
        }
    });

    const router = useRouter();
    function toDetail(uuid: string): void {
        router.push({
            name: "ComicDetailView",
            query: {data: uuid,}
        });
    }
</script>
<style scoped>

    @media (max-width: 768px) {
        .comic-content-container {
            display: grid;
            grid-template-columns: repeat(4, calc(100vw / 4));
        }

        .content {
            width: 100vw;
            min-height: 100%;
            background: rgba(255, 255, 255, 0.5);
            overflow-x: auto;
        }
    }

    @media (min-width: 768px) {
        .comic-content-container {
            display: grid;
            grid-template-columns: repeat(6, calc(100% / 6));
        }

        .content {
            width: 980px;
            min-height: 100%;
            background: rgba(255, 255, 255, 0.5);
            overflow-x: auto;
        }
    }

    .luka-title {
        font-size: 12px;
        width: 100%;
    }

    /*.comic-content-container {*/
    /*    display: grid;*/
    /*    grid-template-columns: repeat(6,calc(980px / 6));*/
    /*}*/

    .comic-container {
        margin: 10px;
        cursor: pointer;
        display: flex;
        flex-direction: column;
        align-items: center;
    }

    .comic-cover-container {
        height: 135px;
        width: 100px;
        background: black;
        overflow: hidden;
    }

    .comic-cover {
        height: 100%;
        width: 100%;
    }

    .comic-cover:hover {
        transform: scale(1.1);
    }

    .bread-crumbs {
        color: white;
        height: 70px;
        width: calc(100% - 100px);
        padding: 10px;
        display: flex;
        align-items: center;
    }

    .view-container {
        width: 100vw;
        height: 100%;
        display: flex;
        justify-content: center;
    }

    /*.content {*/
    /*    width: 980px;*/
    /*    min-height: 100%;*/
    /*    background: rgba(255, 255, 255, 0.5);*/
    /*}*/
</style>