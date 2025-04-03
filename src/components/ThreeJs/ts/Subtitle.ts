import api from "@/request/api";
import util from "@/util/util";
import {I_SubtitleObject} from "@/global/interface";

export class Subtitle {

    private assSubtitleUrl_: string | undefined;
    private vttSubtitleUrl_: string | undefined;
    private subtitleObject_: I_SubtitleObject[] = [];

    constructor(private readonly videoDom: HTMLVideoElement, private readonly videoUuid: string) {}

    public async init() {
        this.assSubtitleUrl_ = await api.subtitleApi(this.videoUuid);
        this.vttSubtitleUrl_ = await util.assToVtt(<string>this.assSubtitleUrl, "URL");
        this.subtitleObject_ = await util.assObjList(<string>this.assSubtitleUrl);
        return this;
    }

    public subtitleLine(callback: (subtitleLine: string) => void) {
        // 没有字幕
        if (this.subtitleObject.length == 0) return;
        // 寻找第一条字幕位置
        let index = this.subtitleObject.findIndex((e) => e.type === "caption");
        const captionStart = index;
        this.videoDom.addEventListener("timeupdate", () => {
            // 转换(ms)
            const newTime = this.videoDom.currentTime * 1000;
            const isNotExcEnd = newTime < this.subtitleObject[index].end;
            const isExcEnd = newTime > this.subtitleObject[index].end;
            const isExcStart = newTime > this.subtitleObject[index].start;
            const isSubtitleShow = this.videoDom.textTracks[0].mode === "showing";
            // 顺序播放字幕
            if (isNotExcEnd && isExcStart) {
                callback(isSubtitleShow ? this.subtitleObject[index].text : "");
            } else if (isExcEnd &&
                index + 1 < this.subtitleObject.length &&
                newTime < this.subtitleObject[index + 1].start) {
                // 目前时间没有字幕
                callback("");
                index++;
            } else {
                // 拖动进度条后重新校准字幕进度(二分查找)
                let [start, end] = [captionStart, this.subtitleObject.length - 1]
                while (start <= end) {
                    const curr = Math.ceil((start + end) / 2);
                    const {
                        start: currStart, end: currEnd, type: currType
                    } = this.subtitleObject[curr];
                    if (currType === "caption" &&
                        currStart < newTime && newTime < currEnd) {
                        callback(this.subtitleObject[index].text);
                        index = curr;
                        break;
                    }
                    newTime > currEnd ? start = curr + 1 : end = curr - 1;
                }
            }
        });
    }

    get assSubtitleUrl() {
        return this.assSubtitleUrl_;
    }

    get vttSubtitleUrl() {
        return this.vttSubtitleUrl_;
    }

    get subtitleObject() {
        return this.subtitleObject_;
    }
}