import fragment from "@/components/ThreeJs/shaders/glsl/grass/fragment.glsl";
import vertex from "@/components/ThreeJs/shaders/glsl/grass/vertex.glsl";
import {
    BufferGeometry,
    Clock,
    DynamicDrawUsage,
    InstancedBufferAttribute,
    InstancedMesh,
    Mesh,
    MeshStandardMaterial,
    Object3D,
    PlaneGeometry,
    RepeatWrapping,
    Scene,
    ShaderMaterial,
    TextureLoader,
    TypedArray, Vector3
} from "three";
import {DRACOLoader} from "three/examples/jsm/loaders/DRACOLoader";
import {GLTFLoader} from "three/examples/jsm/loaders/GLTFLoader";
import {SimplexNoise} from "three/examples/jsm/math/SimplexNoise";

export class Grass {
    clock = new Clock();
    iTime = {value: 0};
    iScalar = {value: 1};

    length = 140;
    count = this.length * this.length;
    // count = 0;
    dummy = new Object3D();
    grassInstancedMesh?: InstancedMesh;
    randomDiff: number[] = [];

    canvasData?: TypedArray;
    simplex = new SimplexNoise();

    constructor(
        private readonly scene: Scene,
        private readonly floor: Mesh<PlaneGeometry, MeshStandardMaterial>
    ) {
        this.length = Math.sqrt(floor.geometry.parameters.widthSegments * floor.geometry.parameters.heightSegments);
        this.count = 0;
        this.init();
    }

    canvas: HTMLCanvasElement = document.createElement("canvas");

    init() {
        this.loadGrassModel();
        const ctx = this.canvas.getContext('2d');
        const width = 1024;
        const height = 1024;

        if (!ctx) return;
        const imageData = ctx.createImageData(width, height);

        for (let y = 0; y < height; y++) {
            for (let x = 0; x < width; x++) {
                const noiseValue =
                    this.simplex.noise(x / 100, y / 100) +
                    this.simplex.noise(x / 50 + 10000, y / 50 + 10000) * .50 +
                    this.simplex.noise(x / 25 + 1000, y / 25 + 1000) * .25 +
                    this.simplex.noise(x / 25 + 100, y / 25 + 100) * .12 +
                    this.simplex.noise(x / 12 + 10, y / 12 + 10) * .06 +
                    this.simplex.noise(x / 6 + 10, y / 6 + 10) * .03;
                const colorValue = Math.floor((noiseValue + 1) * 127.5);
                //二维映射到一维
                const index = (y * width + x) * 4;
                imageData.data[index] = colorValue;
                imageData.data[index + 1] = colorValue;
                imageData.data[index + 2] = colorValue;
                imageData.data[index + 3] = 255;
                // if(colorValue > 50){
                //     this.count++
                // }
            }
        }
        ctx.putImageData(imageData, 0, 0);

        this.canvas.style.border = "solid #000000 3px"
        this.canvas.style.position = "absolute"
        this.canvas.style.top = "75px";
        this.canvas.style.right = "0";
        this.canvas.addEventListener("dblclick", () => {
            this.asyncGrassProp();
        });
        document.body.appendChild(this.canvas)

        const animation = () => {
            requestAnimationFrame(animation)
            const delta = this.clock.getDelta();
            this.iTime.value += delta;
            // this.canvasData = this.floor.geometry.attributes.position.array;
            ctx && (this.canvasData = ctx.getImageData(0, 0, width, height, {colorSpace: "srgb"}).data);
            // this.asyncGrassProp();
        }
        animation();
    }

    loadGrassModel() {
        const gltfLoader = new GLTFLoader();
        const dracoLoader = new DRACOLoader();
        dracoLoader.setDecoderConfig({type: "js"});
        dracoLoader.setDecoderPath("/js/draco/");
        gltfLoader.setDRACOLoader(dracoLoader);
        gltfLoader.load("/3d/room/model/grass.glb", (gltf) => {
            const mesh = <Mesh>gltf.scene.getObjectByName("grass");
            this.initGrass(mesh.geometry);
        });
    }

    initGrass(geometry: BufferGeometry) {
        const material = new ShaderMaterial({
            fragmentShader: fragment,
            vertexShader: vertex,
            uniforms: {
                iTime: this.iTime,
                grassMap: {
                    value: new TextureLoader().load("/3d/texture/grass.jpg", (t) => {
                        t.wrapS = RepeatWrapping;
                        t.wrapT = RepeatWrapping;
                    }),
                },
                iScalar: this.iScalar,
                pointLightPosition: {value: new Vector3(100, 100, 100),},
                pointLightDistance: {value: 10,},
                pointLightDecay: {value: .01,},
            },
            side: 2,
            defines: {RECIPROCAL_PI: Math.PI,},
        });

        const grassInstancedMesh = new InstancedMesh(geometry, material, this.count);
        // 实例矩阵将每帧更新一次。
        grassInstancedMesh.instanceMatrix.setUsage(DynamicDrawUsage);
        grassInstancedMesh.visible = false;
        this.grassInstancedMesh = grassInstancedMesh;
        this.scene.add(grassInstancedMesh);
        // 将地面的uv传递给每个实例 每个实例获取的uvI属性来读取grassMap的颜色
        const uvI = new InstancedBufferAttribute(new Float32Array(this.count * 2), 2);

        //init
        for (let index = 0; index < this.count; index++) {
            const {array} = this.floor!.geometry.attributes.uv;
            const i2 = index * 2;
            uvI.array[i2] = array[i2];
            uvI.array[i2 + 1] = array[i2 + 1];
            const noise = Math.random() * 2 - 1;
            this.randomDiff.push(noise);
        }
        this.asyncGrassProp();
        this.grassInstancedMesh!.geometry.attributes.uvI = uvI;
        this.grassInstancedMesh!.instanceMatrix.needsUpdate = true;
        this.grassInstancedMesh!.visible = true;
    }

    setGrassMatrix(grassIndex: number, scale: number = 1) {
        const {dummy} = this;
        const {array} = this.floor!.geometry.attributes.position;
        const i = grassIndex * 3;
        const noise = this.randomDiff[grassIndex];
        const vertexPosition = {
            x: array[i] + noise,
            y: array[i + 1] + noise,
            z: array[i + 2]
        };
        // 获取相机位置
        dummy.position.copy(vertexPosition);
        dummy.position.applyMatrix4(this.floor!.matrix);
        dummy.scale.set(scale, scale, scale);
        dummy.rotation.y = noise * Math.PI;
        dummy.updateMatrix();
        this.grassInstancedMesh!.setMatrixAt(grassIndex, dummy.matrix);

    }

    asyncGrassProp() {
        if (!this.grassInstancedMesh) return;
        this.grassInstancedMesh!.visible = true;
        let index = 0;
        // const length = this.length;
        const {width, height} = this.canvas;

        for (let row = 0; row < width; row++) {
            for (let column = 0; column < height; column++) {
                const [x,y] = [row,height]
                // const x = Math.floor((column / length) * width);
                // const y = height - Math.floor((row / length) * height);
                //映射到一维数组
                const i = (x * 4) + (y * width * 4);
                const r = this.canvasData![i];
                this.setGrassMatrix(index, r / 127);
                index++;
            }
        }
        this.grassInstancedMesh!.instanceMatrix.needsUpdate = true;
    }
}