<template>
    <div v-for="(anime,index) in state.collectList" :key="index" class="collect-list box">
        <div class="luka-title collect-title" @click="toDetail(anime['animeViewData']['uuid'])">
            {{anime["animeViewData"]["title"]}}
        </div>
        <image-list class="image-list" :size="4" :fileList="anime['animeViewData']['fileList']"></image-list>
        <div class="luka-title" style="display: flex;justify-content: flex-end;">
            {{anime["animeViewData"]["createTime"]}}
        </div>
    </div>
</template>

<script setup lang="ts">
    import api from "@/request/api";
    import {fileTypeList} from '@/global/global';
    import ImageList from "@/components/module/ImageList.vue";
    import {useRouter} from "vue-router";
    import {reactive, onMounted} from "vue";

    import {I_Pageable, I_ResData} from "@/global/interface";

    const router = useRouter();

    const state = reactive({
        collectList: [],
        fileTypeList: fileTypeList,
        api: api,
    });
    onMounted(async () => {
        let reData: I_ResData<I_Pageable> = await api.collectListApi(1, 10) as unknown as I_ResData<I_Pageable>;
        state.collectList = reData.data.content;
    });

    function toDetail(uuid: string) {
        router.push({
            name: "AnimeDetailView",
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