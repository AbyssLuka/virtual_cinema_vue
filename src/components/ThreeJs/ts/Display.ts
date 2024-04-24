import {
    BoxGeometry, Group,
    Mesh,
    MeshBasicMaterial,
    Object3D,
    RectAreaLight,
    Vector3,
    VideoTexture
} from "three";
import {RectAreaLightHelper} from "three/examples/jsm/helpers/RectAreaLightHelper";

interface I_Option {
    position: Vector3,
    videoDom: HTMLVideoElement,
    name: string,
    active: () => void
}

export class Display {

    private readonly option: I_Option;

    constructor(option: I_Option) {
        this.option = option;
    }

    public create(callback: (mesh: Object3D) => void) {
        const width = 24;
        const aspectRatio = 16 / 9;
        //显示器
        const displayMesh = Display.createDisplayMesh(this.option.videoDom, width, aspectRatio);
        displayMesh.name = this.option.name;
        displayMesh.position.copy(this.option.position);
        displayMesh.userData.name = this.option.name;
        displayMesh.userData.active = this.option.active;

        const rectAreaLight = new RectAreaLight(0xffffff, 1, width, width / aspectRatio);
        rectAreaLight.rotation.y = Math.PI;
        rectAreaLight.position.copy(displayMesh.position);
        const rectAreaLightHelper = new RectAreaLightHelper(rectAreaLight);
        const group = new Group();
        group.add(rectAreaLight);
        group.add(rectAreaLightHelper);
        group.add(displayMesh);
        callback(group);
    }

    private static createDisplayMesh(videoDom: HTMLVideoElement, width: number, aspectRatio: number) {
        const displayGeometry = new BoxGeometry(width, Math.ceil(width / aspectRatio), 0.1);
        const videoTexture = new VideoTexture(videoDom);
        const blackMaterial = new MeshBasicMaterial({color: 0x000000});
        const materialArray = [
            blackMaterial,
            blackMaterial,
            blackMaterial,
            blackMaterial,
            new MeshBasicMaterial({map: videoTexture}),
            blackMaterial,
        ];
        return new Mesh(displayGeometry, materialArray);
    }
}