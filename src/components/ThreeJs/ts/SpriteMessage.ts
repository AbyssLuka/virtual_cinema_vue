import {Vector3} from "three";
import {CSS3DSprite} from "three/examples/jsm/renderers/CSS3DRenderer";
import {createVNode, render} from "vue";
import PlayerMessage from "@/components/ThreeJs/PlayerMessage.vue"

export default class SpriteMessage {
    private readonly object: CSS3DSprite;
    private text: string;
    private readonly messageContainer: HTMLDivElement;

    constructor(text = "") {
        this.messageContainer = document.createElement("div");
        this.text = text;
        this.object = this.init();
        this.object.scale.set(.01, .01, .01);
    }

    private init(): CSS3DSprite {
        this.messageContainer.style.background = "#ffffff";
        const vNode = createVNode(PlayerMessage, {message: this.text});
        render(vNode, this.messageContainer);
        return new CSS3DSprite(this.messageContainer);
    }

    public getObject() {
        return this.object;
    }

    public setPosition(vector3: Vector3) {
        this.object.position.copy(vector3);
    }

    public getPosition() {
        return this.object.position;
    }

    public getElement() {
        return this.messageContainer;
    }

    public setText(text: string) {
        this.text = text;
        const vNode = createVNode(PlayerMessage, {message: text});
        render(vNode, this.messageContainer);
    }

    public getText(): string {
        return this.text;
    }
}