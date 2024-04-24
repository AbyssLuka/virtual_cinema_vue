import {
    AmbientLight,
    BoxGeometry,
    Euler,
    Group, Mesh, MeshStandardMaterial,
    Object3D,
    PerspectiveCamera, PointLight, PointLightHelper,
    RepeatWrapping,
    Scene, SpotLight,
    TextureLoader,
    Vector3
} from "three";
import {Octree} from "three/examples/jsm/math/Octree";
import * as CANNON from "cannon-es";
import {GLTFAndCANNONLoader} from "@/components/ThreeJs/ts/GLTFAndCANNONLoader";
import {I_PhysicalList} from "@/components/ThreeJs/ts/GameInterface";
import {TVControl} from "@/components/ThreeJs/ts/TVControl";
import {UnwrapNestedRefs, watch} from "vue";
import {Controls} from "@/components/ThreeJs/ts/Controls";
import {Display} from "@/components/ThreeJs/ts/Display";
import {DVD_Box} from "@/components/ThreeJs/ts/DVD_Box";
import api from "@/request/api";
import {I_File} from "@/global/interface";
import {fileTypeList} from "@/global/global";

type InventoryState = {
    inventory: Object3D[],
    current: number,
    emptyObject3D: Object3D,
}

export class initScene {
    private readonly scene: Scene;
    private readonly octree: Octree;
    private readonly world: CANNON.World;
    private readonly physicalObjects_: I_PhysicalList[];
    private readonly worldRayObjects_: Object3D[];

    constructor(
        scene: Scene,
        octree: Octree,
        world: CANNON.World,
        physicalObjects: I_PhysicalList[],
        worldRayObjects: Object3D[]
    ) {
        this.scene = scene;
        this.octree = octree;
        this.world = world;
        this.physicalObjects_ = physicalObjects;
        this.worldRayObjects_ = worldRayObjects;
    }

    public loadGLTFModel(active: () => void) {

        new GLTFAndCANNONLoader({
            url: "/3d/room/cola.glb",
            active: active,
            name: "CocaCola",
            type: "COLA",
            position: new Vector3(5.5, -2.1, 5),
        }).createBody({
            type: "Cylinder",
            radiusTop: 1 / 3,
            radiusBottom: 1 / 3,
            height: 1,
            numSegments: 20,
            mass: 1
        }, (body, mesh) => {
            this.scene.add(mesh);
            this.world.addBody(body);
            this.physicalObjects.push({body, mesh});
            this.worldRayObjects.push(mesh);
        });

        new GLTFAndCANNONLoader({
            url: "/3d/room/teapoy.glb",
            name: "teapoy",
            position: new Vector3(5, -3.8, 5),
        }).createHitBox("AABB", (hitBox, mesh) => {
            this.scene.add(mesh);
            this.octree.fromGraphNode(hitBox);
        }).createBody({
            type: "AABB",
            mass: 0,
        }, (body, mesh) => {
            this.world.addBody(body);
            this.physicalObjects.push({body, mesh});
        });

        new GLTFAndCANNONLoader({
            url: "/3d/room/bookshelf.glb",
            name: "bookshelf",
            position: new Vector3(24.1, 1.4, 3.6),
            rotation: new Euler(Math.PI / 2, 0, Math.PI / 2)
        }).createHitBox("convex", (hitBox, mesh) => {
            this.scene.add(mesh);
            this.octree.fromGraphNode(hitBox);
        });

        new GLTFAndCANNONLoader({
            url: "/3d/room/soundbar.glb",
            name: "soundbar",
            position: new Vector3(0, -2, -24),
            rotation: new Euler(0, 0, 0)
        }).createMesh((mesh) => {
            this.scene.add(mesh);
        });

        new GLTFAndCANNONLoader({
            url: "/3d/room/tv_cabinet.glb",
            name: "tv_cabinet",
            position: new Vector3(0, -3.7, -23),
            rotation: new Euler(0, 0, 0)
        }).createHitBox("AABB", (hitBox, mesh) => {
            this.scene.add(mesh);
            this.octree.fromGraphNode(hitBox);
        });

        new GLTFAndCANNONLoader({
            url: "/3d/room/teapoy2.glb",
            name: "teapoy2",
            position: new Vector3(24, -5, 11),
            rotation: new Euler(0, Math.PI * (3 / 2), 0)
        }).createHitBox("AABB", (hitBox, mesh) => {
            this.scene.add(mesh);
            this.octree.fromGraphNode(hitBox);
            // gui.add(mesh.position,"x",-25,25)
            // gui.add(mesh.position,"y",-25,25)
            // gui.add(mesh.position,"z",-25,25)
        });
    }

