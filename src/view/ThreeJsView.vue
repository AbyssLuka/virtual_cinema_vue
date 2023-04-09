<template>
    <div ref="screenContainer" style="width: 100%;height: 100%;">
        <div style="width: inherit;height: inherit;position:relative;overflow: hidden">
            <div ref="renderContainer" class="render-container"></div>
        </div>
        <RoleGUI :roleGoods="state.roleGoods"
                 :activeInfo="state.activeInfo"
                 :roleGoodsIndex="state.roleGoodsIndex"
                 :subtitle="state.subtitle"
                 :detectShow="state.detectShow">
        </RoleGUI>
        <div class="pause-container" v-show="state.pauseViewShow">
            <div style="margin: 0 0 30px 30px;width: 200px">
                <h1 class="continue" ref="continueGame">继续</h1>
                <h1 class="continue" @click="fullScreen">全屏</h1>
                <h1 class="continue" @click="changeStatsVisible()">性能监视器</h1>
                <h1 class="continue" @click="[state.displayVideoShow=!state.displayVideoShow]">预览显示器</h1>
                <h1 class="continue" onclick="window.close()">退出</h1>
            </div>
        </div>
        <video id="three-display-video" ref="displayVideo"
               v-show="state.displayVideoShow"
               controls class="video-debug"
               crossorigin="anonymous"
               :src="state.videoUrl">
            <track :src="state.subtitleUrl">
        </video>
    </div>
</template>

