import api from "@/request/api";
import * as CANNON from "cannon-es";
import {BoxGeometry, Mesh, MeshBasicMaterial, MeshStandardMaterial, TextureLoader} from "three";

interface I_Option {
    videoUuid: string,
    position: CANNON.Vec3,
    name?: string,
    type?: string,
    active: () => void,
    infoList?: string[],
}

export class DVD_Box {

    constructor(private readonly option: I_Option) {
    }

    public async create(callback: (mesh: Mesh, body: CANNON.Body) => void) {
        //创建DVD盒子
        const videoInfo = await api.videoApi(this.option.videoUuid);
        if (!videoInfo.data) return;
        const DVDCubeMesh = await DVD_Box.createDVDCube(videoInfo.data.cover);
        const DVDCubeShape = new CANNON.Box(new CANNON.Vec3(1 / 2, 1.5 / 2, 0.2 / 2));
        const DVDCubeBody = new CANNON.Body({
            mass: 1,
            shape: DVDCubeShape,
            position: this.option.position, //位置
        });
        DVDCubeMesh.castShadow = true;
        DVDCubeMesh.receiveShadow = true;
        DVDCubeMesh.name = videoInfo.data.videoName;
        DVDCubeMesh.name = videoInfo.data.videoName;
        DVDCubeMesh.userData.name = this.option.name;
        DVDCubeMesh.userData.type = this.option.type;
        DVDCubeMesh.userData.infoList = this.option.infoList;
        DVDCubeMesh.userData.active = this.option.active;
        DVDCubeMesh.userData.videoUuid = videoInfo.data.videoUuid;
        callback(DVDCubeMesh, DVDCubeBody);
    }

    private static async createDVDCube(imageUuid: string) {
        //创建盒子
        const cubeGeometry = new BoxGeometry(1, 1.5, 0.1);
        if (imageUuid) {
            //材质图片
            const url: string = await api.imageObjUrl(imageUuid) as string;
            //创建纹理
            const cubeCoverTexture = new TextureLoader().load(
                url, (texture) => {
                    texture.center.set(0.5, 0.5);
                    texture.repeat.set(0.47, 1);
                    texture.offset.set(0.265, 0);
                }
            );
            const cubeBackCoverTexture = new TextureLoader().load(
                url, (texture) => {
                    texture.center.set(0.5, 0.5);
                    texture.repeat.set(0.47, 1);
                    texture.offset.set(-0.265, 0);
                }
            );
            const cubeLeftCoverTexture = new TextureLoader().load(
                url, (texture) => {
                    texture.center.set(0.5, 0.5);
                    texture.repeat.set(0.06, 1);
                }
            );

            //创建材质
            const cubeCoveMaterial = new MeshStandardMaterial({map: cubeCoverTexture,});
            const cubeBackMaterial = new MeshStandardMaterial({map: cubeBackCoverTexture,});
            const cubeLeftMaterial = new MeshStandardMaterial({map: cubeLeftCoverTexture,});
            const blackMaterial = new MeshStandardMaterial({color: 0x606060,});
            const materials = [blackMaterial, cubeLeftMaterial, blackMaterial, blackMaterial, cubeCoveMaterial, cubeBackMaterial];
            //创建物体

            return new Mesh(cubeGeometry, materials);
        } else {
            const blackMaterial = new MeshBasicMaterial({color: 0x606060,});
            return new Mesh(cubeGeometry, blackMaterial);
        }
    }
}