import {CSS2DObject} from "three/examples/jsm/renderers/CSS2DRenderer";
import {VNode} from "vue";
import {createVNode, render} from "vue";
import {BoxGeometry, Mesh, MeshStandardMaterial, Vector3} from "three";
import * as CANNON from "cannon-es";
import TVControlVue from "@/components/ThreeJs/TVControl/TVControl.vue"
import {ref} from "vue";

interface I_Option {
    position: Vector3,
    name: string,
    active: () => void,
    openGUI: (show: boolean) => void,
    type: string,
    tvVideoDom: HTMLVideoElement,
    onupdate: (progress: number, audio: number, pause: boolean,) => void,
    infoList?: string[],
}

export class TVControl {
    private readonly tvControlMesh: Mesh;
    private readonly tvControlCSS2D: CSS2DObject;
    private readonly tvVideoDom: HTMLVideoElement;
    private readonly uiContainer: HTMLElement;
    private readonly visible_ = ref(false);

    constructor(private readonly option: I_Option) {
        const tvControlGeometry = new BoxGeometry(0.5, 1, 0.1);
        const tvControlMaterial = new MeshStandardMaterial({color: 0xff0000});
        this.tvControlMesh = new Mesh(tvControlGeometry, tvControlMaterial);
        this.option = option;
        this.tvVideoDom = option.tvVideoDom;
        this.uiContainer = document.createElement("div");
        this.uiContainer.style.width = "30vw";
        this.uiContainer.style.height = "25vw";
        const vNode: VNode = createVNode(TVControlVue, {
            visible: this.visible_,
            tvVideoDom: option.tvVideoDom,
            updateVideoCallback: () => {
                option.onupdate(this.tvVideoDom.currentTime, this.tvVideoDom.volume, this.tvVideoDom.paused);
            },
            onUpdateTime:this.videoUpdate,
            currentTime:this.currentTime,
            volume:this.volume,
            fullscreen:this.fullscreen
        });
        render(vNode, this.uiContainer);
        this.tvControlCSS2D = new CSS2DObject(this.uiContainer);
        this.tvControlCSS2D.position.set(0, 0, -5);
        this.tvControlCSS2D.layers.set(0);
        this.tvControlCSS2D.visible = false;
    }

    public create(callback: (mesh: Mesh, body: CANNON.Body) => void) {
        this.tvControlMesh.name = this.option.name;
        this.tvControlMesh.userData.active = this.option.active;
        this.tvControlMesh.userData.openGUI = this.option.openGUI;
        this.tvControlMesh.userData.type = this.option.type;
        this.tvControlMesh.userData.infoList = this.option.infoList;
        const cubeShape = new CANNON.Box(new CANNON.Vec3(1 / 2, 1.5 / 2, 0.2 / 2));
        const body = new CANNON.Body({
            mass: 1,
            shape: cubeShape,
            position: <unknown>this.option.position as CANNON.Vec3, //位置
        });
        callback(this.tvControlMesh, body);
    }

    set visible(status: boolean) {
        //防止伪光标移动
        this.visible_.value = status;
        //隐藏
        this.tvControlCSS2D.visible = status;
    }

    get CSS2D() {
        return this.tvControlCSS2D;
    }

    get isVisible(): boolean {
        return this.tvControlCSS2D.visible;
    }
    //orangeJuice: 进度 0~100, orangeBuffering: 缓冲 0~100, volumeJuice: 音量 0~100, ended: 是否结束
    public videoUpdate(callback: (orangeJuice: number, orangeBuffering: number, volumeJuice: number, ended: boolean) => void) {
        this.tvVideoDom.addEventListener("timeupdate",()=>{
            //视频长度
            const duration = this.tvVideoDom.duration;
            //视频进度
            const currentTime = this.tvVideoDom.currentTime;
            const juicePos = currentTime / duration;
            // 进度百分比
            const orangeJuice = juicePos * 100;
            //缓冲段
            const buffers = this.tvVideoDom.buffered;
            let orangeBuffering = 0
            if (buffers.length > 0) {
                // 计算缓冲进度
                for (let i = 0; i < buffers.length; i++) {
                    const index = buffers.length - (i + 1);
                    //end为缓冲最后位置
                    if (buffers.end(index) < currentTime) continue;
                    //缓冲进度条
                    orangeBuffering = buffers.end(index) / duration * 100;
                    break;
                }
            }
            // 进度条
            const volumeJuice = this.tvVideoDom.volume * 100;
            callback(orangeJuice, orangeBuffering, volumeJuice, this.tvVideoDom.ended)
        })
    }

    set currentTime(time:number){
        this.tvVideoDom.currentTime = time * this.tvVideoDom.duration;
    }

    set volume(vol:number){
        this.tvVideoDom.volume = vol;
    }

    public fullscreen(){
        if (this.tvVideoDom.requestFullscreen) {
            this.tvVideoDom.requestFullscreen().then();
            this.tvVideoDom.style.display = "block";
            document.exitPointerLock();
        } else {
            this.tvVideoDom.style.display = "none";
            document.exitFullscreen().then();
        }
    }
}