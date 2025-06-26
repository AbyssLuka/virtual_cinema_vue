import {Object3D} from "three";
import {GLTFExporter, GLTFExporterOptions} from "three/examples/jsm/exporters/GLTFExporter";

export class ModelExporter {

    constructor(private object: Object3D) {

    }

    private gltfExporter = new GLTFExporter();

    exporterGltf(options: GLTFExporterOptions = {}) {
        this.gltfExporter.parse(this.object, (gltf) => {
            const blob = new Blob([JSON.stringify(gltf)], {type: 'application/json'});
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = 'scene.gltf';
            a.click();
        }, () => {
            console.log('Exporting GLTF failed');
        }, options);
    }

    exporterGlb(options: GLTFExporterOptions) {
        this.gltfExporter.parse(this.object, (gltf) => {
            const blob = new Blob([<ArrayBuffer>gltf], {type: 'application/octet-stream'});
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = 'scene.glb';
            a.click();
        }, () => {
            console.log('Exporting GLB failed');
        }, {binary: true, ...options});
    }


}