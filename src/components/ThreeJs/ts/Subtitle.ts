import api from "@/request/api";
import util from "@/util/util";
import {I_SubtitleObject} from "@/global/interface";

export class Subtitle {
    private videoDom: HTMLVideoElement;
    private readonly videoUuid: string;
    private assSubtitleUrl: string | undefined;
    private vttSubtitleUrl: string | undefined;
    private subtitleObject: I_SubtitleObject[] = [];

    constructor(videoDom: HTMLVideoElement, videoUuid: string) {
        this.videoDom = videoDom;
        this.videoUuid = videoUuid;
    }

    public async init() {
        this.assSubtitleUrl = await api.subtitleApi(this.videoUuid);
        this.vttSubtitleUrl = await util.assToVtt(this.assSubtitleUrl, "URL");
        this.subtitleObject = await util.assObjList(this.assSubtitleUrl as string) as unknown as I_SubtitleObject[];
    }

    public subtitleLine(callback: (subtitleLine: string) => void) {
        // 没有字幕
        if (this.subtitleObject.length == 0) return;
        let index = 0;
        let captionStart = 0;
        // 寻找第一条字幕位置
        for (let i = 0; i < this.subtitleObject.length - 1; i++) {
            if (this.subtitleObject[i].type === "caption") {
                index = i;
                captionStart = i;
                break;
            }
        }
        this.videoDom.addEventListener("timeupdate", () => {
            // 当前播放时间(s)
            const currentTime = this.videoDom.currentTime as number;
            //转换(ms)
            const newTime = currentTime * 1000;
            // 顺序播放字幕
            if (newTime < this.subtitleObject[index].end && newTime > this.subtitleObject[index].start) {
                if (this.videoDom.textTracks[0].mode === "showing"){
                    callback(this.subtitleObject[index].text);
                }else {
                    callback("");
                }
            } else if (newTime > this.subtitleObject[index].end &&
                index + 1 < this.subtitleObject.length &&
                newTime < this.subtitleObject[index + 1].start) {
                callback("");
                index++;
            } else {
                //拖动进度条后重新校准字幕进度(二分查找)
                let start = captionStart;
                let end = this.subtitleObject.length - 1;
                while (start <= end) {
                    const curr = Math.ceil((start + end) / 2);
                    if (this.subtitleObject[curr].type === "caption" &&
                        newTime < this.subtitleObject[curr].end &&
                        newTime > this.subtitleObject[curr].start) {
                        callback(this.subtitleObject[index].text);
                        index = curr;
                        break;
                    } else if (newTime > this.subtitleObject[curr].end) {
                        start = curr + 1;
                    } else if (newTime < this.subtitleObject[curr].start) {
                        end = curr - 1;
                    }
                }
            }
        });
    }

    public getAssSubtitleUrl() {
        return this.assSubtitleUrl;
    }

    public getVttSubtitleUrl() {
        return this.vttSubtitleUrl;
    }

    public getSubtitleObject() {
        return this.subtitleObject;
    }
}