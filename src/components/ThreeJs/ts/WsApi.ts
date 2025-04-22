import WebSocketUtil from "@/util/WS_Util";
import {
    Clock,
    Mesh,
    Object3D,
    Scene,
} from "three";
import {
    I_EntranceMsg,
    I_InitVideoMsg,
    I_LoadVideoMsg,
    I_NewPlayerMsg,
    I_OtherPlayerExitMsg,
    I_PlayerAction,
    I_RoomInfo,
    I_UpdateVideoMsg
} from "@/components/ThreeJs/ts/GameInterface";
import SpriteMessage from "@/components/ThreeJs/ts//SpriteMessage";
import Player from "@/components/ThreeJs/ts/Player";
import {HTTP_BASE_URL, MODEL_BASE_URL} from "@/global/global";
import api, {ajaxRequest} from "@/request/api";
import {Ref} from "vue";
import {controlsClass, playerList} from "@/components/ThreeJs/ts/Global";

type playerActionOption = {
    userId: string,
    roomId: string,
};

type createPlayerOption = {
    userId: string,
    model: string,
    roomId: string,
    scene: Scene,
    callback: () => void;
}

export type InitVideo = {
    type: "initVideo",
    roomId?: string,
}
export type UpdateVideo = {
    type: "updateVideo",
    progress: number,
    audio: number,
    pause: boolean,
    roomId?: string,
}
export type LoadVideo = {
    type: "loadVideo",
    videoUuid: string,
    roomId?: string,
}


export class WsApi {
    private createPlayerWs: WebSocket | undefined;
    private playerActionWs: WebSocket | undefined;
    private updateVideoWs: WebSocket | undefined;

    constructor(public readonly token: string) {}

    public useSendVideoInfo(roomId: string, videoUrl: Ref<string>, displayVideo: HTMLVideoElement) {
        const videoInfoFunc = {
            loadVideo(parse: I_LoadVideoMsg) {
                videoUrl.value = api.videoUrl(parse.data.videoUuid);
            },
            updateVideo(parse: I_UpdateVideoMsg) {
                if (displayVideo) {
                    displayVideo.currentTime = parse.data.progress;
                    displayVideo.volume = parse.data.audio;
                    parse.data.pause ? displayVideo.pause() : displayVideo.play();
                }
            },
            initVideo(parse: I_InitVideoMsg) {
                //加载视频
                videoUrl.value = api.videoUrl(parse.data.videoUuid);
                //视频的元数据加载完成时调用
                displayVideo.addEventListener("loadedmetadata", () => {
                    //video不存在 结束
                    if (!displayVideo) return;
                    //同步视频进度
                    displayVideo.currentTime = parse.data.videoInfo.progress;
                    displayVideo.volume = parse.data.videoInfo.audio;
                    //用户未进行交互无法自动播放视频 静音时可以自动播放
                    displayVideo.muted = true;
                    parse.data.videoInfo.pause ? displayVideo.pause() : displayVideo.play();
                    const undoMuted = () => {
                        //取消静音
                        displayVideo && (displayVideo.muted = false);
                        //移除监听器
                        window.removeEventListener("keydown", undoMuted);
                    }
                    //用户进行交互时取消静音
                    window.addEventListener("keydown", undoMuted);
                })
            },
        }
        this.updateVideoWs || (this.updateVideoWs = new WebSocketUtil("/updateVideo", this.token).webSocket);
        this.updateVideoWs.onopen = () => {
            this.updateVideoWs && this.updateVideoWs.send(JSON.stringify({
                type: "initVideo",
                roomId,
            }));
        }
        this.updateVideoWs.addEventListener("message", (data: MessageEvent) => {
            const parse = JSON.parse(data.data);
            videoInfoFunc[parse.type](parse);
        });
        this.updateVideoWs.onerror = () => {
            this.useSendVideoInfo(roomId, videoUrl, displayVideo);
        }
        this.updateVideoWs.onclose = () => {
            this.useSendVideoInfo(roomId, videoUrl, displayVideo);
        }

        return (sendData: (InitVideo | UpdateVideo | LoadVideo)) => {
            sendData.roomId = roomId;
            this.updateVideoWs && this.updateVideoWs.send(JSON.stringify(sendData));
        }
    }

