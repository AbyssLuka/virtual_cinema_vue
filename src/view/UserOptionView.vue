<template>
    <div class="content-container">
        <div style="display: flex;align-items: center;">
            <img class="profile" :src="state.profileUrl" alt=""/>
            <BreadCrumbs :in-list="state.BreadCrumbsInList"
                         :symbol="'/'"
                         :default-index="state.defaultIndex"
                         :call-back="breadCrumbsClick">
            </BreadCrumbs>
        </div>
        <router-view></router-view>
    </div>
</template>

<script setup lang="ts">
    import api from "@/request/api"
    import BreadCrumbs from "@/components/module/BreadCrumbs.vue";

    import {reactive, watch, onMounted} from "vue";
    import {useRoute, useRouter} from "vue-router";

    const router = useRouter();
    const route = useRoute();

    const state = reactive<{
        profileUrl: string,
        BreadCrumbsInList: { title: string, path: string }[],
        defaultIndex: number,
    }>({
        profileUrl: "",
        BreadCrumbsInList: [
            {title: "设置", path: "/user/option"},
            {title: "收藏", path: "/user/collect"},
        ],
        defaultIndex: 0,
    });

    interface I_BreadCrumbsItem {
        title: string,
        path: string,
    }

    watch(() => route.path, () => {
        state.BreadCrumbsInList.every((item: I_BreadCrumbsItem, index: number) => {
            if (item.path === route.path) {
                state.defaultIndex = index;
                return false;
            } else {
                return true;
            }
        })
    }, {immediate: true});

    onMounted(async () => {
        state.profileUrl = await api.profileUrl();
    });

    function breadCrumbsClick(item: I_BreadCrumbsItem) {
        router.push(item.path);
    }
</script>

<style scoped>

    @media (max-width: 768px) {
        .profile {
            width: 50px;
            height: 50px;
            border: 10px white solid;
            margin: 10px;
        }
    }

    @media (min-width: 768px) {
        .profile {
            width: 100px;
            height: 100px;
            border: 10px white solid;
            margin: 10px;
        }
    }

    .content-container {
        border: 10px white solid;
        width: calc(96vw - 20px);
        height: calc(100vh - 100px);
        overflow: auto;
        margin: 0 2vw;
    }
</style>