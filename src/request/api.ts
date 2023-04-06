import request from "./request";
import axios, {AxiosRequestConfig, AxiosResponse} from "axios";
import {baseUrl} from "@/global/global";
import {
    I_Detail_,
    I_DetailAndTag,
    I_Pageable,
    I_ResData,
    I_UserInfo,
    I_Video
} from "@/global/interface";

//登录
const loginApi = async (username: string, password: string, code: string) => {
    const resPromise: Promise<AxiosResponse<I_ResData<null>>> = ajaxRequest("POST", "/user/login", {
        username,
        password,
        code
    });
    let resData_: I_ResData<null | string> = {code: -1, msg: "", data: null};
    await resPromise.then((res: AxiosResponse) => {
        localStorage.setItem("token", res.headers.token);
        resData_ = res.data;
    }).catch((err) => {
        resData_.msg = err.toString();
    });
    return resData_;
};
//注册
const registerApi = async (username: string, password: string, email: string) => {
    const resPromise: Promise<AxiosResponse<I_ResData<null>>> = ajaxRequest("POST", "/user/signup", {
        username,
        password,
        email
    });
    let resData_: I_ResData<null | string> = {code: -1, msg: "", data: null};
    await resPromise.then(res => {
        resData_ = res.data;
    }).catch((err) => {
        resData_.msg = err.toString();
    });
    return resData_;
};
//主页
const animePostLimitApi = async (keyword: string, page: number, size: number) => {
    const resPromise: Promise<AxiosResponse<I_ResData<I_Pageable>>> = ajaxRequest("POST", "/anime/list", {
        keyword,
        page,
        size
    });
    let resData_: I_ResData<I_Pageable | null> = {code: -1, msg: "", data: null};
    await resPromise.then((res) => {
        resData_ = res.data;
    }).catch((err) => {
        resData_.msg = err.toString();
    });
    return resData_;
};
//获取视频信息
const videoApi = async (uuid: string) => {
    const resPromise: Promise<AxiosResponse<I_ResData<I_Video>>> = ajaxRequest("GET", "/file/video", {
        uuid
    });
    let resData_: I_ResData<I_Video | null> = {code: -1, msg: "", data: null};
    await resPromise.then(res => {
        resData_ = res.data;
    }).catch((err) => {
        resData_.msg = err.toString();
    });
    return resData_;
};

const animePostApi = async (uuid: string) => {
    const resPromise: Promise<AxiosResponse<I_ResData<I_DetailAndTag>>> = ajaxRequest("GET", "/anime/get", {
        uuid
    });
    let resData_: I_ResData<I_DetailAndTag | null> = {code: -1, msg: "", data: null};
    await resPromise.then(res => {
        resData_ = res.data;
    }).catch((err) => {
        resData_.msg = err.toString();
    });
    return resData_;
};

//缩略图
const thumbnailUrl = (uuid: string): string => {
    return baseUrl + "/file/thumbnail/" + uuid;
};
//视频
const videoUrl = (uuid: string): string => {
    return baseUrl + "/file/video/" + uuid;
};
//下载文件
const fileUrl = (uuid: string): string => {
    return baseUrl + "/file/" + uuid;
};
//头像
const profileUrl = async (): Promise<string> => {
    let url = "";
    await request.get("/user/profile_photo", {responseType: "blob"}).then(res => {
        url = URL.createObjectURL(res.data);
    }).catch((err) => {
        url = err;
    });
    return url;
};

//用户信息
const userInfoApi = async () => {
    const resPromise: Promise<AxiosResponse<I_ResData<I_UserInfo>>> = ajaxRequest("GET", "/user/info/", null);
    let resData_: I_ResData<I_UserInfo | null> = {code: -1, msg: "", data: null};
    await resPromise.then(res => {
        resData_ = res.data;
    }).catch((err) => {
        resData_.msg = err.toString();
    });
    return resData_;
};

//更新密码
const updatePasswordApi = async (username: string, password: string) => {
    const resPromise: Promise<AxiosResponse<I_ResData<null>>> = ajaxRequest("POST", "/user/update_password", {
        userName: username,
        passWord: password,
        code: "",
    });
    let resData_: I_ResData<null> = {code: -1, msg: "", data: null};
    await resPromise.then(res => {
        resData_ = res.data;
    }).catch((err) => {
        resData_.msg = err.toString();
    });
    return resData_;
};
//收藏
const addCollectApi = async (uuid: string) => {
    const resPromise: Promise<AxiosResponse<I_ResData<null>>> = ajaxRequest("POST", "/collect/add", {
        uuid
    });
    let resData_: I_ResData<null> = {code: -1, msg: "", data: null};
    await resPromise.then(res => {
        resData_ = res.data;
    }).catch((err) => {
        resData_.msg = err.toString();
    });
    return resData_;
};

