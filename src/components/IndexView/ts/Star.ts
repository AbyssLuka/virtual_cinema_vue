import {BLOOM_LAYER, STAR_MAX, STAR_MIN} from "@/components/IndexView/ts/config/RenderConfig";
import {Camera, Sprite, SpriteMaterial, TextureLoader, Vector3} from "three";
import {starTypes} from "@/components/IndexView/ts/config/starDisreibutions";
import {clamp} from "@/components/IndexView/ts/util/util";

const texture = new TextureLoader().load("/3d/galaxy/star.png");
const material = starTypes.color.map((color) =>
    new SpriteMaterial({
        map: texture,
        color: color,
    })
);

export class Star {
    private readonly position: Vector3;
    private readonly obj: Sprite;
    private readonly starType: number;

    constructor(position: Vector3) {
        this.position = position;
        this.starType = Star.generateStartType();
        this.obj = new Sprite(material[this.starType])
    }

    private static generateStartType() {
        let num = Math.random() * 100.0;
        const ptc = starTypes.percentage;
        for (let i = 0; i < ptc.length; i++) {
            num -= ptc[i];
            if (num < 0) return i;
        }
        return 0;
    }

    //动态缩放大小
    updateScale(camera: Camera) {
        const dist = this.position.distanceTo(camera.position) / 250;
        let starSize = dist * starTypes.size[this.starType];
        starSize = clamp(starSize, STAR_MIN, STAR_MAX);
        this.obj.scale.copy(new Vector3(starSize, starSize, starSize))
    }

    getObject() {
        this.obj.layers.set(BLOOM_LAYER);
        this.obj.position.copy(this.position);
        this.obj.scale.multiplyScalar(starTypes.size[this.starType]);
        return this.obj;
    }
}