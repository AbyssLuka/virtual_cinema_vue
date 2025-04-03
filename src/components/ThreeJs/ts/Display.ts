import {
    BoxGeometry, Color, Group,
    Mesh,
    MeshBasicMaterial,
    Object3D,
    RectAreaLight,
    Vector3,
    VideoTexture
} from "three";
import {RectAreaLightHelper} from "three/examples/jsm/helpers/RectAreaLightHelper";

interface I_Option {
    position: Vector3,
    videoDom: HTMLVideoElement,
    name: string,
    active: () => void
}

export class Display {

    private readonly videoTexture: VideoTexture;

    constructor(private readonly option: I_Option) {
        this.videoTexture = new VideoTexture(option.videoDom)
    }

    public create(callback: (mesh: Object3D) => void) {
        const width = 24;
        const aspectRatio = 16 / 9;
        //显示器
        const displayMesh = this.createDisplayMesh(width, aspectRatio);
        displayMesh.name = this.option.name;
        displayMesh.position.copy(this.option.position);
        displayMesh.userData.name = this.option.name;
        displayMesh.userData.active = this.option.active;

        const rectAreaLight = new RectAreaLight(0xffffff, 0.1, width, width / aspectRatio);
        rectAreaLight.rotation.y = Math.PI;
        rectAreaLight.position.copy(displayMesh.position);
        const rectAreaLightHelper = new RectAreaLightHelper(rectAreaLight);

        this.option.videoDom.addEventListener("loadeddata", () => {
            const videoElement: HTMLVideoElement = this.option.videoDom;
            const canvas = document.createElement("canvas");
            const context = canvas.getContext("2d");
            if (!context) return;
            [canvas.width, canvas.height] = [360, 240];
            const loadDisplayLight = () => {
                context.drawImage(videoElement, 0, 0, canvas.width, canvas.height);
                const image = context.getImageData(0, 0, canvas.width, canvas.height);
                let [r, g, b, count, brightness] = [0, 0, 0, 0, 0];
                for (let i = 0; i < image.data.length; i += (4 * 3)) {
                    const pixelBrightness = image.data[i] * 0.3 + image.data[i + 1] * 0.59 + image.data[i + 2] * 0.11;
                    if (pixelBrightness > 127) {
                        r += image.data[i];
                        g += image.data[i + 1];
                        b += image.data[i + 2];
                        brightness += pixelBrightness;
                        count++;
                    }
                }
                count > 0 && ([r, g, b, brightness] = [r, g, b, brightness].map((v) => v / count));
                rectAreaLight.color = new Color(r / 255, g / 255, b / 255);
                rectAreaLight.intensity = brightness / 127;
            }
            loadDisplayLight();
            this.option.videoDom.addEventListener("timeupdate", loadDisplayLight)
        });

        const group = new Group();
        group.add(rectAreaLight);
        group.add(rectAreaLightHelper);
        group.add(displayMesh);
        callback(group);
    }

    private createDisplayMesh(width: number, aspectRatio: number) {
        const displayGeometry = new BoxGeometry(width, Math.ceil(width / aspectRatio), 0.1);
        const blackMaterial = new MeshBasicMaterial({color: 0x000000});
        const materialArray = [
            blackMaterial,
            blackMaterial,
            blackMaterial,
            blackMaterial,
            new MeshBasicMaterial({map: this.videoTexture}),
            blackMaterial,
        ];
        return new Mesh(displayGeometry, materialArray);
    }
}