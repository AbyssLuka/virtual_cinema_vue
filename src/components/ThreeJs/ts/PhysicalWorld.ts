import * as CANNON from "cannon-es";
import { Object3D, PerspectiveCamera} from "three";

export class PhysicalWorld {
    private readonly world: CANNON.World;

    constructor() {
        //物理世界
        this.world = new CANNON.World();
        this.init();
    }

    private init() {

        //更好性能，travelling too fast
        this.world.broadphase = new CANNON.SAPBroadphase(this.world);
        this.world.allowSleep = true;
        this.world.gravity.set(0, -9.82, 0);

        //物理世界的材质
        const defaultMaterial = new CANNON.Material({friction: 1, restitution: 0});
        const contactMaterial = new CANNON.ContactMaterial(
            defaultMaterial,
            defaultMaterial,
            {friction: 1, restitution: 0});
        this.world.addContactMaterial(contactMaterial);

        const planeShape = new CANNON.Plane();//地面
        const planeBody = new CANNON.Body({
            mass: 0,//质量为0，表示该物体固定
            shape: planeShape,
            material: defaultMaterial,
        });
        planeBody.quaternion.setFromAxisAngle(
            new CANNON.Vec3(-1, 0, 0),
            Math.PI * 0.5
        );
        planeBody.quaternion.setFromAxisAngle(
            new CANNON.Vec3(-1, 0, 0),
            Math.PI * 0.5
        );
        planeBody.position.y = -5;
        this.world.addBody(planeBody);
    }

    public create() {
        return this.world;
    }

    public update(physicalObjects: { mesh: Object3D | PerspectiveCamera, body: CANNON.Body }[],) {
        physicalObjects.forEach((e: { mesh: Object3D | PerspectiveCamera, body: CANNON.Body }) => {
            e.mesh.position.copy(e.body.position);
            e.mesh.quaternion.copy(e.body.quaternion);
        });
    }

}