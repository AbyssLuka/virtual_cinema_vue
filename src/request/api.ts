import request from "./request";
import axios, {AxiosError, type AxiosRequestConfig, type AxiosResponse} from "axios";
import {baseUrl} from "@/global/global";
import {
    I_Detail_,
    I_DetailAndTag,
    I_File,
    I_Pageable,
    I_ResData,
    I_UserInfo,
    I_Video
} from "@/global/interface";

//登录
type LoginParamsType = { username: string, password: string, code: string }
const loginApi = (params: LoginParamsType):Promise<I_ResData<string>> => {
    return new Promise((resolve) => {
        request.post("/user/login",params).then((res:AxiosResponse<I_ResData<string>>)=>{
            localStorage.setItem("token", res.headers.token);
            resolve(res.data);
        })
    });
};

//注册
type RegisterParamsType = { username: string, password: string, email: string }
const registerApi = (params: RegisterParamsType):Promise<I_ResData<string>> => {
    return new Promise((resolve,reject) => {
        request.post("/user/signup",params).then((res:AxiosResponse<I_ResData<string>>)=>{
            resolve(res.data)
        }).catch(err=>{
            reject(err)
        });
    })
};
//主页
type AnimePostParamsType = { keyword: string, page: number, size: number }
const animePostLimitApi = async (params: { keyword: string, page: number, size: number }) => {
    const resPromise = ajaxRequest<AnimePostParamsType, I_ResData<I_Pageable>>("POST", "/anime/list", params);
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
    const resPromise = ajaxRequest<{ uuid: string }, I_ResData<I_Video>>("GET", "/file/video", {uuid});
    let resData_: I_ResData<I_Video | null> = {code: -1, msg: "", data: null};
    await resPromise.then(res => {
        resData_ = res.data;
    }).catch((err) => {
        resData_.msg = err.toString();
    });
    return resData_;
};

const animePostApi = async (uuid: string) => {
    const resPromise = ajaxRequest<{ uuid: string }, I_ResData<I_DetailAndTag>>("GET", "/anime/get", {uuid});
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
    const resPromise = ajaxRequest<null, I_ResData<I_UserInfo>>("GET", "/user/info", null);
    let resData_: I_ResData<I_UserInfo | null> = {code: -1, msg: "", data: null};
    await resPromise.then(res => {
        resData_ = res.data;
    }).catch((err) => {
        resData_.msg = err.toString();
    });
    return resData_;
};

//更新密码
type UpdatePswParamsType = { oldPassword: string, newPassword: string };
const updatePasswordApi = async (param: UpdatePswParamsType) => {
    const resPromise = ajaxRequest<UpdatePswParamsType, I_ResData<null>>("POST", "/user/update_password", param);
    let resData_: I_ResData<null> = {code: -1, msg: "", data: null};
    await resPromise.then(res => {
        if (res.data.code === 200) {
            localStorage.setItem("token", res.headers.token);
        }
        resData_ = res.data;
    }).catch((err) => {
        resData_.msg = err.toString();
    });
    return resData_;
};
//收藏
const addCollectApi = async (uuid: string) => {
    const resPromise = ajaxRequest<null, I_ResData<null>>("GET", "/collect/add/".concat(uuid), null);
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
    const resPromise = ajaxRequest<{ uuid: string }, I_ResData<null>>("GET", "/collect/remove", {uuid});
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
    const resPromise = ajaxRequest<{
        page: number,
        size: number
    }, I_ResData<null | I_Pageable>>("POST", "/collect/list", {
        page,
        size
    });
    let resData_: I_ResData<null | I_Pageable> = {code: -1, msg: "", data: null};
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
const collectIsHaveApi = async (videoUuid: string) => {
    const resPromise = ajaxRequest<null, I_ResData<boolean>>("GET", "/collect/ishave/".concat(videoUuid), null);
    let resData_: I_ResData<boolean> = {code: -1, msg: "", data: false};
    await resPromise.then(res => {
        resData_ = res.data;
    }).catch((err) => {
        resData_ = {code: -1, msg: err.toString(), data: false};
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

type ComicListType = { page: number, size: number };
const comicListApi = async (params: ComicListType) => {
    const resPromise = ajaxRequest<ComicListType, I_ResData<I_Pageable | null>>("POST", "/comic/list", params);
    let resData_: I_ResData<I_Pageable | null> = {code: -1, msg: "", data: null};
    await resPromise.then(res => {
        resData_ = res.data;
    }).catch((err) => {
        resData_.msg = err.toString();
    });
    return resData_;
};

const comicApi = async (uuid: string) => {
    const resPromise = ajaxRequest<null, I_ResData<I_Detail_ | null>>("GET", "/comic/".concat(uuid), null);
    let resData_: I_ResData<I_Detail_ | null> = {code: -1, msg: "", data: null};
    await resPromise.then(res => {
        resData_ = res.data;
    }).catch((err) => {
        resData_.msg = err.toString();
    });
    return resData_;
};

const searchFileApi = async (keyword: string) => {
    const resPromise = ajaxRequest<{ q: string }, I_ResData<I_File[] | null>>("GET", "/file/searchFile", {q: keyword});
    let resData_: I_ResData<I_File[] | null> = {code: -1, msg: "", data: null};
    await resPromise.then(res => {
        resData_ = res.data;
    }).catch((err) => {
        resData_.msg = err.toString();
    });
    return resData_;
};

const subdirectoryApi = async (uuid: string) => {
    const resPromise = ajaxRequest<
        { uuid: string }, I_ResData<I_File[] | null>
    >("GET", "/file/subdirectory", {uuid: uuid});
    let resData_: I_ResData<I_File[] | null> = {code: -1, msg: "", data: null};
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

type methodType = "POST" | "GET" | "PUT" | "DELETE";
export const ajaxRequest = <T, K>(method: methodType, api: string, params: T, baseUrl_?: string): Promise<AxiosResponse<K>> => {
    const token: string | undefined | null = localStorage.getItem("token");
    const httpDefault: AxiosRequestConfig = {
        method: method,
        headers: {
            "token": token,
            "Cache-Control": "max-age = 36000",
        },
        baseURL: baseUrl_ ? baseUrl_ : baseUrl,
        url: api,
        params: method === 'GET' || method === 'DELETE' ? params : null,
        data: method === 'POST' || method === 'PUT' ? params : null,
        timeout: 50000
    };
    return new Promise((resolve, reject) => {
        axios(httpDefault).then((res: AxiosResponse<K>) => {
            resolve(res)
        }).catch((response: AxiosResponse<null>) => {
            reject(response)
        });
    });
};

type TModel = {
    uuid: string,
    type: string,
    fileName: string,
    createTime: string,
}

const modelListApi = (callback: (data: I_ResData<TModel[]> | null, error: AxiosError | null) => void) => {
    request.post("model").then((res: AxiosResponse) => {
        callback(res.data, null);
    }).catch((err) => {
        callback(null, err);
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

    modelListApi,
}