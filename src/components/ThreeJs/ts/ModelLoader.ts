import {GLTF, GLTFLoader} from "three/examples/jsm/loaders/GLTFLoader";
import {
    BackSide, Box3, BoxGeometry,
    BufferGeometry,
    Material,
    Mesh,
    MeshBasicMaterial,
    Object3D,
    Vector3
} from "three";
import * as CANNON from "cannon-es";
import {mergeGeometries} from "three/examples/jsm/utils/BufferGeometryUtils"
import {Euler} from "three/src/math/Euler";
import {Shape} from "shapes/Shape";
import {funcKey, hitboxCreator} from "@/components/ThreeJs/ts/LoadConfig";

// import {OBB} from "three/examples/jsm/math/OBB";

interface I_Option {
    position: Vector3,
    rotation: Euler,
    scale: Vector3,
    url: string,
    name: string,
    type: string,
    pickup: boolean,
    active: (() => void) | undefined,
    infoList?: string[]
}

interface I_Option_ {
    position?: Vector3,
    rotation?: Euler,
    scale?: Vector3,
    url?: string,
    name?: string,
    type?: string,
    active?: (() => void) | undefined,
    pickup?: boolean,
    infoList?: string[]
}

export class ModelLoader {
    private readonly option: I_Option;
    private object: Mesh | undefined;
    private body: CANNON.Body | undefined;
    private hitbox: Mesh | undefined;

    constructor(option: I_Option_) {
        const defaultOption = {
            position: new Vector3(0, 0, 0),
            rotation: new Euler(0, 0, 0),
            scale: new Vector3(1, 1, 1),
            name: "",
            type: "?",
            url: "",
            pickup: false,
            infoList: [],
            active:()=>{},
        };
        this.option = {
            ...defaultOption,
            ...option,
        };
    }

    public createMesh(callback: (mesh: Mesh) => void) {
        if (this.object) {
            callback(this.object);
            return this;
        }
        new GLTFLoader().load(this.option.url, (gltf: GLTF) => {
            const meshList: BufferGeometry[] = [];
            const materialList: Material[] = [];
            gltf.scene.traverse((child: Object3D) => {
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
            // mesh.frustumCulled = false;
            mesh.castShadow = true;
            mesh.receiveShadow = true;
            mesh.position.copy(this.option.position);
            mesh.rotation.copy(this.option.rotation);
            mesh.scale.copy(this.option.scale);
            mesh.name = this.option.name;
            mesh.userData.type = this.option.type;
            mesh.userData.active = this.option.active;
            mesh.userData.infoList = this.option.infoList;
            mesh.userData.pickup = this.option.pickup;
            this.object = mesh;
            callback(mesh);
        });
        return this;
    }

    public createHitBox(type: funcKey, callback: (hitBox: Mesh, mesh: Mesh) => void) {
        if (this.hitbox && this.object) {
            callback(this.hitbox, this.object);
            return this;
        }

        if (this.object) {
            this.hitbox = hitboxCreator[type](this.object);
            callback(this.hitbox, this.object);
        } else this.createMesh((mesh: Mesh) => {
            this.hitbox = hitboxCreator[type](mesh);
            callback(this.hitbox, mesh);
        });
        return this;
    }

    public createBody(shapeOption: I_CANNONShape, callback: (body: CANNON.Body, mesh: Mesh) => void) {
        if (this.body && this.object) {
            callback(this.body, this.object);
            return this;
        }
        const createShapeBody = (shape: Shape) => {
            return new CANNON.Body({
                mass: shapeOption.mass,
                shape: shape,
                position: <unknown>this.option.position as CANNON.Vec3,
            });
        };
        const createMeshBody = (mesh: Mesh) => {
            if (shapeOption.type === "Cylinder") {
                const shape = new CANNON.Cylinder(
                    shapeOption.radiusTop,
                    shapeOption.radiusBottom,
                    shapeOption.height,
                    shapeOption.numSegments
                );
                callback(createShapeBody(shape), mesh)
            } else if (shapeOption.type === "Sphere") {
                const shape = new CANNON.Sphere(shapeOption.radius);
                callback(createShapeBody(shape), mesh)
            } else if (shapeOption.type === "Box") {
                const shape = new CANNON.Box(new CANNON.Vec3(shapeOption.x, shapeOption.y, shapeOption.z));
                callback(createShapeBody(shape), mesh)
            } else if (shapeOption.type === "AABB") {
                const box3 = new Box3().setFromObject(mesh);
                const size = box3.getSize(new Vector3());
                const [width, height, depth] = [size.x, size.y, size.z];
                const shape = new CANNON.Box(new CANNON.Vec3(width / 2, height / 2, depth / 2));
                callback(createShapeBody(shape), mesh);
            } else if (shapeOption.type === "convex") {
                const aabbMesh = hitboxCreator.convex(mesh);
                const vertices = Array.from(aabbMesh.geometry.attributes.position.array);
                const indices: number[] = [];
                for (let i = 0; i < vertices.length / 3; i++) {
                    indices.push(i);
                }
                const trimesh = new CANNON.Trimesh(vertices, indices);
                const body = new CANNON.Body({shape: trimesh,});
                callback(body, mesh);
            } else {
                callback(createShapeBody(new CANNON.Sphere(1)), mesh);
            }
        }
        if (this.object) {
            createMeshBody(this.object);
        } else this.createMesh((mesh: Mesh) => {
            createMeshBody(mesh);
        });
        return this;
    }

}

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