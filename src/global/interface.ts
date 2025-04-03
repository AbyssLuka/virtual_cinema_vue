export interface I_ResData<T> {
    code: number,
    msg: string,
    data: T
}

export interface I_UserInfo {
    address: string,
    createTime: string,
    email: string,
    id: number,
    info: string,
    password: string,
    phone: string,
    profilePhoto: string,
    salt: string,
    sexType: number,
    username: string,
    uuid: string,
}

export interface I_Pageable {
    content: [],
    pageable: {
        pageNumber: number,
        pageSize: number,
        sort: {
            orders: []
        }
    } | null,
    total: number,
}

export interface I_File {
    fileName: string,
    fileSize?: string,
    fileType: string,
    fileUuid: string,
    absolutePath?: string,
    icon?: string,
    lastEditTime?: string,
}

export interface I_TreeNode {
    title: string,
    subDirectory: I_TreeNode[],
    show: boolean,
    type: string,
    uuid: string,
    absolutePath: string,
}

export interface I_Video {
    cover: string,
    subtitle: string,
    videoName: string,
    videoUuid: string,
}

export interface I_DetailAndTag {
    detail: I_Detail_,
}

export interface I_Detail_ {
    clicks: number,
    createTime: string,
    fileList: I_File[],
    id: number,
    info: string,
    pathUuid: string,
    title: string,
    uuid: string,
}

export interface I_SubtitleObject {
    content: string
    data: {
        Effect: string, End: string, Layer: string, MarginL: string, MarginR: string, MarginV: string,
        Name: string, Start: string, Style: string, Text: string,
    } | {
        Alignment: string, Angle: string, BackColour: string, Bold: string, BorderStyle: string,
        Encoding: string, Fontname: string, Fontsize: string, Italic: string, MarginL: string,
        MarginR: string, MarginV: string, Name: string, Outline: string, OutlineColour: string,
        PrimaryColour: string, ScaleX: string, ScaleY: string, SecondaryColour: string, Shadow: string,
        Spacing: string, StrikeOut: string, Underline: string,
    } | {
        "Aegisub Active Line": string, "Aegisub Scroll Position": string, "Aegisub Video Zoom Percent": string,
        "Original Editing": string, "Original Script": string, "Original Timing": string,
        "Original Translation": string, PlayResX: string, PlayResY: string, ScaledBorderAndShadow: string,
        "Script Updated By": string, ScriptType: string, "Synch Point": string, Timer: string, Title: string,
        "Update Details": string, WrapStyle: string,
    }
    duration: number
    end: number
    start: number
    text: string
    type: string
}
