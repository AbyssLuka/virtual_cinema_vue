import {I_ResData, I_Video} from "@/global/interface";
import api from "@/request/api";
import * as CANNON from "cannon-es";
import * as THREE from "three";

interface I_Option {
    position: CANNON.Vec3,
    name?: string,
    type?: string,
    active: () => void,
}

export class DVD_Box {
    private readonly videoUuid: string;

    constructor(videoUuid: string) {
        this.videoUuid = videoUuid;
    }

    public async create(option: I_Option): Promise<{ mesh: THREE.Mesh, body: CANNON.Body }> {
        //创建DVD盒子
        const videoInfo: I_ResData<I_Video> = await api.videoApi(this.videoUuid) as unknown as I_ResData<I_Video>;
        const DVDCubeMesh = await DVD_Box.createDVDCube(videoInfo.data.cover);
        const DVDCubeShape = new CANNON.Box(new CANNON.Vec3(1 / 2, 1.5 / 2, 0.2 / 2));
        const DVDCubeBody = new CANNON.Body({
            mass: 1,
            shape: DVDCubeShape,
            position: option.position, //位置
        });
        DVDCubeMesh.name = videoInfo.data.videoName;
        DVDCubeMesh.name = videoInfo.data.videoName;
        if (option.name) DVDCubeMesh.userData.name = option.name;
        if (option.type) DVDCubeMesh.userData.type = option.type;
        DVDCubeMesh.userData.active = option.active;
        DVDCubeMesh.userData.videoUuid = videoInfo.data.videoUuid;
        return {mesh: DVDCubeMesh, body: DVDCubeBody}
    }

    private static async createDVDCube(imageUuid: string) {
        //创建盒子
        const cubeGeometry = new THREE.BoxGeometry(1, 1.5, 0.1);
        if (imageUuid) {

            //材质图片
            const url: string = await api.imageObjUrl(imageUuid) as string;
            //创建纹理
            const cubeCoverTexture = new THREE.TextureLoader().load(
                url, function (texture) {
                    texture.center.set(0.5, 0.5);
                    texture.repeat.set(0.47, 1);
                    texture.offset.set(0.265, 0);
                }
            );
            const cubeBackCoverTexture = new THREE.TextureLoader().load(
                url, function (texture) {
                    texture.center.set(0.5, 0.5);
                    texture.repeat.set(0.47, 1);
                    texture.offset.set(-0.265, 0);
                }
            );
            const cubeLeftCoverTexture = new THREE.TextureLoader().load(
                url, function (texture) {
                    texture.center.set(0.5, 0.5);
                    texture.repeat.set(0.06, 1);
                }
            );

            //创建材质
            const cubeCoveMaterial = new THREE.MeshBasicMaterial({map: cubeCoverTexture,});
            const cubeBackMaterial = new THREE.MeshBasicMaterial({map: cubeBackCoverTexture,});
            const cubeLeftMaterial = new THREE.MeshBasicMaterial({map: cubeLeftCoverTexture,});
            const blackMaterial = new THREE.MeshBasicMaterial({color: 0x606060,});
            const materials = [blackMaterial, cubeLeftMaterial, blackMaterial, blackMaterial, cubeCoveMaterial, cubeBackMaterial];
            //创建物体

            return new THREE.Mesh(cubeGeometry, materials);
        } else {
            const blackMaterial = new THREE.MeshBasicMaterial({color: 0x606060,});
            return new THREE.Mesh(cubeGeometry, blackMaterial);
        }
    }
}