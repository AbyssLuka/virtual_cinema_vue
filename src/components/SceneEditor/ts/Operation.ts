import {operationListener} from "@/components/SceneEditor/ts/OperationListener";
import {editor} from "@/components/SceneEditor/ts/Editor";

type OperationType =
    "translate" | "rotate" | "scale" |
    "addObject" | "removeObject";

const operations: {
    type: OperationType
    uuid: string
    data: any
}[] = [];

let index = 0;
export const undo = () => {
    if (index < 0) return;
    const operation = operations[index];
    if (!operation) return;
    if (operation.type === "translate") {
        const modelUuid = operation.uuid;
        const {x, y, z} = operation.data;
        editor.scene.traverse(object => {
            if (object.uuid === modelUuid) {
                object.position.set(x, y, z);
                return;
            }
        })
    }
    if (operation.type === "scale") {
        const modelUuid = operation.uuid;
        const {x, y, z} = operation.data;
        editor.scene.traverse(object => {
            if (object.uuid === modelUuid) {
                object.scale.set(x, y, z);
                return;
            }
        })
    }
    if (operation.type === "rotate") {
        const modelUuid = operation.uuid;
        const {x, y, z} = operation.data;
        editor.scene.traverse(object => {
            if (object.uuid === modelUuid) {
                object.rotation.set(x, y, z);
                return;
            }
        })
    }
    index--;
    operationListener.emit("operation:undo", operation);
}
export const redo = () => {
    if (index + 1 >= operations.length) return;
    index++;
    undo();
    operationListener.emit("operation:redo");
}

export const addOperation = (type: OperationType, uuid: string, data: any) => {
    operations.splice(index + 1);
    operations.push({type, uuid, data});
    index = operations.length - 1;
    console.log(operations, index);
    operationListener.emit("operation:add");
}