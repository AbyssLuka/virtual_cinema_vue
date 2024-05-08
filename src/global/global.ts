//后端地址
export const baseUrl = "http://***.***.***.***:****";
//websocket服务器端口
export const PORT = "3322";
//websocket服务器http地址
export const HTTP_BASE_URL = "http://***.***.***.***:".concat(PORT);
//角色模型地址（为什么是websocket服务器的地址，因为懒）
export const MODEL_BASE_URL = HTTP_BASE_URL.concat("/static/model/");
//websocket服务器ws地址
export const WS_BASE_URL = "ws://***.***.***.***:".concat(PORT);
//为什么上面的变量名这么奇怪（改起来有点麻烦，现在能用就好）
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