import {
    type VNode,
    createVNode,
    render,
} from "vue";
import PopUps from "@/util/PopUps.vue";

interface I_Props<T> {
    data: T,
    title: string,
    popUpsId?: string,
    width?: string,
    height?: string,
}

const createPopUps = <
    T extends abstract new (...args: any[]) => any
>(
    component: T,
    props: I_Props<InstanceType<T>["$props"]["data"]>
) => {
    !props.popUpsId && (props.popUpsId = component["__name"]);
    let div: HTMLElement;
    const windowClass = "pop-ups-obj-";
    const windowId = windowClass.concat(props.popUpsId!);
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
        div = !popUpsObj ? document.createElement("div") : popUpsObj;
    }

    const submitCallback = () => {
        render(null, div);
        document.body.removeChild(div);
        document.body.contains(div) && document.body.removeChild(div);

    };

    const cancelCallback = () => {
        render(null, div);
        document.body.contains(div) && document.body.removeChild(div);
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
    const popUpsClick = (windowId: string) => {
        //获取所有窗口
        const classList = document.getElementsByClassName(windowClass);
        //没有窗口直接return结束函数
        if (classList.length <= 1) return;
        //被点击的窗口
        const first = <HTMLElement>(<HTMLElement>document.getElementById(windowId)).parentElement;
        //最上层的窗口
        const last = <HTMLElement>classList[classList.length - 1];
        //当前窗口已经在最上层
        if (last === first) return;
        //父元素
        const parentNode = <HTMLElement>first.parentNode;
        //插入到父元素内末尾，窗口移到最上层
        parentNode.insertBefore(first, last.nextSibling)
    };

    let animation: Animation | null = null;
    //窗体缩放
    const fullScreen = (status: boolean) => {
        const fullScreenBtn = document.getElementById(`full-screen-${props.popUpsId}`);
        const popupsWindow = document.getElementById(`popups-window-${props.popUpsId}`);

        if (!status) {
            animation = popupsWindow!.animate({
                width: "100vw", height: "100vh", top: "50%", left: "50%"
            }, {
                duration: 100, fill: "forwards"
            });
            // 更改按钮图标
            fullScreenBtn!.classList.replace("ri-fullscreen-fill", "ri-fullscreen-exit-fill")
        } else {
            animation?.reverse();
            // 更改按钮图标
            fullScreenBtn!.classList.replace("ri-fullscreen-exit-fill", "ri-fullscreen-fill")
        }
        return !status;
    };

    //渲染窗体模板虚拟节点
    const windowTemplate = createVNode(PopUps, {
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
    const popUpsContentVNode: VNode = createVNode(<InstanceType<T>>component, {
        data: props.data,
        fullScreenStatus: false,
        updateTitle,
        fullScreen,
        submitCallback,
        popUpsClick,
    });

    //渲染窗体内容
    const contentId = `content-${props.popUpsId}`;
    const content = document.getElementById(contentId);
    if (content) render(popUpsContentVNode, content);

    return {
        submitCallback,
        cancelCallback,
        updateTitle,
        fullScreen,
        popUpsClick,
    };

};

// 控制台关闭窗口
window.dropWindow = (id: string) => {
    const windowClass = "pop-ups-obj-";
    const windowId: string = windowClass.concat(id);
    const popUpsObj = document.getElementById(windowId);
    if (!popUpsObj) return "Not Found !";
    popUpsObj.remove();
    render(null, popUpsObj);
    return windowId;
};

export default createPopUps;