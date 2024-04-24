<template>
    <div class="webgl-container">
        <canvas id="model-detail-canvas"></canvas>
        <div class="control-panel">
            <div class="luka-button animation-button"
                 :style="state.AnimationActions[index].isScheduled()?'color:forestgreen':''"
                 v-for="(animation,index) in state.AnimationClips"
                 :key="index"
                 @click="playAnimation(index)">
                {{ animation.name.split(".")[2] }}
                <div class="progress-bar"
                     :id="'progress-'.concat(index.toString())">
                </div>
            </div>
            <div class="luka-button animation-button"
                 @click="playAnimation(-1)">
                停止所有动画
            </div>
            <div class="luka-button animation-button"
                 @click="router.go(-1)">
                返回
            </div>
            <div class="luka-button animation-button"
                 :style="[state.isCollect?'color:orangered':'']"
            >
                {{ state.collectText }}
            </div>
        </div>
    </div>
</template>

<script setup lang="ts">
import {
    AnimationMixer, Clock,
    DirectionalLight,
    HemisphereLight, Mesh, Object3D,
    PerspectiveCamera,
    Scene, Vector3,
    WebGLRenderer
} from "three"
import {onMounted, onBeforeUnmount, reactive} from "vue"
import {OrbitControls} from "three/examples/jsm/controls/OrbitControls";
import {useRoute, useRouter} from "vue-router";
import {GLTFLoader} from "three/examples/jsm/loaders/GLTFLoader";
import {AnimationClip} from "three/src/animation/AnimationClip";
import {AnimationAction} from "three/src/animation/AnimationAction";
// import api from "@/request/api";
import {MODEL_BASE_URL} from "@/global/global";

let renderer, canvas, controls;

const route = useRoute();
const router = useRouter();
// const animationClips

const state = reactive<{
    mixer: AnimationMixer | null,
    model: Object3D | null,
    AnimationClips: AnimationClip[],
    AnimationActions: AnimationAction[],
    isCollect: boolean,
    collectText: string,
    modelUuid: string
}>({
    mixer: null,
    model: null,
    AnimationClips: [],
    AnimationActions: [],
    isCollect: false,
    collectText: "收藏",
    modelUuid: ""
});


function playAnimation(index: number) {
    if (state.mixer && index >= 0) {
        if (state.AnimationActions[index].isScheduled()) {
            state.AnimationActions[index].stop();
        } else {
            state.AnimationActions[index].play();
        }
        const dom = document.getElementById("progress-" + index);
        dom && (dom.style.width = "0");
    } else if (index < 0) {
        state.AnimationActions.forEach((action, aIndex) => {
            action.stop();
            const dom = document.getElementById("progress-" + aIndex);
            dom && (dom.style.width = "0");
        });
    }
}

// const setCollectText = (status: boolean) => {
//     if (status) {
//         state.collectText = "已收藏";
//         state.isCollect = true;
//     } else {
//         state.collectText = "收藏";
//         state.isCollect = false;
//     }
// };

// function collect() {
//     if (state.isCollect) {
//         api.removeModelCollectApi(state.modelUuid, (err, data) => {
//             console.log("remove", err, data);
//             setCollectText(!err);
//         });
//     } else {
//         api.addModelCollectApi(state.modelUuid, (err, data) => {
//             console.log("add", err, data);
//             setCollectText(!!err);
//         });
//     }
// }

onMounted(() => {
    const fileName = route.query.fileName as string;
    const url = MODEL_BASE_URL.concat(fileName);
    state.modelUuid = route.query.uuid as string;
    new GLTFLoader().load(url, (gltf) => {
        scene.add(gltf.scene);
        state.model = gltf.scene;
        state.mixer = new AnimationMixer(gltf.scene);
        state.AnimationClips = gltf.animations;
        state.AnimationClips.forEach((clip) => {
            state.mixer && state.AnimationActions.push(state.mixer.clipAction(clip))
        })
    });

    scene.add(new HemisphereLight(0xaaaaaa, 0x444444));
    const light = new DirectionalLight(0xffffff, 0.5);
    light.position.set(1, 1, 1);
    scene.add(light);
    canvas = document.getElementById("model-detail-canvas") as HTMLCanvasElement;
    controls = new OrbitControls(camera, canvas);
    controls.target = new Vector3(0, .25, 0);
    renderer = new WebGLRenderer({
        canvas: canvas,
    });
    renderer.setClearColor(0xEEEEEE, 0.0);

    // api.collectIsEmptyApi(state.modelUuid, (data) => {
    //     setCollectText(data.data)
    // });

    resizeFunc();
    animationFunc();
});

const camera = new PerspectiveCamera(50, 1, 0.1, 10);
camera.position.set(-.5, .5, -.6);
const scene = new Scene();
let requestAnimationFrameId = -1;
const clock = new Clock();
const animationFunc = () => {
    const delta = clock.getDelta();
    requestAnimationFrameId = requestAnimationFrame(animationFunc);
    controls.update();
    state.mixer?.update(delta);
    renderer.render(scene, camera);
    state.AnimationActions.forEach((action, index) => {
        if (action.isScheduled()) {
            const number = action.time / state.AnimationClips[index].duration;
            const dom = document.getElementById("progress-" + index);
            dom && (dom.style.width = number * 100 + "%");
        }
    })
};

onBeforeUnmount(() => {
    dispose();
});

const resizeFunc = () => {
    camera.aspect = canvas.clientWidth / canvas.clientHeight;
    camera.updateProjectionMatrix();
    const width = canvas.clientWidth;
    const height = canvas.clientHeight;
    if (canvas.width !== width || canvas.height !== height) {
        renderer.setSize(width, height, false);
    }
};

window.addEventListener("resize", resizeFunc);

//回收
const dispose = () => {
    cancelAnimationFrame(requestAnimationFrameId);
    window.removeEventListener("resize", resizeFunc);
    scene.traverse((child: Object3D) => {
        if ((child) instanceof Mesh) {
            child.material.dispose && child.material.dispose();
            child.geometry.dispose && child.geometry.dispose();
        }
        child.clear();
    });
    scene.clear();
    camera.clear();
    controls.dispose();
    renderer.forceContextLoss();
    renderer.dispose();
}
</script>

<style scoped>
.progress-bar {
    position: absolute;
    left: 0;
    top: 0;
    height: 100%;
    background: rgba(255, 255, 255, .1);
}

.webgl-container {
    width: 100%;
    height: 100%;
    padding: 0;
    margin: 0;
    overflow: hidden;
    position: relative;
    background: rgba(255, 255, 255, 0.1);
    backdrop-filter: blur(5px);
}

#model-detail-canvas {
    width: 100%;
    height: 100%;
}

.control-panel {
    position: absolute;
    top: 0;
    left: 0;
    width: 1000px;
    height: 100px;
    display: flex;
}

.animation-button {
    margin: 5px 10px;
    position: relative;
}
</style>