//取消收藏
const unCollectApi = async (uuid: string) => {
    const resPromise: Promise<AxiosResponse<I_ResData<null>>> = ajaxRequest("POST", "/collect/remove", {
        uuid
    });
    let resData_: I_ResData<null> = {code: -1, msg: "", data: null};
    await resPromise.then(res => {
        resData_ = res.data;
    }).catch((err) => {
        resData_.msg = err.toString();
    });
    return resData_;
};
//收藏列表
const collectListApi = async (page: number, size: number) => {
    const resPromise: Promise<AxiosResponse<I_ResData<null>>> = ajaxRequest("POST", "/collect/list", {
        page, size
    });
    let resData_: I_ResData<null> = {code: -1, msg: "", data: null};
    await resPromise.then(res => {
        resData_ = res.data;
    }).catch((err) => {
        resData_.msg = err.toString();
    });
    return resData_;
};

//收藏列表
const kaptchaUrl = (): string => {
    return baseUrl.concat("/user/kaptcha?k=").concat(Math.random().toString());
};

//收藏状态
const collectIsHaveApi = async (viewUuid: string) => {
    const resPromise: Promise<AxiosResponse<boolean | I_ResData<null>>> = ajaxRequest("GET", "/collect/ishave/".concat(viewUuid), null);
    let resData_: boolean | I_ResData<null> = false;
    await resPromise.then(res => {
        resData_ = res.data;
    }).catch((err) => {
        resData_ = {code: -1, msg: err.toString(), data: null};
    });
    return resData_;
};

const subtitleApi = async (videoUuid: string): Promise<string> => {
    let url: string | null = "";
    await request.get("/file/subtitle/".concat(videoUuid), {responseType: "blob"}).then(res => {
        url = URL.createObjectURL(res.data);
    }).catch(() => {
        url = null;
    });
    return url;
};

const comicListApi = async (page: number, size: number) => {
    const resPromise: Promise<AxiosResponse<I_ResData<I_Pageable | null>>> = ajaxRequest("POST", "/comic/list/", {
        page, size
    });
    let resData_: I_ResData<I_Pageable | null> = {code: -1, msg: "", data: null};
    await resPromise.then(res => {
        resData_ = res.data;
    }).catch((err) => {
        resData_.msg = err.toString();
    });
    return resData_;
};

const comicApi = async (uuid: string) => {
    const resPromise: Promise<AxiosResponse<I_ResData<I_Detail_ | null>>> = ajaxRequest("GET", "/comic/".concat(uuid), null);
    let resData_: I_ResData<I_Detail_ | null> = {code: -1, msg: "", data: null};
    await resPromise.then(res => {
        resData_ = res.data;
    }).catch((err) => {
        resData_.msg = err.toString();
    });
    return resData_;
};

const searchFileApi = async (keyword: string) => {
    const resPromise: Promise<AxiosResponse<I_ResData<I_Pageable | null>>> = ajaxRequest("GET", "/file/searchFile/", {q: keyword});
    let resData_: I_ResData<I_Pageable | null> = {code: -1, msg: "", data: null};
    await resPromise.then(res => {
        resData_ = res.data;
    }).catch((err) => {
        resData_.msg = err.toString();
    });
    return resData_;
};

const subdirectoryApi = async (uuid: string) => {
    const resPromise: Promise<AxiosResponse<I_ResData<I_Pageable | null>>> = ajaxRequest("POST", "/file/subdirectory", {directoryUuid: uuid});
    let resData_: I_ResData<I_Pageable | null> = {code: -1, msg: "", data: null};
    await resPromise.then(res => {
        resData_ = res.data;
    }).catch((err) => {
        resData_.msg = err.toString();
    });
    return resData_;
};

const imageObjUrl = async (uuid: string): Promise<string> => {
    let url: string | null = "";
    await request.get("/file/thumbnail/".concat(uuid), {responseType: "blob"}).then(res => {
        url = URL.createObjectURL(res.data);
    }).catch(() => {
        url = "";
    });
    return url;
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const ajaxRequest = <T>(method: "POST" | "GET" | "PUT" | "DELETE", api: string, params: T): Promise<any> => {
    let token: string | undefined | null = localStorage.getItem("token");
    !token && (token = "");
    const httpDefault: AxiosRequestConfig = {
        method: method,
        headers: {
            "token": token,
            "Cache-Control": "max-age = 36000",
        },
        baseURL: baseUrl,
        url: api,
        // `params` 是即将与请求一起发送的 URL 参数
        // `data` 是作为请求主体被发送的数据
        params: method === 'GET' || method === 'DELETE' ? params : null,
        data: method === 'POST' || method === 'PUT' ? params : null,
        timeout: 50000
    };

    return new Promise((resolve, reject) => {
        axios(httpDefault).then((res: AxiosResponse) => {
            resolve(res)
        }).catch((response: AxiosResponse) => {
            reject(response)
        });
    });
};

export default {
    loginApi,
    registerApi,
    animePostLimitApi,
    animePostApi,
    videoApi,
    userInfoApi,
    updatePasswordApi,
    addCollectApi,
    unCollectApi,
    collectListApi,
    collectIsHaveApi,
    subtitleApi,
    comicListApi,
    comicApi,
    searchFileApi,
    subdirectoryApi,

    imageObjUrl,
    thumbnailUrl,
    videoUrl,
    fileUrl,
    profileUrl,
    kaptchaUrl,
}