import request from "./request";
import axios, {AxiosError, type AxiosRequestConfig, type AxiosResponse} from "axios";
import {baseUrl} from "@/global/global";
import {
    I_Collection,
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
const loginApi = (params: LoginParamsType): Promise<I_ResData<string>> => {
    return new Promise((resolve) => {
        request.post("/user/login", params).then((res: AxiosResponse<I_ResData<string>>) => {
            localStorage.setItem("token", res.headers.token);
            resolve(res.data);
        })
    });
};

//注册
type RegisterParamsType = { username: string, password: string, email: string }
const registerApi = (params: RegisterParamsType): Promise<I_ResData<string>> => {
    return new Promise((resolve, reject) => {
        request.post("/user/signup", params).then((res: AxiosResponse<I_ResData<string>>) => {
            resolve(res.data)
        }).catch(err => {
            reject(err)
        });
    })
};

//主页
type AnimePostParamsType = { keyword: string, page: number, size: number }
const animePostLimitApi = (params: AnimePostParamsType): Promise<I_ResData<I_Pageable<I_Detail_>>> => {
    return new Promise((resolve) => {
        request.post("/anime/list", params).then((res) => {
            resolve(res.data)
        })
    })
};
//获取视频信息
const videoApi = (uuid: string): Promise<I_ResData<I_Video>> => {
    return new Promise((resolve) => {
        request.get("/file/video", {params: {uuid}}).then((res) => {
            resolve(res.data)
        })
    })
};

const animePostApi = async (uuid: string):Promise<I_ResData<I_DetailAndTag>> => {
    return new Promise((resolve) => {
        request.get("/anime/get", {params: {uuid}}).then((res) => {
            resolve(res.data)
        })
    });
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
const profileUrl = (): Promise<string> => {
    return new Promise((resolve) => {
        request.get("/user/profile_photo", {responseType: "blob"}).then(res => {
            resolve(URL.createObjectURL(res.data));
        })
    })

};

//用户信息
const userInfoApi = (): Promise<I_ResData<I_UserInfo>> => {
    return new Promise((resolve) => {
        request.get("/user/info").then((res) => {
            resolve(res.data)
        });
    });
};

//更新密码
type UpdatePswParamsType = { oldPassword: string, newPassword: string };
const updatePasswordApi = async (param: UpdatePswParamsType) => {
    return new Promise<I_ResData<null>>((resolve) => {
        request.post("/user/update_password", param).then((res) => {
            resolve(res.data)
        });
    });
}

//收藏
const addCollectApi = async (uuid: string):Promise<I_ResData<null>> => {
    return new Promise((resolve) => {
        request.get(`/collect/add/${uuid}`).then((res) => {
            resolve(res.data)
        })
    })
};

//取消收藏
const unCollectApi = async (uuid: string) => {
    return new Promise<I_ResData<null>>((resolve) => {
        request.get(`/collect/remove/${uuid}`).then((res) => {
            resolve(res.data)
        })
    })
};
//收藏列表
const collectListApi = (page: number, size: number): Promise<I_ResData<I_Pageable<I_Collection>>> => {
    return new Promise((resolve) => {
        request.post("/collect/list", {page, size}).then((res) => {
            resolve(res.data)
            console.log(res.data)
        });
    });
};

//验证码
const kaptchaUrl = () => {
    return `${baseUrl}"/user/kaptcha?k="${Math.random()}`;
};

//收藏状态
const collectIsHaveApi = async (videoUuid: string): Promise<I_ResData<boolean>> => {
    return new Promise((resolve) => {
        request.get(`/collect/ishave/${videoUuid}`).then((res) => {
            resolve(res.data)
        });
    });
};

const subtitleApi = async (videoUuid: string): Promise<string> => {
    return new Promise((resolve) => {
        request.get("/file/subtitle/".concat(videoUuid), {responseType: "blob"}).then(res => {
            resolve(URL.createObjectURL(res.data))
        });
    });
};

type ComicListType = { page: number, size: number, keyword: string };
const comicListApi = async (params: ComicListType) => {
    return new Promise<I_ResData<I_Pageable>>((resolve) => {
        request.post("/comic/list", params).then((res) => {
            resolve(res.data)
        });
    });
};

const comicApi = async (uuid: string) => {
    return new Promise<I_ResData<I_Detail_>>((resolve) => {
        request.get(`/comic/${uuid}`).then((res) => {
            resolve(res.data)
        });
    });
};

const searchFileApi = async (keyword: string) => {
    return new Promise<I_ResData<I_File[]>>((resolve) => {
        request.get("/file/searchFile", {params: {q: keyword}}).then((res) => {
            resolve(res.data)
        });
    });
};

const subdirectoryApi = async (uuid: string) => {
    return new Promise<I_ResData<I_File[]>>((resolve) => {
        request.get("/file/subdirectory", {params: {uuid: uuid}}).then((res) => {
            resolve(res.data)
        });
    });
};

const imageObjUrl = (uuid: string): Promise<string> => {
    return new Promise((resolve => {
        request.get("/file/thumbnail/".concat(uuid), {responseType: "blob"}).then(res => {
            resolve(URL.createObjectURL(res.data));
        });
    }));
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