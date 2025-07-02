import {
    AmbientLight,
    BoxGeometry, Color, GridHelper,
    Material,
    Mesh,
    PerspectiveCamera, PlaneGeometry,
    Scene,
    SphereGeometry, Sprite, SpriteMaterial,
    WebGLRenderer
} from "three";

export type PreviewType = "sphere" | "cube" | "plane";

export class PreviewMaterial {
    private readonly previewScene: Scene = new Scene()
    private readonly previewMesh: { [k in PreviewType]: Mesh | Sprite };
    private previewKey: PreviewType = "plane";
    private ambientLight = new AmbientLight(0xffffff, 4);
    private gridHelper = new GridHelper(100, 100, 0xff0000);

    constructor() {
        const cube = new Mesh(new BoxGeometry(1, 1, 1))
        const sphere = new Mesh(new SphereGeometry(1, 32, 32))
        const plane = new Mesh(new PlaneGeometry(1, 1, 32))
        cube.castShadow = true;
        cube.receiveShadow = true;
        sphere.castShadow = true;
        sphere.receiveShadow = true;
        plane.castShadow = true;
        plane.receiveShadow = true;
        this.previewScene.background = new Color(0xcccccc)
        this.renderer.setPixelRatio(1);

        this.previewMesh = {
            cube,
            sphere,
            plane,
        } as const;
        this.reloadMesh();

        this.previewScene.add(this.ambientLight);
        this.gridHelper.position.y = -2
        this.previewScene.add(this.gridHelper);
    }

    private reloadMesh() {
        const values = Object.values(this.previewMesh);
        this.previewScene.remove(...values)
        this.previewScene.add(this.mesh);
        this.render(...this.curWnH)
    }

    get mesh() {
        return this.previewMesh[this.previewKey];
    }

    set material(m: Material | Material[] | SpriteMaterial) {
        this.curMaterial = m;
        this.mesh.material = m;
    }

    set meshType(type: PreviewType) {
        this.previewKey = type;
        this.material = this.curMaterial;
        this.reloadMesh();
    }

    private renderer = new WebGLRenderer();
    private camera = new PerspectiveCamera(
        75, 1, 0.1, 100
    );

    get domElement() {
        return this.renderer.domElement;
    }

    private curWnH: [number, number] = [0, 0];
    private curMaterial: Material|Material[] = [];

    render(w: number, h: number) {
        this.curWnH = [w, h]
        this.gridHelper.visible = true;
        this.camera.position.set(1, 2, 1);
        this.camera.lookAt(0, 0, 0);
        if (this.previewKey === "plane") {
            this.camera.position.set(0, 0, 1)
            this.camera.lookAt(0, 0, 0);
            this.gridHelper.visible = false;
        }
        this.renderer.setSize(w, h);
        this.camera.aspect = w / h;
        this.camera.updateProjectionMatrix();
        this.renderer.render(this.previewScene, this.camera);
    }

    get scene(){
        return this.previewScene;
    }
}