import {reactive} from "vue";
import {AmbientLight, Object3D, Scene, Vector3} from "three";
import {I_PhysicalList} from "@/components/ThreeJs/ts/GameInterface";
import Player from "@/components/ThreeJs/ts/Player";
import {Camera} from "@/components/ThreeJs/ts/Camera";
import {Controls} from "@/components/ThreeJs/ts/Controls";

export const inventoryState = reactive<{
    inventory: Object3D[],
    current: number,
    emptyObject3D: Object3D,
}>({
    inventory: new Array<Object3D>(10),
    current: 1,
    emptyObject3D: new Object3D,
});
inventoryState.inventory.fill(inventoryState.emptyObject3D)

// 射线检测
// export const rayDetect = new RayDetect(new Vector2(0, 0), camera);

//射线检测列表
export const worldRayObjects: Object3D[] = [];
export const physicalObjects: I_PhysicalList[] = [];

export const playerList: { [key: string]: Player } = {};


//摄影机
export const cameraClass = new Camera(new Vector3(0, 0, 10));
//摄影机(手持物品防止穿模)
export const handItemScene = new Scene();
export const handItemCamera = cameraClass.itemCamera;
handItemScene.add(handItemCamera);
handItemScene.add(new AmbientLight(0xFFFFFF, 1));


export const controlsClass = new Controls(cameraClass.camera, document.body);
