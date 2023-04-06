import * as THREE from "three";

interface I_Option {
    position: THREE.Vector3,
    name: string,
    active: () => void
}

export class Display {
    private readonly videoDom: HTMLVideoElement;

    constructor(videoDom: HTMLVideoElement) {
        this.videoDom = videoDom;
    }

    async create(option: I_Option) {
        //显示器
        const displayMesh = await Display.createDisplayMesh(this.videoDom);
        displayMesh.name = option.name;
        displayMesh.position.copy(option.position);
        displayMesh.userData.name = option.name;
        displayMesh.userData.active = option.active;
        return displayMesh;
    }

    private static async createDisplayMesh(videoDom: HTMLVideoElement) {
        const displayGeometry = new THREE.BoxGeometry(16, 9, 0.1);
        const videoTexture = new THREE.VideoTexture(videoDom);
        const materialArray = [
            new THREE.MeshBasicMaterial({color: 0x000000}),
            new THREE.MeshBasicMaterial({color: 0x000000}),
            new THREE.MeshBasicMaterial({color: 0x000000}),
            new THREE.MeshBasicMaterial({color: 0x000000}),
            new THREE.MeshBasicMaterial({map: videoTexture}),
            new THREE.MeshBasicMaterial({color: 0x000000}),
        ];
        return new THREE.Mesh(displayGeometry, materialArray);
    }
}