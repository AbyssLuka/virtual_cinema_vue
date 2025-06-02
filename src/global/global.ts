//后端地址
export const baseUrl = "http://127.0.0.1:2022";
//websocket服务器端口
export const PORT = "3322";
//websocket服务器http地址
export const HTTP_BASE_URL = "http://127.0.0.1:".concat(PORT);
//角色模型地址（为什么是websocket服务器的地址，因为懒）
export const MODEL_BASE_URL = HTTP_BASE_URL.concat("/static/model/");
//websocket服务器ws地址
export const WS_BASE_URL = "ws://127.0.0.1:".concat(PORT);
//为什么上面的变量名这么奇怪（改起来有点麻烦，现在能用就好）

export const fileTypes = {
    directory: "directory",

    mp4: "video", avi: "video", mkv: "video", wmv: "video", mpg: "video",
    mpeg: "video", flv: "video",

    jpg: "image", png: "image", jpeg: "image", gif: "image", psd: "image",
    svg: "image", webp: "image", tiff: "image", raw: "image", bmp: "image",

    txt: "document", pdf: "document", doc: "document", xml: "document", html: "document", ass: "document",
    ssa: "document", vtt: "document",

    mp3:"audio", wma:"audio", wav:"audio", ogg:"audio", ape:"audio", flac:"audio",
    aac:"audio",

    zip:"package", "7z":"package", rar:"package", tar:"package", gz:"package",

    iso:"mirror", img:"mirror", bin:"mirror", mds:"mirror", ccd:"mirror",
    cue:"mirror", bwt:"mirror", wim:"mirror",

    url:"link",
};

export const iconMap = {
    directory: "ri-folder-fill",
    document: "ri-file-doc-fill",
    audio: "ri-file-music-fill",
    video: "ri-movie-fill",
    image: "ri-image-fill",
    mirroring: "ri-file-text-fill",
    package: "ri-folder-zip-fill",
    link: "ri-link",
}