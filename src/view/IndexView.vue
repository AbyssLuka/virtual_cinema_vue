<template>
    <div class="index">
        <div class="index-router-view">
            <div class="router-view-container">
                <router-view></router-view>
            </div>
            <header-menu class="header-menu"></header-menu>
        </div>
        <div class="background-3d" ref="renderContainer"></div>
    </div>
    <!--        <cursor-osu></cursor-osu>-->
</template>

<script setup lang="ts">
    // import FloatingWindow from "@/components/module/FloatingWindow";
    import HeaderMenu from "@/components/module/HeaderMenu.vue";
    // import CursorOsu from "@/components/module/Cursor.vue";
    import {ref, onMounted, watch, onBeforeUnmount} from "vue";
    import {useRoute} from "vue-router";
    import {CompositionShader} from "@/components/IndexView/ts/shaders/CompositionShader";
    // import {MapControls} from "three/examples/jsm/controls/OrbitControls";
    import {EffectComposer} from "three/examples/jsm/postprocessing/EffectComposer";
    import {RenderPass} from "three/examples/jsm/postprocessing/RenderPass";
    import {UnrealBloomPass} from "three/examples/jsm/postprocessing/UnrealBloomPass";
    import {ShaderPass} from "three/examples/jsm/postprocessing/ShaderPass";
    import {Star} from "@/components/IndexView/ts/Star";
    import {
        PerspectiveCamera,
        Scene,
        sRGBEncoding,
        WebGLRenderer,
        Vector2,
        ShaderMaterial,
        Vector3,
        Clock, Object3D, Sprite
    } from "three";
    import {BLOOM_PARAMS, BLOOM_LAYER, OVERLAY_LAYER, BASE_LAYER} from "@/components/IndexView/ts/config/RenderConfig";
    import {
        ARM_X_DIST,
        ARM_X_MEAN,
        ARM_Y_DIST,
        ARM_Y_MEAN,
        ARMS,
        CODE_X_DEST,
        CODE_Y_DEST,
        CODE_Z_DEST,
        NUM_STARS,
        OUTER_CODE_X_DIST,
        OUTER_CODE_Y_DIST
    } from "@/components/IndexView/ts/config/GalaxyConfig";
    import {positionRandom, spiral} from "@/components/IndexView/ts/util/util";
    import {Haze} from "@/components/IndexView/ts/Haze";

    //画布容器
    let renderContainer = ref();
    //透视相机
    const camera: PerspectiveCamera = new PerspectiveCamera(60, 1, 0.1, 10000);
    camera.position.set(10, 400, 160);
    camera.up.set(0, 0, 1);
    camera.lookAt(0, 0, 0);
    //场景
    const scene: Scene = new Scene();
    // 控制器
    // const orbit: MapControls = new MapControls(camera, document.body);
    // orbit.enableDamping = true;
    // orbit.dampingFactor = 0.05;
    // orbit.screenSpacePanning = false;
    // orbit.minDistance = 1;
    // orbit.maxDistance = 16384;
    // orbit.maxPolarAngle = (Math.PI / 2) - (Math.PI / 360);
    //渲染器
    const renderer: WebGLRenderer = new WebGLRenderer({
        antialias: true,
        logarithmicDepthBuffer: true,
    });
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.outputEncoding = sRGBEncoding;
    renderer.toneMappingExposure = 0.5;
    const renderScene: RenderPass = new RenderPass(scene, camera);
    const bloomPass: UnrealBloomPass = new UnrealBloomPass(new Vector2(window.innerHeight, window.innerHeight), 1.5, 0.4, 0.85);
    bloomPass.threshold = BLOOM_PARAMS.bloomThreshold;
    bloomPass.strength = BLOOM_PARAMS.bloomStrength;
    bloomPass.radius = BLOOM_PARAMS.bloomRadius;
    const bloomComposer: EffectComposer = new EffectComposer(renderer);
    bloomComposer.renderToScreen = false;
    bloomComposer.addPass(renderScene);
    bloomComposer.addPass(bloomPass);

    const overlayComposer: EffectComposer = new EffectComposer(renderer);
    overlayComposer.renderToScreen = false;
    overlayComposer.addPass(renderScene);

    //着色器
    const finalPass = new ShaderPass(
        new ShaderMaterial({
            uniforms: {
                baseTexture: {value: null},
                bloomTexture: {value: bloomComposer.renderTarget2.texture},
                overlayTexture: {value: overlayComposer.renderTarget2.texture}
            },
            vertexShader: CompositionShader.vertex,
            fragmentShader: CompositionShader.fragment,
            defines: {}
        }), 'baseTexture'
    );
    finalPass.needsSwap = true;
    const baseComposer: EffectComposer = new EffectComposer(renderer);
    baseComposer.addPass(renderScene);
    baseComposer.addPass(finalPass);

    function init() {
        renderContainer.value.appendChild(renderer.domElement);
        windowResizeFun();
    }

    const windowResizeFun = () => {
        if (renderContainer.value != null) {
            // 更新渲染器比例
            renderer.setSize(renderContainer.value.clientWidth, renderContainer.value.clientHeight);
            //更新渲染器和设备的像素比
            renderer.setPixelRatio(renderContainer.value.devicePixelRatio);
            //更新宽高比
            camera.aspect = renderContainer.value.clientWidth / renderContainer.value.clientHeight;
        }
    };

    window.addEventListener("resize", windowResizeFun);

    // 星体集合
    let stars: Star[] = [];

    // 生成星体
    function generateStar() {
        // 核心
        for (let i = 0; i < NUM_STARS / 4; i++) {
            let position = new Vector3(
                positionRandom(0, CODE_X_DEST),
                positionRandom(0, CODE_Y_DEST),
                positionRandom(0, CODE_Z_DEST)
            );
            const star = new Star(position);
            scene.add(star.getObject());
            stars.push(star);
        }
        //外围
        for (let i = 0; i < NUM_STARS / 2; i++) {
            let pos = new Vector3(
                positionRandom(0, OUTER_CODE_X_DIST),
                positionRandom(0, OUTER_CODE_Y_DIST),
                positionRandom(0, CODE_Z_DEST)
            );
            const star = new Star(pos);
            scene.add(star.getObject());
            stars.push(star);
        }
        //旋臂
        for (let i = 0; i < NUM_STARS * ARMS; i++) {
            let position = spiral(
                positionRandom(ARM_X_MEAN, ARM_X_DIST),
                positionRandom(ARM_Y_MEAN, ARM_Y_DIST),
                positionRandom(0, CODE_Z_DEST),
                i * 2 * Math.PI / ARMS
            );
            const star = new Star(position);
            scene.add(star.getObject());
            stars.push(star);
        }

    }

    //雾气集合
    let hazes: Haze[] = [];

    //生成雾气
    function generateHaze() {
        // 核心
        for (let i = 0; i < NUM_STARS / 4; i++) {
            let pos = new Vector3(
                positionRandom(0, CODE_X_DEST),
                positionRandom(0, CODE_Y_DEST),
                positionRandom(0, CODE_Z_DEST)
            );
            const haze = new Haze(pos);
            scene.add(haze.getObject());
            hazes.push(haze);
        }
        //外围
        for (let i = 0; i < NUM_STARS / 2; i++) {
            let pos = new Vector3(
                positionRandom(0, OUTER_CODE_X_DIST),
                positionRandom(0, OUTER_CODE_Y_DIST),
                positionRandom(0, CODE_Z_DEST)
            );
            const haze = new Haze(pos);
            scene.add(haze.getObject());
            hazes.push(haze);
        }
        //旋臂
        for (let i = 0; i < NUM_STARS * ARMS / 2; i++) {
            let position = spiral(
                positionRandom(ARM_X_MEAN, ARM_X_DIST),
                positionRandom(ARM_Y_MEAN, ARM_Y_DIST),
                positionRandom(0, CODE_Z_DEST),
                i * 2 * Math.PI / ARMS
            );
            const haze = new Haze(position);
            scene.add(haze.getObject());
            hazes.push(haze);
        }
    }

    //时钟
    let clock = new Clock();
    const route = useRoute();
    let requestAnimationFrameId: number | null = null;
    //不进行渲染的页面路由名称集合
    const routeName = ["ThreeJs"];

    //监听路由，恢复渲染
    watch(() => route.path, () => {
        //判断当前路由
        if (routeName.includes(route.name as string)) {
            //如果id存在则执行cancelAnimationFrame销毁
            requestAnimationFrameId && cancelAnimationFrame(requestAnimationFrameId);
            requestAnimationFrameId = null;
        } else {
            //如果id存在则不再执行requestAnimationFrame
            requestAnimationFrameId || (requestAnimationFrameId = requestAnimationFrame(render));
        }
    }, {immediate: true});

    //渲染函数 每一帧执行
    function render() {
        // 上一帧与当前帧的时间差
        let time = clock.getDelta();
        // 银河旋转
        scene.rotation.z += time * -.02;
        // orbit.update();
        camera.updateProjectionMatrix();
        renderer.render(scene, camera);

        camera.layers.set(BLOOM_LAYER);
        bloomComposer.render();

        camera.layers.set(OVERLAY_LAYER);
        overlayComposer.render();

        camera.layers.set(BASE_LAYER);
        baseComposer.render();

        requestAnimationFrameId = requestAnimationFrame(render);

        // stars.forEach((star) => {
        //     star.updateScale(camera);
        // });
        // hazes.forEach((haze) => {
        //     haze.updateScale(camera);
        // });
    }

    onBeforeUnmount(() => {
        //销毁
        window.removeEventListener("resize", windowResizeFun);
        clearScene();
    });

    //释放资源
    function clearScene() {
        scene.traverse((child: Object3D) => {
            if (child.type === "Sprite" && child instanceof Sprite) {
                child.material && child.material.dispose();
                child.geometry && child.geometry.dispose();
            }
        });
        requestAnimationFrameId && cancelAnimationFrame(requestAnimationFrameId);
        renderer.forceContextLoss();
        renderer.dispose();
        scene.clear();
        baseComposer.dispose();
        overlayComposer.dispose();
        bloomComposer.dispose();
    }

    onMounted(() => {
        init();
        generateStar();
        generateHaze();
    });

</script>

<style scoped>

    .header-menu {
        min-height: 75px;
        height: auto;
        width: 100vw;
        backdrop-filter: blur(10px);
        background: rgba(255, 255, 255, 0.5);
    }

    .router-view-container {
        width: 100%;
        height: calc(100% - 75px);
    }

    .index {
        display: flex;
        flex-direction: column-reverse;
        width: 100vw;
        height: 100vh;
        background-size: cover;
    }

    .index-router-view {
        display: flex;
        flex-direction: column-reverse;
        width: 100vw;
        height: 100vh;
        position: absolute;
        top: 0;
        left: 0;
    }

    .background-3d {
        width: 100%;
        height: 100%;
    }


</style>