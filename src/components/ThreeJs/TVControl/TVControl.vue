<template>
    <div style="width: 100%;height: 100%;background: rgba(0,0,0,0.50);position: fixed" ref="cursorContainer">
        <div class="tv_control_content">
            <div style="display: flex;flex-wrap: wrap">
                <div class="tv_control_button_container">
                    <div class="tv_control_button ri-play-circle-line ri-3x" ref="playAndPause"></div>
                    <div class="tv_control_button_title">播放</div>
                </div>
                <div class="tv_control_button_container">
                    <div class="tv_control_button ri-fullscreen-line ri-3x" ref="fullScanner"></div>
                    <div class="tv_control_button_title">全屏</div>
                </div>
                <div class="tv_control_button_container">
                    <div class="tv_control_button ri-closed-captioning-line ri-3x" ref="visibleSubtitle"></div>
                    <div class="tv_control_button_title">字幕</div>
                </div>
            </div>
            <div style="width: calc(100% - 20px)">
                <h2 style="color: white">进度条</h2>
                <div ref="orangeBar" class="orange-bar">
                    <div ref="orangeBuffering" class="orange-buffering"></div>
                    <div ref="orangeJuice" class="orange-juice"></div>
                </div>
            </div>
            <div style="width: calc(100% - 20px)">
                <h2 style="color: white">音量</h2>
                <div ref="volumeBar" class="orange-bar">
                    <div ref="volumeJuice" class="orange-juice"></div>
                </div>
            </div>
        </div>
        <div class="cursor" ref="cursor"></div>
    </div>
</template>

<script setup lang="ts">
import {defineProps, onBeforeUnmount, onMounted, Ref, useTemplateRef} from "vue";

const cursor = useTemplateRef<HTMLDivElement>("cursor");
const cursorContainer = useTemplateRef<HTMLDivElement>("cursorContainer");
const playAndPause = useTemplateRef<HTMLDivElement>("playAndPause");
const visibleSubtitle = useTemplateRef<HTMLDivElement>("visibleSubtitle");
const orangeBar = useTemplateRef<HTMLDivElement>("orangeBar");
const orangeBuffering = useTemplateRef<HTMLDivElement>("orangeBuffering");
const orangeJuice = useTemplateRef<HTMLDivElement>("orangeJuice");
const fullScanner = useTemplateRef<HTMLDivElement>("fullScanner");
const volumeBar = useTemplateRef<HTMLDivElement>("volumeBar");
const volumeJuice = useTemplateRef<HTMLDivElement>("volumeJuice");

const props = defineProps<{
    visible: Ref<boolean>,
    tvVideoDom: HTMLVideoElement,
    currentTime: (time: number) => void,
    volume: (vol: number) => void,
    updateVideoCallback: () => void,
    onUpdateTime: (callback: (
        orangeJuice: number,
        orangeBuffering: number,
        volumeJuice: number,
        ended: boolean
    ) => void) => void,
    fullscreen: () => void,
}>();

console.log(props.currentTime)

onMounted(() => {
    //监听video标签，获取            进度                    缓存                      音量                是否结束
    props.onUpdateTime((orangeJuice_: number, orangeBuffering_: number, volumeJuice_: number, ended_: boolean) => {
        orangeJuice.value!.style.width = orangeJuice_ + "%";
        orangeBuffering.value!.style.width = orangeBuffering_ + "%";
        volumeJuice.value!.style.width = volumeJuice_ + "%";
        if (!ended_) return;
        //视频播放结束更换图标
        playAndPause.value!.classList.remove("ri-play-circle-line");
        playAndPause.value!.classList.add("ri-pause-circle-line");

    })
});

onBeforeUnmount(() => {
    document.removeEventListener("mousemove", mousemove);
    document.removeEventListener("mousedown", mousedown);
});

function mousemove(event: MouseEvent) {
    if (!document.pointerLockElement) return;
    let y = cursor.value!.offsetTop;
    let x = cursor.value!.offsetLeft;
    if ((x <= 0 && y <= 0) && !props.visible.value) return;
    const movementX = event.movementX || 0;
    const movementY = event.movementY || 0;
    if (y > cursorContainer.value!.clientHeight) y = cursorContainer.value!.clientHeight;
    if (x > cursorContainer.value!.clientWidth) x = cursorContainer.value!.clientWidth;
    if (y < 0) y = 0;
    if (x < 0) x = 0;
    cursor.value!.style.top = (y + movementY) + "px";
    cursor.value!.style.left = (x + movementX) + "px";
}