    public loadTVControl(
        videoDom: HTMLVideoElement,
        handItemCamera: PerspectiveCamera,
        controlsClass: Controls,
        InventoryState: UnwrapNestedRefs<InventoryState>,
        pickUp: () => void,
        send: (data) => void,
    ) {
        const openGUI = (visible: boolean) => {
            watch(() => InventoryState.current, () => {
                controlsClass.lockAngle(false);
                tvControlClass.visible(false);
            });
            const visible_ = visible ? visible : !tvControlClass.isVisible();
            // 打开GUI时关闭视角转动
            controlsClass.lockAngle(visible_);
            tvControlClass.visible(visible_);
        };
        const tvControlClass = new TVControl({
            position: new Vector3(),
            name: "TVControl",
            type: "TVC",
            active: pickUp,
            openGUI,
            tvVideoDom: videoDom,
            onupdate: (progress, audio, pause) => {
                send({type: "updateVideo", progress, audio, pause});
            },
            infoList:["右击鼠标打开/关闭面板"]
        });
        tvControlClass.create((mesh, body) => {
            handItemCamera.add(tvControlClass.getCSS2D());
            this.scene.add(mesh);
            this.world.addBody(body);
            this.physicalObjects.push({mesh, body});
            this.worldRayObjects.push(mesh)
        });
    }

    public async loadDisplay(displayVideo: HTMLVideoElement, activeFunc: () => void) {
        new Display({
            videoDom: <HTMLVideoElement>displayVideo,
            position: new Vector3(0, 6, -24),
            name: "显示器",
            active: activeFunc,
        }).create((mesh) => {
            this.scene.add(mesh);
            this.worldRayObjects.push(mesh);
        });
    }

    public async requestDVDBox(uuid: string) {
        const resData = await api.animePostApi(uuid);
        let videoFileList: I_File[] = [];
        if (resData.data) videoFileList = resData.data?.detail.fileList.filter(
            (fileItem: I_File) => fileTypeList.video.includes(fileItem.fileType)
        );
        return (pickUp: () => void) => {
            let timeout = -1000;
            videoFileList.forEach((videoFile) => {
                setTimeout(() => {
                    new DVD_Box({
                        position: new CANNON.Vec3(0, 10, 0),
                        type: "DVD",
                        active: pickUp,
                        videoUuid: videoFile.fileUuid,
                        infoList:["对显示器按「E」加载视频"]
                    }).create((mesh, body) => {
                        this.world.addBody(body);
                        this.scene.add(mesh);
                        this.physicalObjects.push({mesh, body});
                        this.worldRayObjects.push(mesh);
                    });
                }, timeout += 500);
            });
        }
    }

