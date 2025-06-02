import {TransformControls} from "three/examples/jsm/controls/TransformControls";
import {Camera, Object3D} from "three";
import {addOperation} from "@/components/SceneEditor/ts/Operation";
import {operationListener} from "@/components/SceneEditor/ts/OperationListener";

export class CustomTransformControls {
    private readonly transformControls: TransformControls;
    private previousInfo = {
        uuid: "",
        translate: {x: 0, y: 0, z: 0},
        rotate: {x: 0, y: 0, z: 0},
        scale: {x: 1, y: 1, z: 1}
    }

    constructor(public camera: Camera, public domElement: HTMLElement) {
        this.transformControls = new TransformControls(camera, domElement);
        const saveInfo = (type: "translate" | "rotate" | "scale", object: Object3D) => {
            const map = {
                translate: "position",
                rotate: "rotation",
                scale: "scale"
            }
            const {x: x_, y: y_, z: z_} = object[map[type]];
            const {x, y, z} = this.previousInfo[type];
            const uuid = this.previousInfo.uuid;
            if (x !== x_ || y !== y_ || z !== z_) {
                addOperation(type, uuid, this.previousInfo[type])
                this.previousInfo[type] = {x: x_, y: y_, z: z_}
                this.previousInfo.uuid = object.uuid;
            }
        }

        this.transformControls.addEventListener('dragging-changed', (event) => {
            if (event.value) return;
            const object = event.target.object;
            const mode = event.target.getMode()
            //保存当前的信息
            saveInfo(mode, object);
        })

        this.transformControls.addEventListener('object-changed', (event) => {
            const object = event.target.object;
            if (!object) return;
            this.previousInfo.uuid = object.uuid;
            const {x, y, z} = object.position;
            this.previousInfo.translate = {x, y, z};
            const {x: rx, y: ry, z: rz} = object.rotation;
            this.previousInfo.rotate = {x: rx, y: ry, z: rz};
            const {x: sx, y: sy, z: sz} = object.scale;
            this.previousInfo.scale = {x: sx, y: sy, z: sz};
        })
        operationListener.on("operation:undo", (operation: any) => {
            const {type, uuid, data} = operation
            const {x, y, z} = data;
            this.previousInfo.uuid = uuid;
            this.previousInfo[type] = {x, y, z};
        });
    }

    get controls() {
        return this.transformControls;
    }
}