import {
    AmbientLight, BoxHelper, Color,
    EquirectangularReflectionMapping,
    GridHelper,
    Object3D,
    PerspectiveCamera,
    Scene, Vector3,
    WebGLRenderer
} from "three";
// import {editorCamera, editorRenderer} from "@/components/SceneEditor/ts/Global";
import {OrbitControls} from "three/examples/jsm/controls/OrbitControls";
import {CustomTransformControls} from "@/components/SceneEditor/ts/CustomTransformControls";
import {RGBELoader} from "three/examples/jsm/loaders/RGBELoader";

type EditorEvent = "model-add" | "model-remove" | "helper-add" | "helper-remove";

class Editor {
    private editorScene = new Scene();
    private editorRenderer = new WebGLRenderer({antialias: true, alpha: true});
    private editorCamera: PerspectiveCamera = new PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    private editorOrbitControls = new OrbitControls(this.camera, this.editorRenderer.domElement);
    private MODEL_LIST: Object3D[] = [];
    private editorTransformControls = new CustomTransformControls(this.camera, this.editorRenderer.domElement);
    private boxHelper_ = new BoxHelper(new Object3D(), 0xff0000);

    constructor() {
        this.camera.up.set(0, 1, 0);
        new RGBELoader().loadAsync("/3d/skybox/skydome_hdri-starlight_sky_fullview.hdr",)
            .then((texture) => {
                texture.mapping = EquirectangularReflectionMapping;
                // editorScene.background = texture;
                this.scene.background = new Color(0x575757);
                // editorScene.environment = texture;
            })

        this.transformControls.addEventListener('dragging-changed', (event) => {
            this.orbitControls.enabled = !event.value;
        });
        this.sceneReload();
    }

    private FUNC_MAP: Record<EditorEvent, Set<Function>> = {
        "helper-add": new Set(),
        "helper-remove": new Set(),
        "model-add": new Set(),
        "model-remove": new Set(),
    }

    addEventListener(key: EditorEvent, cb: (model: Object3D) => void) {
        this.FUNC_MAP[key].add(cb);
    }

    addModel(...models: Object3D[]) {
        this.editorScene.add(...models);
        this.MODEL_LIST.push(...models);
        this.FUNC_MAP["model-add"].forEach((cb) => cb(...models));
    }

    removeModel(...models: Object3D[]) {
        models.forEach((model => {
            const index = this.MODEL_LIST.indexOf(model);
            if (index !== -1) {
                this.MODEL_LIST.splice(index, 1);
            }
            model.parent?.remove(model);
        }))

        this.FUNC_MAP["model-remove"].forEach((cb) => cb(...models));
    }

    addHelper(helper: Object3D) {
        this.editorScene.add(helper);
        helper.userData.isHelper = true; // 标记为 helper
        this.FUNC_MAP["helper-add"].forEach((cb) => cb(helper));
    }

    sceneReload() {
        this.editorScene.clear();
        const TCHelper = this.editorTransformControls.controls.getHelper();
        TCHelper.userData.isHelper = true;
        this.editorScene.add(TCHelper);
        this.editorCamera.lookAt(0, 0, 0)
        this.editorCamera.position.set(10, 10, 10);
        const gridHelper = new GridHelper(1000, 1000, 0xff0000);
        gridHelper.userData.isHelper = true; // 标记为 helper
        this.editorScene.add(gridHelper)
        const ambientLight = new AmbientLight(0xffffff, 0.5);
        ambientLight.userData.isDefualt = true; // 标记为默认光源
        this.editorScene.add(ambientLight);
        this.boxHelper_.userData.isHelper = true; // 标记为 helper
        this.editorScene.add(this.boxHelper);
        this.MODEL_LIST = [];
    }

    get boxHelper() {
        return this.boxHelper_;
    }

    get scene() {
        return this.editorScene;
    }

    get renderer() {
        return this.editorRenderer;
    }

    get camera() {
        return this.editorCamera;
    }

    get orbitControls() {
        return this.editorOrbitControls;
    }

    get transformControls() {
        return this.editorTransformControls.controls;
    }

    changeTransform() {
        return this.editorTransformControls.changeTransform();
    }

    get models() {
        return this.MODEL_LIST;
    }

    get modelList() {
        return this.MODEL_LIST;
    }

    dispose() {
        this.transformControls.dispose();
        this.editorOrbitControls.dispose();
        this.editorRenderer.dispose();
        this.editorScene.clear();
    }

    removeFocusObject() {
        console.log(this.transformControls.object)
        this.removeModel(this.transformControls.object);
        this.transformControls.detach();
        this.boxHelper.visible = false;
        this.boxHelper.update();
    }

    canvasResize = (w: number, h: number) => {
        // 更新渲染器比例
        editor.renderer.setSize(w, h);
        //更新渲染器和设备的像素比
        editor.renderer.setPixelRatio(window.devicePixelRatio);
        const canvas = editor.renderer.domElement;
        //更新宽高比
        editor.camera.aspect = canvas.clientWidth / canvas.clientHeight;
        //更新摄像机的投影矩阵
        editor.camera.updateProjectionMatrix();
    }
}

const editor = new Editor();
export {
    editor,
    Editor
}