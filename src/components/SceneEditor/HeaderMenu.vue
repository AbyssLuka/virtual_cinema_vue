<template>
    <div class="header-menu-container">
        <div class="header-menu-item"
             tabindex="-1"
             v-for="(menuItem, menuIndex) in menuOptions"
             :key="menuItem.name"
             @click="showMenu(menuIndex)"
        >
            <div class="item-title">{{ menuItem.name }}</div>

            <div class="util-item-menu">
                <div v-for="(item) in menuItem.options"
                     :key="item.name"
                     style="position:relative;"
                     @click.stop="item.action?.()"
                >
                    <div class="item-title">{{ item.name }}</div>
                    <div v-if="item.options" class="sub-util-item-menu">
                        <div v-for="(subItem, subIndex) in item.options"
                             :key="subIndex"
                             @click.stop="subItem.action?.()"
                        >
                            <div class="item-title">{{ subItem.name }}</div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>

<script setup lang="ts">
import {ref} from "vue";
import {GLTFLoader} from "three/examples/jsm/loaders/GLTFLoader";
import {
    BoxGeometry,
    CylinderGeometry,
    Mesh,
    MeshStandardMaterial,
    PlaneGeometry,
    RingGeometry,
    SphereGeometry,
    SpotLight,
    SpotLightHelper,
    TorusGeometry
} from "three";
import {ModelExporter} from "@/components/SceneEditor/ts/ModelExporter";
import {editor} from "@/components/SceneEditor/ts/Editor";

const showIndex = ref(-1)
const showMenu = (index: number) => {
    showIndex.value = index;
}
const openFileEl = document.createElement("input");
openFileEl.setAttribute("type", "file");
openFileEl.addEventListener("change", (event) => {
    const file = (<HTMLInputElement>event.target).files?.[0];
    if (!file) return;
    const reader = new FileReader();
    const gltfLoader = new GLTFLoader();
    reader.onloadend = async () => {
        const result = reader.result;
        const gltf = await gltfLoader.parseAsync(<string>result, "");
        const object = gltf.scene;
        object.traverse((child) => {
            if ((child) instanceof Mesh) {
                child.castShadow = true;
                child.receiveShadow = true;
                editor.modelList.push(child);
            }
        });
        editor.addModel(object);
    }
    reader.readAsArrayBuffer(file);
});
const addFile = () => {
    openFileEl.click();
}