    public createPlayer(option: createPlayerOption) {
        this.createPlayerWs || (this.createPlayerWs = new WebSocketUtil("/createPlayer", this.token).webSocket);
        this.createPlayerWs.onopen = () => {
            this.createPlayerWs && this.createPlayerWs.send(JSON.stringify({
                roomId: option.roomId,
                userId: option.userId,
                name: "-------",
                model: option.model,
                type: "createPlayer",
            }));
        };
        const funcMap = {
            newPlayer: (playerData: I_NewPlayerMsg) => {
                const model = playerData.data.newPlayer.model;
                const userId = playerData.data.newPlayer.userId;
                //创建玩家数据
                const player = new Player(userId);
                // 添加至玩家列表
                player.create(MODEL_BASE_URL.concat(model)).then((mesh) => {
                    playerList[userId] = player;
                    option.scene.add(mesh);
                });
            },
            allPlayer: (playerData: I_EntranceMsg) => {
                const playerKeys = Object.keys(playerData.data.allPlayer);
                const videoUuid = playerData.data.videoUuid;
                localStorage.setItem("/threejs:videoUuid", videoUuid);
                option.callback();
                playerKeys.forEach((key) => {
                    if (key !== option.userId) {
                        // 其他玩家
                        const model = playerData.data.allPlayer[key].model;
                        const userId = playerData.data.allPlayer[key].userId;
                        //创建玩家数据
                        const player = new Player(userId);
                        // 添加至玩家列表
                        player.create(MODEL_BASE_URL.concat(model)).then((mesh) => {
                            playerList[userId] = player;
                            option.scene.add(mesh);
                        });
                    } else {
                        // 自己
                        if (playerList[option.userId]) {
                            playerList[option.userId].message = new SpriteMessage("HELLO");
                        }
                    }
                });
            },
            otherPlayerExit: (playerData: I_OtherPlayerExitMsg) => {
                const roleListElement = playerList[playerData.data.userId];
                roleListElement && option.scene.remove(roleListElement.mesh);
                roleListElement.mesh.traverse((child: Object3D) => {
                    if (child.type === "Mesh" && (child) instanceof Mesh) {
                        child.material && child.material.dispose();
                        child.geometry && child.geometry.dispose();
                    }
                });
                roleListElement && roleListElement.message && option.scene.remove(roleListElement.message.object);
            },
            createPlayerError: () => {
                this.createPlayerWs?.close();
            },
            removeRoom: () => {
                cancelAnimationFrame(this.frameSync);
                this.playerActionWs && this.playerActionWs.close();
                this.createPlayerWs && this.createPlayerWs.close();
            },
        };
        this.createPlayerWs.addEventListener("message", (data: MessageEvent) => {
            const playerData = JSON.parse(data.data);
            if (playerData.type) funcMap[playerData.type](playerData);
        });
        this.createPlayerWs.onerror = () => {
            this.createPlayer(option);
        }
        this.createPlayerWs.onclose = () => {
            this.createPlayer(option);
        }
    }

    private frameSync = 0;

