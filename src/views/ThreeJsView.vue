<template>
    <div ref="screenContainer" style="width: 100%;height: 100%;">
        <div style="width: inherit;height: inherit;position:relative;overflow: hidden">
            <div ref="renderContainer" class="render-container"></div>
        </div>
        <RoleGUI :roleGoods="InventoryState.inventory"
                 :activeInfo="activeInfo"
                 :roleGoodsIndex="InventoryState.current"
                 :subtitle="subtitle"
                 :detectShow="detectShow">
        </RoleGUI>
        <div class="pause-container" v-show="pauseViewShow">
            <div style="margin: 0 0 30px 30px;">
                <h1 class="option" ref="continueGame">继续</h1>
                <h1 class="option" @click="screenContainer.value.requestFullscreen()">全屏</h1>
                <h1 class="option" @click="StatsClass.changeVisible()">性能监视器</h1>
                <h1 class="option" @click="[displayVideoShow=!displayVideoShow]">预览显示器</h1>
                <h1 class="option" onclick="window.close()">退出</h1>
                <h2 style="text-align: right">
                    WASD移动；E互动；R丢弃；数字键、滚轮切换物品；
                </h2>
            </div>
        </div>
        <video id="three-display-video"
               ref="displayVideo"
               v-show="displayVideoShow"
               controls
               class="video-debug"
               crossorigin="anonymous"
               :src="videoUrl">
            <track :src="subtitleUrl">
        </video>
    </div>
</template>

<script setup lang="ts">

import RoleGUI from "@/components/ThreeJs/RoleGUI.vue"

import {onBeforeUnmount, onMounted, reactive, ref} from "vue";
import {useRoute} from "vue-router";

import * as dat from "dat.gui";
// import * as CANNON from "cannon-es";
import CannonDebugger from "cannon-es-debugger";
import {Octree} from "three/examples/jsm/math/Octree";
import {CSS2DRenderer} from "three/examples/jsm/renderers/CSS2DRenderer";

import {ThreeJsStats} from "@/components/ThreeJs/ts/ThreeJsStats";
import {Controls} from "@/components/ThreeJs/ts/Controls";
import {Camera} from "@/components/ThreeJs/ts/Camera";
import {PhysicalWorld} from "@/components/ThreeJs/ts/PhysicalWorld";
import {RayDetect} from "@/components/ThreeJs/ts/RayDetect";
import {
    AmbientLight,
    Clock,
    EquirectangularReflectionMapping,
    LinearSRGBColorSpace,
    Mesh,
    Object3D,
    PCFSoftShadowMap,
    Scene,
    Vector2,
    Vector3,
    WebGLRenderer
} from "three";
import {WsApi} from "@/components/ThreeJs/ts/WsApi";
import Player from "@/components/ThreeJs/ts/Player";
import {InitScene} from "@/components/ThreeJs/ts/InitScene";

const videoUrl = ref("");
const pauseViewShow = ref(true);
const subtitle = ref("");
const subtitleUrl = ref("");
const activeInfo = ref("");
// const message = ref("");
let roomId = "";
const userId = <string>localStorage.getItem("token");
const detectShow = ref(false);
const displayVideoShow = ref(false);

const InventoryState = reactive<{
    inventory: Object3D[],
    current: number,
    emptyObject3D: Object3D,
}>({
    inventory: new Array<Object3D>(10),
    current: 1,
    emptyObject3D: new Object3D,
});

InventoryState.inventory.fill(InventoryState.emptyObject3D)

const route = useRoute();

//画布容器
const renderContainer = ref();
//显示器DOM
const displayVideo = ref<HTMLVideoElement>();
const continueGame = ref();
const screenContainer = ref();

const scene = new Scene();//图形世界
const physicalWorldClass = new PhysicalWorld();//物理世界
const physicalWorld = physicalWorldClass.create();//物理世界
// const cubeTexture = new CubeTextureLoader()
//     .setPath("/3d/skybox/")
//     .load(["posx.jpg", "negx.jpg", "posy.jpg", "negy.jpg", "posz.jpg", "negz.jpg"]);
// scene.background = cubeTexture;
new RGBELoader().loadAsync("/3d/skybox/skydome_hdri-starlight_sky_fullview.hdr",)
    .then((texture: DataTexture) => {
        texture.mapping = EquirectangularReflectionMapping;
        scene.background = texture;
        // scene.background = new Color(0x000000);
        scene.environment = texture;
    })
