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
    import {ref, defineProps, onBeforeUnmount, onMounted} from "vue";

    const cursor = ref();
    const cursorContainer = ref();
    const playAndPause = ref();
    const visibleSubtitle = ref();
    const orangeBar = ref();
    const orangeBuffering = ref();
    const orangeJuice = ref();
    const fullScanner = ref();
    const volumeBar = ref();
    const volumeJuice = ref();

    const props = defineProps<{
        visible: boolean,
        tvVideoDom: HTMLVideoElement,
    }>();

    onMounted(() => {
        props.tvVideoDom.addEventListener("timeupdate", videoUpdate);
    });

    onBeforeUnmount(() => {
        document.removeEventListener("mousemove", mousemove);
        document.removeEventListener("mousedown", mousedown);
        // props.tvVideoDom.removeEventListener("timeupdate", videoUpdate);
    });

    function mousemove(event: MouseEvent) {
        if (!document.pointerLockElement) return;
        let y = cursor.value.offsetTop;
        let x = cursor.value.offsetLeft;
        if ((x <= 0 && y <= 0) && !props.visible) return;
        const movementX = event.movementX || 0;
        const movementY = event.movementY || 0;
        if (y > cursorContainer.value.clientHeight) y = cursorContainer.value.clientHeight;
        if (x > cursorContainer.value.clientWidth) x = cursorContainer.value.clientWidth;
        if (y < 0) y = 0;
        if (x < 0) x = 0;
        cursor.value.style.top = (y + movementY) + "px";
        cursor.value.style.left = (x + movementX) + "px";
    }

    function videoUpdate() {
        //视频长度
        let duration = props.tvVideoDom.duration;
        //视频进度
        let currentTime = props.tvVideoDom.currentTime;
        let juicePos = currentTime / duration;
        // 进度百分比
        orangeJuice.value.style.width = juicePos * 100 + "%";
        //缓冲段
        let buffereds = props.tvVideoDom.buffered;
        if (buffereds.length > 0) {
            // 计算缓冲进度
            for (let i = 0; i < buffereds.length; i++) {
                let index = buffereds.length - (i + 1);
                //end为缓冲最后位置
                if (buffereds.end(index) < currentTime) continue;
                //缓冲进度条
                orangeBuffering.value.style.width = buffereds.end(index) / duration * 100 + "%";
                break;
            }
        }
        // 进度条
        volumeJuice.value.style.width = props.tvVideoDom.volume * 100 + "%";
        //视频结束
        if (props.tvVideoDom.ended) {
            playAndPause.value.classList.remove("ri-play-circle-line");
        }
    }

    //指针(伪)移动
    document.addEventListener("mousemove", mousemove);

    //修改进度
    function timeupdate() {
        if (check(orangeBar.value, cursor.value)) {
            let x = cursor.value.offsetLeft;
            let w = orangeBar.value.offsetWidth;
            if (isNaN(props.tvVideoDom.duration)) return;
            // eslint-disable-next-line vue/no-mutating-props
            props.tvVideoDom.currentTime = x / w * props.tvVideoDom.duration;
        }
    }

    //播放与暂停
    function playAndPauseFun() {
        if (check(playAndPause.value, cursor.value)) {
            if (props.tvVideoDom.paused) {
                props.tvVideoDom.play();
                playAndPause.value.classList.remove("ri-play-circle-line");
                playAndPause.value.classList.add("ri-pause-circle-line");
            } else {
                props.tvVideoDom.pause();
                playAndPause.value.classList.add("ri-play-circle-line");
                playAndPause.value.classList.remove("ri-pause-circle-line");
            }
        }
    }

    //显示字幕
    function visibleSubtitleFun() {
        if (check(visibleSubtitle.value, cursor.value)) {
            const subtitleStatus = props.tvVideoDom.textTracks[0].mode;
            if (subtitleStatus === "showing") {
                // eslint-disable-next-line vue/no-mutating-props
                props.tvVideoDom.textTracks[0].mode = "disabled";
                visibleSubtitle.value.classList.add("ri-closed-captioning-line");
                visibleSubtitle.value.classList.remove("ri-closed-captioning-fill");
            } else {
                // eslint-disable-next-line vue/no-mutating-props
                props.tvVideoDom.textTracks[0].mode = "showing";
                visibleSubtitle.value.classList.add("ri-closed-captioning-fill");
                visibleSubtitle.value.classList.remove("ri-closed-captioning-line");
            }
        }
    }

    //控制全屏
    function fullScannerFun() {
        if (check(fullScanner.value, cursor.value)) {
            if (props.tvVideoDom.requestFullscreen) {
                props.tvVideoDom.requestFullscreen();
                // eslint-disable-next-line vue/no-mutating-props
                props.tvVideoDom.style.display = "block";
                document.exitPointerLock();
            } else {
                // eslint-disable-next-line vue/no-mutating-props
                props.tvVideoDom.style.display = "none";
                document.exitFullscreen();
            }
        }
    }

    //设置视频音量
    function updateVolume() {
        if (check(volumeBar.value, cursor.value)) {
            // 指针位置点击到进度条的位置
            let x = cursor.value.offsetLeft - volumeBar.value.offsetLeft;
            // 进度条长度
            let w = volumeBar.value.offsetWidth;
            //音量值0-1
            // eslint-disable-next-line vue/no-mutating-props
            props.tvVideoDom.volume = x / w;
            // 设置音量进度
            volumeJuice.value.style.width = (x / w * 100) + "%";
        }
    }

    function mousedown(event: MouseEvent) {
        //左键点击
        if (event.button === 0 && document.pointerLockElement) {
            playAndPauseFun();
            timeupdate();
            fullScannerFun();
            updateVolume();
            visibleSubtitleFun();
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