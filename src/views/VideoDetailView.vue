<template>
    <div style="width: 100%;height: 100%;display: flex;justify-content: center;">
        <div class="content-container box">
            <div class="video-container">
                <video :src="state.currentPlay.url" controls>
                    <track :src="subtitleUrl" kind="subtitles" default>
                </video>
                <div class="episode-container">
                    <div class="horiz-warp">
                        <div class="episode-item box center" v-for="(item,index) in state.fileList.filter(
                            fileListItem=>fileTypeList.video.includes(fileListItem['fileType'])
                        )" :key="index" :class="[index === state.currentPlay.index?'episode-item-playing':'']"
                             @click="[playVideo(item) ,state.currentPlay.index=index]" :title="item['fileName']">
                            P.{{ index + 1 }}
                        </div>
                    </div>
                </div>
            </div>
            <div class="operate">
                <div class="luka-button button">点赞</div>
                <div class="luka-button button" @click="[state.collectInfo.status?delCollect():addCollect()]"
                     :style="[state.collectInfo.status?'color: orangered;':'color: black;']">
                    {{ state.collectInfo.text }}
                </div>
                <div class="luka-button button" @click="copyUrl">分享</div>
            </div>
            <hr/>
            <div class="introduction">
                <image-list :size="state.fileList.length" :fileList="state.fileList"
                            class="item-img-container"></image-list>
                <div>
                    <div class="title">标题：{{ videoTitle }}</div>
                    <div class="title">简介：{{ videoInfo }}</div>
                </div>
            </div>
            <hr/>
        </div>
        <circle-menu class="circle-menu" :menu-list="state.menuList"></circle-menu>
    </div>
</template>
<script setup lang="ts">
import CircleMenu from "@/components/module/CircleMenu.vue";
import ImageList from "@/components/module/ImageList.vue";
import AddAnimeTag from "@/components/AnimePostDetail/PopUps/AddAnimeTag.vue";
import {fileTypeList} from "@/global/global";
import useClipboard from "vue-clipboard3"
import api from "@/request/api";
import util from "@/util/util";
import {reactive, onMounted, ref} from "vue";
import {I_File} from "@/global/interface";
import createPopUps from "@/util/createPopUps";
import {useRoute, useRouter} from "vue-router";

const videoTitle = ref("")
const videoInfo = ref("")
const subtitleUrl = ref("")

const state = reactive<{
    fileList: I_File[],
    currentPlay: {
        index: number,
        name: string,
        url: string,
    },
    collectInfo: {
        status: boolean,
        text: string,
    },
    menuList: I_MenuList[],
}>({
    fileList: [],
    currentPlay: {
        index: 0,
        name: "",
        url: "",
    },
    collectInfo: {
        status: false,
        text: "收藏",
    },
    menuList: [],
});

interface I_MenuList {
    icon: string,
    active: () => void;
}

onMounted(() => {
    init();
    initMenuList();
});

const router = useRouter();

function initMenuList() {
    state.menuList = [
        {
            icon: "ri-home-2-fill",
            active: () => {
                console.log(1)
            }
        },
        {
            icon: "ri-game-fill",
            active: () => {
                console.log(2)
            }
        },
        {
            icon: "ri-hashtag",
            active: () => {
                createPopUps(AddAnimeTag, {
                    title: "添加TAG",
                    data: {},
                    popUpsId: "addTag",
                });
            }
        },
        {
            icon: "ri-video-add-fill",
            active: () => {
                console.log(4)
            }
        },
        {
            icon: "ri-link-m",
            active: () => {
                router.push({
                    name: "ThreeJs",
                    query: {
                        data: route.query.data
                    }
                });
            }
        },
        {
            icon: "ri-star-fill",
            active: () => {
                console.log(6)
            }
        },
    ];
}

async function copyUrl() {
    const {toClipboard} = useClipboard();
    try {
        await toClipboard(window.location.href);
        alert("URL已复制！")
    } catch (e) {
        console.error(e)
    }
}

const route = useRoute();

