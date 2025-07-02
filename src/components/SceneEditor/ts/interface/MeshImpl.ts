import {Matrix3, Matrix4, Mesh, Object3D, Vector3} from "three";
import {
    createObject3DProperty,
    I_Mesh,
    I_Object3D,
    Object3DPropertyType
} from "@/components/SceneEditor/ts/interface/MeshInterface";

export function createObject3D(object3D: Mesh): I_Mesh;
export function createObject3D(object3D: Object3D): I_Object3D;
export function createObject3D(object3D: Object3D): I_Mesh | I_Object3D {
    const object3DTemplate: I_Object3D = {
        id: createObject3DProperty(object3D, "id", Object3DPropertyType.Number, true),
        name: createObject3DProperty(object3D, "name", Object3DPropertyType.String, false),
        type: createObject3DProperty(object3D, "type", Object3DPropertyType.String, true),
        userData: createObject3DProperty(object3D, "userData", Object3DPropertyType.Object, false),
        visible: createObject3DProperty(object3D, "visible", Object3DPropertyType.Boolean, false),
        isObject3D: createObject3DProperty(object3D, "isObject3D", Object3DPropertyType.Boolean, true),
        castShadow: createObject3DProperty(object3D, "castShadow", Object3DPropertyType.Boolean, false),
        customDepthMaterial: createObject3DProperty(object3D, "customDepthMaterial", Object3DPropertyType.Material, false),
        customDistanceMaterial: createObject3DProperty(object3D, "customDistanceMaterial", Object3DPropertyType.Material, false),
        frustumCulled: createObject3DProperty(object3D, "frustumCulled", Object3DPropertyType.Boolean, false),
        layers: createObject3DProperty(object3D, "layers", Object3DPropertyType.Layers, false),
        matrix: createObject3DProperty(object3D, "matrix", Object3DPropertyType.Matrix4, false),
        matrixAutoUpdate: createObject3DProperty(object3D, "matrixAutoUpdate", Object3DPropertyType.Boolean, false),
        matrixWorld: createObject3DProperty(object3D, "matrixWorld", Object3DPropertyType.Matrix4, false),
        matrixWorldAutoUpdate: createObject3DProperty(object3D, "matrixWorldAutoUpdate", Object3DPropertyType.Boolean, false),
        matrixWorldNeedsUpdate: createObject3DProperty(object3D, "matrixWorldNeedsUpdate", Object3DPropertyType.Boolean, false),
        modelViewMatrix: createObject3DProperty(object3D, "modelViewMatrix", Object3DPropertyType.Matrix4, true),
        normalMatrix: createObject3DProperty(object3D, "normalMatrix", Object3DPropertyType.Matrix3, true),
        position: createObject3DProperty(object3D, "position", Object3DPropertyType.Vector3, false),
        receiveShadow: createObject3DProperty(object3D, "receiveShadow", Object3DPropertyType.Boolean, false),
        renderOrder: createObject3DProperty(object3D, "renderOrder", Object3DPropertyType.Number, false),
        rotation: createObject3DProperty(object3D, "rotation", Object3DPropertyType.Euler, false),
        scale: createObject3DProperty(object3D, "scale", Object3DPropertyType.Vector3, false),
        up: createObject3DProperty(object3D, "up", Object3DPropertyType.Vector3, false),
        uuid: createObject3DProperty(object3D, "uuid", Object3DPropertyType.String, true),
    }
    if (object3D.type === "Mesh") {
        const mesh = <Mesh>object3D;
        return {
            ...object3DTemplate,
            isMesh: createObject3DProperty(mesh, "isMesh", Object3DPropertyType.Boolean, true),
            geometry: createObject3DProperty(mesh, "geometry", Object3DPropertyType.BufferGeometry, false),
            material: createObject3DProperty(mesh, "material", Object3DPropertyType.Material, false),
            morphTargetInfluences: createObject3DProperty(mesh, "morphTargetInfluences", Object3DPropertyType.Array, false),
            morphTargetDictionary: createObject3DProperty(mesh, "morphTargetDictionary", Object3DPropertyType.Object, false),
        }
    }
    return object3DTemplate;
}