import {Object3D, PerspectiveCamera, Raycaster, Vector2, Vector3} from "three";

export class RayDetect {
    private raycaster: Raycaster;

    constructor(
        public readonly axis: Vector2,
        public readonly camera: PerspectiveCamera,
        far_ = 10
    ) {
        this.raycaster = new Raycaster(new Vector3(), new Vector3(), 0, far_);
    }

    set far(value: number) {
        this.raycaster.far = value;
    }

    public firstMesh(object3DList: Object3D[], callback: (mesh: Object3D | null) => void) {
        this.raycaster.setFromCamera(this.axis, this.camera);
        const intersectObjects = this.raycaster.intersectObjects(object3DList);
        if (intersectObjects.length > 0) {
            const intersectObject = intersectObjects[0].object;
            callback(intersectObject);
        } else {
            callback(null);
        }
    }
}