//指针(伪)移动
document.addEventListener("mousemove", mousemove);

//修改进度
function timeupdate() {
    if (!check(orangeBar.value!, cursor.value!)) return;
    if (isNaN(props.tvVideoDom.duration)) return;
    const x = cursor.value!.offsetLeft;
    const w = orangeBar.value!.offsetWidth;
    props.currentTime(x / w);
}

//播放与暂停
function playAndPauseFun() {
    if (!check(playAndPause.value!, cursor.value!)) return;
    if (props.tvVideoDom.paused) {
        props.tvVideoDom.play();
        playAndPause.value!.classList.add("ri-pause-circle-line");
        playAndPause.value!.classList.remove("ri-play-circle-line");
    } else {
        props.tvVideoDom.pause();
        playAndPause.value!.classList.add("ri-play-circle-line");
        playAndPause.value!.classList.remove("ri-pause-circle-line");
    }
}

//显示字幕
function visibleSubtitleFun() {
    if (!check(visibleSubtitle.value!, cursor.value!)) return;
    const subtitleStatus = props.tvVideoDom.textTracks[0].mode;
    if (subtitleStatus === "showing") {
        // eslint-disable-next-line vue/no-mutating-props
        props.tvVideoDom.textTracks[0].mode = "disabled";
        visibleSubtitle.value!.classList.add("ri-closed-captioning-line");
        visibleSubtitle.value!.classList.remove("ri-closed-captioning-fill");
    } else {
        // eslint-disable-next-line vue/no-mutating-props
        props.tvVideoDom.textTracks[0].mode = "showing";
        visibleSubtitle.value!.classList.add("ri-closed-captioning-fill");
        visibleSubtitle.value!.classList.remove("ri-closed-captioning-line");
    }
}

//控制全屏
function fullScannerFun() {
    if (!check(fullScanner.value!, cursor.value!)) return;
    props.fullscreen()
}

//设置视频音量
function updateVolume() {
    if (!check(volumeBar.value!, cursor.value!)) return;
    // 指针位置点击到进度条的位置
    let x = cursor.value!.offsetLeft - volumeBar.value!.offsetLeft;
    // 进度条长度
    let w = volumeBar.value!.offsetWidth;
    props.volume(x / w)
}

function mousedown(event: MouseEvent) {
    //左键点击
    if (event.button === 0 && document.pointerLockElement) {
        playAndPauseFun();
        timeupdate();
        fullScannerFun();
        updateVolume();
        visibleSubtitleFun();
        props.updateVideoCallback();
    }

}

document.addEventListener("mousedown", mousedown);

//判断指针(伪)有没有在某个div上
function check(div1: HTMLElement, cursor: HTMLElement) {
    //左边界
    let left = div1.offsetLeft;
    //上边界
    let top = div1.offsetTop;
    //右边界
    let right = div1.offsetWidth + left;
    //下边界
    let bottom = div1.offsetHeight + top;
    // 指针中心点位置
    // 使用了translate xy都偏移了50% (offsetLeft,offsetTop)为中心
    const cursorWidth = cursor.offsetLeft;
    const cursorHeight = cursor.offsetTop;

    return (cursorWidth > left && cursorWidth < right)
        && (cursorHeight < bottom && cursorHeight > top);
}

</script>

<style scoped>

.orange-bar {
    height: 8px;
    width: 100%;
    background: black;
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

.tv_control_button_container {
    margin: 0 10px;
}

.tv_control_button {
    width: 80px;
    height: 80px;
    background: #8c8eff;
    display: flex;
    justify-content: center;
    align-items: center;
    flex-shrink: inherit;
}

.tv_control_button_title {
    color: white;
    font-size: 26px;
    display: flex;
    justify-content: center;
}

.tv_control_content {
    width: 100%;
    height: 100%;
    padding: 10px;
}

.cursor {
    position: absolute;
    width: 1rem;
    height: 1rem;
    background: orangered;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
}
</style>