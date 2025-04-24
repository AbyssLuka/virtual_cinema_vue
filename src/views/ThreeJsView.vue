<template>
    <div ref="screenContainer" style="width: 100%;height: 100%;">
        <div style="width: inherit;height: inherit;position:relative;overflow: hidden">
            <div ref="renderContainer" class="render-container"></div>
        </div>
        <RoleGUI :roleGoods="inventoryState.inventory"
                 :activeInfo="activeInfo"
                 :roleGoodsIndex="inventoryState.current"
                 :subtitle="subtitle"
                 :detectShow="detectShow">
        </RoleGUI>
        <div class="pause-container" v-show="pauseViewShow">
            <div style="margin: 0 0 30px 30px;">
                <h1 class="option" ref="continueGame">继续</h1>
                <h1 class="option" @click="screenContainer!.requestFullscreen()">全屏</h1>
                <h1 class="option" @click="StatsClass.changeVisible()">性能监视器</h1>
                <h1 class="option" @click="[displayVideoShow=!displayVideoShow]">预览显示器</h1>
                <h1 class="option" onclick="window.close()">退出</h1>
                <h2 style="text-align: right">
                    WASD移动；E互动；R丢弃；Shift加速；数字键、滚轮切换物品；
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

import {onBeforeUnmount, onMounted, ref, useTemplateRef} from "vue";
import {useRoute} from "vue-router";

// import * as CANNON from "cannon-es";
import CannonDebugger from "cannon-es-debugger";
import {Octree} from "three/examples/jsm/math/Octree";
import {CSS2DRenderer} from "three/examples/jsm/renderers/CSS2DRenderer";
import {RGBELoader} from "three/examples/jsm/loaders/RGBELoader";
import {
    Clock,
    EquirectangularReflectionMapping,
    LinearSRGBColorSpace,
    Mesh,
    Object3D,
    PCFSoftShadowMap,
    Scene,
    Vector2,
    WebGLRenderer,
    WebGLRenderTarget
} from "three";

import {WsApi} from "@/components/ThreeJs/ts/WsApi";
import {InitScene} from "@/components/ThreeJs/ts/InitScene";
import {
    inventoryState,
    worldRayObjects,
    physicalObjects,
    controlsClass,
    cameraClass,
    handItemCamera,
    handItemScene
} from "@/components/ThreeJs/ts/Global";
import BindKey from "@/components/ThreeJs/ts/BindKey"
import {useDisplayActive, usePickUp} from "@/components/ThreeJs/ts/ActiveFunc";
import {ThreeJsStats} from "@/components/ThreeJs/ts/ThreeJsStats";
import {PhysicalWorld} from "@/components/ThreeJs/ts/PhysicalWorld";
import {RayDetect} from "@/components/ThreeJs/ts/RayDetect";
import {RenderPass} from "three/examples/jsm/postprocessing/RenderPass";
import {EffectComposer} from "three/examples/jsm/postprocessing/EffectComposer";
import {OutlinePass} from "three/examples/jsm/postprocessing/OutlinePass";

const videoUrl = ref("");
const pauseViewShow = ref(true);
const subtitle = ref("");
const subtitleUrl = ref("");
const activeInfo = ref("");

let roomId = "";
const userId = <string>localStorage.getItem("token");
const detectShow = ref(false);
const displayVideoShow = ref(false);

const route = useRoute();

//画布容器
const renderContainer = useTemplateRef<HTMLVideoElement>("renderContainer")!;
//显示器DOM
const displayVideo = useTemplateRef<HTMLVideoElement>("displayVideo")!;
const continueGame = useTemplateRef<HTMLVideoElement>("continueGame")!;
const screenContainer = useTemplateRef<HTMLVideoElement>("screenContainer")!;

const scene = new Scene();//图形世界
const physicalWorldClass = new PhysicalWorld();//物理世界
const physicalWorld = physicalWorldClass.create();//物理世界
// const cubeTexture = new CubeTextureLoader()
//     .setPath("/3d/skybox/")
//     .load(["posx.jpg", "negx.jpg", "posy.jpg", "negy.jpg", "posz.jpg", "negz.jpg"]);
// scene.background = cubeTexture;
new RGBELoader().loadAsync("/3d/skybox/skydome_hdri-starlight_sky_fullview.hdr",)
    .then((texture) => {
        texture.mapping = EquirectangularReflectionMapping;
        scene.background = texture;
        // scene.background = new Color(0x000000);
        scene.environment = texture;
    })
// scene.environment = cubeTexture;
//渲染器//antialias抗锯齿
const renderer = new WebGLRenderer({antialias: true, alpha: true});
renderer.shadowMap.type = PCFSoftShadowMap;
// render.outputEncoding = LinearEncoding;
renderer.outputColorSpace = LinearSRGBColorSpace;
renderer.shadowMap.enabled = true;
const css2DRenderer = new CSS2DRenderer();

//碰撞线框
CannonDebugger(scene, physicalWorld, {color: 0x077700});
//性能监视器
const StatsClass = new ThreeJsStats();
const stats = StatsClass.create();

//八叉树
const worldOctree = new Octree();

const controls = controlsClass.create();
physicalWorld.addBody(controlsClass.getPlayerBody());
scene.add(cameraClass.camera);
renderer.sortObjects = true;
// 射线检测
const rayDetect = new RayDetect(new Vector2(0, 0), cameraClass.camera);

const pickUp = usePickUp(rayDetect, activeInfo)
const loadModel = new InitScene(scene, worldOctree, physicalWorld);

let wsApi: WsApi;