    public loadRoom() {
        const group = new Group();
        //纹理 //地板
        const floorTexture = new TextureLoader().load("/3d/room/floor_texture.png");
        //重复平铺
        floorTexture.wrapS = floorTexture.wrapT = RepeatWrapping;
        floorTexture.repeat.x = 10;
        floorTexture.repeat.y = 20;
        //几何体
        const floorBoxGeometry = new BoxGeometry(50, 2, 50);
        //材质
        const floorMaterial = new MeshStandardMaterial({map: floorTexture, roughness: 0.1, metalness: 0});
        //网格模型
        const floorMesh = new Mesh(floorBoxGeometry, floorMaterial);
        //旋转
        floorMesh.rotation.set(0, 0, 0);
        //投射阴影
        floorMesh.castShadow = true;
        // 接收阴影
        floorMesh.receiveShadow = true;
        //位置
        floorMesh.position.set(0, -6.01, 0);

        group.add(floorMesh);

        const ceilingMesh = this.createBox(50, 2, 50, new Vector3(0, 15, 0), new Euler(0, 0, 0));
        group.add(ceilingMesh);
        const wallMesh_1 = this.createBox(2, 20, 50, new Vector3(26, 5, 0), new Euler(0, 0, 0));
        group.add(wallMesh_1);
        const wallMesh_2 = this.createBox(2, 20, 50, new Vector3(-26, 5, 0), new Euler(0, 0, 0));
        group.add(wallMesh_2);
        const wallMesh_3 = this.createBox(2, 20, 50, new Vector3(0, 5, 26), new Euler(0, Math.PI / 2, 0));
        group.add(wallMesh_3);
        const wallMesh_4 = this.createBox(2, 20, 50, new Vector3(0, 5, -26), new Euler(0, Math.PI / 2, 0));
        group.add(wallMesh_4);

        const wallpaperMesh = this.createWallpaper();
        group.add(wallpaperMesh);

        // const audioMeshLeft = this.createBox(4, 5, 4, new Vector3(-15, -2.3, -23), new Euler(0, 0, 0));
        // group.add(audioMeshLeft);
        // const audioMeshRight = this.createBox(4, 5, 4, new Vector3(15, -2.3, -23), new Euler(0, 0, 0));
        // group.add(audioMeshRight);

        //点光
        const pointLight = new PointLight(0xff0000, 0.6, 8, 1);
        const pointLightHelper = new PointLightHelper(pointLight);
        pointLight.position.set(-5, 5, -24.5);
        pointLight.castShadow = true;
        group.add(pointLight);
        group.add(pointLightHelper);

        //环境光
        const ambientLight = new AmbientLight(0xFFFFFF, .5);
        group.add(ambientLight);

        const mesh_test = new Mesh();
        //聚光灯
        const spotLight = new SpotLight(0xffffff, 30, 100, Math.PI / 6, 1, 1);
        spotLight.shadow.mapSize.width = 2048;
        spotLight.shadow.mapSize.height = 2048;
        spotLight.target = mesh_test;
        mesh_test.position.x = 0;
        spotLight.castShadow = true;
        spotLight.position.set(-23, 12, 0);
        spotLight.shadow.camera.near = .1;
        spotLight.shadow.camera.far = 100;
        spotLight.shadow.camera.fov = 75;

        group.add(spotLight);
        // const spotLightHelper = new SpotLightHelper(spotLight);
        // group.add(spotLightHelper);

        // 给场景添加太阳光
        // const sunShine = new DirectionalLight(0xffffff, 1);
        // sunShine.position.set(50, 100, 50);
        // sunShine.castShadow = true;
        // group.add(sunShine);

        // const grid = new GridHelper(100, 20, 0xFF0000, 0xFFFFFF);
        // grid.position.set(0, -5, 0);
        // scene.add(grid);
        // const octreeHelper = new OctreeHelper(worldOctree, new Color(0xff0000));
        // octreeHelper.visible = false;
        // scene.add(octreeHelper);

        this.scene.add(group)
        this.octree.fromGraphNode(group)
    }

    private createBox(width: number, height: number, depth: number, position: Vector3, rotation: Euler) {
        const boxGeometry = new BoxGeometry(width, height, depth);


        const map = new TextureLoader().load("/3d/room/Texturelabs_Brick_142S.jpg");
        map.wrapS = map.wrapT = RepeatWrapping;
        map.repeat.x = 4;
        map.repeat.y = 2;

        const boxMaterial = new MeshStandardMaterial({
            map,
            // normalMap,
            // roughnessMap,
            // displacementMap,
        });
        // boxMaterial.metalness =0.45;
        // boxMaterial.roughness =0.65;
        const boxMesh = new Mesh(boxGeometry, boxMaterial);
        boxMesh.position.copy(position);
        boxMesh.rotation.copy(rotation);
        boxMesh.castShadow = true;
        boxMesh.receiveShadow = true;
        return boxMesh;
    }

    private createWallpaper(): Mesh {
        const wallpaperGeometry = new BoxGeometry(3, 5, 0.1);
        const wallpaperMaterials = [
            new MeshStandardMaterial({color: 0x000000}),
            new MeshStandardMaterial({color: 0x000000}),
            new MeshStandardMaterial({color: 0x000000}),
            new MeshStandardMaterial({color: 0x000000}),
            new MeshStandardMaterial({
                map: new TextureLoader().load(
                    "/3d/room/wallpaper/wallpaper-marisa.jpg"
                )
            }),
            new MeshStandardMaterial({color: 0x000000}),
        ];
        const wallpaperMesh = new Mesh(wallpaperGeometry, wallpaperMaterials);
        wallpaperMesh.castShadow = true;
        wallpaperMesh.receiveShadow = true;
        wallpaperMesh.rotation.y = Math.PI / 2;
        wallpaperMesh.position.x = -24.8;
        wallpaperMesh.position.y = 6;
        return wallpaperMesh;
    }

    get physicalObjects() {
        return this.physicalObjects_;
    }

    get worldRayObjects() {
        return this.worldRayObjects_;
    }
}

/*import * as dat from "dat.gui"*/