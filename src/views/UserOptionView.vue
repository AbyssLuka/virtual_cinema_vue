<template>
    <div class="content-container">
        <div style="display: flex;align-items: center;">
            <img class="profile" :src="profileUrl" alt=""/>
            <BreadCrumbs :in-list="BreadCrumbsInList"
                         :symbol="'/'"
                         :default-index="defaultIndex"
                         :call-back="breadCrumbsClick">
            </BreadCrumbs>
        </div>
        <router-view></router-view>
    </div>
</template>

<script setup lang="ts">
import api from "@/request/api"
import BreadCrumbs from "@/components/module/BreadCrumbs.vue";

import {watch, onMounted, ref} from "vue";
import {useRoute, useRouter} from "vue-router";

const router = useRouter();
const route = useRoute();
const profileUrl = ref("")
const defaultIndex = ref(0)

const BreadCrumbsInList = [
    {title: "设置", path: "/user/option"},
    {title: "收藏", path: "/user/collect"},
];

watch(() => route.path, () => {
    BreadCrumbsInList.every((item, index) => {
        if (item.path === route.path) {
            defaultIndex.value = index;
            return false;
        } else return true;
    })
}, {immediate: true});

onMounted(async () => {
    profileUrl.value = await api.profileUrl();
});

function breadCrumbsClick(item: { title: string, path: string }) {
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
    backdrop-filter: blur(5px);
    border: 10px white solid;
    width: calc(96vw - 20px);
    height: calc(100vh - 4vw - 100px);
    overflow: auto;
    margin: 2vw 2vw;
}
.content-container::-webkit-scrollbar{
    display: none;
}

</style>