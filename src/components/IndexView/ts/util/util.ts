import {ARM_X_DIST, SPIRAL} from "@/components/IndexView/ts/config/GalaxyConfig";
import {Vector3} from "three";

export function clamp(value, min, max) {
    return Math.min(Math.max(value, min), max)
}

// 旋臂
export function spiral(x, y, z, offset) {
    const r = Math.sqrt(x ** 2 + y ** 2);
    let theta = offset;
    theta += Math.atan(y / x);
    theta += (r / ARM_X_DIST) * SPIRAL;
    return new Vector3(r * Math.cos(theta), r * Math.sin(theta), z)
}

//银河星体随机坐标
export function positionRandom(min = 0, max = 1): number {
    const u = 1 - Math.random();
    const v = Math.random();
    const z = Math.sqrt(-2.0 * Math.log(u)) * Math.cos(2.0 * Math.PI * v);
    return z * max + min;
}