onMounted(async () => {
    roomId = <string>route.params.room_id;
    wsApi = new WsApi(userId);
    //页面初始化
    await initGraphicalWorld();
    //刷新渲染动画
    screenContainer.value!.append(stats.dom);
    createPlayer();
    playerAction();
    initComposer();
    renderer.setAnimationLoop(renderLoopFunc)
});

let composer: EffectComposer;
let outlinePass: OutlinePass;

const initComposer = () => {
    // postprocessing
    composer = new EffectComposer(renderer,
        new WebGLRenderTarget(
            renderContainer.value!.clientWidth,
            renderContainer.value!.clientHeight
        )
    );

    const renderPass = new RenderPass(scene, cameraClass.camera);
    composer.addPass(renderPass);

    outlinePass = new OutlinePass(
        new Vector2(
            renderContainer.value!.clientWidth,
            renderContainer.value!.clientHeight
        ),
        scene,
        cameraClass.camera
    );
    outlinePass.edgeStrength = 3;
    outlinePass.edgeGlow = 1;
    composer.addPass(outlinePass);

    // const outputPass = new OutputPass();
    // composer.addPass(outputPass);
    //
    // const effectFXAA = new ShaderPass(FXAAShader);
    // effectFXAA.uniforms['resolution'].value.set(1 / renderContainer.value.clientWidth, 1 / renderContainer.value.clientHeight);
    // composer.addPass(effectFXAA);
}

//图形世界初始化
const initGraphicalWorld = async () => {
    // 坐标
    // const axesHelper = new AxesHelper();
    // scene.add(axesHelper);

    const send = wsApi.useSendVideoInfo(roomId, videoUrl, displayVideo.value!);

    loadModel.loadGLTFModel(pickUp);
    //创建遥控器
    loadModel.loadTVControl(displayVideo.value!, pickUp, send);
    loadModel.loadRoom();
    //创建显示器
    const activeFunc = useDisplayActive(displayVideo.value!, videoUrl, subtitleUrl, subtitle, send)
    await loadModel.loadDisplay(displayVideo.value!, activeFunc);
    loadModel.createTerrain();
    loadModel.loadMoon();
    // 添加画布至DOM树
    renderContainer.value!.appendChild(renderer.domElement);
    //初始化摄影机
    cameraClass.resizeCamera(renderContainer.value!, renderer);
    //指针锁
    controlsClass.controlsLock(continueGame.value!);
    roleGoodsActive();

    css2DRenderer.setSize(renderContainer.value!.clientWidth, renderContainer.value!.clientHeight);
    css2DRenderer.domElement.style.position = 'absolute';
    css2DRenderer.domElement.style.top = '0px';
    // 添加画布至DOM树
    renderContainer.value!.appendChild(css2DRenderer.domElement);
}

const roleGoodsActive = () => {
    BindKey.keyMouse2();
    BindKey.keyLoopNumber(activeInfo);
    BindKey.keyQ(activeInfo);
    BindKey.keyE(rayDetect);
    BindKey.keyNumber();
}

//计时器
const clock = new Clock();
let lastTime = 0;
//渲染函数ID
// let requestAnimationFrameId = 0;
const renderLoopFunc = () => {
    let delta = clock.getDelta();
    lastTime += delta;
    //每一帧调用
    // requestAnimationFrameId = requestAnimationFrame(renderLoopFunc);
    //刷新物理碰撞线框
    // cannonDebugger.update();
    //刷新物理世界
    physicalWorld.step(1 / 60, delta, 3);
    //更新相机
    cameraClass.camera.updateProjectionMatrix();
    handItemCamera.updateProjectionMatrix();
    // octreeHelper.update();
    //性能监视器
    stats.update();
    //渲染图像世界画面
    renderer.clear();
    renderer.render(scene, cameraClass.camera);
    outlinePass && composer.render();
    renderer.autoClear = false;
    renderer.clearDepth();
    renderer.render(handItemScene, handItemCamera);
    css2DRenderer.render(handItemScene, handItemCamera);
    renderer.clearDepth();

    //判断指针锁定状态开启菜单
    pauseViewShow.value = !controls.isLocked;
    //刷新控制器和角色
    controlsClass.update(worldOctree, delta);
    //刷新物理引擎
    physicalWorldClass.update(physicalObjects);
    //检测是是否有可互动的Mesh
    if (lastTime >= .2) {
        lastTime = 0;
        rayDetect.firstMesh(worldRayObjects, (intersectObject) => {
            detectShow.value = !!intersectObject;
            if (intersectObject != null) {
                if (!outlinePass || outlinePass.selectedObjects[0] === intersectObject) return;
                outlinePass.selectedObjects = [intersectObject];
            } else {
                outlinePass && (outlinePass.selectedObjects = []);
            }
        });
    }
};

const createPlayer = () => {
    const modelName = <string>route.params.model_name;
    modelName && wsApi.createPlayer({
        userId,
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

const playerAction = () => {
    wsApi.playerAction({userId, roomId})
}

const windowResizeFun = () => {
    cameraClass.resizeCamera(renderContainer.value!, renderer);
    css2DRenderer.setSize(renderContainer.value!.clientWidth, renderContainer.value!.clientHeight)
};
window.addEventListener("resize", windowResizeFun);
onBeforeUnmount(() => {
    //销毁
    StatsClass.destroy();
    controlsClass.dispose();
    window.removeEventListener("resize", windowResizeFun);
    wsApi.exitRoom(userId, roomId);
    wsApi.dispose();
    clearScene();
});

//释放资源
const clearScene = () => {
    scene.traverse((child: Object3D) => {
        if (child.type === "Mesh" && (child) instanceof Mesh) {
            child.material.dispose && child.material.dispose();
            child.geometry && child.geometry.dispose();
        }
    });
    renderer.forceContextLoss();
    renderer.dispose();
    scene.clear();
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