    public playerAction(option: playerActionOption) {
        this.playerActionWs || (this.playerActionWs = new WebSocketUtil("/playerAction", this.token).webSocket)
        /*const reconnect = () =>{
            setTimeout(()=>{
                this.playerActionWs = this.playerActionWs = new WebSocketUtil("/playerAction", this.token).webSocket
                this.playerActionWs && (this.playerActionWs.onerror = () =>{
                    reconnect();
                })
                this.playerActionWs && (this.playerActionWs.onclose = () =>{
                    reconnect();
                })
            },1000)
        }*/
        // clearInterval(this.frameSync);
        this.playerActionWs.onopen = () => {
            //同步数据发送函数
            const clock = new Clock();
            let time = 0;
            const synchronous = () => {
                time += clock.getDelta();
                if (time <= 1/60) return;
                time %= 1/60;
                const position = controlsClass.position;
                const rotation = controlsClass.rotation;
                const message = "";
                // const roleListElement = option.playerList[option.userId];
                // if (roleListElement && roleListElement.message) {
                //     message = roleListElement.message.getText();
                // }

                this.playerActionWs && this.playerActionWs.send(JSON.stringify({
                    type: "playerAction",
                    name: option.userId,
                    position: {x: position.x, y: position.y, z: position.z},
                    rotation: {x: rotation.x, y: rotation.y, z: rotation.z, w: rotation.w},
                    roomId: option.roomId,
                    userId: option.userId,
                    playerStatus: controlsClass.playerState,
                    message: message,
                }));
                this.frameSync = requestAnimationFrame(synchronous);
            };
            cancelAnimationFrame(this.frameSync);
            synchronous();
        };
        //同步，数据接收
        this.playerActionWs.onmessage = (data: MessageEvent) => {
            const playerKey = Object.keys(playerList);
            const parse: I_PlayerAction = JSON.parse(data.data);
            //更新所有玩家的数据
            parse && parse.room && parse.room.playerList_ && playerKey.forEach((key) => {
                const playerMesh = playerList[key].mesh;
                const player = playerList[key];
                const message = playerList[key].message;
                const playerData = parse.room.playerList_[playerMesh.userData.userId];
                if (!playerData) return;
                player.update(playerData);
                if (option.userId !== key) {
                    message!.text = playerData.message
                }
            });
        }

        this.playerActionWs.onerror = () => {
            this.playerAction(option);
        }
        this.playerActionWs.onclose = () => {
            this.playerAction(option);
        }
    }

    public createRoom(roomName: string, videoUuid: string) {
        return ajaxRequest<
            { type: "createRoom", name: string, videoUuid: string, },
            { type: "createRoom", roomId: string, name: string, videoUuid: string, }
        >("POST", "/createRoom",
            {type: "createRoom", name: roomName, videoUuid,},
            HTTP_BASE_URL
        );
    }

    public selectRoomList(name: string, callback: (roomList: I_RoomInfo[]) => void) {
        ajaxRequest<
            { type: "selectRoomList", name: string },
            { "type": "selectRoomList", "roomInfoList": [] }
        >("POST", "/selectRoomList",
            {
                type: "selectRoomList",
                name
            },
            HTTP_BASE_URL
        ).then(res => {
            console.log(res.data.roomInfoList)
            callback(res.data.roomInfoList);
        });
    }

    public exitRoom(userId: string, roomId: string) {
        ajaxRequest<
            { userId: string, roomId: string },
            {
                type: "createRoom",
                roomId: string,
                name: string,
                videoUuid: string,
            }
        >("POST", "/exitRoom",
            {userId, roomId},
            HTTP_BASE_URL
        ).then(res => {
            console.log(res.data)
            cancelAnimationFrame(this.frameSync);
            this.playerActionWs && this.playerActionWs.close();
        });
    }

    public removeRoom(roomId: string) {
        ajaxRequest<
            { type: "removeRoom", roomId: string }, {
            type: "createRoom",
            roomId: string,
            name: string,
            videoUuid: string,
        }
        >("POST", "/removeRoom",
            {type: "removeRoom", roomId},
            HTTP_BASE_URL
        ).then(res => {
            console.log(res.data)
            cancelAnimationFrame(this.frameSync);
            this.playerActionWs && this.playerActionWs.close();
        });

    }

    public dispose() {
        this.createPlayerWs && this.createPlayerWs.close();
        this.playerActionWs && this.playerActionWs.close();
        this.updateVideoWs && this.updateVideoWs.close();
        cancelAnimationFrame(this.frameSync);
    }
}