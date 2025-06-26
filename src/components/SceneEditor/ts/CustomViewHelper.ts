import {Euler, PerspectiveCamera, Vector3, WebGLRenderer} from "three";
import {ViewHelper} from "three/examples/jsm/helpers/ViewHelper";
import {OrbitControls} from "three/examples/jsm/controls/OrbitControls";

export class CustomViewHelper {
    private readonly viewHelperCamera: PerspectiveCamera;
    private readonly viewHelper: ViewHelper;
    private updateStatus = false;

    constructor(
        private readonly domElement: HTMLElement,
        private readonly domControls: HTMLElement,
    ) {
        this.viewHelperCamera = new PerspectiveCamera();

        this.viewHelperCamera.position.set(0, 0, 10);
        this.viewHelperCamera.up.set(0, 1, 0);
        this.viewHelperCamera.lookAt(0, 0, 0);

        this.viewHelperCamera.far = 100;
        this.viewHelperCamera.near = 0.1;
        this.viewHelper = new ViewHelper(this.viewHelperCamera, domElement);
        (this.viewHelper as any).name = 'ViewHelper';
        this.viewHelper.setLabels("X", "Y", "Z");
        domControls.addEventListener("pointerup", (e) => {
            e.stopPropagation();
            this.viewHelper.handleClick(e);
        });

        domControls.addEventListener("pointerdown", (e) => {
            e.stopPropagation();
        });
    }

    update(detail: number, renderer: WebGLRenderer) {
        this.viewHelper.render(renderer);
        if (this.viewHelper.animating) {
            this.viewHelper.update(detail);
            if (this.controls) {
                const camera = this.controls.object;
                const distance = camera.position.distanceTo(
                    this.controls.target);
                const offset = new Vector3(0, 0, 1)
                    .applyQuaternion(this.viewHelperCamera.quaternion)
                    .multiplyScalar(distance);
                camera.position.copy(this.controls.target).add(offset);
                camera.quaternion.copy(this.viewHelperCamera.quaternion);
            }
        }
    }

    updateCameraRotation(rotation: Euler) {
        this.viewHelperCamera.rotation.copy(rotation);
    }

    private controls: OrbitControls | null = null;
    private changeCb: () => void = () => {
    };

    syncCamera(
        camera: PerspectiveCamera,
        controls: OrbitControls,
    ) {
        this.controls = controls;
        this.changeCb = () => {
            this.updateStatus || this.updateCameraRotation(camera.rotation);
        }
        controls.addEventListener('change', this.changeCb);
    }

    dispose() {
        if (this.viewHelper) {
            this.viewHelper.dispose();
        }
        if (this.controls) {
            this.controls.removeEventListener('change', this.changeCb);
        }
        this.viewHelperCamera.clear();
    }
}