import {Ref} from "vue";
import {RayDetect} from "@/components/ThreeJs/ts/RayDetect";
import {inventoryState, worldRayObjects, cameraClass, controlsClass} from "@/components/ThreeJs/ts/Global";

const keyQ = (activeInfo: Ref<string>) => {
    controlsClass.addKeydownEventListener("KeyQ", () => {
        // 指针未锁定 结束
        if (!controlsClass.isLocked) return;
        if (inventoryState.inventory.length > 0) {
            // 丢弃当前物品
            inventoryState.inventory[inventoryState.current - 1] = inventoryState.emptyObject3D;
            activeInfo.value = "";
            cameraClass.loadItem(inventoryState.inventory[inventoryState.current - 1].clone()).then();
        }
    });
}

const keyE = (rayDetect: RayDetect) => {
    //模型互动
    controlsClass.addKeydownEventListener("KeyE", () => {
        if (!controlsClass.isLocked) return;
        rayDetect.firstMesh(worldRayObjects, (intersectObject) => {
            console.log(intersectObject)
            // 执行模型自定义行为
            intersectObject?.userData?.active();
        });
    });
}

const keyNumber = () => {
    const code = ["Digit1", "Digit2", "Digit3", "Digit4", "Digit5", "Digit6", "Digit7", "Digit8", "Digit9", "Digit0"];
    controlsClass.addKeydownEventListener(code, (event) => {
        if (!controlsClass.isLocked || event.ctrlKey) return;
        inventoryState.current = (+event.key + 9) % 10 + 1;
        cameraClass.loadItem(inventoryState.inventory[inventoryState.current - 1].clone()).then()
    });
}

const keyMouse2 = () => {
    // 打开遥控器GUI
    controlsClass.addMousedownEventListener(2, () => {
        if (inventoryState.inventory[inventoryState.current - 1].userData.type === "TVC" && controlsClass.isLocked) {
            inventoryState.inventory[inventoryState.current - 1].userData.openGUI();
        }
    });
}

const keyLoopNumber = (activeInfo: Ref<string>,) => {
    // 物品切换
    controlsClass.loopNumber(10, inventoryState.current, (index) => {
        inventoryState.current = index;
        activeInfo.value = inventoryState.inventory[inventoryState.current - 1].name;
        cameraClass.loadItem(inventoryState.inventory[inventoryState.current - 1].clone()).then()
    });
}

export default {
    keyQ, keyE, keyNumber, keyLoopNumber, keyMouse2
}
