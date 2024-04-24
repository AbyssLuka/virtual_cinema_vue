import {Object3D, PerspectiveCamera, Vector3, WebGLRenderer} from "three";
import * as dat from "dat.gui";
import gsap from "gsap";

export class Camera {
    private readonly camera: PerspectiveCamera;
    private readonly itemCamera: PerspectiveCamera;
    private gui = new dat.GUI();//调试

    constructor(position: Vector3) {
        this.camera = new PerspectiveCamera(
            60,         //角度
            1,       //比例
            0.1,       //近端
            1000        //远端
        );
        this.itemCamera = new PerspectiveCamera(
            60,
            1,
            0.1,
            50
        );
        this.camera.position.copy(position);
        this.itemCamera.position.copy(position);
        // this.gui.add(this.camera, "fov", 60, 120, 1);
    }

    public resizeCamera(renderContainerDom: HTMLElement, render: WebGLRenderer) {
        if (renderContainerDom != null) {
            // 更新渲染器比例
            render.setSize(renderContainerDom.clientWidth, renderContainerDom.clientHeight);
            //更新渲染器和设备的像素比
            render.setPixelRatio(window.devicePixelRatio);
            const canvas = render.domElement;
            //更新宽高比
            this.camera.aspect = canvas.clientWidth / canvas.clientHeight;
            this.itemCamera.aspect = canvas.clientWidth / canvas.clientHeight;
            //更新摄像机的投影矩阵
            this.camera.updateProjectionMatrix();
            this.itemCamera.updateProjectionMatrix();
        }
    }

    public create() {
        return this.camera;
    }

    public createItemCamera() {
        return this.itemCamera;
    }

    private tempObject3D: Object3D = new Object3D();

    public async loadItem(cameraGoods: Object3D | null | undefined) {
        !cameraGoods && (cameraGoods = new Object3D())
        // 物品切换动画
        await gsap.to(this.tempObject3D.position, {
            y: (this.tempObject3D.position.y - 1.5),
            duration: 0.1,
        });
        // 清除当前手中的物品
        this.itemCamera.remove(this.tempObject3D);
        // 替换手中的物品
        this.tempObject3D = cameraGoods;
        this.tempObject3D.layers.set(1);
        cameraGoods.position.set(2.8, (-1.2 - 1.5), -3);
        cameraGoods.rotation.set(3, 1.8, 2.9);
        cameraGoods.scale.set(cameraGoods.scale.x * 1.5, cameraGoods.scale.y * 1.5, cameraGoods.scale.z * 1.5);
        // 添加到相机中
        this.itemCamera.add(cameraGoods);
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