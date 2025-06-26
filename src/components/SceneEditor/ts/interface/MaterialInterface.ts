import {Color, Material, Texture} from "three";

export interface I_Material {
    id: MaterialProperty<number>
    uuid: MaterialProperty<string>
    type: MaterialProperty<string>
    name: MaterialProperty<string>
    alphaHash: MaterialProperty<boolean>
    alphaTest:MaterialProperty<number>
    opacity: MaterialProperty<number>
    visible: MaterialProperty<boolean>
    userData: MaterialProperty
}

export interface I_MeshBasicMaterial extends I_Material {
    map: MaterialProperty<Texture | null>
    alphaMap: MaterialProperty<Texture | null>
    aoMap: MaterialProperty<Texture | null>
    envMap: MaterialProperty<Texture | null>
    lightMap: MaterialProperty<Texture | null>
    aoMapIntensity: MaterialProperty<number>
    color: MaterialProperty<Color>
    fog: MaterialProperty<boolean>
}

export interface I_MeshStandardMaterial extends I_Material {
    map: MaterialProperty<Texture | null>
    alphaMap: MaterialProperty<Texture | null>
    aoMap: MaterialProperty<Texture | null>
    envMap: MaterialProperty<Texture | null>
    lightMap: MaterialProperty<Texture | null>

    aoMapIntensity: MaterialProperty<number>
    color: MaterialProperty<Color>
    fog: MaterialProperty<boolean>

    emissive: MaterialProperty<Color>
    emissiveMap: MaterialProperty<Texture | null>
    emissiveIntensity: MaterialProperty<number>

    metalness: MaterialProperty<number>
    metalnessMap: MaterialProperty<number>

    normalMap: MaterialProperty<Texture | null>
    normalMapType: MaterialProperty<number>
    normalScale: MaterialProperty<Texture | null>

    roughnessMap: MaterialProperty<number>

    wireframe: MaterialProperty<boolean>
}

export enum MaterialPropertyType {
    String,
    Number,
    Boolean,
    Color,
    Select,
    Texture,
}

export interface MaterialProperty<T = any> {
    type: MaterialPropertyType;
    data: T;
    readonly: boolean;
    options?: any[];
}

export const createMaterialProperty = <T extends Material, K extends keyof T>(
    material: T,
    key: K,
    type: MaterialPropertyType,
    readonly: boolean = false
): MaterialProperty<T[K]> => {

    const property: MaterialProperty<T[K]> = {
        type,
        readonly,
        data: material[key]
    };

    return new Proxy(property, {
        get(target, prop) {
            if (prop === 'data') {
                if (type === MaterialPropertyType.Color) {
                    return `#${(<Color>material[key]).getHexString()}`;
                } else {
                    return material[key];
                }
            }
            return target[prop];
        },
        set(target, prop, value) {
            if (prop === 'data') {
                if (type === MaterialPropertyType.Color) {
                    (<Color>material[key]).set(value);
                } else {
                    material[key] = value;
                }
                material.needsUpdate = true;
                return true;
            }
            target[prop] = value;
            return true;
        }
    });
}