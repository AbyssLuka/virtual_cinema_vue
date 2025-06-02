import {Object3D, Scene} from "three";
import {editorScene} from "@/components/SceneEditor/ts/Global";
import {operationListener} from "@/components/SceneEditor/ts/OperationListener";

type OperationType =
    "translate" | "rotate" | "scale" |
    "addObject" | "removeObject";

const operations: {
    type: OperationType
    uuid: string
    data: any
}[] = [];

let index = 0;
export const undo = (scene: Scene) => {
    if (index < 0) return;
    const operation = operations[index];
    if (!operation) return;
    if (operation.type === "translate") {
        const modelUuid = operation.uuid;
        const {x, y, z} = operation.data;
        scene.traverse(object => {
            if (object.uuid === modelUuid) {
                object.position.set(x, y, z);
                return;
            }
        })
    }
    if (operation.type === "scale") {
        const modelUuid = operation.uuid;
        const {x, y, z} = operation.data;
        scene.traverse(object => {
            if (object.uuid === modelUuid) {
                object.scale.set(x, y, z);
                return;
            }
        })
    }
    if (operation.type === "rotate") {
        const modelUuid = operation.uuid;
        const {x, y, z} = operation.data;
        scene.traverse(object => {
            if (object.uuid === modelUuid) {
                object.rotation.set(x, y, z);
                return;
            }
        })
    }
    index--;
    operationListener.emit("operation:undo", operation);
}
export const redo = (scene: Scene) => {
    if (index + 1 >= operations.length) return;
    index++;
    undo(scene);
    operationListener.emit("operation:redo");
}
export const addOperation = (type: OperationType, uuid: string, data: any) => {
    operations.splice(index + 1);
    operations.push({type, uuid, data});
    index = operations.length - 1;
    console.log(operations, index);
    operationListener.emit("operation:add");
}

window.addEventListener("keydown", (event) => {
    if (event.ctrlKey && event.key.toLowerCase() === "z") {
        undo(editorScene);
    }
})