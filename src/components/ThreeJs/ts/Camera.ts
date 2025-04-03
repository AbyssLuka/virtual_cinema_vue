import {Object3D, PerspectiveCamera, Vector3, WebGLRenderer} from "three";
import * as dat from "dat.gui";
import gsap from "gsap";

export class Camera {
    private readonly camera_: PerspectiveCamera;
    private readonly itemCamera_: PerspectiveCamera;
    private gui = new dat.GUI();//调试

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

    public resizeCamera(renderContainerDom: HTMLElement, render: WebGLRenderer) {
        if (renderContainerDom != null) {
            // 更新渲染器比例
            render.setSize(renderContainerDom.clientWidth, renderContainerDom.clientHeight);
            //更新渲染器和设备的像素比
            render.setPixelRatio(window.devicePixelRatio);
            const canvas = render.domElement;
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

    public async loadItem(cameraItem: Object3D | null | undefined) {
        !cameraItem && (cameraItem = new Object3D())
        // 物品切换动画
        await gsap.to(this.tempObject3D.position, {
            y: (this.tempObject3D.position.y - 1.5),
            duration: 0.1,
        });
        // 清除当前手中的物品
        this.itemCamera.remove(this.tempObject3D);
        // 替换手中的物品
        this.tempObject3D = cameraItem;
        this.tempObject3D.layers.set(1);
        cameraItem.position.set(2.8, (-1.2 - 1.5), -3);
        cameraItem.rotation.set(3, 1.8, 2.9);
        cameraItem.scale.set(cameraItem.scale.x * 1.5, cameraItem.scale.y * 1.5, cameraItem.scale.z * 1.5);
        // 添加到相机中
        // this.camera_.add(cameraItem);
        // this.camera_.layers.enable(1);

        this.itemCamera.add(cameraItem);
        this.itemCamera.layers.enable(1);

        // 物品切换动画
        await gsap.to(this.tempObject3D.position, {
            y: this.tempObject3D.position.y + 1.5,
            duration: 0.1,
        });
        // this.gui.add(cameraGoods.position, "x", -3, 6);
        // this.gui.add(cameraGoods.position, "y", -3, 6);
        // this.gui.add(cameraGoods.position, "z", -3, 6);
        // this.gui.add(cameraGoods.rotation, "x", 0, Math.PI * 2);
        // this.gui.add(cameraGoods.rotation, "y", 0, Math.PI * 2);
        // this.gui.add(cameraGoods.rotation, "z", 0, Math.PI * 2);
    }
}