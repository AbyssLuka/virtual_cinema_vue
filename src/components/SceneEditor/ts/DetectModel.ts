import {BoxHelper, Object3D, PerspectiveCamera, Vector2, WebGLRenderer} from "three";
import {RayDetect} from "@/components/ThreeJs/ts/RayDetect";
import {editorScene, MODEL_LIST} from "@/components/SceneEditor/ts/Global";
import {OrbitControls} from "three/examples/jsm/controls/OrbitControls";
import {TransformControls} from "three/examples/jsm/controls/TransformControls";
import {ColorRepresentation} from "three/src/math/Color";

export const detectInit = (
    camera: PerspectiveCamera,
    orbitControls: OrbitControls,
    transformControls: TransformControls,
    renderer: WebGLRenderer
) => {
    const vector2 = new Vector2(0, 0);
    const rayDetect = new RayDetect(vector2, camera, 1000);
    let isMove = false;
    const noneTarget = new Object3D();
    const boxHelper = new BoxHelper(noneTarget, 0xff0000);
    editorScene.add(boxHelper);

    const isMoveFn = () => {
        isMove = true;
        boxHelper.update();
    }
    const notIsMoveFn = () => {
        isMove = false;
    }
    const undoFn = (event: KeyboardEvent) => {
        if (event.ctrlKey && event.key === "z") {
            boxHelper?.update();
        }
    }
    orbitControls.addEventListener("change", isMoveFn);
    transformControls.addEventListener("change", isMoveFn);
    renderer.domElement.addEventListener("mousedown", notIsMoveFn);
    window.addEventListener("keydown", undoFn);
    const detectFn = (event: MouseEvent) => {
        if (!(event.button === 0)) return;
        if (isMove) return;
        const x = (event.offsetX / renderer.domElement.clientWidth) * 2 - 1;
        const y = -(event.offsetY / renderer.domElement.clientHeight) * 2 + 1;
        vector2.set(x, y);
        rayDetect.firstMesh(MODEL_LIST, (mesh) => {
            if (mesh === null) {
                transformControls.detach();
                boxHelper.visible = false;
            } else {
                transformControls.attach(mesh)
                boxHelper.setFromObject(mesh);
                boxHelper.visible = true;
            }
            boxHelper.update();
        });
    }
    renderer.domElement.addEventListener('mouseup', detectFn);
    return {
        dispose: () => {
            orbitControls.removeEventListener("change", isMoveFn);
            transformControls.removeEventListener("change", isMoveFn);
            renderer.domElement.removeEventListener("mousedown", isMoveFn);
            window.removeEventListener("keydown", undoFn);
            renderer.domElement.removeEventListener('mouseup', detectFn);
            boxHelper && editorScene.remove(boxHelper);
        },
        updateBoxHelperColor: (color: ColorRepresentation) => {
            boxHelper.material.color.set(color);
            boxHelper.update();
        }
    }
}