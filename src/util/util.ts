import subsrt from "subsrt";
import {I_SubtitleObject} from "@/global/interface";

const convertData = (date: string, format: string): string => {
    const newDate: Date = new Date(date);
    format = format.replace("yyyy", String(newDate.getFullYear()));
    format = format.replace("MM", String(newDate.getMonth() + 1));
    format = format.replace("dd", String(newDate.getDate() ));
    format = format.replace("HH", String(newDate.getHours()));
    format = format.replace("mm", String(newDate.getMinutes()));
    format = format.replace("ss", String(newDate.getSeconds()));
    return format;
};

const convertByte = (byte: string): string => {
    const size: string[] = ["B", "KB", "MB", "GB", "TB"];
    const i: number = Math.floor(Math.log(parseInt(byte)) / Math.log(1024));
    return Math.floor(parseInt(byte) / Math.pow(1024, i)) + size[i];
};

const loadFile = (url: string): string | null => {
    const xhr: XMLHttpRequest = new XMLHttpRequest();
    const okStatus: number = document.location.protocol === "file:" ? 0 : 200;
    xhr.open('GET', url, false);
    xhr.overrideMimeType("text/html;charset=windows-1252");
    xhr.send(null);
    // xhr.setRequestHeader("responseType","blob");
    return xhr.status === okStatus ? xhr.responseText : null;
};


const assToVtt = async (url: string, type: "URL" | "TEXT"): Promise<string | undefined> => {
    // let captions = subsrt.parse(loadFile("http://192.168.193.216:2020/ass"), {verbose: true});
    // console.log(captions);
    // let vtt = subsrt.convert(loadFile("http://192.168.193.216:2020/ass"), { format: 'vtt' });
    // console.log(vtt);
    try {
        const vtt: string = subsrt.convert(loadFile(url), {format: 'vtt'});
        const blob: Blob = new Blob([vtt], {type: "text/plain;charset=utf-8",});
        if (type === "URL") {
            return URL.createObjectURL(blob);
        } else if (type === "TEXT") {
            return await blob.text();
        }
    } catch (e) {
        return undefined;
    }
};

const assObjList = async (url: string):Promise<I_SubtitleObject[]> => {
    return subsrt.parse(loadFile(url));
};

export default {
    convertData,
    convertByte,
    loadFile,
    assToVtt,
    assObjList,
}