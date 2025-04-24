import {
    AmbientLight,
    BoxGeometry,
    Euler,
    Group,
    Mesh,
    MeshStandardMaterial,
    PointLight,
    PointLightHelper,
    RepeatWrapping,
    Scene,
    SpotLight,
    TextureLoader,
    Vector3,
    PlaneGeometry,
    ShaderMaterial,
    DoubleSide,
    BufferAttribute,
    BufferGeometry,
    FogExp2,
    SpriteMaterial,
    Sprite, AdditiveBlending, Light
} from "three";
import {Octree} from "three/examples/jsm/math/Octree";
import * as CANNON from "cannon-es";
import {GLTFAndCANNONLoader} from "@/components/ThreeJs/ts/GLTFAndCANNONLoader";
import {TVControl} from "@/components/ThreeJs/ts/TVControl";
import {watch} from "vue";
import {Display} from "@/components/ThreeJs/ts/Display";
import {DVD_Box} from "@/components/ThreeJs/ts/DVD_Box";
import api from "@/request/api";
import {I_File} from "@/global/interface";
import {fileTypeList} from "@/global/global";
import {createNoise2D} from "simplex-noise";
import grassShader from "@/components/ThreeJs/shaders/GrassShader";
import {Lensflare, LensflareElement} from "three/examples/jsm/objects/Lensflare";
import {cameraClass, controlsClass, inventoryState} from "@/components/ThreeJs/ts/Global";
import {worldRayObjects, physicalObjects} from "@/components/ThreeJs/ts/Global";
import {Grass} from "@/components/ThreeJs/ts/Grass";

export class InitScene {

    private noise2D = createNoise2D(() => 0.4389958785683823);

    constructor(
        private readonly scene: Scene,
        private readonly octree: Octree,
        private readonly world: CANNON.World,
    ) {}

