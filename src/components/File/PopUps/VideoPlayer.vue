<template>
    <div class="video-content">
        <div class="title video-title">正在播放：{{ videoTitle }}</div>
        <div class="video-container" ref="videoContainer">
            <video ref="videoPlayer" class="video-player" :src="videoUrl" :poster="cover"
                   @click="togglePlayPause">
                <track src="" default>
            </video>
            <div class="ass-container" ref="assContainer"></div>
            <div class="video-controls-hover"></div>
            <div class="video-controls">
                <div ref="orangeBar" class="orange-bar">
                    <div ref="orangeBuffering" class="orange-buffering"></div>
                    <div ref="orangeJuice" class="orange-juice"></div>
                </div>
                <div class="buttons">
                    <div ref="playAndPause"
                         class="play-pause ri-play-circle-line ri-2x"
                         @click="togglePlayPause"></div>
                    <div ref="fullScreenButton"
                         class="play-pause ri-fullscreen-line ri-2x"
                         @click="fullScreenFun"></div>
                    <div ref="subtitleButton"
                         class="play-pause ri-closed-captioning-fill ri-2x"
                         @click="visibleSubtitleFun"></div>
                </div>
            </div>
        </div>
    </div>
</template>

<script setup lang="ts">
import ASS from "assjs"
import util from "@/util/util";
import api from "@/request/api";

import {defineProps, watch, ref, onMounted, onBeforeMount} from "vue";
import {I_File, I_Video} from "@/global/interface";

const props = defineProps<{
    data: I_File,
    fullScreenStatus: boolean,
}>();

//监测屏幕对象
const videoPlayer = ref();
const orangeJuice = ref();
const orangeBar = ref();
const orangeBuffering = ref();
const playAndPause = ref();
const assContainer = ref();
const fullScreenButton = ref();
const subtitleButton = ref();
const videoContainer = ref();

const videoUrl = ref("");
const videoTitle = ref("");
const cover = ref("");
let ass: typeof ASS;

onMounted(() => {
    updateOrangeBar();
    OrangeBarClick();
    // videoPlayer.value.textTracks[0].mode = "showing";
});

// 进度条更新
function updateOrangeBar() {
    videoPlayer.value.addEventListener("timeupdate", () => {
        //视频长度
        const duration = videoPlayer.value.duration;
        //视频进度
        const currentTime = videoPlayer.value.currentTime;
        const juicePos = currentTime / duration;
        // 进度百分比
        orangeJuice.value.style.width = juicePos * 100 + "%";
        //缓冲段
        const buffereds = videoPlayer.value.buffered;
        if (buffereds.length > 0) {
            // 计算缓冲进度
            for (let i = 0; i < buffereds.length; i++) {
                const index = buffereds.length - (i + 1);
                //end为缓冲最后位置
                if (buffereds.end(index) < currentTime) continue;
                orangeBuffering.value.style.width = buffereds.end(index) / duration * 100 + "%";
                break;
            }
        }
        //视频结束
        if (videoPlayer.value.ended) {
            playAndPause.value.classList.remove("ri-play-circle-line");
        }
    });
}

// 点击进度条
function OrangeBarClick() {
    orangeBar.value.addEventListener("click", (event: PointerEvent) => {
        let x = event.offsetX;
        let w = orangeBar.value.offsetWidth;
        if (isNaN(videoPlayer.value.duration)) return;
        videoPlayer.value.currentTime = x / w * videoPlayer.value.duration;
    });
}

//全屏
function fullScreenFun() {
    if (document.fullscreenElement) {
        fullScreenButton.value.classList.add("ri-fullscreen-line");
        fullScreenButton.value.classList.remove("ri-fullscreen-exit-line");
        document.exitFullscreen();
    } else {
        fullScreenButton.value.classList.add("ri-fullscreen-exit-line");
        fullScreenButton.value.classList.remove("ri-fullscreen-line");
        videoContainer.value.requestFullscreen();
    }
}

