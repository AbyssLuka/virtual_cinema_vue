<template>
    <div class="game-main-container">
        <canvas id="c" style="width: 100%;height: 100%;"></canvas>
        <div class="gui-container">
            <h1>选择你的模型</h1>
            <div style="display: flex;align-items: center;">
                <div class="luka-button" @click="developing">搜索模型</div>
                <label>
                    <input type="text" class="luka-input" placeholder="模型名称"/>
                </label>
            </div>
            <div style="position:relative;">
                <div id="content">
                    <ModelViewItem
                        :sceneCallback="callback"
                        :modelList="modelList"
                        :choosePlayer="choosePlayer"
                        :openDetail="openDetail"
                        :manipulate="manipulate"
                        :titleClick="(fileName:string)=>{choosePlayer = fileName}">
                    </ModelViewItem>
                </div>
                <h2 style="color: white;margin: 0 0 10px 20px">模型来源：车万女仆</h2>
            </div>
            <div style="display: flex;align-items: center;">
                <div class="luka-button" @click="openCreateRoom()">创建场景</div>
                <div class="luka-button" @click="selectRoomList_()">获取场景</div>
                <div class="luka-button" @click="selectRoomList_(searchRoomText)">搜索场景</div>
                <label>
                    <input type="text" class="luka-input" placeholder="场景名称" v-model="searchRoomText"/>
                </label>
            </div>
            <table class="room-table">
                <thead>
                <tr>
                    <td>名称</td>
                    <td>人数</td>
                    <td>时间</td>
                    <td>操作</td>
                </tr>
                </thead>
                <tbody>
                <tr v-show="createRoomVisible">
                    <td>
                        <label>
                            <input type="text" v-model="newRoomName" id="room-name-input" placeholder="ROOM_NAME"/>
                        </label>
                    </td>
                    <td>---</td>
                    <td>{{ new Date() }}</td>
                    <td>
                        <div class="luka-button"
                             @click="[createRoom(newRoomName),createRoomVisible = false]">
                            创建
                        </div>
                    </td>
                </tr>
                <tr v-for="(room,index) in roomList" :key="index">
                    <td>{{ room.name.trim() === '' ? 'UNKNOWN' : room.name }}</td>
                    <td>{{ room.amount }}</td>
                    <td>{{ new Date() }}</td>
                    <td style="display: flex;">
                        <router-link
                            style="flex-shrink: 0"
                            :to="`/threejs/${room.id}/${choosePlayer}`"
                            class="luka-button">
                            加入
                        </router-link>
                        <div style="flex-shrink: 0"
                             @click="removeRoom(room.id)"
                             class="luka-button">
                            删除
                        </div>
                    </td>
                </tr>
                </tbody>
            </table>
        </div>
    </div>
</template>

<script setup lang="ts">
import ModelViewItem from "@/components/ThreeJs/ModelViewItem.vue"
import api from "@/request/api";
import {onMounted, onBeforeUnmount, ref} from "vue";
import {Mesh, Object3D, PerspectiveCamera, Scene, WebGLRenderer} from "three";
import {OrbitControls} from "three/examples/jsm/controls/OrbitControls";
import {WsApi} from "@/components/ThreeJs/ts/WsApi";
import {I_RoomInfo} from "@/components/ThreeJs/ts/GameInterface";
import {I_ModelEntity} from "@/components/ThreeJs/ts/GameInterface"
import {useRoute, useRouter} from "vue-router";

const wsApi = new WsApi(<string>localStorage.getItem("token"));

const scenes: Scene[] = [];
let modelList: I_ModelEntity[] = [];
let roomList = ref<I_RoomInfo[]>( []);
const choosePlayer = ref("--");
const video_id = ref("");
const searchRoomText = ref("");
const newRoomName = ref("");
const createRoomVisible = ref(false);
// const deleteRoom = ref(false);

let renderer: WebGLRenderer, canvas: HTMLCanvasElement;

const callback = (scene: Scene) => {
    scenes.push(scene);
}

const developing = () => {
    alert("未完成");
}

const route = useRoute();
onMounted(() => {
    video_id.value = <string>route.query.data;
    canvas = document.getElementById('c') as HTMLCanvasElement;
    renderer = new WebGLRenderer({canvas: canvas});
    renderer.setPixelRatio(window.devicePixelRatio);
    api.modelListApi((data) => {
        data && (modelList = data.data);
        choosePlayer.value = modelList[0].fileName;
    });
    selectRoomList_();
    animate();
});

//回收资源
onBeforeUnmount(() => {
    scenes.forEach(scene => {
        scene.traverse((child: Object3D) => {
            if ((child) instanceof Mesh) {
                child.material.dispose && child.material.dispose();
                child.geometry.dispose && child.geometry.dispose();
            }
            child.clear();
        });
        scene.clear();
        const camera = scene.userData.camera as PerspectiveCamera;
        const controls = scene.userData.controls as OrbitControls;
        camera && camera.clear();
        controls && controls.dispose();
        camera.clear();
        scene.clear();
    });
    cancelAnimationFrame(requestAnimationFrameId);
    renderer.forceContextLoss();
    renderer.dispose();
});
const router = useRouter()

