// import {editorScene, MODEL_LIST} from "@/components/SceneEditor/ts/Global";
import {Object3D, Object3DJSON, ObjectLoader, Scene} from "three";
import {editor} from "@/components/SceneEditor/ts/Editor";

class AutoSave {
    private saveFn: () => void = () => {
    };
    private request: Promise<IDBOpenDBRequest>;

    constructor() {
        this.request = new Promise((resolve) => {
            const request = indexedDB.open("Web3D", 2);
            request.addEventListener("upgradeneeded", (event) => {
                const db = (<IDBOpenDBRequest>event.target).result;
                if (!db.objectStoreNames.contains("autosave")) {
                    db.createObjectStore("autosave", {keyPath: "id"});
                }
            })
            request.addEventListener("success", (event) => {
                const db = (<IDBOpenDBRequest>event.target).result;
                this.saveFn = () => {
                    const helpers: { parent: Object3D, object: Object3D }[] = [];
                    editor.scene.traverse((object) => {
                        if ((object.userData.isHelper || object.userData.isDefualt) && object.parent) {
                            helpers.push({parent: object.parent, object});
                        }
                    });
                    // 移除所有 helper
                    helpers.forEach((
                        {parent, object}
                    ) => parent.remove(object));

                    const idbTransaction = db.transaction("autosave", "readwrite");
                    const idbObjectStore = idbTransaction.objectStore("autosave");
                    idbObjectStore.put({
                        id: "autosave",
                        scene: editor.scene.toJSON(),
                        timestamp: Date.now()
                    });
                    // 恢复 helper
                    helpers.forEach(({parent, object}) => parent.add(object));
                }
                resolve(request)
            })
        })
    }

    save() {
        this.saveFn();
    }

    async load() {
        const db = (await this.request).result;
        const idbTransaction = db.transaction("autosave", "readonly");
        const idbObjectStore = idbTransaction.objectStore("autosave");
        const getRequest = idbObjectStore.get("autosave");
        editor.sceneReload();
        getRequest.onsuccess = (event) => {
            const data = (<IDBRequest>event.target).result;
            if (data && data.scene) {
                editor.modelList.splice(0, editor.modelList.length);
                const loader = new ObjectLoader();
                const loadedScene = <Scene>loader.parse(data.scene);
                editor.scene.background = loadedScene.background;
                editor.scene.environment = loadedScene.environment;
                editor.scene.fog = loadedScene.fog;
                editor.scene.userData = loadedScene.userData;
                while (loadedScene.children.length > 0) {
                    const object = loadedScene.children[0];
                    editor.addModel(object);
                }
            }
        }
    }

}

const saveScene = new AutoSave();

export {
    saveScene
}