//字幕显示
function visibleSubtitleFun() {
    const subtitleStatus = videoPlayer.value.textTracks[0].mode;
    if (subtitleStatus === "showing") {
        videoPlayer.value.textTracks[0].mode = "disabled";
        subtitleButton.value.classList.add("ri-closed-captioning-line");
        subtitleButton.value.classList.remove("ri-closed-captioning-fill");
        assContainer.value.style.display = "none";
    } else {
        videoPlayer.value.textTracks[0].mode = "showing";
        subtitleButton.value.classList.add("ri-closed-captioning-fill");
        subtitleButton.value.classList.remove("ri-closed-captioning-line");
        assContainer.value.style.display = "block";
    }
}

async function animeList(videoUuid: string) {
    const resData = (await api.videoApi(videoUuid));
    resData.data && playVideo(resData.data);
}

watch(() => props.data, (newData: I_File) => {
    videoTitle.value = newData.fileName;
    animeList(newData.fileUuid);
}, {immediate: true});

function togglePlayPause() {
    if (videoPlayer.value.paused) {
        playAndPause.value.classList.remove("ri-play-circle-line");
        playAndPause.value.classList.add("ri-pause-circle-line");
        videoPlayer.value.play();
    } else {
        playAndPause.value.classList.add("ri-play-circle-line");
        playAndPause.value.classList.remove("ri-pause-circle-line");
        videoPlayer.value.pause();
    }
}

function playVideo(videoItem: I_Video) {
    if (ass) ass.destroy();
    videoTitle.value = videoItem["videoName"];
    videoUrl.value = api.videoUrl(videoItem["videoUuid"]);
    if (videoItem["cover"] !== "")
        cover.value = api.fileUrl(videoItem["cover"]);
    if (videoItem.subtitle !== "null" && videoItem.subtitle !== "undefined" && videoItem.subtitle !== "") {
        loadSubtitle(videoItem.subtitle);
        updateAss();
    } else {
        console.log("未找到字幕")
    }
}

let animationFunId = 0;
const updateAss = () => {
    animationFunId = requestAnimationFrame(updateAss);
    ass && ass.resize();
};

onBeforeMount(() => {
    return cancelAnimationFrame(animationFunId);
});


function loadSubtitle(subtitle: string) {
    ass = new ASS(util.loadFile(api.fileUrl(subtitle)), videoPlayer.value, {
        container: assContainer.value
    });
}
</script>

<style scoped>
.orange-bar {
    height: 8px;
    width: 100%;
    background: black;
    cursor: pointer;
    position: relative;
}

.orange-buffering {
    height: 8px;
    width: 0;
    background: #cdcdcd;
}

.orange-juice {
    height: 8px;
    background: white;
    position: absolute;
    top: 0;
}

.buttons {
    padding: 0 20px;
    display: flex;
}

.buttons div {
    cursor: pointer;
}

.video-controls {
    position: absolute;
    height: 50px;
    width: 100%;
    bottom: 0;
    background: rgba(0, 0, 0, 0.6);
    display: flex;
    flex-wrap: wrap;
    transform: translateY(100%) translateY(-5px);
    transition: all .2s ease 1s;
}

.video-controls-hover {
    position: absolute;
    height: 50px;
    width: 100%;
    bottom: 0;
}

.video-controls-hover:hover + .video-controls {
    transform: translateY(0);
    transition-delay: 0s;
}

.video-controls:hover {
    transform: translateY(0);
    transition-delay: 0s;
}

.ass-container {
    pointer-events: none;
    height: 100%;
    width: 100%;
    position: absolute;
    top: 0;
}

.video-container {
    overflow: hidden;;
    width: 100%;
    height: calc(100% - 50px);
    position: relative;
}

.video-title {
    height: 30px;
    width: 100%;
    background: black;
}

.video-content {
    width: 100%;
    height: 100%;
}

.video-player {
    width: 100%;
    height: 100%;
    background: #111111;
}
</style>