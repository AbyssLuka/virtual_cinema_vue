import {Camera, Scene, Sprite, SpriteMaterial, TextureLoader, Vector3} from "three";
import {BASE_LAYER, HAZE_MAX, HAZE_MIN, HAZE_OPACITY} from "@/components/IndexView/ts/config/RenderConfig";
import {clamp} from "@/components/IndexView/ts/util/util";

/*
雾气
 */
export class Haze {
    //坐标
    private readonly position: Vector3;
    //贴图
    private hazeTexture = new TextureLoader().load("/3d/galaxy/haze.png");
    //材质
    private hazeSprite = new SpriteMaterial({
        map: this.hazeTexture,
        color: 0x0082ff,
        opacity: HAZE_OPACITY,
        depthTest: false,
        depthWrite: false,
    });
    private readonly object: Sprite;

    constructor(position: Vector3) {
        this.position = position;
        this.object = new Sprite(this.hazeSprite);
    }

    // 动态缩放透明
    updateScale(camera: Camera) {
        const dist = this.position.distanceTo(camera.position) / 250;
        this.object.material.opacity = clamp(HAZE_OPACITY * Math.pow(dist / 2.5, 2), 0, HAZE_OPACITY)
    }

    // 获取精灵对象
    getObject() {
        this.object.layers.set(BASE_LAYER);
        this.object.position.copy(this.position);
        //随机大小
        this.object.scale.multiplyScalar(clamp(HAZE_MAX * Math.random(), HAZE_MIN, HAZE_MAX));
        return this.object;
    }
}