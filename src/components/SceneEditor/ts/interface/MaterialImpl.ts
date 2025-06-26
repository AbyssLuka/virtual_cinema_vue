import {Material, MeshStandardMaterial, MeshBasicMaterial, AmbientLight} from "three";
import {
    createMaterialProperty,
    I_Material, I_MeshBasicMaterial, I_MeshStandardMaterial, MaterialPropertyType,
} from "@/components/SceneEditor/ts/interface/MaterialInterface";

export function createMaterial(material: MeshStandardMaterial): I_MeshStandardMaterial;
export function createMaterial(material: MeshBasicMaterial): I_MeshBasicMaterial;
export function createMaterial(material: Material): I_Material;
export function createMaterial(material: Material): I_Material | I_MeshBasicMaterial | I_MeshStandardMaterial | undefined {
    // const prop = createMaterialProperty(material,"type", MaterialPropertyType.String, true);
    const materialTemplate: I_Material = {
        id: createMaterialProperty(material, "id", MaterialPropertyType.Number, true),
        uuid: createMaterialProperty(material, "uuid", MaterialPropertyType.String, true),
        type: createMaterialProperty(material, "type", MaterialPropertyType.String, true),
        name: createMaterialProperty(material, "name", MaterialPropertyType.String),
        alphaHash: createMaterialProperty(material, "alphaHash", MaterialPropertyType.Boolean),
        alphaTest: createMaterialProperty(material, "alphaTest", MaterialPropertyType.Number),
        opacity: createMaterialProperty(material, "opacity", MaterialPropertyType.Number),
        visible: createMaterialProperty(material, "visible", MaterialPropertyType.Boolean),
        userData: createMaterialProperty(material, "userData", MaterialPropertyType.String),
    }

    if (material.type === "MeshBasicMaterial") {
        const material_ = <MeshBasicMaterial>material;
        return {
            ...materialTemplate,
            alphaMap: createMaterialProperty(material_, "alphaMap", MaterialPropertyType.Texture),
            aoMap: createMaterialProperty(material_, "aoMap", MaterialPropertyType.Texture),
            aoMapIntensity: createMaterialProperty(material_, "aoMapIntensity", MaterialPropertyType.Number),
            color: createMaterialProperty(material_, "color", MaterialPropertyType.Color),
            envMap: createMaterialProperty(material_, "envMap", MaterialPropertyType.Texture),
            fog: createMaterialProperty(material_, "fog", MaterialPropertyType.Boolean),
            lightMap: createMaterialProperty(material_, "lightMap", MaterialPropertyType.Texture),
            map: createMaterialProperty(material_, "map", MaterialPropertyType.Texture),
        }

    }
    if (material.type === "MeshStandardMaterial") {
        const material_ = <MeshBasicMaterial>material;
        return {
            ...materialTemplate,
            wireframe: createMaterialProperty(material_, "wireframe", MaterialPropertyType.Boolean),
            alphaMap: createMaterialProperty(material_, "alphaMap", MaterialPropertyType.Texture),
            aoMap: createMaterialProperty(material_, "aoMap", MaterialPropertyType.Texture),
            aoMapIntensity: createMaterialProperty(material_, "aoMapIntensity", MaterialPropertyType.Number),
            color: createMaterialProperty(material_, "color", MaterialPropertyType.Color),
            envMap: createMaterialProperty(material_, "envMap", MaterialPropertyType.Texture),
            fog: createMaterialProperty(material_, "fog", MaterialPropertyType.Boolean),
            lightMap: createMaterialProperty(material_, "lightMap", MaterialPropertyType.Texture),
            map: createMaterialProperty(material_, "map", MaterialPropertyType.Texture)
        }
    }
    if (material.type === "Material") {
        return materialTemplate;
    }
}