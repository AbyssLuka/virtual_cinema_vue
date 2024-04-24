import {Mesh, Object3D} from "three";
import {Controls} from "@/components/ThreeJs/ts/Controls";
import {RayDetect} from "@/components/ThreeJs/ts/RayDetect";
import {Camera} from "@/components/ThreeJs/ts/Camera";
import {Ref} from "vue";
import api from "@/request/api";
import {Subtitle} from "@/components/ThreeJs/ts/Subtitle";
import {UnwrapNestedRefs} from "vue";

type InventoryState = {
    inventory: Object3D[],
    current: number,
    emptyObject3D: Object3D,
}

export const usePickUp = (
    controlsClass: Controls,
    cameraClass: Camera,
    rayDetect: RayDetect,
    worldRayObjects: Object3D[],
    state: UnwrapNestedRefs<InventoryState>,
    activeInfo: Ref<string>
) => {
    return () => {
        // 没有锁定控制器
        if (!controlsClass.isLocked) return;
        rayDetect.firstMesh(worldRayObjects, (intersectObject) => {
            // 没有检测到
            if (!intersectObject) return;
            // 查询物品栏有没有相同的物品 防止重复获取
            const index = state.inventory.indexOf(intersectObject);
            // 查询物品栏第一个空位的位置
            const insertIndex = state.inventory.indexOf(state.emptyObject3D);
            if (index !== -1) {
                state.current = index + 1;
            } else if (insertIndex !== -1) {
                // 拾取物品插入空位
                state.inventory[insertIndex] = <Mesh>intersectObject;
                state.current = insertIndex + 1;
            }
            // 显示选中的物品的名称
            activeInfo.value = intersectObject.name;
            // 把模型加载到手中
            cameraClass.loadItem(state.inventory[state.current - 1].clone()).then()
        });
    }
};

export const useDisplayActive = (
    state: UnwrapNestedRefs<InventoryState>,
    displayVideo: HTMLVideoElement,
    videoUrl: Ref<string>,
    subtitleUrl: Ref<string>,
    subtitle: Ref<string>,
    send: (data) => void,
) => {
    return async () => {
        const selected = state.inventory[state.current - 1];
        if (selected && selected.userData.type === "DVD") {
            send({type: "loadVideo", videoUuid: selected.userData.videoUuid})
            //更换视频URL播放视频
            videoUrl.value = api.videoUrl(selected.userData.videoUuid);
            //创建字幕处理类 //初始化（分析Ass字幕）
            const subtitleClass = await new Subtitle(<HTMLVideoElement>displayVideo, selected.userData.videoUuid).init();
            //获取根据Video播放进度获取字幕
            subtitleClass.subtitleLine((subtitleLine) => {
                subtitle.value = subtitleLine;
            });
            //VTT字幕URL
            subtitleUrl.value = <string>subtitleClass.vttSubtitleUrl;
        } else {
            console.log("无效物品");
        }
    }
}