import {
    createVNode,
    render,
    VNode,
    Component,
} from "vue";
import PopUps from "@/util/PopUps.vue";

interface I_Props<T> {
    data: T,
    title: string,
    popUpsId: string,
    width?: string,
    height?: string,
}

// test function
// const c = <T extends abstract new (...args) => any>(component:T) =>{
//     return (b:InstanceType<T>["$props"]["data"]) => {
//         console.log(component)
//         console.log(b)
//     }
// }
//
// import ImagePopUps from "@/components/File/PopUps/ImagePopUps.vue";
// c(ImagePopUps)({
//     list:[],
//     defaultIndex:1
// })

const createPopUps = <T>(
    component: Component,
    props: I_Props<T>
) => {
    let div: HTMLElement;
    const windowClass = "pop-ups-obj-";
    const windowId = windowClass.concat(props.popUpsId);
    //如果窗口未被创建
    if (!document.getElementById(windowId)) {
        //创建一个div设置id和class
        div = document.createElement("div");
        //窗口唯一标识
        div.setAttribute("id", windowId);
        //窗户class
        div.setAttribute("class", windowClass);
        //添加至于body内末尾使窗口不会被覆盖
        document.body.appendChild(div);
    } else {
        const popUpsObj = document.getElementById(windowId);
        if (!popUpsObj) {
            div = document.createElement("div");
        } else {
            div = popUpsObj;
        }
    }

    return new Promise(((resolve, reject) => {

        const submitCallback = () => {
            render(null, div);
            document.body.removeChild(div);
            resolve("");
        };

        const cancelCallback = () => {
            render(null, div);
            document.body.removeChild(div);
            reject("取消");
        };

        // 重新渲染更新标题
        const updateTitle = (title: string) => {
            const vnode: VNode = createVNode(PopUps, {
                submitCallback,
                cancelCallback,
                fullScreen,
                width: props.width ? props.width : "",
                height: props.height ? props.height : "",
                title: title,
                popUpsId: props.popUpsId,
            });
            render(vnode, div);
        };

        //窗口被点击后移动到最上层
        const popUpsClick = (windowId: string): void => {
            //获取所有窗口
            const classList = document.getElementsByClassName(windowClass);
            //没有窗口直接return结束函数
            if (classList.length <= 1) return;
            //被点击的窗口
            const first = (document.getElementById(windowId) as Node).parentElement as Node;
            //最上层的窗口
            const last = classList[classList.length - 1] as Node;
            //当前窗口已经在最上层
            if (last === first) return;
            //父元素
            const parentNode: Node = first.parentNode as Node;
            //插入到父元素内末尾，窗口移到最上层
            parentNode.insertBefore(first, last.nextSibling)
        };

        //窗体缩放
        const fullScreen = (status: boolean) => {
            // if (status === undefined || status == null) {
            //     status = false;
            // }
            const popupsWindowId = "popups-window-".concat(props.popUpsId as string);
            const fullScreenId = "full-screen-".concat(props.popUpsId as string);
            const popupsWindow: HTMLElement = document.getElementById(popupsWindowId) as HTMLElement;
            const fullScreenBtn: HTMLElement = document.getElementById(fullScreenId) as HTMLElement;
            if (!status) {
                //设置过渡动画100ms全屏和位置
                Object.assign(popupsWindow.style, {
                    transition: ".1s", width: "100vw", height: "100vh", top: "50%", left: "50%"
                });
                // 更改按钮图标
                fullScreenBtn.classList.remove("ri-fullscreen-fill");
                fullScreenBtn.classList.add("ri-fullscreen-exit-fill");
            } else {
                //设置过渡动画100ms取消全屏
                const window: HTMLElement = document.getElementById(windowId) as HTMLElement;
                Object.assign(popupsWindow.style, {
                    transition: ".1s",
                    width: window.style.width,
                    height: window.style.height,
                    top: window.style.top,
                    left: window.style.left
                });
                // 更改按钮图标
                fullScreenBtn.classList.remove("ri-fullscreen-exit-fill");
                fullScreenBtn.classList.add("ri-fullscreen-fill");
            }
            //100ms后删除过渡动画防止拖动卡顿
            setTimeout(() => {
                popupsWindow.style.transition = "0s";
            }, 100);
        };

        //渲染窗体模板虚拟节点
        const windowTemplate: VNode = createVNode(PopUps, {
            submitCallback,
            cancelCallback,
            fullScreen,
            popUpsClick,
            title: props.title,
            width: props.width ? props.width : "",
            height: props.height ? props.height : "",
            popUpsId: props.popUpsId,
        });

        // 渲染窗口模板
        render(windowTemplate, div);
        //渲染窗体虚拟节点
        const popUpsContentVNode: VNode = createVNode(component, {
            data: props.data,
            fullScreenStatus: false,
            updateTitle,
            fullScreen,
            submitCallback,
            popUpsClick,
        });

        //渲染窗体内容
        const contentId = "content-".concat(props.popUpsId);
        const content = document.getElementById(contentId);
        if (content) render(popUpsContentVNode, content);
    }));
};

// 控制台关闭窗口
window.dropWindow = (id: string): string => {
    const windowClass = "pop-ups-obj-";
    const windowId: string = windowClass.concat(id);
    const popUpsObj = document.getElementById(windowId);
    if (!popUpsObj) return "Not Find"
    popUpsObj.remove();
    render(null, popUpsObj);
    return windowId;
};

export default createPopUps;