import {Object3D, Vector2, Vector3} from "three";
import {RayDetect} from "@/components/ThreeJs/ts/RayDetect";
import {TransformControls} from "three/examples/jsm/controls/TransformControls";
import {ColorRepresentation} from "three/src/math/Color";
import {Event} from "three/src/core/EventDispatcher";
import gsap from "gsap";
import {Editor} from "@/components/SceneEditor/ts/Editor";

export const detectInit = (
    editor: Editor
) => {
    const {camera, renderer, orbitControls, transformControls} = editor;
    const vector2 = new Vector2(0, 0);
    const rayDetect = new RayDetect(vector2, camera, 1000);
    let isMove = false;

    const boxHelper = editor.boxHelper;

    const isMoveFn = () => {
        isMove = true;
        boxHelper.update();
    }
    const notIsMoveFn = () => {
        isMove = false;
    }
    const undoFn = (event: KeyboardEvent) => {
        if (event.ctrlKey && event.key === "z") {
            boxHelper.update();
        }
    }

    const focusFn = (value: Event<"object-changed", TransformControls>) => {
        boxHelper.visible = true;
        if (!value.target.object) {
            boxHelper.visible = false;
            return;
        }
        boxHelper.setFromObject(value.target.object);
        boxHelper.update()
    }

    orbitControls.addEventListener("change", isMoveFn);
    transformControls.addEventListener("change", isMoveFn);
    transformControls.addEventListener("object-changed", focusFn);
    renderer.domElement.addEventListener("mousedown", notIsMoveFn);
    window.addEventListener("keydown", undoFn);

    //检测
    const detectFn = (event: MouseEvent, cb: (object: Object3D | null) => void) => {
        if (!(event.button === 0)) return;
        if (isMove) return;
        const x = (event.offsetX / renderer.domElement.clientWidth) * 2 - 1;
        const y = -(event.offsetY / renderer.domElement.clientHeight) * 2 + 1;
        vector2.set(x, y);
        rayDetect.firstMesh(editor.modelList, (mesh) => {
            cb(mesh)
        });
    }
    //单击选择
    const clickFn = (event: MouseEvent) => {
        detectFn(event, (mesh) => {
            if (mesh === null) {
                transformControls.detach();
                boxHelper.visible = false;
            } else {
                transformControls.attach(mesh)
                boxHelper.setFromObject(mesh);
                boxHelper.visible = true;
            }
            boxHelper.update();
        })
    }

    //双击聚焦
    const dbClickFn = (event: MouseEvent) => {
        detectFn(event, (mesh) => {
            if (mesh === null) return;
            const worldPosition = new Vector3(0, 0, 0);
            mesh.getWorldPosition(worldPosition)
            const {x, y, z} = worldPosition;
            gsap.to(orbitControls.target, {
                x, y, z, duration: .5,
                onUpdate: () => {
                    camera.lookAt(orbitControls.target);
                    orbitControls.update();
                }
            })
        });
    }

    renderer.domElement.addEventListener('mouseup', clickFn);
    renderer.domElement.addEventListener("dblclick", dbClickFn);

    return {
        dispose: () => {
            orbitControls.removeEventListener("change", isMoveFn);
            transformControls.removeEventListener("change", isMoveFn);
            transformControls.removeEventListener("object-changed", focusFn);
            renderer.domElement.removeEventListener("mousedown", isMoveFn);
            window.removeEventListener("keydown", undoFn);
            renderer.domElement.removeEventListener('mouseup', clickFn);
            renderer.domElement.removeEventListener("dblclick", dbClickFn);
            boxHelper && editor.removeModel(boxHelper);
        },
        updateBoxHelperColor: (color: ColorRepresentation) => {
            boxHelper.material.color.set(color);
            boxHelper.update();
        }
    }
}