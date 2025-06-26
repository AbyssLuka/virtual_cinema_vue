import {Object3D, PerspectiveCamera, Vector3, WebGLRenderer} from "three";
import * as dat from "dat.gui";
import gsap from "gsap";

export class Camera {
    private readonly camera_: PerspectiveCamera;
    private readonly itemCamera_: PerspectiveCamera;
    // private gui = new dat.GUI();//调试

    constructor(position: Vector3) {
        this.camera_ = new PerspectiveCamera(
            60,         //角度
            1,       //比例
            0.1,       //近端
            1000        //远端
        );
        this.itemCamera_ = new PerspectiveCamera(
            60,
            1,
            0.1,
            50
        );
        this.camera_.position.copy(position);
        this.itemCamera_.position.copy(position);
        // this.gui.add(this.camera_, "fov", 60, 120, 1);
    }

    public resizeCamera(renderContainerDom: HTMLElement, renderer: WebGLRenderer) {
        if (renderContainerDom != null) {
            // 更新渲染器比例
            renderer.setSize(renderContainerDom.clientWidth, renderContainerDom.clientHeight);
            //更新渲染器和设备的像素比
            renderer.setPixelRatio(window.devicePixelRatio);
            const canvas = renderer.domElement;
            //更新宽高比
            this.camera_.aspect = canvas.clientWidth / canvas.clientHeight;
            this.itemCamera_.aspect = canvas.clientWidth / canvas.clientHeight;
            //更新摄像机的投影矩阵
            this.camera_.updateProjectionMatrix();
            this.itemCamera_.updateProjectionMatrix();
        }
    }

    get camera() {
        return this.camera_;
    }

    get itemCamera() {
        return this.itemCamera_;
    }


    private tempObject3D: Object3D = new Object3D();

    public loadItem(cameraItem: Object3D | null) {
        const load = () => {
            if (cameraItem === null) {
                cameraItem = new Object3D()
            }
            // 清除当前手中的物品
            this.itemCamera.remove(this.tempObject3D);
            // 替换手中的物品
            this.tempObject3D = cameraItem;
            this.tempObject3D.layers.set(1);
            cameraItem.position.set(1.2, -2.2, -1.4);
            cameraItem.rotation.set(3, 1.8, 2.9);
            const {x, y, z} = cameraItem.scale;
            cameraItem.scale.set(x * .5, y * .5, z * .5);
            // 添加到相机中
            // this.camera_.add(cameraItem);
            // this.camera_.layers.enable(1);

            this.itemCamera.add(cameraItem);
            this.itemCamera.layers.enable(1);
        }
        // 物品切换动画
        gsap.to(this.tempObject3D.position, {
            y: (this.tempObject3D.position.y - 1.5),
            duration: 0.1,
        }).then(() => {
            load();
            gsap.to(this.tempObject3D.position, {
                y: this.tempObject3D.position.y + 1.5,
                duration: 0.1,
            });
        });
        // this.gui.add(cameraGoods.position, "x", -3, 6);
        // this.gui.add(cameraGoods.position, "y", -3, 6);
        // this.gui.add(cameraGoods.position, "z", -3, 6);
        // this.gui.add(cameraGoods.rotation, "x", 0, Math.PI * 2);
        // this.gui.add(cameraGoods.rotation, "y", 0, Math.PI * 2);
        // this.gui.add(cameraGoods.rotation, "z", 0, Math.PI * 2);
    }
}