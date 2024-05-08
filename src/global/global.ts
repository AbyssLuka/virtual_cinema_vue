export const baseUrl = "http://***.***.***.***:****";
export const PORT = "****";
export const HTTP_BASE_URL = "http://***.***.***.***:".concat(PORT);
export const MODEL_BASE_URL = HTTP_BASE_URL.concat("/static/model/");
export const WS_BASE_URL = "ws://***.***.***.***:".concat(PORT);

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