import axios from "axios";
import {baseUrl} from "@/global/global";

const instance = axios.create({
    baseURL: baseUrl,
    timeout: 10000,
});

instance.interceptors.request.use(config => {
    const token: string | null | undefined = localStorage.getItem("token");
    token && (config.headers.token = token);
    return config;
}, error => {
    return new Promise(error);
});

instance.interceptors.response.use(res => {
    return res;
}, error => {
    return new Promise(error);
});

export default instance;