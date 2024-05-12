<template>
    <div class="video-album-view-container">
        <div class="album-content-container">
            <div id="album-content" ref="albumContentDom">
                <!--:style="'transform:rotateY('+(index>current?'-50':(index<current?'50':'0'))+'deg)'"-->
                <transition-group>
                    <div class="album-item"
                         @click="[selectAlbum(index,true)]"
                         :class="[index>current?'current-right':(index<current?'current-left':'current')]"
                         v-for="(videoItem,index) in videoState.videoList"
                         :key="videoItem.uuid">
                        <div class="card left">
                            <img v-img-lazy style="width: 100%;height: 100%;object-fit: cover"
                                 :src="api.thumbnailUrl(videoItem.fileList.filter((fileItem)=>fileTypeList.image.includes(fileItem.fileType))[0]?.fileUuid)"
                                 @error="(e:Event)=>((<HTMLImageElement>e.target).src = '/image/ErrorImage.svg')"
                                 alt="">
                        </div>
                        <div class="card right">
                            <img v-img-lazy style="width: 100%;height: 100%;object-fit: cover"
                                 :src="api.thumbnailUrl(videoItem.fileList.filter((fileItem)=>fileTypeList.image.includes(fileItem.fileType))[0]?.fileUuid)"
                                 @error="(e:Event)=>((<HTMLImageElement>e.target).src = '/image/ErrorImage.svg')"
                                 alt="">
                        </div>
                        <div class="card cover">
                            <img v-img-lazy style="width: 100%;height: 100%;object-fit: cover"
                                 :src="api.thumbnailUrl(videoItem.fileList.filter((fileItem)=>fileTypeList.image.includes(fileItem.fileType))[0]?.fileUuid)"
                                 @error="(e:Event)=>((e.target as HTMLImageElement).src = '/image/ErrorImage.svg')"
                                 alt="">
                        </div>
                    </div>
                </transition-group>
            </div>
            <div class="album-title">
                <div class="" style="width: auto;height: 40px" :title="albumTitle">
                    {{ albumTitle }}
                </div>
                <div class="control-panel" ref="controlPanelDom">
                    <i class="control-icon ri-arrow-left-s-line ri-2x"
                       @mouseenter="[controlHover(0,'上一个')]"
                       @click="[selectAlbum(current-1,true)]"></i>
                    <i class="control-icon ri-video-line ri-2x"
                       @mouseenter="[controlHover(1,'播放')]"
                       @click="toDetail"></i>
                    <i class="control-icon ri-box-3-line ri-2x"
                       @mouseenter="[controlHover(2,'3D')]"
                       @click="to3DView"></i>
                    <i class="control-icon ri-arrow-right-s-line ri-2x"
                       @mouseenter="[controlHover(3,'下一个')]"
                       @click="[selectAlbum(current+1,true)]"></i>
                    <div class="control-title"
                         ref="controlTitleDom">{{ controlTitle }}
                    </div>
                </div>
            </div>
            <search-input :active="(keyword:string)=>{pageState.keyword = keyword;pageClick(0);}"
                          style="position: fixed;top: 50px;right: 100px;">
            </search-input>
        </div>
        <pagination-module
            class="pagination-module"
            :page="pageState.page"
            :size="pageState.size"
            :total="pageState.total"
            :active="pageClick">
        </pagination-module>
    </div>
</template>

<script setup lang="ts">
import {useRoute, useRouter} from "vue-router";
import {reactive, onMounted, watch, ref, onUnmounted} from "vue"
import PaginationModule from "@/components/module/PaginationModule.vue";
import {fileTypeList} from '@/global/global';
import api from "@/request/api";
import {I_Detail_} from "@/global/interface";
import SearchInput from "@/components/module/SearchInput.vue";

const route = useRoute();
const router = useRouter();

const pageState = reactive({
    page: 0,
    size: 1,
    total: 1,
    keyword: ""
});
const current = ref(0);
const albumTitle = ref("");
const controlTitle = ref("");
const controlTitleDom = ref();
const controlPanelDom = ref();
const albumContentDom = ref();

const videoState = reactive<{
    videoList: I_Detail_[]
}>({
    videoList: []
});

watch(() => route.query, () => {
    init();
});

onMounted(async () => {
    init();
});

onUnmounted(() => {
    document.removeEventListener("wheel", wheelCharge);
})

function controlHover(index: number, title: string) {
    const left = (controlPanelDom.value.offsetWidth - controlTitleDom.value.offsetWidth) / 3;
    controlTitle.value = title;
    controlTitleDom.value.style.left = left * index + "px";
}

function toDetail() {
    router.push({
        name: "VideoDetailView",
        query: {data: videoState.videoList[current.value].uuid}
    })
}

function to3DView() {
    router.push({
        name: "GameMain",
        query: {data: videoState.videoList[current.value].uuid}
    })
}

function selectAlbum(index: number, animation: boolean) {
    albumContentDom.value.style.transition = animation ? ".5s" : "0s";
    index = (index + videoState.videoList.length) % videoState.videoList.length;
    current.value = index;
    albumTitle.value = videoState.videoList[index]?.title;
    const number = ((index + 1) * -220) + (220 / 2) + window.innerWidth / 2;
    albumContentDom.value.style.transformOrigin = number + "px";
    albumContentDom.value.style.transform = "translateX(" + number + "px)";
    localStorage.setItem("/:current", index.toString());
}