const openDetail = (index: number) => {
    router.push({
        name: "ModelDetail",
        query: {
            fileName: modelList[index].fileName,
            uuid: modelList[index].uuid,
        }
    });
}

const updateSize = () => {
    const width = canvas.clientWidth;
    const height = canvas.clientHeight;
    if (canvas.width !== width || canvas.height !== height) {
        renderer.setSize(width, height, false);
    }
}

const animate = () => {
    updateSize();
    renderer.setClearColor(0xEEEEEE, 0.1);
    renderer.setScissorTest(false);
    renderer.clear();
    renderer.setClearColor(0xe0e0e0, 0.2);
    renderer.setScissorTest(true);
    scenes.forEach((scene) => {
        const element = scene.userData.element;
        const framesRect = element.getBoundingClientRect();
        const renderRect = renderer.domElement.getBoundingClientRect();
        if (framesRect.bottom < 0 || framesRect.top > renderRect.height ||
            framesRect.right < 0 || framesRect.left > renderRect.width) {
            return;
        }
        const width = framesRect.right - framesRect.left;
        const height = framesRect.bottom - framesRect.top;
        const left = framesRect.left;
        const bottom = (renderRect.height - framesRect.bottom) + renderRect.top;
        renderer.setViewport(left, bottom, width, height);
        renderer.setScissor(left, bottom, width, height);
        const camera = scene.userData.camera;
        camera.aspect = width / height;
        camera.updateProjectionMatrix();
        scene.userData.controls.update();
        renderer.render(scene, camera);
    });
    requestAnimationFrameId = requestAnimationFrame(animate);
}

let requestAnimationFrameId = -1;

const selectRoomList_ = (name = "") => {
    wsApi.selectRoomList(name, (roomList_) => {
        roomList.value = roomList_;
    });
}

const createRoom = (name: string) => {
    if (!route.query.data) {
        alert("需要在主页选择一个视频");
        return;
    }
    const newRoomInputEl = document.getElementById("room-name-input");
    if (name.trim() === "") {
        newRoomInputEl && newRoomInputEl.setAttribute("placeholder", "请输入名称");
        return;
    }
    wsApi.createRoom(name, video_id.value).then(() => {
        selectRoomList_();
    });
    newRoomInputEl && newRoomInputEl.setAttribute("placeholder", "ROOM_NAME");
}

const removeRoom = (roomId: string) => {
    wsApi.removeRoom(roomId);
    selectRoomList_();
}

const openCreateRoom = () => {
    if (!route.query.data) {
        alert("需要在主页选择一个视频");
        return;
    }
    createRoomVisible.value = !createRoomVisible.value
}

const manipulate: {
    icon: string,
    title: string,
    func: (index: number) => void,
}[] = [{
    icon: "ri-fullscreen-line",
    title: "预览",
    func: openDetail
}];

</script>

<style scoped>

.luka-button {
    border: 0;
    background: rgba(255, 255, 255, 0.1);
    backdrop-filter: blur(5px);
    margin: 0 20px;
}

.luka-button:hover {
    background: rgba(255, 255, 255, 0.5);
}

.room-table {
    width: calc(100% - 40px);
    height: auto;
    border-collapse: collapse;
    border-spacing: 0;
    user-select: none;
    margin: 10px 20px;
    box-shadow: 1px 2px 4px 0 rgba(0, 0, 0, 0.25);
    background: rgba(255, 255, 255, 0.1);
    backdrop-filter: blur(5px);
}

.room-table tbody tr td,
.room-table tr td {
    border: 2px solid transparent;
    text-align: center;
    height: 50px;
    width: 100px;
}

.room-table tbody tr td:nth-child(2) {
    color: #8c8eff;
}

.room-table tbody tr td:nth-child(2):hover,
.room-table tbody tr td:nth-child(4):hover {
    color: #ff7363;
}

.room-table tbody tr:hover {
    background: rgba(212, 218, 246, .4);
}

.room-table tbody tr td:hover {
    background: rgba(212, 218, 246, .4);
}

.room-table tbody tr td:nth-child(4) {
    color: #8c8eff;
}

.room-table tbody tr td:nth-child(9) {
    color: #ff7363;
}

.room-table tbody tr td input::placeholder {
    color: white;
}

.room-table tbody tr td input {
    width: 100%;
    height: 100%;
    display: flex;
    justify-content: center;
    align-items: center;
    font-size: 18px;
    outline: none;
    padding: 0 0 0 10px;
    border: transparent;
    border-bottom: white solid 3px;
    background: transparent;
}


#c {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
}

#content {
    width: 100%;
    height: 320px;
    overflow-y: scroll;
    display: flex;
    position: relative;
}

#content::-webkit-scrollbar {
    display: none;
}

.game-main-container {
    width: 100%;
    height: 100%;
    position: relative;
    color: white;
}

.gui-container {
    width: 100%;
    height: 100%;
    position: absolute;
    top: 0;
    left: 0;
}
</style>