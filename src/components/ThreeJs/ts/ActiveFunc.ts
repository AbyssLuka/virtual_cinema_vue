import {Mesh} from "three";
import {RayDetect} from "@/components/ThreeJs/ts/RayDetect";
import {Ref} from "vue";
import api from "@/request/api";
import {Subtitle} from "@/components/ThreeJs/ts/Subtitle";

import {cameraClass, controlsClass, inventoryState, worldRayObjects} from "@/components/ThreeJs/ts/Global";
import {InitVideo, LoadVideo, UpdateVideo} from "@/components/ThreeJs/ts/WsApi";

export const usePickUp = (
    rayDetect: RayDetect,
    activeInfo: Ref<string>
) => {
    return () => {
        // 没有锁定控制器
        if (!controlsClass.isLocked) return;
        rayDetect.firstMesh(worldRayObjects, (intersectObject) => {
            // 没有检测到
            if (!intersectObject) return;
            // 查询物品栏有没有相同的物品 防止重复获取
            const index = inventoryState.inventory.indexOf(intersectObject);
            // 查询物品栏第一个空位的位置
            const insertIndex = inventoryState.inventory.indexOf(inventoryState.emptyObject3D);
            if (index !== -1) {
                inventoryState.current = index + 1;
            } else if (insertIndex !== -1) {
                // 拾取物品插入空位
                inventoryState.inventory[insertIndex] = <Mesh>intersectObject;
                inventoryState.current = insertIndex + 1;
            }
            // 显示选中的物品的名称
            activeInfo.value = intersectObject.name;
            // 把模型加载到手中
            cameraClass.loadItem(inventoryState.inventory[inventoryState.current - 1].clone()).then()
        });
    }
};

export const useDisplayActive = (
    displayVideo: HTMLVideoElement,
    videoUrl: Ref<string>,
    subtitleUrl: Ref<string>,
    subtitle: Ref<string>,
    send: (data: (InitVideo | UpdateVideo | LoadVideo)) => void,
) => {
    return async () => {
        const selected = inventoryState.inventory[inventoryState.current - 1];
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