async function addCollect() {
    let animeUuid = <string>route.query.data;
    console.log(animeUuid)
    let resData = await api.addCollectApi(animeUuid);
    if (resData.code === 200) {
        state.collectInfo.text = "已收藏";
        state.collectInfo.status = true;
    } else {
        state.collectInfo.text = "收藏";
        state.collectInfo.status = false;
    }
}

async function delCollect() {
    let animeUuid = <string>route.query.data;
    let resData = await api.unCollectApi(animeUuid);
    if (resData.code === 200) {
        state.collectInfo.text = "收藏";
        state.collectInfo.status = false;
    } else {
        state.collectInfo.text = "已收藏";
        state.collectInfo.status = true;
    }
}


async function init() {
    let uuid: string = route.query.data as string;
    let resData = await api.animePostApi(uuid);
    if (!resData.data) return;
    state.fileList = resData.data.detail.fileList;
    videoTitle.value = resData.data.detail.title;
    videoInfo.value = resData.data.detail.info;
    let firstVideo = state.fileList.filter(
        fileListItem => fileTypeList.video.includes(fileListItem.fileType)
    )[0];           //先播放的视频
    state.currentPlay.url = api.videoUrl(firstVideo.fileUuid);
    state.currentPlay.name = firstVideo.fileName;
    await loadSubtitle(firstVideo.fileUuid);
    if (![undefined, null, "null", "undefined", ""].includes(localStorage.getItem("token"))) {
        let resData = await api.collectIsHaveApi(uuid);
        if (resData.data) {
            state.collectInfo.text = "已收藏";
            state.collectInfo.status = true;
        } else {
            state.collectInfo.text = "收藏";
            state.collectInfo.status = false;
        }
    }

}

function playVideo(fileObj: I_File) {
    //播放视频并重新加载字幕
    state.currentPlay.name = fileObj.fileName;
    state.currentPlay.url = api.videoUrl(fileObj.fileUuid);
    loadSubtitle(fileObj.fileUuid);
}

async function loadSubtitle(videoUuid: string) {
    let subtitle = await api.subtitleApi(videoUuid);
    subtitleUrl.value = <string>(await util.assToVtt(subtitle, "URL"));
    if (!subtitleUrl.value || subtitleUrl.value === "") {
        console.log("没有字幕")
    }
}
</script>

<style scoped>

@media (max-width: 768px) {
    .content-container {
        width: 100vw;
        height: 100%;
        overflow-y: auto;
    }

    .video-container video {
        background: black;
        width: 100%;
        height: auto;
    }

    .video-container .episode-container {
        width: 100%;
        height: auto;
        overflow-x: auto;
    }
}

@media (min-width: 768px) {
    .content-container {
        width: 980px;
        height: 100%;
        overflow-y: auto;
    }

    .video-container {
        display: flex;
        margin: 20px 0 0 0;
    }

    .video-container video {
        background: black;
        width: 720px;
        height: 480px;
    }

    .video-container .episode-container {
        width: 260px;
        height: 480px;
        overflow-x: auto;
    }
}

.circle-menu {
    position: absolute;
    bottom: 150px;
    right: 150px;
}

.button {
    margin: 0 10px;
}

.operate {
    height: 50px;
    width: 100%;
    display: flex;
    margin: 10px 0;

}

.content-container::-webkit-scrollbar {
    display: none;
}

.item-img-container {
    display: flex;
    padding: 10px 10px;
    width: calc(100% - 20px);
    overflow-x: auto;
}

.item-img-container::-webkit-scrollbar {
    display: none;
}

.video-container .episode-container::-webkit-scrollbar {
    display: none;
}


.introduction {

}

hr {
    margin: 10px 0;
    border: none;
    height: 5px;
    border-top: 5px dotted black;
}

.episode-item {
    width: 100px;
    height: 30px;
    font-weight: bold;
    margin: 0 10px 10px 10px;
    cursor: pointer;
    user-select: none;
}

.episode-item-playing {
    color: orangered;
}

.episode-item:hover {
    background: black;
    color: white;
}

.episode-item:active {
    position: relative;
    top: 3px;
}
</style>