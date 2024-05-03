// export const baseUrl = "http://ganzhou-eb7c59a5.of-7af93c01.shop:57555";
// export const HTTP_BASE_URL = "http://ganzhou-eb7c59a5.of-7af93c01.shop:59777";
// export const MODEL_BASE_URL = HTTP_BASE_URL.concat("/static/model/");
// export const WS_BASE_URL = "ws://ganzhou-eb7c59a5.of-7af93c01.shop:59777";

export const baseUrl = "http://192.168.193.216:2022";
export const PORT = "3322";
export const HTTP_BASE_URL = "http://192.168.193.216:".concat(PORT);
export const MODEL_BASE_URL = HTTP_BASE_URL.concat("/static/model/");
export const WS_BASE_URL = "ws://192.168.193.216:".concat(PORT);

export const fileTypeList = {
    directory: ["directory"],
    video: ["mp4", "avi", "mkv", "wmv", "mpg", "mpeg", "flv"],
    image: ["jpg", "png", "jpeg", "gif", "psd", "svg", "webp", "tiff", "raw", "bmp"],
    document: ["txt", "pdf", "doc", "xml", "html", "ass", "ssa"],
    audio: ["mp3", "wma", "wav", "ogg", "ape", "flac", "aac"],
    package: ["zip", "7z", "rar", "tar", "gz"],
    mirroring: ["iso", "img", "bin", "mds", "ccd", "cue", "bwt", "wim"],
    link: ["url"]
};