// scene.environment = cubeTexture;
//渲染器//antialias抗锯齿
const render = new WebGLRenderer({antialias: true, alpha: true});
render.shadowMap.type = PCFSoftShadowMap;
// render.outputEncoding = LinearEncoding;
render.outputColorSpace = LinearSRGBColorSpace;
render.shadowMap.enabled = true;
const css2DRenderer = new CSS2DRenderer();

//调试UI
const gui = new dat.GUI();
//碰撞线框
CannonDebugger(scene, physicalWorld, {color: 0x077700});
//性能监视器
const StatsClass = new ThreeJsStats();
const stats = StatsClass.create();
//射线检测列表
let worldRayObjects: Object3D[] = [];
let physicalObjects: I_PhysicalList[] = [];
//八叉树
const worldOctree = new Octree();

//摄影机
const cameraClass = new Camera(new Vector3(0, 0, 10));
const camera = cameraClass.camera;
//摄影机(手持物品防止穿模)
const handItemScene = new Scene();
const handItemCamera = cameraClass.itemCamera;
handItemScene.add(handItemCamera);
handItemScene.add(new AmbientLight(0xFFFFFF, 1));
//控制器
const controlsClass = new Controls(camera, document.body);
const controls = controlsClass.create();
physicalWorld.addBody(controlsClass.getPlayerBody());
scene.add(controls.getObject());

// 射线检测
const rayDetect = new RayDetect(new Vector2(0, 0), camera);

const pickUp = usePickUp(controlsClass, cameraClass, rayDetect, worldRayObjects, InventoryState, activeInfo)
const loadModel = new InitScene(scene, worldOctree, physicalWorld, physicalObjects, worldRayObjects);

let wsApi: WsApi;

onMounted(async () => {
    roomId = <string>route.params.room_id;
    wsApi = new WsApi(userId);
    //页面初始化
    await initGraphicalWorld();
    //刷新渲染动画
    renderLoopFun();
    screenContainer.value.append(stats.dom);
    createPlayer();
    playerAction();
});

//图形世界初始化
async function initGraphicalWorld() {
    // 坐标
    // const axesHelper = new AxesHelper();
    // scene.add(axesHelper);

    const send = wsApi.useSendVideoInfo(roomId, videoUrl, <HTMLVideoElement>displayVideo.value);

    loadModel.loadGLTFModel(pickUp);
    //创建遥控器
    loadModel.loadTVControl(<HTMLVideoElement>displayVideo.value, cameraClass, controlsClass, InventoryState, pickUp, send);
    loadModel.loadRoom();
    //创建显示器
    const activeFunc = useDisplayActive(InventoryState, <HTMLVideoElement>displayVideo.value, videoUrl, subtitleUrl, subtitle, send)
    await loadModel.loadDisplay(<HTMLVideoElement>displayVideo.value, activeFunc);
    loadModel.createTerrain();
    loadModel.loadMoon();
    // 添加画布至DOM树
    renderContainer.value.appendChild(render.domElement);
    //初始化摄影机
    cameraClass.resizeCamera(renderContainer.value, render);
    //指针锁
    controlsClass.controlsLock(continueGame.value);
    roleGoodsActive();

    css2DRenderer.setSize(renderContainer.value.clientWidth, renderContainer.value.clientHeight);
    css2DRenderer.domElement.style.position = 'absolute';
    css2DRenderer.domElement.style.top = '0px';
    // 添加画布至DOM树
    renderContainer.value.appendChild(css2DRenderer.domElement);
}

import BindKey from "@/components/ThreeJs/ts/BindKey"
import {I_PhysicalList} from "@/components/ThreeJs/ts/GameInterface";
import {useDisplayActive, usePickUp} from "@/components/ThreeJs/ts/ActiveFunc";
import {RGBELoader} from "three/examples/jsm/loaders/RGBELoader";
import {DataTexture} from "three/src/textures/DataTexture";

function roleGoodsActive() {
    BindKey.keyMouse2(controlsClass, InventoryState);
    BindKey.keyLoopNumber(controlsClass, InventoryState, activeInfo, cameraClass);
    BindKey.keyQ(controlsClass, InventoryState, activeInfo, cameraClass);
    BindKey.keyE(controlsClass, rayDetect, worldRayObjects);
    BindKey.keyNumber(controlsClass, InventoryState, cameraClass);
}

