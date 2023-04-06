import {Object3D, PerspectiveCamera, Vector2} from "three";
import * as THREE from "three";


export class RayDetect {
    private raycaster;
    private readonly axis;
    private readonly camera;

    constructor(axis: Vector2, camera: PerspectiveCamera,) {
        this.axis = axis;
        this.camera = camera;
        this.raycaster = new THREE.Raycaster(new THREE.Vector3(), new THREE.Vector3(), 0, 20);
    }

    public firstMesh(Object3DList: Object3D[], callback: (mesh: Object3D | null) => void) {
        this.raycaster.setFromCamera(this.axis, this.camera);
        const intersectObjects = this.raycaster.intersectObjects(Object3DList);
        if (intersectObjects.length > 0) {
            const intersectObject = intersectObjects[0].object;
            callback(intersectObject);
        } else {
            callback(null);
        }
    }
}
