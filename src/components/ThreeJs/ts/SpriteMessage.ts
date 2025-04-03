import {Vector3} from "three";
import {CSS3DSprite} from "three/examples/jsm/renderers/CSS3DRenderer";
import {createVNode, render} from "vue";
import PlayerMessage from "@/components/ThreeJs/PlayerMessage.vue"

export default class SpriteMessage {
    private readonly object_: CSS3DSprite;
    private readonly messageContainer: HTMLDivElement;

    constructor(private text_ = "") {
        this.messageContainer = document.createElement("div");
        this.object_ = this.init();
        this.object.scale.set(.01, .01, .01);
    }

    private init(): CSS3DSprite {
        this.messageContainer.style.background = "#ffffff";
        const vNode = createVNode(PlayerMessage, {message: this.text});
        render(vNode, this.messageContainer);
        return new CSS3DSprite(this.messageContainer);
    }

    get object() {
        return this.object_;
    }

    set position(vector3: Vector3) {
        this.object.position.copy(vector3);
    }

    get position() {
        return this.object.position;
    }

    get element() {
        return this.messageContainer;
    }

    set text(text: string) {
        this.text_ = text;
        const vNode = createVNode(PlayerMessage, {message: text});
        render(vNode, this.messageContainer);
    }

    get text(): string {
        return this.text_;
    }
}