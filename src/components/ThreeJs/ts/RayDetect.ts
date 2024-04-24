import {Object3D, PerspectiveCamera, Raycaster, Vector2, Vector3} from "three";

export class RayDetect {
    private raycaster: Raycaster;
    private readonly axis: Vector2;
    private readonly camera: PerspectiveCamera;

    constructor(axis: Vector2, camera: PerspectiveCamera,) {
        this.axis = axis;
        this.camera = camera;
        this.raycaster = new Raycaster(new Vector3(), new Vector3(), 0, 20);
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