type optionsType = { name: string, action?: () => void, options?: optionsType[] };
const menuOptions: optionsType[] = [
    {
        name: "文件",
        options: [
            {
                name: "新建",
                action: () => {
                    editor.sceneReload()
                    alert("新建场景成功！");
                }
            },
            {name: "打开", action: () => console.log("打开")},
            {name: "保存", action: () => console.log("保存")},
            {
                name: "导入",
                options: [
                    {
                        name: "GLTF模型",
                        action: addFile
                    },
                    {
                        name: "OBJ模型",
                        action: () => {
                            alert("请将OBJ模型文件拖拽到编辑器中，或点击此处选择文件。");
                        }
                    },
                    {
                        name: "FBX模型",
                        action: () => {
                            alert("请将FBX模型文件拖拽到编辑器中，或点击此处选择文件。");
                        }
                    },
                    {
                        name: "STL模型",
                        action: () => {
                            alert("请将STL模型文件拖拽到编辑器中，或点击此处选择文件。");
                        }
                    }
                ]
            },
            {
                name: "导出",
                options: [
                    {
                        name: "GLTF模型",
                        action: () => {
                            new ModelExporter(editor.scene).exporterGltf()
                        }
                    },
                    {
                        name: "OBJ模型",
                        action: () => {
                            alert("请将场景导出为OBJ模型。");
                        }
                    },
                    {
                        name: "FBX模型",
                        action: () => {
                            alert("请将场景导出为FBX模型。");
                        }
                    },
                    {
                        name: "STL模型",
                        action: () => {
                            alert("请将场景导出为STL模型。");
                        }
                    }
                ]
            }
        ]
    },
    {name: "编辑", options: []},
    {
        name: "添加",
        options: [
            {
                name: "模型",
                options: [
                    {
                        name: "立方体",
                        action: () => {
                            const geometry = new BoxGeometry(1, 1, 1);
                            const material = new MeshStandardMaterial({color: 0xffffff});
                            const cube = new Mesh(geometry, material);
                            cube.castShadow = true;
                            cube.receiveShadow = true;
                            cube.name = "Cube";
                            editor.addModel(cube);
                        }
                    },
                    {
                        name: "球体",
                        action: () => {
                            const geometry = new SphereGeometry(0.5, 32, 32);
                            const material = new MeshStandardMaterial({color: 0xffffff});
                            const sphere = new Mesh(geometry, material);
                            sphere.castShadow = true;
                            sphere.receiveShadow = true;
                            sphere.name = "Sphere";
                            editor.addModel(sphere);
                        }
                    },
                    {
                        name: "平面",
                        action: () => {
                            const planeGeometry = new PlaneGeometry(5, 5);
                            const planeMaterial = new MeshStandardMaterial({color: 0xffffff});
                            const plane = new Mesh(planeGeometry, planeMaterial);
                            plane.rotation.x = -Math.PI / 2; // 平面朝上
                            plane.receiveShadow = true;
                            plane.castShadow = true;
                            plane.name = "Plane";
                            editor.addModel(plane);
                        }
                    },
                    {
                        name: "圆柱体",
                        action: () => {
                            const geometry = new CylinderGeometry(0.5, 0.5, 1, 32);
                            const material = new MeshStandardMaterial({color: 0xffffff});
                            const cylinder = new Mesh(geometry, material);
                            cylinder.castShadow = true;
                            cylinder.receiveShadow = true;
                            cylinder.name = "Cylinder";
                            editor.addModel(cylinder);
                        }
                    },
                    {
                        name: "二维圆环", action: () => {
                            const ringGeometry = new RingGeometry(0.5, 1, 32);
                            const material = new MeshStandardMaterial({color: 0xffffff});
                            const ring = new Mesh(ringGeometry, material);
                            ring.castShadow = true;
                            ring.receiveShadow = true;
                            ring.name = "Ring2D";
                            editor.addModel(ring);
                        }
                    },
                    {
                        name: "三维圆环", action: () => {
                            const ringGeometry = new TorusGeometry(2, 1, 8, 50);
                            const material = new MeshStandardMaterial({color: 0xffffff});
                            const ring = new Mesh(ringGeometry, material);
                            ring.castShadow = true;
                            ring.receiveShadow = true;
                            ring.name = "Ring3D";
                            editor.addModel(ring);
                        }
                    },
                    {
                        name: "圆锥", action: () => {
                            const geometry = new CylinderGeometry(0, 0.5, 1, 32);
                            const material = new MeshStandardMaterial({color: 0xffffff});
                            const cone = new Mesh(geometry, material);
                            cone.castShadow = true;
                            cone.receiveShadow = true;
                            cone.name = "Cone";
                            editor.addModel(cone);
                        }
                    },
                ]
            },
            {
                name: "光源",
                options: [
                    {
                        name: "聚光灯", action: () => {
                            const light = new SpotLight(0xffffff, 10000);
                            const spotLightHelper = new SpotLightHelper(light);
                            light.position.set(0, 30, 0);
                            light.castShadow = true;
                            editor.addModel(light);
                            editor.addHelper(spotLightHelper);
                        }
                    },
                ]
            },
            {
                name: "相机", options: [
                    {
                        name: "透视相机",
                        action: () => {
                            alert("TODO")
                        }
                    },
                    {
                        name: "正交相机",
                        action: () => {
                            alert("TODO")
                        }
                    }
                ]
            }
        ]
    },
    {name: "视图", options: []},
    {
        name: "帮助",
        options: [
            {
                name: "关于",
                action: () => {
                    alert("这是一个三维场景编辑器，使用Three.js和Vue.js构建。");
                }
            },
            {
                name: "文档",
                action: () => {
                    alert("TODO")
                }
            }
        ]
    }
] as const;

</script>

<style scoped>
.sub-util-item-menu {
    display: none;
    position: absolute;
    background: white;
    width: 6rem;
    left: 100%;
    top: 0;
}

.item-title {
    width: 100%;
    display: flex;
    justify-content: center;
    align-items: center;
}

.sub-util-item-menu > div {
    height: 2rem;

}

.util-item-menu > div {
    height: 2rem;
    width: 100%;
}

.util-item-menu div:hover > .sub-util-item-menu {
    display: block;
}

.util-item-menu {
    position: absolute;
    background: white;
    width: 5rem;
    display: none;
}

.util-item-menu > div:hover .sub-util-item-menu > div:hover {
    color: orangered;
}

.header-menu-container {
    width: 100%;
    height: 100%;
    display: flex;
    align-items: center;
}

.header-menu-item {
    margin: 0 1rem;
    position: relative;
}

.header-menu-item:focus > .util-item-menu {
    display: block;
}

.header-menu-item:hover {
    cursor: pointer;
}

.item-title:hover {
    color: orangered;
}

</style>