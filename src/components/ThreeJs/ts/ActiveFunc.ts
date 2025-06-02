import {Ref} from "vue";
import api from "@/request/api";
import {Subtitle} from "@/components/ThreeJs/ts/Subtitle";

import {inventoryState} from "@/components/ThreeJs/ts/Global";
import {listener} from "@/components/ThreeJs/ts/EventListener";

export const useDisplayActive = (
    displayVideo: HTMLVideoElement,
    videoUrl: Ref<string>,
    subtitleUrl: Ref<string>,
    subtitle: Ref<string>,
) => {
    return async () => {
        const selected = inventoryState.inventory[inventoryState.current - 1];
        if (selected && selected.userData.type === "DVD") {
            listener.emit("ws:send", {type: "loadVideo", videoUuid: selected.userData.videoUuid})
            //更换视频URL播放视频
            videoUrl.value = api.videoUrl(selected.userData.videoUuid);
            //创建字幕处理类 //初始化（分析Ass字幕）
            const subtitleClass = await new Subtitle(<HTMLVideoElement>displayVideo, selected.userData.videoUuid).init();
            //获取根据Video播放进度获取字幕
            subtitleClass.subtitleLine((subtitleLine) => {
                subtitle.value = subtitleLine;
            });
            //VTT字幕 URL
            subtitleUrl.value = <string>subtitleClass.vttSubtitleUrl;
        } else {
            console.log("无效物品");
        }
    }
}