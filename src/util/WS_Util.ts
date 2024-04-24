import {WS_BASE_URL} from "@/global/global";

export default class WS_Util {
    private readonly webSocket_: WebSocket;

    constructor(url: string, token: string) {
        this.webSocket_ = new WebSocket(WS_BASE_URL.concat(url), [token]);
    }

    get webSocket() {
        return this.webSocket_;
    }
}