function init() {
    const keyword = route.query.keyword;
    const page = route.query.page;
    const current = localStorage.getItem("/:current");
    pageState.keyword = <string>(keyword ? keyword : "");
    const promise = page ? getVideoList(+page) : getVideoList(0);
    promise.then(() => {
        const currentIndex = current === "NaN" ? 0 : (current ? +current : 0);
        selectAlbum(currentIndex, false);
    });
    document.addEventListener("wheel", wheelCharge);
}

const wheelCharge = (event: WheelEvent) => {
    if (event.deltaY < 0) {
        selectAlbum(current.value + 1, true);
    } else if (event.deltaY > 0) {
        selectAlbum(current.value - 1, true);
    }
}

function pageClick(page: number) {
    localStorage.setItem("/:current", "0");
    videoState.videoList = [];
    router.push({
        query: {keyword: pageState.keyword, page: page, x: Math.random()}
    });
}

async function getVideoList(page: number) {
    let resData = await api.animePostLimitApi({keyword: pageState.keyword, page: page, size: 36});
    if (!resData.data) return;
    if (resData.code === 200) {
        videoState.videoList = resData.data.content;
        if (resData.data.pageable) {
            pageState.page = resData.data.pageable.page;
            pageState.size = resData.data.pageable.size;
        }
        pageState.total = resData.data.total;
    }
    albumTitle.value = videoState.videoList[0]?.title;
}

</script>
<style>

</style>
<style scoped>

.control-icon {
    cursor: pointer;
    transition: .1s;
    user-select: none;
    width: 75px;
    height: 75px;
    display: flex;
    justify-content: center;
    align-items: center;
}

.control-title {
    border-top: 3px solid white;
    position: absolute;
    top: 80px;
    transition: .5s;
    width: 75px;
    font-size: 24px;
    display: flex;
    justify-content: center;
    align-items: center;
}

.control-icon:hover {
    transform: scale(1.5);
}

.current {
    transform: rotateY(0) translateZ(100px) scale(1.5);
    /*margin: 30px;*/
}

.current-left {
    transform: rotateY(50deg);

}

.current-right {
    transform: rotateY(-50deg);
}

.control-panel {
    color: white;
    width: 800px;
    display: flex;
    justify-content: space-between;
    transform: translateY(40px);
    position: relative;
}

.album-title {
    width: 100%;
    display: flex;
    align-items: center;
    flex-direction: column;
    color: white;
    transform: translate3d(0, 70px, 100px);
    font-size: 30px;
    font-weight: bold;
    text-shadow: 0 0 25px white;
}

.pagination-module {
    height: 100px;
    margin: 20px 0;
    background: rgba(255, 255, 255, 0.5);
    display: flex;
    align-items: center;
    justify-content: center;
}

#album-content {
    display: flex;
    transition: .5s;
    /*perspective: 1000000px;*/
    transform-style: preserve-3d;
    height: 280px;
}

.album-item {
    width: 180px;
    height: 250px;
    background-size: cover;
    flex-shrink: 0;
    margin: 20px;
    position: relative;
    transform-style: preserve-3d;
    transform-origin: center;
    transition: .5s;
    animation-timing-function: ease-out;
    box-shadow: 0 0 50px #ffffff;
}

.album-item:hover {
    transform: rotateZ(3deg) translateY(-40px);
}

.album-item:focus {
    pointer-events: none;
}

.album-item .card {
    height: 100%;
    position: absolute;
    transform-style: preserve-3d;
    perspective: 1000px;
    box-shadow: 0 0 10px #ffffff;
    background: #ffffff;
    -webkit-box-reflect: below 25px linear-gradient(transparent 50%, rgba(0, 0, 0, 0.33));
}

.album-item .cover {
    width: 100%;
    transform-origin: center;
}

.album-item:after {
    content: "";
    position: absolute;
    width: 100%;
    height: 20px;
    background: rgba(41, 41, 41, 0.25);
    box-shadow: 0 0 15px 15px rgba(41, 41, 41, 0.25);
    transform: rotateX(90deg) translate3d(0px, -20px, -265px);
}

.album-item .right {
    width: 20px;
    transform-origin: right;
    transform: rotateY(90deg) translateX(20px);
    right: 0;
    /*display: none;*/
}

.album-item .left {
    width: 20px;
    transform-origin: left;
    transform: rotateY(-90deg) translateX(-20px);
    left: 0;
    /*display: none;*/
}

.video-album-view-container {
    width: 100%;
    height: 100%;
    perspective: 1000px;
    transform-origin: center;
    backdrop-filter: blur(5px);
}

.album-content-container {
    width: 100%;
    height: calc(100% - 140px);
    display: flex;
    flex-direction: column;
    justify-content: center;
    /*align-items: center;*/
    transform-origin: center;
    transform-style: preserve-3d;
    perspective: 100vw;
    overflow: hidden;
}

.v-enter-active,
.v-leave-active {
    transition: opacity 0.5s ease;
}

.v-enter-from,
.v-leave-to {
    opacity: 0;
}
</style>