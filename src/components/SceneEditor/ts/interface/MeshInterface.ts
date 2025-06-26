import {BufferGeometry, Euler, Layers, Material, Matrix3, Matrix4, Object3D, Vector3} from "three";

export interface I_Object3D {
    id: Object3DProperty<number>
    type: Object3DProperty<string>
    name: Object3DProperty<String>
    uuid: Object3DProperty<string>
    position: Object3DProperty<Vector3>
    rotation: Object3DProperty<Euler>
    scale: Object3DProperty<Vector3>
    renderOrder: Object3DProperty<number>
    up: Object3DProperty<Vector3>
    castShadow: Object3DProperty<boolean>
    receiveShadow: Object3DProperty<boolean>
    customDepthMaterial: Object3DProperty<Material|undefined>
    customDistanceMaterial: Object3DProperty<Material|undefined>
    frustumCulled: Object3DProperty<boolean>
    layers: Object3DProperty<Layers>
    matrix: Object3DProperty<Matrix4>
    matrixAutoUpdate: Object3DProperty<boolean>
    matrixWorld: Object3DProperty<Matrix4>
    matrixWorldAutoUpdate: Object3DProperty<boolean>
    matrixWorldNeedsUpdate: Object3DProperty<boolean>
    modelViewMatrix: Object3DProperty<Matrix4>
    normalMatrix: Object3DProperty<Matrix3>
    userData: Object3DProperty<Object>;
    visible: Object3DProperty<boolean>;
    isObject3D: Object3DProperty<boolean>;
}

export interface I_Mesh extends I_Object3D {
    isMesh: Object3DProperty<boolean>;
    geometry: Object3DProperty<BufferGeometry>
    material: Object3DProperty<Material | Material[]>;
    morphTargetInfluences: Object3DProperty<Array<number>|undefined>;
    morphTargetDictionary: Object3DProperty<Object|undefined>;
}

export enum Object3DPropertyType {
    String,
    Number,
    Boolean,
    Vector3,
    Matrix4,
    Matrix3,
    Layers,
    BufferGeometry,
    Material,
    Euler,
    Object,
    Array,
}

export interface Object3DProperty<T = any> {
    type: Object3DPropertyType;
    data: T;
    readonly: boolean;
    options?: any[];
}

export const createObject3DProperty = <T extends Object3D, K extends keyof T>(
    object3d: T,
    key: K,
    type: Object3DPropertyType,
    readonly: boolean = false
): Object3DProperty<T[K]> => {

    const property: Object3DProperty<T[K]> = {
        type,
        readonly,
        data: object3d[key]
    };

    return new Proxy(property, {
        get(target, prop) {
            if (prop === 'data') {
                return object3d[key];
            }
            return target[prop];
        },
        set(target, prop, value) {
            if (prop === 'data') {
                object3d[key] = value;
                return true;
            }
            target[prop] = value;
            return true;
        }
    });
}