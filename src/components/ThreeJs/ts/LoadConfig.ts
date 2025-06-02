import {GLTF, GLTFLoader} from "three/examples/jsm/loaders/GLTFLoader";
import {modelConfig} from "@/components/ThreeJs/ts/ModelConfig";
import {
    BackSide,
    Box3,
    BoxGeometry,
    BufferGeometry,
    Material,
    Mesh,
    MeshBasicMaterial,
    Object3D,
    Vector3
} from "three";
import {ConvexGeometry} from "three/examples/jsm/geometries/ConvexGeometry";
import {SimplifyModifier} from "three/examples/jsm/modifiers/SimplifyModifier";
import {physicalObjects, physicalWorld, worldOctree, worldRayObjects, worldScene} from "@/components/ThreeJs/ts/Global";
import {mergeGeometries} from "three/examples/jsm/utils/BufferGeometryUtils";
import {Shape} from "shapes/Shape";
import * as CANNON from "cannon-es";

const loaders = {
    "gltf": new GLTFLoader()
}

export type funcKey = keyof typeof hitboxCreator;
export const hitboxCreator = {
    AABB: (mesh: Mesh) => {
        //AABB盒子
        const box3 = new Box3().setFromObject(mesh);
        const size = box3.getSize(new Vector3());
        const [width, height, depth] = [size.x, size.y, size.z];
        const geometry = new BoxGeometry(width, height, depth);
        const hitBox = new Mesh(geometry);
        const center = box3.getCenter(new Vector3());
        hitBox.position.copy(center);
        return hitBox;
    },
    convex: (mesh: Mesh) => {
        const vertices: Vector3[] = [];
        const position = mesh.geometry.attributes.position;
        for (let i = 0; i < position.count; i++) {
            const [x, y, z] = [position.getX(i), position.getY(i), position.getZ(i)]
            vertices.push(new Vector3(x, y, z));
        }
        const geometry = new ConvexGeometry(vertices);
        const hitbox = new Mesh(geometry);
        hitbox.position.copy(mesh.position);
        hitbox.scale.copy(mesh.scale);
        hitbox.rotation.copy(mesh.rotation);
        return hitbox;
    },
    simplify: (mesh: Mesh) => {
        // 精简模型
        const simplifyModifier = new SimplifyModifier();
        const hitBox = mesh.clone();
        hitBox.geometry = simplifyModifier.modify(hitBox.geometry, 0);
        hitBox.material = new MeshBasicMaterial({color: 0x000000, wireframe: true, transparent: true});
        return hitBox;
    },
    OBB: (mesh: Mesh) => {
        return mesh;
    }
} as const;

type I_CANNONShape = {
    type: "Cylinder",
    radiusTop: number,
    radiusBottom: number,
    height: number,
    numSegments: number,
    mass: number,
} | {
    type: "Sphere",
    radius: number,
    mass: number,
} | {
    type: "Box",
    x: number,
    y: number,
    z: number,
    mass: number,
} | {
    type: "AABB",
    mass: number,
} | {
    type: "convex",
    mass: number,
}

export const loadModelCfg = () => {
    modelConfig.forEach((config) => {
        loaders[config.modelType].load(config.url, (model:GLTF) => {
            if (!config.position) config.position = {x: 0, y: 0, z: 0};
            if (!config.rotation) config.rotation = {x: 0, y: 0, z: 0};
            if (!config.scale) config.scale = {x: 1, y: 1, z: 1};
            const meshList: BufferGeometry[] = [];
            const materialList: Material[] = [];
            model.scene.traverse((child: Object3D) => {
                if (child.isObject3D && (child) instanceof Mesh) {
                    //自发光
                    // child.material.emissive =  child.material.color;
                    // child.material.emissiveMap = child.material.map ;
                    //消除光线条纹
                    child.material.shadowSide = BackSide;
                    meshList.push(child.geometry);
                    materialList.push(child.material);
                }
            });
            //合并
            const mergedGeometries = mergeGeometries(meshList, true);
            mergedGeometries.computeVertexNormals();
            const mesh = new Mesh(mergedGeometries, materialList);
            mesh.name = config.name;
            mesh.position.set(config.position.x, config.position.y, config.position.z);
            mesh.rotation.set(config.rotation.x, config.rotation.y, config.rotation.z);
            mesh.scale.set(config.scale.x, config.scale.y, config.scale.z);
            mesh.userData.pickup = config.pickup;
            mesh.userData.type = config.itemType;
            mesh.userData.infoList = config.infoList;
            if (config.hitbox?.collision){
                console.log(mesh)
                const hitbox = hitboxCreator[config.hitbox.type](mesh);
                worldOctree.fromGraphNode(hitbox);
            }
            if (config.body?.collision) {
                const position = new CANNON.Vec3(config.position.x, config.position.y, config.position.z)
                const body = createBody( config.body, mesh, position);
                physicalWorld.addBody(body);
                physicalObjects.push({body, mesh});
            }
            if (config.pickup) {
                worldRayObjects.push(mesh);
            }
            worldScene.add(mesh);
        });
    });

    const createBody = (shapeOption:I_CANNONShape,mesh:Mesh,position: CANNON.Vec3) => {
        const createShapeBody = (shape: Shape) => {
            return new CANNON.Body({
                mass: shapeOption.mass,
                shape: shape,
                position: position,
            });
        };
        if (shapeOption.type === "Cylinder") {
            const shape = new CANNON.Cylinder(
                shapeOption.radiusTop,
                shapeOption.radiusBottom,
                shapeOption.height,
                shapeOption.numSegments
            );
            return createShapeBody(shape)
        } else if (shapeOption.type === "Sphere") {
            const shape = new CANNON.Sphere(shapeOption.radius);
            return createShapeBody(shape)
        } else if (shapeOption.type === "Box") {
            const shape = new CANNON.Box(new CANNON.Vec3(shapeOption.x, shapeOption.y, shapeOption.z));
            return createShapeBody(shape)
        } else if (shapeOption.type === "AABB") {
            const box3 = new Box3().setFromObject(mesh);
            const size = box3.getSize(new Vector3());
            const [width, height, depth] = [size.x, size.y, size.z];
            const shape = new CANNON.Box(new CANNON.Vec3(width / 2, height / 2, depth / 2));
            return createShapeBody(shape)
        } else if (shapeOption.type === "convex") {
            const aabbMesh = hitboxCreator.convex(mesh);
            const vertices = Array.from(aabbMesh.geometry.attributes.position.array);
            const indices: number[] = [];
            for (let i = 0; i < vertices.length / 3; i++) {
                indices.push(i);
            }
            const trimester = new CANNON.Trimesh(vertices, indices);
            return new CANNON.Body({shape: trimester});
        } else {
            return createShapeBody(new CANNON.Sphere(1));
        }
    }
}
