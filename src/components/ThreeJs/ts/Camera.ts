import * as CANNON from "cannon-es";
import * as THREE from "three";
import {Object3D} from "three";
// import * as dat from "dat.gui";
import gsap from "gsap";

export class Camera {
    private readonly camera;
    private readonly cameraRoleGoods;

    constructor(position: THREE.Vector3) {
        this.camera = new THREE.PerspectiveCamera(
            75,         //角度
            1,       //比例
            0.1,       //近端
            1000        //远端
        );
        // this.cameraRoleGoods = new THREE.PerspectiveCamera(
        //     75,         //角度
        //     1,       //比例
        //     0.1,       //近端
        //     1000        //远端
        // );
        this.cameraRoleGoods = new THREE.OrthographicCamera(
            0, 0, 0, 0, 0.1, 1000);
        this.cameraRoleGoods.zoom = 700;
        this.camera.position.copy(position);
        this.cameraRoleGoods.position.copy(position);
    }

    private zoomMagnification = 1;

    public resizeCamera = (renderContainerDom: HTMLElement, render: THREE.WebGLRenderer) => {
        if (renderContainerDom != null) {
            // 更新渲染器比例
            render.setSize(renderContainerDom.clientWidth, renderContainerDom.clientHeight);
            //更新渲染器和设备的像素比
            render.setPixelRatio(window.devicePixelRatio);
            const canvas = render.domElement;
            //更新宽高比
            this.camera.aspect = canvas.clientWidth / canvas.clientHeight;
            //更新摄像机的投影矩阵
            this.camera.updateProjectionMatrix();

            //计算分辨率缩放倍率
            let number = renderContainerDom.clientWidth / this.cameraRoleGoods.left;
            number = number === Infinity || number == -Infinity ? 1 : number;
            this.zoomMagnification *= number;
            this.tempObject3D.position.x = (this.zoomMagnification * -2);
            this.tempObject3D.position.y = (this.zoomMagnification * -1.1);
            //更新相机
            this.cameraRoleGoods.left = renderContainerDom.clientWidth;
            this.cameraRoleGoods.right = -renderContainerDom.clientWidth;
            this.cameraRoleGoods.top = renderContainerDom.clientHeight;
            this.cameraRoleGoods.bottom = -renderContainerDom.clientHeight;
            this.cameraRoleGoods.updateProjectionMatrix();
        }
    };

    public create() {
        return this.camera;
    }

    public createRoleGoodsCamera() {
        return this.cameraRoleGoods;
    }

    private tempObject3D: THREE.Object3D = new Object3D();

    public async loadRoleCamera(cameraGoods: Object3D) {
        // 物品切换动画
        await gsap.to(this.tempObject3D.position, {
            y: this.tempObject3D.position.y - 1.5,
            duration:0.1,
        });
        // 清除当前手中的物品
        this.cameraRoleGoods.remove(this.tempObject3D);
        // 替换手中的物品
        this.tempObject3D = cameraGoods;
        cameraGoods.position.set(-2 * this.zoomMagnification, -1.1 * this.zoomMagnification - 1.5, -3);
        cameraGoods.rotation.set(2.8, 1.3, 3.3);
        cameraGoods.scale.set(1.5, 1.5, 1.5);
        // 物品切换动画
        gsap.to(this.tempObject3D.position, {
            y: this.tempObject3D.position.y + 1.5,
            duration:0.1,
        });
        // const gui = new dat.GUI();//调试
        // gui.add(cameraGoods.position, "x", -3, 6)
        // gui.add(cameraGoods.position, "y", -3, 6)
        // gui.add(cameraGoods.position, "z", -3, 6)
        // gui.add(cameraGoods.rotation, "x", 0, Math.PI * 2)
        // gui.add(cameraGoods.rotation, "y", 0, Math.PI * 2)
        // gui.add(cameraGoods.rotation, "z", 0, Math.PI * 2)

        // 添加到相机中
        this.cameraRoleGoods.add(cameraGoods);
    }

    // public createCameraBody() {
    //     const cameraShape = new CANNON.Box(new CANNON.Vec3(4 / 2, 8 / 2, 4 / 2));
    //     const cameraBody = new CANNON.Body({
    //         mass: 10000,
    //         shape: cameraShape,
    //         position: this.camera.position as unknown as CANNON.Vec3, //位置
    //         material: new CANNON.Material({friction: 0.5, restitution: 0}),
    //     });
    //     return {mesh: this.camera, body: cameraBody}
    // }

}