    public loadGLTFModel(active: () => void) {

        new GLTFAndCANNONLoader({
            url: "/3d/room/model/cola.glb",
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
            physicalObjects.push({body, mesh});
            worldRayObjects.push(mesh);
        });

        new GLTFAndCANNONLoader({
            url: "/3d/room/model/teapoy.glb",
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
            physicalObjects.push({body, mesh});
        });

        new GLTFAndCANNONLoader({
            url: "/3d/room/model/bookshelf.glb",
            name: "bookshelf",
            position: new Vector3(24.1, 1.4, 3.6),
            rotation: new Euler(Math.PI / 2, 0, Math.PI / 2)
        }).createHitBox("convex", (hitBox, mesh) => {
            this.scene.add(mesh);
            this.octree.fromGraphNode(hitBox);
        });

        new GLTFAndCANNONLoader({
            url: "/3d/room/model/soundbar.glb",
            name: "soundbar",
            position: new Vector3(0, -2, -24),
            rotation: new Euler(0, 0, 0)
        }).createMesh((mesh) => {
            this.scene.add(mesh);
        });

        new GLTFAndCANNONLoader({
            url: "/3d/room/model/tv_cabinet.glb",
            name: "tv_cabinet",
            position: new Vector3(0, -3.7, -23),
            rotation: new Euler(0, 0, 0)
        }).createHitBox("AABB", (hitBox, mesh) => {
            this.scene.add(mesh);
            this.octree.fromGraphNode(hitBox);
        });

        new GLTFAndCANNONLoader({
            url: "/3d/room/model/teapoy2.glb",
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
        pickUp: () => void,
        send: (data) => void,
    ) {
        const openGUI = (visible: boolean) => {
            watch(() => inventoryState.current, () => {
                controlsClass.lockAngle(false);
                tvControlClass.visible = false;
            });
            const visible_ = visible ? visible : !tvControlClass.isVisible;
            // 打开GUI时关闭视角转动
            controlsClass.lockAngle(visible_);
            tvControlClass.visible = visible_;
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
            infoList: ["右击鼠标打开/关闭面板"]
        });
        tvControlClass.create((mesh, body) => {
            // InventoryState.inventory[0] = mesh;
            this.scene.add(mesh);
            this.world.addBody(body);
            physicalObjects.push({mesh, body});
            worldRayObjects.push(mesh);
            cameraClass.itemCamera.add(tvControlClass.CSS2D);

            inventoryState.inventory[0] = mesh;
            cameraClass.loadItem(inventoryState.inventory[0].clone()).then();

            console.log(inventoryState)
        });
    }

    public async loadDisplay(displayVideo: HTMLVideoElement, activeFunc: () => void) {
        new Display({
            videoDom: displayVideo,
            position: new Vector3(0, 6, -24),
            name: "显示器",
            active: activeFunc,
        }).create((mesh) => {
            this.scene.add(mesh);
            worldRayObjects.push(mesh);
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
                        infoList: ["对显示器按「E」加载视频"]
                    }).create((mesh, body) => {
                        this.world.addBody(body);
                        this.scene.add(mesh);
                        physicalObjects.push({mesh, body});
                        worldRayObjects.push(mesh);
                    });
                }, timeout += 500);
            });
        }
    }

    public loadRoom() {
        const group = new Group();
        //纹理 //地板
        const floorTexture = new TextureLoader().load("/3d/room/texture/floor_texture.png");
        //重复平铺
        floorTexture.wrapS = floorTexture.wrapT = RepeatWrapping;
        floorTexture.repeat.x = 10;
        floorTexture.repeat.y = 20;
        const floorBoxGeometry = new BoxGeometry(75, 2, 75);
        const floorMaterial = new MeshStandardMaterial({
            map: floorTexture,
            fog: true
        });
        const floorMesh = new Mesh(floorBoxGeometry, floorMaterial);
        floorMesh.rotation.set(0, 0, 0);
        floorMesh.castShadow = true;
        floorMesh.receiveShadow = true;
        floorMesh.position.set(0, -6.01, 0);
        group.add(floorMesh);

        const ceilingMesh = this.createBox(50, 2, 50, new Vector3(0, 15, 0), new Euler(0, 0, 0));
        group.add(ceilingMesh);
        const wallMesh_1 = this.createBox(2, 20, 50, new Vector3(26, 5, 0), new Euler(0, 0, 0));
        group.add(wallMesh_1);
        const wallMesh_2 = this.createBox(2, 20, 50, new Vector3(-26, 5, 0), new Euler(0, 0, 0));
        group.add(wallMesh_2);
        // const wallMesh_3 = this.createBox(2, 20, 50, new Vector3(0, 5, 26), new Euler(0, Math.PI / 2, 0));
        // group.add(wallMesh_3);
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
        this.addLensflare()(pointLight);
        pointLight.position.set(-50, 5, 50);
        pointLight.castShadow = true;
        group.add(pointLight);
        group.add(pointLightHelper);

        //环境光
        const ambientLight = new AmbientLight(0xFFFFFF, 1);
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

        // const grid = new GridHelper(100, 20, 0xFF0000, 0xFFFFFF);
        // grid.position.set(0, -5, 0);
        // scene.add(grid);
        // const octreeHelper = new OctreeHelper(worldOctree, new Color(0xff0000));
        // octreeHelper.visible = false;
        // scene.add(octreeHelper);

        // const directionalLight = new DirectionalLight(0xffffff, 0.1);
        // directionalLight.position.set(0, 1000, 0);
        // directionalLight.castShadow = true;
        // this.scene.add(directionalLight);

        this.scene.fog = new FogExp2(0x232323, 0.005);
        // const color = "#232323"
        this.scene.add(group)
        this.octree.fromGraphNode(group)
    }

    private createBox(width: number, height: number, depth: number, position: Vector3, rotation: Euler) {
        const boxGeometry = new BoxGeometry(width, height, depth);
        const map = new TextureLoader().load("/3d/room/texture/Brick_142S.jpg");
        map.wrapS = map.wrapT = RepeatWrapping;
        map.repeat.x = 4;
        map.repeat.y = 2;
        const boxMaterial = new MeshStandardMaterial({
            map,
            fog: true,
        });
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
            new MeshStandardMaterial({color: 0x000000, fog: true}),
            new MeshStandardMaterial({color: 0x000000, fog: true}),
            new MeshStandardMaterial({color: 0x000000, fog: true}),
            new MeshStandardMaterial({color: 0x000000, fog: true}),
            new MeshStandardMaterial({
                map: new TextureLoader().load(
                    "/3d/room/texture/wallpaper-marisa.jpg"
                ),
                fog: true
            }),
            new MeshStandardMaterial({color: 0x000000, fog: true}),
        ];
        const wallpaperMesh = new Mesh(wallpaperGeometry, wallpaperMaterials);
        wallpaperMesh.castShadow = true;
        wallpaperMesh.receiveShadow = true;
        wallpaperMesh.rotation.y = Math.PI / 2;
        wallpaperMesh.position.x = -24.8;
        wallpaperMesh.position.y = 6;
        return wallpaperMesh;
    }

    public createTerrain() {
        const worldWidth = 25;
        const worldDepth = 25;
        const geometry = new PlaneGeometry(worldWidth, worldDepth, 128, 128);
        //应用噪声到PlaneGeometry
        // const vertices = geometry.attributes.position.array;
        //
        // let [a, b] = [1, 1];
        // for (let i = 0; i < vertices.length; i += 3) {
        //     vertices[i + 2] = this.noise2D(vertices[i] * a, vertices[i + 1] * a) * b;
        //     a *= 1;
        //     b *= 1;
        // }

        geometry.attributes.position.needsUpdate = true;
        const texture = new TextureLoader().load("/3d/texture/grass.jpg");
        const material = new MeshStandardMaterial({map: texture, fog: true});
        const mesh = new Mesh(geometry, material);
        mesh.rotation.x = -Math.PI / 2;
        mesh.position.set(0, -5, 0);
        mesh.scale.set(12, 12, 12);
        mesh.receiveShadow = true;
        this.octree.fromGraphNode(mesh);
        this.scene.add(mesh);
        // this.generateGrass();

        // new Grass(this.scene, mesh);
    }

    public loadMoon() {
        const texture = new TextureLoader().load('/3d/texture/sprite.png')
        const spriteMaterial = new SpriteMaterial({
            map: texture,
            color: 0xfffee1,
            blending: AdditiveBlending,
            transparent: true
        });
        const sprite = new Sprite(spriteMaterial);
        const group = new Group();
        const pointLight = new PointLight(0xd6ecf0, 100, 10000, 1);
        pointLight.position.set(0, 0, 0);
        pointLight.castShadow = true;
        group.add(pointLight);
        sprite.scale.set(10, 10, 10);
        group.position.copy(new Vector3(0, 150, 150));
        group.add(sprite);
        this.scene.add(group);
    }

    public addLensflare() {
        const textureLoader = new TextureLoader();
        const textureFlare0 = textureLoader.load('/3d/texture/light_0.png');
        const textureFlare1 = textureLoader.load('/3d/texture/light_1.png');
        return (light: Light) => {
            const lensflare = new Lensflare();
            lensflare.addElement(new LensflareElement(textureFlare0, 700, 0, light.color));
            lensflare.addElement(new LensflareElement(textureFlare1, 60, 0.6));
            lensflare.addElement(new LensflareElement(textureFlare1, 70, 0.7));
            lensflare.addElement(new LensflareElement(textureFlare1, 120, 0.9));
            lensflare.addElement(new LensflareElement(textureFlare1, 70, 1));
            light.add(lensflare);
        }
    }

    public generateGrass() {
        // Parameters
        const PLANE_SIZE = 8;
        const BLADE_COUNT = 1000;
        const BLADE_WIDTH = 0.1;
        const BLADE_HEIGHT = 0.8;
        const BLADE_HEIGHT_VARIATION = 0.6;

        const grassTexture = new TextureLoader().load('/3d/texture/grass.jpg');
        const cloudTexture = new TextureLoader().load('/3d/texture/cloud.jpg');
        cloudTexture.wrapS = cloudTexture.wrapT = RepeatWrapping;

        const timeUniform = {type: 'f', value: 0.0};

        const grassUniforms = {
            textures: {value: [grassTexture, cloudTexture]},
            iTime: timeUniform
        };
        const grassMaterial = new ShaderMaterial({
            uniforms: grassUniforms,
            vertexShader: grassShader.vert,
            fragmentShader: grassShader.frag,
            vertexColors: true,
            side: DoubleSide,
        });
        const convertRange = (val: number, oldMin: number, oldMax: number, newMin: number, newMax: number) => {
            return (((val - oldMin) * (newMax - newMin)) / (oldMax - oldMin)) + newMin;
        }
        const generateField = () => {
            const positions: number[] = [];
            const uvs: number[] = [];
            const indices: number[] = [];
            const colors: number[] = [];

            for (let i = 0; i < BLADE_COUNT; i++) {
                const VERTEX_COUNT = 5;
                const surfaceMin = PLANE_SIZE / 2 * -1;
                const surfaceMax = PLANE_SIZE / 2;

                const radius = PLANE_SIZE / 2;
                const r = radius * Math.pow(Math.random(), 2);
                const theta = Math.random() * 2 * Math.PI;
                const x = r * Math.cos(theta);
                const z = r * Math.sin(theta);

                // const x = Math.random() * (surfaceMax - surfaceMin) + surfaceMin;
                // const z = Math.random() * (surfaceMax - surfaceMin) + surfaceMin;

                const pos = new Vector3(x, this.noise2D(x, z), z);

                const uv = [convertRange(pos.x, surfaceMin, surfaceMax, 0, 1), convertRange(pos.z, surfaceMin, surfaceMax, 0, 1)];

                const blade = generateBlade(pos, i * VERTEX_COUNT, uv);
                blade.verts.forEach(vert => {
                    positions.push(...vert.pos);
                    uvs.push(...vert.uv);
                    colors.push(...vert.color);
                });
                blade.indices.forEach(indice => indices.push(indice));
            }

            const geom = new BufferGeometry();
            geom.setAttribute('position', new BufferAttribute(new Float32Array(positions), 3));
            geom.setAttribute('uv', new BufferAttribute(new Float32Array(uvs), 2));
            geom.setAttribute('color', new BufferAttribute(new Float32Array(colors), 3));
            geom.setIndex(indices);
            geom.computeVertexNormals();
            // geom.computeFaceNormals();

            const mesh = new Mesh(geom, grassMaterial);
            mesh.receiveShadow = true;
            mesh.castShadow = true;
            mesh.position.y = -5.5;
            mesh.position.x = 0;
            mesh.position.z = 20;
            this.scene.add(mesh);
        }
        const generateBlade = (center: Vector3, vArrOffset: number, uv: number[]) => {
            const MID_WIDTH = BLADE_WIDTH * 0.5;
            const TIP_OFFSET = 0.1;
            const height = BLADE_HEIGHT + (Math.random() * BLADE_HEIGHT_VARIATION);

            const yaw = Math.random() * Math.PI * 2;
            const yawUnitVec = new Vector3(Math.sin(yaw), 0, -Math.cos(yaw));
            const tipBend = Math.random() * Math.PI * 2;
            const tipBendUnitVec = new Vector3(Math.sin(tipBend), 0, -Math.cos(tipBend));
            // Find the Bottom Left, Bottom Right, Top Left, Top right, Top Center vertex positions
            const bl = new Vector3().addVectors(center, new Vector3().copy(yawUnitVec).multiplyScalar((BLADE_WIDTH / 2)));
            const br = new Vector3().addVectors(center, new Vector3().copy(yawUnitVec).multiplyScalar((BLADE_WIDTH / 2) * -1));
            const tl = new Vector3().addVectors(center, new Vector3().copy(yawUnitVec).multiplyScalar((MID_WIDTH / 2)));
            const tr = new Vector3().addVectors(center, new Vector3().copy(yawUnitVec).multiplyScalar((MID_WIDTH / 2) * -1));
            const tc = new Vector3().addVectors(center, new Vector3().copy(tipBendUnitVec).multiplyScalar(TIP_OFFSET));
            tl.y += height / 2;
            tr.y += height / 2;
            tc.y += height;
            // Vertex Colors
            const black = [0, 0, 0];
            const gray = [0.5, 0.5, 0.5];
            const white = [1.0, 1.0, 1.0];
            const verts = [
                {pos: bl.toArray(), uv: uv, color: black},
                {pos: br.toArray(), uv: uv, color: black},
                {pos: tr.toArray(), uv: uv, color: gray},
                {pos: tl.toArray(), uv: uv, color: gray},
                {pos: tc.toArray(), uv: uv, color: white}
            ];
            const indices = [
                vArrOffset,
                vArrOffset + 1,
                vArrOffset + 2,
                vArrOffset + 2,
                vArrOffset + 4,
                vArrOffset + 3,
                vArrOffset + 3,
                vArrOffset,
                vArrOffset + 2
            ];
            return {verts, indices};
        }
        generateField();
    }

}
