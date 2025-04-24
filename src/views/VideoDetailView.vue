<template>
    <div style="width: 100%;height: 100%;display: flex;justify-content: center;">
        <div class="content-container box">
            <div class="video-container">
                <video :src="currentPlay.url" controls>
                    <track :src="subtitleUrl" kind="subtitles" default>
                </video>
                <div class="episode-container">
                    <div class="horiz-warp">
                        <div class="episode-item box center" v-for="(item,index) in fileList.filter(
                            fileListItem=>fileTypeList.video.includes(fileListItem['fileType'])
                        )" :key="index" :class="[index === currentPlay.index?'episode-item-playing':'']"
                             @click="[playVideo(item) ,currentPlay.index=index]" :title="item['fileName']">
                            P.{{ index + 1 }}
                        </div>
                    </div>
                </div>
            </div>
            <div class="operate">
                <div class="luka-button button">点赞</div>
                <div class="luka-button button" @click="[collectInfo.status?delCollect():addCollect()]"
                     :style="[collectInfo.status?'color: orangered;':'color: black;']">
                    {{ collectInfo.text }}
                </div>
                <div class="luka-button button" @click="copyUrl">分享</div>
            </div>
            <hr/>
            <div class="introduction">
                <image-list :size="fileList.length" :fileList="fileList"
                            class="item-img-container"></image-list>
                <div>
                    <div class="title">标题：{{ videoTitle }}</div>
                    <div class="title">简介：{{ videoInfo }}</div>
                </div>
            </div>
            <hr/>
        </div>
        <circle-menu class="circle-menu" :menu-list="menuList"></circle-menu>
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

const fileList = ref<I_File[]>([])
const menuList = ref<I_MenuList[]>([])
const currentPlay = reactive<{
    index: number,
    name: string,
    url: string,
}>({
    index: 0,
    name: "",
    url: "",
})
const collectInfo = reactive<{
    status: boolean,
    text: string,
}>({
    status: false,
    text: "收藏",
})

interface I_MenuList {
    icon: string,
    active: () => void;
}

onMounted(() => {
    init();
    initMenuList();
});

const router = useRouter();

const initMenuList = () => {
    menuList.value = [
        {
            icon: "ri-home-2-fill",
            active: () => console.log(1)

        },
        {
            icon: "ri-game-fill",
            active: () => console.log(2)
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
            active: () => console.log(4)
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
            active: () => console.log(6)
        },
    ];
}

const copyUrl = async () => {
    const {toClipboard} = useClipboard();
    try {
        await toClipboard(window.location.href);
        alert("URL已复制！")
    } catch (e) {
        console.error(e)
    }
}

const route = useRoute();

const addCollect = () => {
    const videoUuid = <string>route.query.data;
    api.addCollectApi(videoUuid).then((res) => {
        if (res.code === 200) {
            collectInfo.text = "已收藏";
            collectInfo.status = true;
        } else {
            collectInfo.text = "收藏";
            collectInfo.status = false;
        }
    });
}

const delCollect = () => {
    let animeUuid = <string>route.query.data;
    api.unCollectApi(animeUuid).then((res) => {
        if (res.code === 200) {
            collectInfo.text = "收藏";
            collectInfo.status = false;
        } else {
            collectInfo.text = "已收藏";
            collectInfo.status = true;
        }
    });
}


const init = () => {
    const uuid = <string>route.query.data;
    api.animePostApi(uuid).then((res) => {
        if (!res.data) return;
        fileList.value = res.data.detail.fileList;
        videoTitle.value = res.data.detail.title;
        videoInfo.value = res.data.detail.info;
        let firstVideo = fileList.value.filter(
            fileListItem => fileTypeList.video.includes(fileListItem.fileType)
        )[0];           //先播放的视频
        currentPlay.url = api.videoUrl(firstVideo.fileUuid);
        currentPlay.name = firstVideo.fileName;
        loadSubtitle(firstVideo.fileUuid);
        const token = localStorage.getItem("token");
        if (![undefined, null, "null", "undefined", ""].includes(token)) return;
        api.collectIsHaveApi(uuid).then((res) => {
            if (res.data) {
                collectInfo.text = "已收藏";
                collectInfo.status = true;
            } else {
                collectInfo.text = "收藏";
                collectInfo.status = false;
            }
        });
    });
}

const playVideo = (fileObj: I_File) => {
    //播放视频并重新加载字幕
    currentPlay.name = fileObj.fileName;
    currentPlay.url = api.videoUrl(fileObj.fileUuid);
    loadSubtitle(fileObj.fileUuid);
}

const loadSubtitle = (videoUuid: string) => {
    api.subtitleApi(videoUuid).then((res) => {
        util.assToVtt(res, "URL").then((res) => {
            subtitleUrl.value = <string>res
            if (!subtitleUrl.value || subtitleUrl.value === "") {
                console.log("没有字幕")
            }
        })
    });
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