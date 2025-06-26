import {Ref} from "vue";
import {inventoryState, worldRayObjects, cameraClass, controlsClass, rayDetect} from "@/components/ThreeJs/ts/Global";

const keyQ = (activeInfo: Ref<string>) => {
    controlsClass.addKeydownEventListener("KeyQ", () => {
        // 指针未锁定 结束
        if (!controlsClass.isLocked) return;
        if (inventoryState.inventory.length > 0) {
            // 丢弃当前物品
            inventoryState.inventory[inventoryState.current - 1] = inventoryState.emptyObject3D;
            activeInfo.value = "";
            cameraClass.loadItem(inventoryState.inventory[inventoryState.current - 1].clone());
        }
    });
}
const keyE = () => {
    //模型互动
    controlsClass.addKeydownEventListener("KeyE", () => {
        if (!controlsClass.isLocked) return;
        rayDetect.firstMesh(worldRayObjects, (intersectObject) => {
            if (!intersectObject)return;
            if (intersectObject.userData.pickup){
                // 没有检测到
                // 查询物品栏有没有相同的物品 防止重复获取
                const index = inventoryState.inventory.indexOf(intersectObject);
                // 查询物品栏第一个空位的位置
                const insertIndex = inventoryState.inventory.indexOf(inventoryState.emptyObject3D);
                if (index !== -1) {
                    inventoryState.current = index + 1;
                } else if (insertIndex !== -1) {
                    // 拾取物品插入空位
                    inventoryState.inventory[insertIndex] = intersectObject;
                    inventoryState.current = insertIndex + 1;
                }
                // 把模型加载到手中
                cameraClass.loadItem(inventoryState.inventory[inventoryState.current - 1].clone());
            }else {
                // 执行模型自定义行为
                intersectObject.userData.active();
            }
        });
    });
}

const keyNumber = () => {
    const codes = [
        "Digit1", "Digit2", "Digit3",
        "Digit4", "Digit5", "Digit6",
        "Digit7", "Digit8", "Digit9",
        "Digit0"
    ] as const;

    codes.forEach((key) => {
        controlsClass.addKeydownEventListener(key, (event) => {
            if (!controlsClass.isLocked || event.ctrlKey) return;
            inventoryState.current = (+event.key + 9) % 10 + 1;
            cameraClass.loadItem(inventoryState.inventory[inventoryState.current - 1].clone());
        });
    })

}

const keyMouse2 = () => {
    // 打开遥控器GUI
    controlsClass.addMousedownEventListener(2, () => {
        if (inventoryState.inventory[inventoryState.current - 1].userData.type === "TVC" && controlsClass.isLocked) {
            inventoryState.inventory[inventoryState.current - 1].userData.openGUI();
        }
    });
}

const keyLoopNumber = (activeInfo: Ref<string>) => {
    // 物品切换
    controlsClass.loopNumber(10, inventoryState.current, (index) => {
        inventoryState.current = index;
        activeInfo.value = inventoryState.inventory[inventoryState.current - 1].name;
        cameraClass.loadItem(inventoryState.inventory[inventoryState.current - 1].clone());
    });

}

export default {
    keyQ, keyE, keyNumber, keyLoopNumber, keyMouse2
}