<script setup lang="ts">
    import RoleGUI from "@/components/ThreeJs/RoleGUI.vue"
    import TVControlVue from "@/components/ThreeJs/TVControl/TVControl.vue"

    import {onBeforeUnmount, onMounted, reactive, ref, watch} from "vue";
    import {useRoute} from "vue-router";

    import * as THREE from "three";
    import * as dat from "dat.gui";
    import * as CANNON from "cannon-es";
    import CannonDebugger from "cannon-es-debugger";
    import {Octree} from "three/examples/jsm/math/Octree";
    import {OctreeHelper} from "three/examples/jsm/helpers/OctreeHelper";
    import {CSS2DRenderer} from "three/examples/jsm/renderers/CSS2DRenderer";

    import api from "@/request/api";
    import {I_DetailAndTag, I_File, I_ResData} from "@/global/interface";
    import {fileTypeList} from "@/global/global";

    import {ThreeJsStats} from "@/components/ThreeJs/ts/ThreeJsStats";
    import {DVD_Box} from "@/components/ThreeJs/ts/DVD_Box";
    import {Display} from "@/components/ThreeJs/ts/Display";
    import {Controls} from "@/components/ThreeJs/ts/Controls";
    import {Camera} from "@/components/ThreeJs/ts/Camera";
    import {Room} from "@/components/ThreeJs/ts/Room";
    import {Subtitle} from "@/components/ThreeJs/ts/Subtitle";
    import {PhysicalWorld} from "@/components/ThreeJs/ts/PhysicalWorld";
    import {TVControl} from "@/components/ThreeJs/ts/TVControl";
    import {RayDetect} from "@/components/ThreeJs/ts/RayDetect";
    import {Mesh, Object3D} from "three";

    interface I_VueData {
        videoUrl: string,
        pauseViewShow: boolean,
        subtitle: string,
        subtitleUrl: string | undefined,
        activeInfo: string,
        roleGoods: Array<THREE.Object3D>,
        roleGoodsIndex: number,
        detectShow: boolean,
        emptyObject3D: THREE.Object3D,
        displayVideoShow: boolean,
    }

    const state: I_VueData = reactive({
        videoUrl: "",
        pauseViewShow: true,
        subtitle: "",
        subtitleUrl: "",
        activeInfo: "",
        roleGoods: new Array<THREE.Object3D>(10),
        roleGoodsIndex: 1,
        detectShow: false,
        emptyObject3D: new THREE.Object3D,
        displayVideoShow: false,
    });

    const route = useRoute();

    //画布容器
    const renderContainer = ref();
    //显示器DOM
    const displayVideo = ref<HTMLVideoElement>();
    const continueGame = ref();
    const screenContainer = ref();

    const scene = new THREE.Scene();//图形世界
    const physicalWorldClass = new PhysicalWorld();//物理世界
    const world = physicalWorldClass.create();//物理世界
    const urls = ["posx.jpg", "negx.jpg", "posy.jpg", "negy.jpg", "posz.jpg", "negz.jpg",];
    scene.background = new THREE.CubeTextureLoader().setPath("/3d/skybox/").load(urls);
    //渲染器//antialias抗锯齿
    const render = new THREE.WebGLRenderer({antialias: true});
    render.shadowMap.type = THREE.PCFSoftShadowMap;
    render.shadowMap.enabled = true;
    const css2DRenderer = new CSS2DRenderer();

    //调试UI
    const gui = new dat.GUI();
    //碰撞线框
    const cannonDebugger = CannonDebugger(scene, world, {color: 0x077700});
    //性能监视器
    const StatsClass = new ThreeJsStats();
    const stats = StatsClass.create();
    //射线检测列表
    let worldRayObjects: THREE.Object3D[] | (THREE.PerspectiveCamera | THREE.Mesh)[] = [];

    //八叉树
    const worldOctree = new Octree();
    const octreeHelper = new OctreeHelper(worldOctree, new THREE.Color(0xff0000));
    octreeHelper.visible = true;
    scene.add(octreeHelper);

    //摄影机
    const cameraClass = new Camera(new THREE.Vector3(0, 0, 10));
    const camera = cameraClass.create();

    //摄影机(手持物品防止穿模)
    const roleGoodsScene = new THREE.Scene();
    const roleGoodsCamera = cameraClass.createRoleGoodsCamera();
    roleGoodsScene.add(roleGoodsCamera);
    roleGoodsScene.add(new THREE.AmbientLight(0xFFFFFF, 0.8));
    //控制器
    const controlsClass = new Controls(camera, document.body);
    const controls = controlsClass.create();
    scene.add(controls.getObject());

    // 射线检测
    const rayDetect = new RayDetect(new THREE.Vector2(0, 0), camera);

    onMounted(async () => {
        //页面初始化
        await viewInit();
        //图形世界初始化
        await initGraphicalWorld();
        //刷新渲染动画
        renderLoopFun();
        screenContainer.value.append(stats.dom);
    });

    function changeStatsVisible() {
        StatsClass.changeVisible();
    }

    function fullScreen() {
        screenContainer.value.requestFullscreen();
    }

    let videoFileList: I_File[] = [];

    //页面数据初始化
    async function viewInit() {
        // 初始化物品栏
        for (let i = 0; i < state.roleGoods.length; i++) {
            state.roleGoods[i] = state.emptyObject3D;
        }
        const uuid = route.query.data;
        if (!uuid) return;
        try {
            let resData: I_ResData<I_DetailAndTag> = await api.animePostApi(uuid.toString()) as unknown as I_ResData<I_DetailAndTag>;
            videoFileList = resData.data.detail.fileList.filter(
                (fileListItem: I_File) => fileTypeList.video.includes(fileListItem['fileType'])
            );
        } catch (e) {
            console.error(e);
        }
    }

    //图形世界初始化
    async function initGraphicalWorld() {
        // 坐标
        const axesHelper = new THREE.AxesHelper();
        scene.add(axesHelper);

        //THREE地面
        const plane = new THREE.Mesh(new THREE.PlaneGeometry(50, 50), new THREE.MeshStandardMaterial());
        plane.rotation.x = -0.5 * Math.PI;
        plane.position.y = -5;
        plane.receiveShadow = true;
        scene.add(plane);

        const roomGroup = new Room().create();
        scene.add(roomGroup);

        createTVControl();
        //创建DVD
        await createDVDBox();
        //创建显示器
        await createDisplay();

        const grid = new THREE.GridHelper(100, 20, 0xFF0000, 0xFFFFFF);//网格辅助线
        grid.position.set(0, -5, 0);
        scene.add(grid);
        // 添加画布至DOM树
        renderContainer.value.appendChild(render.domElement);
        //初始化摄影机
        cameraClass.resizeCamera(renderContainer.value, render);
        //指针锁
        controlsClass.controlsLock(continueGame.value);

        worldOctree.fromGraphNode(scene);

        roleGoodsActive();

        css2DRenderer.setSize(renderContainer.value.clientWidth, renderContainer.value.clientHeight);
        css2DRenderer.domElement.style.position = 'absolute';
        css2DRenderer.domElement.style.top = '0px';
        // 添加画布至DOM树
        renderContainer.value.appendChild(css2DRenderer.domElement);

    }

    function roleGoodsActive() {
        controlsClass.addKeydownEventListener("KeyQ", () => {
            // 指针未锁定 结束
            if (!controls.isLocked) return;
            if (state.roleGoods.length > 0) {
                // 丢弃当前物品
                state.roleGoods[state.roleGoodsIndex - 1] = state.emptyObject3D;
                state.activeInfo = "";
                cameraClass.loadRoleCamera(state.roleGoods[state.roleGoodsIndex - 1].clone())
            }
        });

        //模型互动
        controlsClass.addKeydownEventListener("KeyE", () => {
            if (!controls.isLocked) return;
            rayDetect.firstMesh(worldRayObjects, (intersectObject) => {
                // 执行模型自定义行为
                if (intersectObject) intersectObject.userData?.active();
            });
        });

        const code = ["Digit1", "Digit2", "Digit3", "Digit4", "Digit5", "Digit6", "Digit7", "Digit8", "Digit9", "Digit0"];

        controlsClass.addKeydownEventListener(code, (event: KeyboardEvent) => {
            if (!controls.isLocked || event.ctrlKey) return;
            state.roleGoodsIndex = (+event.key + 9) % 10 + 1;
            cameraClass.loadRoleCamera(state.roleGoods[state.roleGoodsIndex - 1].clone())
        });

        // 打开遥控器GUI
        controlsClass.addMousedownEventListener(2, () => {
            if (state.roleGoods[state.roleGoodsIndex - 1].userData.type === "TVC" && controls.isLocked) {
                state.roleGoods[state.roleGoodsIndex - 1].userData?.openGUI();
            }
        });

        // 物品切换
        controlsClass.loopNumber(10, state.roleGoodsIndex, (index) => {
            state.roleGoodsIndex = index;
            state.activeInfo = state.roleGoods[state.roleGoodsIndex - 1]?.name;
            cameraClass.loadRoleCamera(state.roleGoods[state.roleGoodsIndex - 1].clone())
        });
    }

    //拾取物品
    function pickUp() {
        if (!controls.isLocked) return;
        rayDetect.firstMesh(worldRayObjects, (intersectObject) => {
            if (!intersectObject) return;
            // 查询物品栏有没有相同的物品 防止重复获取
            const index = state.roleGoods.indexOf(intersectObject);
            // 查询物品栏第一个空位的位置
            const insertIndex = state.roleGoods.indexOf(state.emptyObject3D);
            if (index !== -1) {
                state.roleGoodsIndex = index + 1;
            } else if (insertIndex !== -1) {
                // 拾取物品插入空位
                state.roleGoods[insertIndex] = intersectObject;
                state.roleGoodsIndex = insertIndex + 1;
            }
            state.activeInfo = intersectObject.name;
            cameraClass.loadRoleCamera(state.roleGoods[state.roleGoodsIndex - 1].clone())
        });
    }

    //创建DVD盒子
    function createDVDBox() {
        let timeout = -1000;
        for (let i = 0; i < videoFileList.length; i++) {
            setTimeout(async () => {
                let videoUuid: string = videoFileList[i].fileUuid;
                const dvdBox = await new DVD_Box(videoUuid).create({
                    position: new CANNON.Vec3(0, 10, 0),
                    type: "DVD",
                    active: pickUp
                });
                world.addBody(dvdBox.body);
                scene.add(dvdBox.mesh);
                physicalObjects.push(dvdBox);
                worldRayObjects.push(dvdBox.mesh);
            }, timeout += 1000);
        }
    }

    //创建显示器
    async function createDisplay() {
        const displayBox = await new Display(displayVideo.value as HTMLVideoElement).create({
            position: new THREE.Vector3(0, 4, -24),
            name: "显示器",
            active: async () => {
                const selected = state.roleGoods[state.roleGoodsIndex - 1];
                if (selected && selected.userData.type === "DVD") {
                    //更换视频URL播放视频
                    state.videoUrl = api.videoUrl(selected.userData.videoUuid);
                    //创建字幕处理类
                    const subtitleClass = new Subtitle(displayVideo.value as HTMLVideoElement, selected.userData.videoUuid);
                    //初始化（分析Ass字幕）
                    await subtitleClass.init();
                    //获取根据Video播放进度获取字幕
                    subtitleClass.subtitleLine((subtitleLine) => {
                        state.subtitle = subtitleLine;
                    });
                    //VTT字幕URL
                    state.subtitleUrl = subtitleClass.getVttSubtitleUrl();
                } else {
                    console.log("无效物品")
                }
            }
        });
        scene.add(displayBox);
        worldRayObjects.push(displayBox);
    }

    //创建显示器的遥控器
    function createTVControl() {
        const tvControlClass = new TVControl(TVControlVue, displayVideo.value as HTMLVideoElement);
        roleGoodsCamera.add(tvControlClass.getCSS2D());

        const mesh = tvControlClass.create({
            position: new THREE.Vector3(),
            name: "TVControl",
            type: "TVC",
            active: pickUp,
            openGUI: (show: boolean) => {
                watch(() => state.roleGoodsIndex, () => {
                    tvControlClass.visible(false);
                });
                tvControlClass.visible(show ? show : !tvControlClass.isVisible());
            }
        });

        scene.add(mesh);
        worldRayObjects.push(mesh)
    }

    let physicalObjects: { mesh: THREE.Mesh, body: CANNON.Body }[] = [];

    //计时器
    const clock = new THREE.Clock();
    //渲染函数ID
    let requestAnimationFrameId = 0;

    const renderLoopFun = () => {
        let delta = clock.getDelta();
        //每一帧调用
        requestAnimationFrameId = requestAnimationFrame(renderLoopFun);
        //刷新物理碰撞线框
        cannonDebugger.update();
        //刷新物理世界
        world.step(1 / 144, delta, 3);
        //更新相机
        camera.updateProjectionMatrix();
        roleGoodsCamera.updateProjectionMatrix();
        octreeHelper.update();
        //性能监视器
        stats.update();
        //渲染图像世界画面
        render.render(scene, camera);
        render.autoClear = false;
        render.render(roleGoodsScene, roleGoodsCamera);
        css2DRenderer.render(roleGoodsScene, roleGoodsCamera);
        //判断指针锁定状态开启菜单
        state.pauseViewShow = !controls.isLocked;
        //刷新控制器和角色
        controlsClass.update(worldOctree, delta);
        //刷新物理引擎
        physicalWorldClass.update(physicalObjects);
        //检测是是否有可互动的Mesh
        rayDetect.firstMesh(worldRayObjects, (intersectObject) => {
            state.detectShow = Boolean(intersectObject);
        });
    };

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
        clearScene();
    });

    //释放资源
    function clearScene() {
        scene.traverse((child: Object3D) => {
            if (child.type === "Mesh" && child instanceof Mesh) {
                child.material.dispose && child.material.dispose();
                child.geometry && child.geometry.dispose();
            }
        });
        cancelAnimationFrame(requestAnimationFrameId);
        render.forceContextLoss();
        render.dispose();
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
    }

    .pause-container {
        background: rgba(0, 0, 0, 0.7);
    }

    .foresight-container h1 {
        color: orangered;
    }

    .continue {
        cursor: pointer;
    }

    .continue:hover {
        color: orangered;
    }
</style>