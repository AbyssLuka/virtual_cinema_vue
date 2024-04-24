import {Controls} from "@/components/ThreeJs/ts/Controls";
import {Camera} from "@/components/ThreeJs/ts/Camera";
import {Ref} from "vue";
import {RayDetect} from "@/components/ThreeJs/ts/RayDetect";
import {Object3D} from "three";
import {UnwrapNestedRefs} from "vue";

type InventoryState = {
    inventory: Object3D[],
    current: number,
    emptyObject3D: Object3D,
}

const keyQ = (
    controlsClass: Controls,
    state: UnwrapNestedRefs<InventoryState>,
    activeInfo: Ref<string>,
    cameraClass: Camera
) => {
    controlsClass.addKeydownEventListener("KeyQ", () => {
        // 指针未锁定 结束
        if (!controlsClass.isLocked) return;
        if (state.inventory.length > 0) {
            // 丢弃当前物品
            state.inventory[state.current - 1] = state.emptyObject3D;
            activeInfo.value = "";
            cameraClass.loadItem(state.inventory[state.current - 1].clone()).then();
        }
    });
}

const keyE = (controlsClass: Controls, rayDetect: RayDetect, worldRayObjects: Object3D[]) => {
    //模型互动
    controlsClass.addKeydownEventListener("KeyE", () => {
        if (!controlsClass.isLocked) return;
        rayDetect.firstMesh(worldRayObjects, (intersectObject) => {
            console.log(intersectObject)
            // 执行模型自定义行为
            if (intersectObject) intersectObject.userData?.active();
        });
    });
}
const keyNumber = (
    controlsClass: Controls,
    state: UnwrapNestedRefs<InventoryState>,
    cameraClass: Camera
) => {
    const code = ["Digit1", "Digit2", "Digit3", "Digit4", "Digit5", "Digit6", "Digit7", "Digit8", "Digit9", "Digit0"];
    controlsClass.addKeydownEventListener(code, (event) => {
        if (!controlsClass.isLocked || event.ctrlKey) return;
        state.current = (+event.key + 9) % 10 + 1;
        cameraClass.loadItem(state.inventory[state.current - 1].clone()).then()
    });
}
const keyMouse2 = (
    controlsClass: Controls,
    state: UnwrapNestedRefs<InventoryState>
) => {
    // 打开遥控器GUI
    controlsClass.addMousedownEventListener(2, () => {
        if (state.inventory[state.current - 1].userData.type === "TVC" && controlsClass.isLocked) {
            state.inventory[state.current - 1].userData?.openGUI();
        }
    });
}

const keyLoopNumber = (
    controlsClass: Controls,
    state: UnwrapNestedRefs<InventoryState>,
    activeInfo: Ref<string>,
    cameraClass: Camera
) => {
    // 物品切换
    controlsClass.loopNumber(10, state.current, (index) => {
        state.current = index;
        activeInfo.value = state.inventory[state.current - 1]?.name;
        cameraClass.loadItem(state.inventory[state.current - 1].clone()).then()
    });
}

export default {
    keyQ, keyE, keyNumber, keyLoopNumber, keyMouse2
}
