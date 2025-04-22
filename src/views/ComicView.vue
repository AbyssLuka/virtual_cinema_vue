<template>
    <div class="view-container">
        <div class="content">
            <div class="comic-content-container">
                <div v-for="(object,index) in comicList"
                     :key="index"
                     class="comic-container"
                     @click="toDetail(object.uuid)">
                    <div class="comic-cover-container">
                        <img :src="api.thumbnailUrl(object.fileList[0].fileUuid)"
                             alt=""
                             class="comic-cover"
                             v-img-lazy/>
                    </div>
                    <div class="comic-title" :title="object.title">{{ object.title }}</div>
                </div>
            </div>
        </div>
        <search-input :active="(keyword:string)=>{pageState.keyword = keyword;pageClick(0);}"
                      style="position: fixed;top: 100px;right: 100px;">
        </search-input>
        <pagination-module
            :page="pageState.page"
            :size="pageState.size"
            :total="pageState.total"
            :active="pageClick"
            class="pagination-module"
        ></pagination-module>
    </div>
</template>

<script setup lang="ts">
import {reactive, onBeforeMount,ref} from "vue";
import {useRouter} from "vue-router";
import api from "@/request/api";
import {I_Detail_} from "@/global/interface";
import PaginationModule from "@/components/module/PaginationModule.vue";
import SearchInput from "@/components/module/SearchInput.vue";

const comicList = ref<I_Detail_[]>([]);

const pageState = reactive({
    page: 0,
    size: 30,
    total: 0,
    keyword:"",
})

onBeforeMount(async () => {
    pageClick(0);
});

const pageClick = (index: number) => {
    comicList.value = [];
    api.comicListApi({page: index, size: pageState.size}).then((res) => {
      if (!res.data) return;
      comicList.value = res.data.content;
      if (res.data.pageable) {
        pageState.page = res.data.pageable.pageNumber;
        pageState.size = res.data.pageable.pageSize;
      }
      pageState.total = res.data.total;
    }).catch((err) => {
        console.error(err);
    });

}

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
}

@media (min-width: 768px) {
    .comic-content-container {
        display: grid;
        grid-template-columns: repeat(5, calc(100% / 5));
    }
}

.content {
    width: 100vw;
    max-width: 980px;
    height: calc(100% - 100px);
    background: rgba(255, 255, 255, 0.5);
    overflow-x: auto;
    margin: 20px 0;
}

.content::-webkit-scrollbar {
    display: none;
}

.pagination-module {
    height: 100px;
    margin: 20px 0;
    background: rgba(255, 255, 255, 0.5);
    display: flex;
    align-items: center;
    justify-content: center;
}

.comic-title {
    font-size: 13px;
    width: 100%;
    font-weight: bold;
}

.comic-container {
    margin: 10px;
    cursor: pointer;
    display: flex;
    flex-direction: column;
    align-items: center;
}

.comic-cover-container {
    height: 200px;
    width: 150px;
    background: black;
    overflow: hidden;
}

.comic-cover {
    height: 100%;
    width: 100%;
    object-fit: cover;
}

.comic-cover:hover {
    transform: scale(1.1);
}

.view-container {
    width: 100vw;
    height: 100%;
    display: flex;
    align-items: center;
    flex-direction: column;
}

</style>