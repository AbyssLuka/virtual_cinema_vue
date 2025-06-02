type I_ModelConfig = {
    name: string,
    modelType: string,
    itemType: string,
    url: string,
    position?: Vec3,
    rotation?: Vec3,
    scale?: Vec3,
    active?: string,
    hitbox?: Collision,
    body?: I_CANNONShape & Collision,
    pickup?: boolean,
    infoList?: string[]
}
type Collision = {collision: boolean, type: string}
type Mass = {mass: number}
type I_Cylinder = {
    type: "Cylinder",
    radiusTop: number,
    radiusBottom: number,
    height: number,
    numSegments: number,
}
type Vec3 = {
    x: number,
    y: number,
    z: number,
}
type I_Sphere = {
    type: "Sphere",
    radius: number,
}
type I_Box = {type: "Box"}&Vec3
type I_AABB = {type: "AABB"}
type I_Convex = {type: "AABB"}
type I_CANNONShape  = (I_Cylinder|I_Sphere|I_Box|I_AABB|I_Convex)&Mass

export const modelConfig:I_ModelConfig[] = [
    {
        name: "teapoy",
        modelType: "gltf",
        itemType: "gltf",
        url: "/3d/model/room/teapoy.glb",
        position: {x: 5, y:-3.8, z:5},
        hitbox: {
            collision: true,
            type: "AABB"
        },
        body:{
            collision: true,
            type:"AABB",
            mass: 0,
        },
    },
    {
        name: "CocaCola",
        modelType: "gltf",
        itemType: "COLA",
        url: "/3d/model/room/cola.glb",
        position: {x: 5.5, y:4, z:5},
        active: "pickup",
        body:{
            type:"Cylinder",
            collision: true,
            radiusTop: 1 / 3,
            radiusBottom: 1 / 3,
            height: 1,
            numSegments: 20,
            mass: 1
        },
        pickup:true,
    },
    {
        name: "soundbar",
        modelType: "gltf",
        itemType: "",
        url: "/3d/model/room/soundbar.glb",
        position: {x: 0, y:-2, z:-24},
        hitbox: {
            collision: true,
            type: "AABB"
        },
    },
    {
        name: "tv_cabinet",
        modelType: "gltf",
        itemType: "",
        url: "/3d/model/room/tv_cabinet.glb",
        position: {x: 0, y:-3.7, z:-23},
        hitbox: {
            collision: true,
            type: "AABB"
        },
    },
    {
        name: "teapoy2",
        modelType: "gltf",
        itemType: "",
        url: "/3d/model/room/teapoy2.glb",
        position: {x: 24, y:-5, z:11},
        rotation: {x: 0, y: Math.PI * (3 / 2), z: 0},
        hitbox: {
            collision: true,
            type: "AABB"
        },
    },
    {
        name: "bookshelf",
        modelType: "gltf",
        itemType: "",
        url: "/3d/model/room/bookshelf.glb",
        position: {x: 24.1, y:1.4, z:3.6},
        rotation: {x: Math.PI / 2, y: 0, z: Math.PI / 2},
        hitbox: {
            collision: true,
            type: "AABB"
        },
    },
]