//计时器
const clock = new Clock();
//渲染函数ID
let requestAnimationFrameId = 0;
const playerList: { [key: string]: Player } = {};

const renderLoopFun = () => {
    let delta = clock.getDelta();
    //每一帧调用
    requestAnimationFrameId = requestAnimationFrame(renderLoopFun);
    //刷新物理碰撞线框
    // cannonDebugger.update();
    //刷新物理世界
    physicalWorld.step(1 / 120, delta, 3);
    //更新相机
    camera.updateProjectionMatrix();
    handItemCamera.updateProjectionMatrix();
    // octreeHelper.update();
    //性能监视器
    stats.update();
    //渲染图像世界画面
    render.clear();
    render.render(scene, camera);
    render.autoClear = false;
    render.clearDepth();
    render.render(handItemScene, handItemCamera);
    css2DRenderer.render(handItemScene, handItemCamera);
    //判断指针锁定状态开启菜单
    pauseViewShow.value = !controls.isLocked;
    //刷新控制器和角色
    controlsClass.update(worldOctree, delta);
    //刷新物理引擎
    physicalWorldClass.update(physicalObjects);
    //检测是是否有可互动的Mesh
    rayDetect.firstMesh(worldRayObjects, (intersectObject) => {
        detectShow.value = !!intersectObject;
    });

    // const roleKey = Object.keys(playerList);
    // roleKey.forEach((key) => {
    //   playerList[key]?.mixer?.update(delta);
    //   //对话框位置
    //   if (playerList[key] && playerList[key].message) {
    //     const position = playerList[key].mesh.position.clone();
    //     position.y += 4;
    //     playerList[key]?.message?.setPosition(position);
    //   }
    // });
};

function createPlayer() {
    const modelName = <string>route.params.model_name;
    modelName && wsApi.createPlayer({
        userId,
        playerList,
        scene,
        model: modelName,
        roomId,
        callback: async () => {
            //获取当前场景的信息后生成视频模型
            const videoUuid = <string>localStorage.getItem("/threejs:videoUuid");
            (await loadModel.requestDVDBox(videoUuid))(pickUp);
        }
    })
}

function playerAction() {
    wsApi.playerAction({
        userId,
        playerList,
        control: controlsClass,
        roomId
    })
}

// function updateMessage() {
//   const youObject = roleList[userId];
//   console.log(state.message);
//   if (roleList && youObject.message) {
//     youObject.message.setText(state.message);
//     console.log(youObject.message);
//   }
//   state.message = "";
// }

const windowResizeFun = () => {
    cameraClass.resizeCamera(renderContainer.value, render);
    css2DRenderer.setSize(renderContainer.value.clientWidth, renderContainer.value.clientHeight)
};
window.addEventListener("resize", windowResizeFun);
onBeforeUnmount(() => {
    //销毁
    gui.destroy();
    StatsClass.destroy();
    controlsClass.dispose();
    window.removeEventListener("resize", windowResizeFun);
    wsApi.exitRoom(userId, roomId);
    wsApi.dispose();
    clearScene();
});

//释放资源
function clearScene() {
    scene.traverse((child: Object3D) => {
        if (child.type === "Mesh" && (child) instanceof Mesh) {
            child.material.dispose && child.material.dispose();
            child.geometry && child.geometry.dispose();
        }
    });
    cancelAnimationFrame(requestAnimationFrameId);
    render.forceContextLoss();
    render.dispose();
    scene.clear();
    console.log("销毁")
}

</script>

<style scoped>
.render-container {
    width: inherit;
    height: inherit;
    overflow: hidden;
}

.video-debug {
    position: fixed;
    top: 200px;
    left: 100px;
    width: 300px;
    height: 200px;
}

.pause-container {
    position: fixed;
    width: 100%;
    height: 100%;
    display: flex;
    justify-content: flex-end;
    flex-direction: column;
    bottom: 0;
    left: 0;
    color: white;
    background: rgba(0, 0, 0, 0.4);
}

.foresight-container h1 {
    color: orangered;
}

.option {
    cursor: pointer;
}

.option:hover {
    color: orangered;
}
</style>