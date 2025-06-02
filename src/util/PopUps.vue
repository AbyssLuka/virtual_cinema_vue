<template>
    <div class="popups-window"
         :id="`popups-window-${popUpsId}`"
         :style="{height,width}"
         :ref="`popups-window-${popUpsId}`">
        <div :id="`popups-bar-${popUpsId}`"
             class="popups-bar"
             @dblclick="[fullscreen = fullScreen(fullscreen)]"
             @mousedown="popUpsClick(`popups-window-${popUpsId}`)">
            <div class="popups-title">{{ title }}</div>
            <div class="ri-fullscreen-fill full-screen"
                 :id="`full-screen-${popUpsId}`"
                 @click.stop="[fullscreen = fullScreen(fullscreen)]"></div>
            <div class="exit-button ri-close-line" @click.stop="exitPopups"></div>
        </div>
        <div class="popups-window-content" :id="`content-${popUpsId}`"></div>
    </div>
</template>

<script setup lang="ts">
import {defineProps, withDefaults, ref, onMounted, onBeforeUnmount, useTemplateRef} from "vue";

const fullscreen = ref(false)

const props = withDefaults(defineProps<{
    //标题
    title?: string,
    //回调函数
    cancelCallback?: () => void,
    //回调函数
    submitCallback?: () => void,
    //初始宽高
    width: string,
    height: string,
    //窗口ID
    popUpsId: string,
    //更新窗口大小回调函数
    fullScreen?: (status?: boolean) => boolean,
    popUpsClick?: (id: string) => void,
}>(), {
    //标题
    title: "Window",
    cancelCallback: () => console.log("cancelCallback"),
    submitCallback: () => console.log("submitCallback"),
    fullScreen: (status?: boolean) => {
        console.log("updateFullScreen", status)
        return status!;
    },
    popUpsClick: (id: string) => {
        console.log(`popUpsClick:${id}`);
    }
});


onMounted(() => {
    windowMove();
    openWindow()
});

const windowEl = useTemplateRef<HTMLDivElement>(`popups-window-${props.popUpsId}`);
let animation: Animation | null = null;
const openWindow = () => {
    animation = windowEl.value!.animate([
        {transform: "translate(-50%, -50%) scale(.5)", opacity: 0},
        {transform: "translate(-50%, -50%) scale(1)", opacity: 1},
    ], {
        duration: 100,
        fill: "forwards"
    });
}

const exitPopups = () => {
    animation!.reverse();
    animation!.finished.then(() => {
        props.cancelCallback();
    })
}

let bar: HTMLDivElement | null = null;
let mousedownFunc: ((e: MouseEvent) => void) | null = null;

//窗口拖动
const windowMove = () => {
    //窗口标题栏
    const barId = `popups-bar-${props.popUpsId}`;
    bar = <HTMLDivElement>document.getElementById(barId);
    //窗口

    mousedownFunc = (e: MouseEvent) => {
        // 阻止跳转
        e.preventDefault();
        //鼠标位置
        const distX = e.pageX - windowEl.value!.offsetLeft;
        const distY = e.pageY - windowEl.value!.offsetTop;
        let left = e.clientX - distX;
        let top = e.clientY - distY;
        //鼠标拖动
        const mousemoveFunc = (e: MouseEvent) => {
            //鼠标移动位置
            left = e.clientX - distX;
            top = e.clientY - distY;
            //限制左右移动区域
            if (left <= 0) {
                left = 5;
            } else if (left > document.documentElement.clientWidth) {
                left = document.documentElement.clientWidth
            }
            //限制上下移动区域
            if (top <= 0) {
                top = 5;
            } else if (top > document.documentElement.clientHeight) {
                top = document.documentElement.clientHeight
            }
            if (windowEl.value!.offsetLeft != left && windowEl.value!.offsetTop != top) {
                //设置窗口位置
                windowEl.value!.style.left = left + "px";
                windowEl.value!.style.top = top + "px";
            }
        };
        document.addEventListener("mousemove", mousemoveFunc);

        //销毁
        const mouseupFunc = () => {
            document.removeEventListener("mousemove", mousemoveFunc);
            document.removeEventListener("mouseup", mouseupFunc);
        };
        document.addEventListener("mouseup", mouseupFunc);
    };
    //鼠标按下
    bar.addEventListener("mousedown", mousedownFunc);
}

//销毁
onBeforeUnmount(() => {
    bar && mousedownFunc && bar.removeEventListener("mousedown", mousedownFunc);
});
</script>
<style scoped>
@media (max-width: 768px) {
    .popups-window {
        width: 100vw;
        height: 480px;
    }
}

@media (min-width: 768px) and (max-width: 1400px) {
    .popups-window {
        width: 768px;
        height: 500px;
    }
}

@media (min-width: 1400px ) {
    .popups-window {
        width: 960px;
        height: 600px;
    }
}

.exit-button, .full-screen {
    width: 20px;
    height: 20px;
    border-radius: 50%;
    cursor: pointer;
    color: black;
    border: 2px solid black;
    display: flex;
    justify-content: center;
    align-items: center;
    margin: 0 15px 0 0;
}

.exit-button:hover, .full-screen:hover {
    color: white;
    border: 2px solid white;
}

.popups-title {
    width: calc(100% - 100px);
    align-items: center;
    height: 50px;
    line-height: 50px;
    text-overflow: ellipsis;
    white-space: nowrap;
    overflow: hidden;
    font-size: 20px;
    padding: 0 0 0 15px;
}

.popups-window {
    color: white;
    user-select: none;
    border-radius: 2px;
    background: rgba(99, 99, 99, 0.5);
    display: flex;
    align-items: center;
    flex-direction: column;
    box-shadow: 5px 5px 10px rgba(50, 50, 50, 0.5);
    backdrop-filter: blur(10px);
    position: fixed;
    left: 50%;
    top: 50%;
}

.popups-bar {
    display: flex;
    justify-content: space-between;
    width: 100%;
    height: 50px;
    align-items: center;
    cursor: move;
}

.popups-window-content {
    height: calc(100% - 50px);
    width: 100%;
}

</style>