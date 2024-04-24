<template>
    <div class="anime-container">
        <div class="content-container">
            <div class="content-container-left">
                <div class="anime-item" v-hori-anim-lazy
                     v-for="(item,index) in state.animeList" :key="index"
                     @mouseenter="state.hoverInfo = item">
                    <div class="luka-title anime-item-title"
                         @click="toDetail(item.uuid)">
                        #{{ item.id }} {{ item.title }}
                    </div>
                    <image-list :file-list="item['fileList']" :size="4"></image-list>
                    <div class="anime-item-foot horiz" style="justify-content: flex-end;">
                        <div class="text-hidden" style="font-weight: bold">{{ item["createTime"] }}</div>
                    </div>
                </div>
                <div v-show="pageable.total === 0"
                     style="height: 100%;width: 100%"
                     class="center">
                    <h2 style="color: white">没有找到！！！</h2>
                </div>
            </div>
            <div class="content-container-right">
                <label class="search">
                    <div class="ri-search-eye-line ri-3x"></div>
                    <input class="search-input"
                           type="text"
                           v-model="keyword"
                           @keydown.enter="pageClick(0)"/>
                </label>
                <div style="border: 5px white solid;width: calc(100% - 15px);height: calc(100% - 60px)">
                    <div style="margin: 10px 0 0 10px;height: 200px;width: 50%;background: white">
                        <div>标题：{{ state.hoverInfo.title }}</div>
                        <div>点击：{{ state.hoverInfo.clicks }}</div>
                        <div>信息：{{ state.hoverInfo.info }}</div>
                        <div>时间：{{ state.hoverInfo.createTime }}</div>
                    </div>
                </div>
            </div>
        </div>
        <pagination-module
            class="pagination-module"
            :page="pageable.page"
            :size="pageable.size"
            :total="pageable.total"
            :active="pageClick">
        </pagination-module>
    </div>
</template>

<script setup lang="ts">
import api from "@/request/api"
import PaginationModule from "@/components/module/PaginationModule.vue";
import ImageList from "@/components/module/ImageList.vue";
import {reactive, onMounted, nextTick, watch, onBeforeUnmount, ref} from "vue";
import {useRoute, useRouter} from "vue-router";
import {I_Detail_} from "@/global/interface";

const pageable = reactive({
    page: 0,
    size: 1,
    total: 1,
});

const keyword = ref("")

const state = reactive<{
    animeList: I_Detail_[],
    hoverInfo: {
        title: string,
        clicks: number,
        info: string,
        createTime: string,
    }
}>({
    animeList: [],                          //动漫列表
    hoverInfo: {                            //列表项悬浮
        title: "",
        clicks: 0,
        info: "",
        createTime: "",
    }
});

onMounted(async () => {
    await init();
});


const route = useRoute();
const router = useRouter();

watch(() => route.query, () => {
    init();
});


async function init() {
    const pathKeyword = route.query.keyword;
    const page = route.query.page;
    keyword.value = (pathKeyword ? pathKeyword : "") as string;
    await nextTick(() => {
        page ? getAnimePostData(+page) : getAnimePostData(0);
    });
}

//进入详情页
function toDetail(uuid: string) {
    router.push({
        name: "AnimeDetailView",
        query: {data: uuid}
    })
}

let loopFuncId = 0;

//请求动漫列表
async function getAnimePostData(page: number | string) {
    let resData = await api.animePostLimitApi({keyword: keyword.value, page: +page, size: 100});
    if (!resData.data) return;
    if (resData.code === 200) {
        state.animeList = [];
        let count = 0;
        let loopFun = () => {
            if (!resData.data) return;
            state.animeList.push(resData.data.content[count++]);
            if (count >= resData.data.content.length) {
                clearInterval(loopFuncId);
            }
        };
        loopFuncId = setInterval(loopFun, 100) as unknown as number;
        if (resData.data.pageable) {
            pageable.page = resData.data.pageable.page;
            pageable.size = resData.data.pageable.size;
        }
        pageable.total = resData.data.total;
    }
}

function pageClick(page: number) {
    router.push({
        query: {keyword: keyword.value, page: page,}
    });
}

onBeforeUnmount(() => {
    clearInterval(loopFuncId);
});
</script>

<style scoped>

@media (max-width: 768px) {
    .content-container-left {
        width: 100vw;
    }

    .anime-item-title {
        height: 30px;
        line-height: 30px;
    }

    .anime-item {
        margin: 3px 0;
    }

    .search {
        position: absolute;
        top: 70px;
        right: 10px;
        color: orangered;
    }

    .search-input {
        border: 0 solid orangered;
        border-bottom: 2px solid orangered;
        color: orangered;
    }
}

@media (min-width: 768px) {

    .content-container-left {
        width: 700px;
    }

    .anime-item-title {
        height: 50px;
        line-height: 50px;
    }

    .anime-item {
        margin: 0 0 15px 0;
    }

    .search {
        color: white;
    }

    .search-input {
        border: 0 solid white;
        border-bottom: 2px solid white;
        color: white;
    }
}

.search {
    height: 50px;
    display: flex;
    align-items: center;
}

.search-input {
    background: transparent;
    outline: none;
    height: 35px;
    transition: .2s linear;
    width: 0;
}

.search:hover .search-input {
    width: 150px
}

.search-input:focus,
.search-input:valid {
    width: 150px
}

.anime-item-foot {
    height: 30px;
    font-weight: bold;
    padding: 0 15px;
}

.anime-item-title {
    padding: 0 15px;
    font-weight: bold;
}

.anime-item-title:hover {
    color: orangered;
    cursor: pointer;
}

.content-container {
    width: 100vw;
    display: flex;
}

.content-container-left {
    height: calc(100vh - 200px);
    overflow-y: auto;
}

.content-container-left::-webkit-scrollbar, .content-container-right::-webkit-scrollbar {
    display: none;
}

.content-container-right {
    width: calc(100vw - 700px);
    height: calc(100vh - 200px);
    overflow-y: auto;
}

.anime-item {
    width: 100%;
    overflow-x: hidden;
    background: rgba(255, 255, 255, .5);
    box-shadow: 3px 3px 3px rgba(50, 50, 50, 0.5);
    backdrop-filter: blur(10px);
    transform: translateX(-100%);
}

.anime-container {
    width: 100%;
    height: 100%;
}

.pagination-module {
    height: 100px;
    margin: 20px 0;
    background: white;
    display: flex;
    align-items: center;
    justify-content: center;
}
</style>