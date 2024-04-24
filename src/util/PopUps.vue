<template>
    <div class="popups-window" :id="'popups-window-'+props.popUpsId"
         :style="'width:'+width+';'+'height:'+height">
        <div :id="'popups-bar-'+props.popUpsId" class="popups-bar"
             @dblclick="[fullScreen(fullscreen),fullscreen = !fullscreen]"
             @mousedown="props.popUpsClick('popups-window-'+props.popUpsId)">
            <div class="popups-title">{{title}}</div>
            <div class="ri-fullscreen-fill full-screen" :id="'full-screen-'+props.popUpsId"
                 @click.stop="[fullScreen(fullscreen),fullscreen = !fullscreen]"></div>
            <div class="exit-button ri-close-line" @click.stop="props.cancelCallback"></div>
        </div>
        <div class="popups-window-content" :id="'content-'+props.popUpsId"></div>
    </div>
</template>

<script setup lang="ts">
    import {defineProps, withDefaults, ref, onMounted, onBeforeUnmount} from "vue";

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
        fullScreen?: (status?: boolean) => void,
        popUpsClick?: (id: string) => void,
    }>(), {
        //标题
        title: "Window",
        cancelCallback: () => console.log("cancelCallback"),
        submitCallback: () => console.log("submitCallback"),
        fullScreen: (status?: boolean) => console.log("updateFullScreen", status),
        popUpsClick: (id: string) => {
            console.log(`popUpsClick:${id}`);
        }
    });


    onMounted(() => {
        windowMove();
    });

    let bar: HTMLDivElement | null = null;
    let mousedownFunc: ((e: MouseEvent) => void) | null = null;

    //窗口拖动
    function windowMove() {
        //窗口标题栏
        let barId: string = "popups-bar-".concat(props.popUpsId as string);
        bar = document.getElementById(barId) as HTMLDivElement;
        //窗口
        let windowId: string = "popups-window-".concat(props.popUpsId as string);
        let window: HTMLElement = document.getElementById(windowId) as HTMLElement;

        mousedownFunc = (e: MouseEvent): void => {
            // 阻止跳转
            e.preventDefault();
            //鼠标位置
            let distX: number = e.pageX - window.offsetLeft;
            let distY: number = e.pageY - window.offsetTop;
            let left: number = e.clientX - distX;
            let top: number = e.clientY - distY;
            //鼠标拖动
            const mousemoveFunc = (e: MouseEvent): void => {
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

                if (+window.style.left != left && +window.style.top != top) {
                    //设置窗口位置
                    window.style.left = left + "px";
                    window.style.top = top + "px";
                }
            };
            document.addEventListener("mousemove", mousemoveFunc);

            //销毁
            const mouseupFunc = (): void => {
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

    // //窗口被点击后移动到最上层
    // function popUpsClick(): void {
    //     //获取所有窗口
    //     let classList = document.getElementsByClassName("pop-ups-obj-");
    //     //没有窗口直接return结束函数
    //     if (classList.length <= 1) return;
    //     let id: string = 'popups-window-'.concat(props.popUpsId as string);
    //     //被点击的窗口
    //     let first = (document.getElementById(id) as Node).parentElement as Node;
    //     //最上层的窗口
    //     let last = classList[classList.length - 1] as Node;
    //     //当前窗口已经在最上层
    //     if (last === first) return;
    //     //父元素
    //     let parentNode = first.parentNode as Node;
    //     //插入到父元素内末尾，窗口移到最上层
    //     parentNode.insertBefore(first, last.nextSibling)
    // }
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
        transform: translate(-50%, -50%);
        /*transition: .1s;*/
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