import {AnimationAction, AnimationMixer, Group, Mesh, Object3D} from "three";
import SpriteMessage from "@/components/ThreeJs/ts/SpriteMessage"
import CANNON from "cannon-es";

interface I_Vector3 {
    x: number,
    y: number,
    z: number,
    w?: number,
}

export interface I_ModelEntity {
    uuid: string,
    type: string,
    fileName: string,
    createTime: string,
}

export interface I_CreateRoom {
    type: string,
    roomId: string,
}

export interface I_Player {
    name: string,
    position: I_Vector3,
    rotation: I_Vector3,
    userId: string,
    playerStatus: "run" | "jump" | "stand",
    message: string,
    model: string,
}


export interface I_PlayerList {
    [key: string]: I_Player
}

export interface I_PlayerAction {
    type: string,
    room: {
        id: string,
        name: string,
        scene: string,
        playerList_: I_PlayerList
    },
}

export interface I_WsMsg {
    type: string,
    code: number,
    msg: string,
}

export interface I_EntranceMsg extends I_WsMsg {
    data: {
        allPlayer: I_PlayerList,
        videoUuid: string,
    }
}

export interface I_NewPlayerMsg extends I_WsMsg {
    data: { newPlayer: I_Player }
}

export interface I_OtherPlayerExitMsg extends I_WsMsg {
    data: { userId: string }
}

export interface I_LoadVideoMsg extends I_WsMsg {
    data: { videoUuid: string, },
}

export interface I_UpdateVideoMsg extends I_WsMsg {
    data: {
        pause: boolean,
        progress: number,
        audio: number,
    },
}

export interface I_InitVideoMsg extends I_WsMsg {
    data: {
        videoUuid: string,
        videoInfo: {
            pause: boolean,
            progress: number,
            audio: number,
        },
    },
}

export interface I_SelectRoomList {
    type: string,
    roomInfoList: I_RoomInfo[],
}

export interface I_RoomInfo {
    id: string,
    name: string,
    amount: number,
}

export interface I_RoleObject {
    mesh: Object3D,
    mixer?: AnimationMixer,
    animation?: {
        run?: AnimationAction,
        stand?: AnimationAction,
        jump?: AnimationAction,
        expression?: AnimationAction,
    },
    message?: SpriteMessage,
}

export interface I_PhysicalList {
    mesh: Mesh | Object3D | Group,
    body: CANNON.Body
}
