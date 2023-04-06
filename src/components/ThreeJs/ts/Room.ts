import * as THREE from "three";
import {AmbientLight, DirectionalLight, Euler, Vector3} from "three";

export class Room {
    constructor() {
        //
    }

    public create(): THREE.Group {
        const homeGroup = new THREE.Group();

        //墙
        const floorMesh = Room.createBox(50, 2, 50, 0xffffff, new Vector3(0, -6.01, 0), new Euler(0, 0, 0));
        homeGroup.add(floorMesh);
        const ceilingMesh = Room.createBox(50, 2, 50, 0xffffff, new Vector3(0, 15, 0), new Euler(0, 0, 0));
        homeGroup.add(ceilingMesh);
        const wallMesh_1 = Room.createBox(2, 20, 50, 0xffffff, new Vector3(26, 5, 0), new Euler(0, 0, 0));
        homeGroup.add(wallMesh_1);
        const wallMesh_2 = Room.createBox(2, 20, 50, 0xffffff, new Vector3(-26, 5, 0), new Euler(0, 0, 0));
        homeGroup.add(wallMesh_2);
        const wallMesh_3 = Room.createBox(2, 20, 50, 0xffffff, new Vector3(0, 5, 26), new Euler(0, Math.PI / 2, 0));
        homeGroup.add(wallMesh_3);
        const wallMesh_4 = Room.createBox(2, 20, 50, 0xffffff, new Vector3(0, 5, -26), new Euler(0, Math.PI / 2, 0));
        homeGroup.add(wallMesh_4);
        const tableGeometry = Room.createBox(20, 3, 3, 0xffffff, new Vector3(0, -4, -23.5), new Euler(0, 0, 0));
        homeGroup.add(tableGeometry);
        const wallpaperMesh = Room.createWallpaper();
        homeGroup.add(wallpaperMesh);

        const audioMeshLeft = Room.createBox(4, 5, 4, 0x000000, new Vector3(-13, -2, -23), new Euler(0, 0, 0));
        homeGroup.add(audioMeshLeft);
        const audioMeshRight = Room.createBox(4, 5, 4, 0x000000, new Vector3(13, -2, -23), new Euler(0, 0, 0));
        homeGroup.add(audioMeshRight);

        const mesh = Room.teaTable();
        homeGroup.add(mesh);

        //点光
        const pointLight = new THREE.PointLight(0xff0000, 0.6, 8, 1);
        const pointLightHelper = new THREE.PointLightHelper(pointLight);
        pointLight.position.set(-5, 5, -24.5);
        pointLight.castShadow = true;
        homeGroup.add(pointLight);
        homeGroup.add(pointLightHelper);

        //环境光
        const ambientLight = new AmbientLight(0xFFFFFF, 0.3);
        homeGroup.add(ambientLight);

        const mesh_test = new THREE.Mesh();
        //聚光灯
        const spotLight = new THREE.SpotLight(0x87A0FF, 0.7, 100, Math.PI / 6, 1, 1);
        spotLight.target = mesh_test;
        mesh_test.position.x = -24;
        spotLight.castShadow = true;
        spotLight.position.set(-25, 14, 0);
        homeGroup.add(spotLight);
        const spotLightHelper = new THREE.SpotLightHelper(spotLight);
        homeGroup.add(spotLightHelper);


        // const mtlLoader = new MTLLoader();
        // mtlLoader.load("/3d/room/Room.mtl", (material) => {
        //     material.preload();
        //     const objLoader = new OBJLoader();
        //     objLoader.setMaterials(material);
        //     objLoader.load("/3d/room/Room.obj", (option) => {
        //         option.scale.set(2,2,2);
        //         option.position.set(0, -7, 0);
        //         homeGroup.add(option);
        //     });
        // });

        // const fbxLoader = new FBXLoader();
        // fbxLoader.load("/3d/room/sofa.fbx", (option) => {
        //     option.scale.set(0.02, 0.02, 0.02);
        //     option.position.set(0, -5.5, 0);
        //     option.castShadow = true;
        //     homeGroup.add(option);
        // });

        // 给场景添加太阳光
        // const Sun = new THREE.DirectionalLight(0xffffff, 1);
        // Sun.position.set(0, 10, 50);
        // Sun.castShadow = true;
        // homeGroup.add(Sun);


        return homeGroup;
    }

    private static createBox(width: number, height: number, depth: number, color: number, position: Vector3, rotation: Euler) {
        const boxGeometry = new THREE.BoxGeometry(width, height, depth);
        const boxMaterial = new THREE.MeshStandardMaterial({color});
        // boxMaterial.metalness =0.45;
        // boxMaterial.roughness =0.65;
        const floorMesh = new THREE.Mesh(boxGeometry, boxMaterial);
        floorMesh.position.copy(position);
        floorMesh.rotation.copy(rotation);
        floorMesh.castShadow = true;
        floorMesh.receiveShadow = true;
        return floorMesh;
    }

    private static createWallpaper(): THREE.Mesh {
        const wallpaperGeometry = new THREE.BoxGeometry(3, 5, 0.1);
        const wallpaperMaterials = [
            new THREE.MeshStandardMaterial({color: 0x000000}),
            new THREE.MeshStandardMaterial({color: 0x000000}),
            new THREE.MeshStandardMaterial({color: 0x000000}),
            new THREE.MeshStandardMaterial({color: 0x000000}),
            new THREE.MeshStandardMaterial({
                map: new THREE.TextureLoader().load(
                    "/3d/room/wallpaper/wallpaper-marisa.jpg"
                )
            }),
            new THREE.MeshStandardMaterial({color: 0x000000}),
        ];
        const wallpaperMesh = new THREE.Mesh(wallpaperGeometry, wallpaperMaterials);
        wallpaperMesh.castShadow = true;
        wallpaperMesh.receiveShadow = true;
        wallpaperMesh.rotation.y = Math.PI / 2;
        wallpaperMesh.position.x = -24.8;
        wallpaperMesh.position.y = 6;
        return wallpaperMesh;
    }

    private static teaTable(): THREE.Mesh {
        const teaTableGeometry = new THREE.BoxGeometry(20, 3, 5);
        const teaTableMaterial = new THREE.MeshStandardMaterial({color: 0xFFFFFF});
        const teaTableMesh = new THREE.Mesh(teaTableGeometry, teaTableMaterial);
        teaTableMesh.castShadow = true;
        teaTableMesh.receiveShadow = true;
        teaTableMesh.position.set(0, -4, -8);
        return teaTableMesh;
    }
}