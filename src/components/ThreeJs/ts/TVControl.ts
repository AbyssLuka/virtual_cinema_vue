import * as THREE from "three";
import {CSS2DObject} from "three/examples/jsm/renderers/CSS2DRenderer";
import {ComponentOptions, ComponentOptionsMixin, VNode} from "@vue/runtime-core";
import {createVNode, render} from "vue";

interface I_Option {
    position: THREE.Vector3,
    name: string,
    active: () => void,
    openGUI: (show: boolean) => void,
    type: string,
}

export class TVControl {
    private readonly tvControlMesh: THREE.Mesh;
    private readonly tvControlCSS2D: CSS2DObject;
    private readonly uiDom: ComponentOptions;
    private readonly tvVideoDom: HTMLVideoElement;
    private readonly uiContainer: HTMLElement;

    constructor(uiDom: ComponentOptionsMixin, tvVideoDom: HTMLVideoElement) {
        const tvControlGeometry = new THREE.BoxGeometry(0.5, 1, 0.1);
        const tvControlMaterial = new THREE.MeshStandardMaterial({color: 0xff0000});
        this.tvControlMesh = new THREE.Mesh(tvControlGeometry, tvControlMaterial);

        this.tvVideoDom = tvVideoDom;
        this.uiDom = uiDom;
        this.uiContainer = document.createElement("div");
        this.uiContainer.style.width = "30vw";
        this.uiContainer.style.height = "25vw";
        const vNode: VNode = createVNode(uiDom, {
            visible: false,
            tvVideoDom: tvVideoDom,
        });
        render(vNode, this.uiContainer);
        this.tvControlCSS2D = new CSS2DObject(this.uiContainer);
        this.tvControlCSS2D.position.set(0, 0, -5);
        this.tvControlCSS2D.layers.set(0);
        this.tvControlCSS2D.visible = false;

    }

    public create(option: I_Option) {
        this.tvControlMesh.name = option.name;
        this.tvControlMesh.userData.active = option.active;
        this.tvControlMesh.userData.openGUI = option.openGUI;
        this.tvControlMesh.userData.type = option.type;
        return this.tvControlMesh;
    }

    public visible(status: boolean) {
        const vNode: VNode = createVNode(this.uiDom, {
            visible: status,
            tvVideoDom: this.tvVideoDom,
        });
        render(vNode, this.uiContainer);
        this.tvControlCSS2D.visible = status;
    }

    public getCSS2D() {
        return this.tvControlCSS2D;
    }

    public isVisible(): boolean {
        return this.tvControlCSS2D.visible;
    }

}