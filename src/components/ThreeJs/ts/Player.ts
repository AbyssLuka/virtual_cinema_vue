import {GLTFLoader} from "three/examples/jsm/loaders/GLTFLoader";
import {
    AnimationAction,
    AnimationMixer, Clock,
    Euler,
    Group,
    LoopOnce,
    LoopRepeat,
    MathUtils,
    Object3D,
    Quaternion,
} from "three";
import SpriteMessage from "@/components/ThreeJs/ts/SpriteMessage";
import {I_Player} from "@/components/ThreeJs/ts/GameInterface";

export default class Player {
    get mesh(): Object3D {
        return this._playerMesh;
    }

    private _playerMesh: Object3D = new Object3D();
    public message = new SpriteMessage();
    public mixer: AnimationMixer | undefined;
    public animation: {
        run?: AnimationAction,
        stand?: AnimationAction,
        jump?: AnimationAction,
        expression?: AnimationAction,
    } = {};

    constructor(public readonly userId: string) {
    }

    public async create(url: string): Promise<Object3D> {
        const gltfLoader = new GLTFLoader();
        const gltf = await gltfLoader.loadAsync(url)

        const headMesh = <Object3D>gltf.scene.getObjectByName("head");
        gltf.scene.remove(headMesh)
        const playerMesh = new Group();
        playerMesh.add(headMesh);
        gltf.scene.name = "body_group";
        playerMesh.add(gltf.scene)

        playerMesh.scale.set(8, 8, 8);
        playerMesh.rotation.set(0, 0, 0);
        playerMesh.userData.userId = this.userId;

        playerMesh.traverse((child: Object3D) => {
            if (child.isObject3D) {
                child.frustumCulled = false;
                child.castShadow = true;
            }
        });
        this._playerMesh = playerMesh;
        const mixer = new AnimationMixer(playerMesh);
        const clips = gltf.animations;

        // spriteMessage.setText("HelloLuka");
        playerMesh.add(this.message.object);
        const moveClip = clips.find(animationClip =>
            animationClip.name === "animation.model.move"
        );
        const emotionClip = clips.find(animationClip =>
            animationClip.name === "animation.model.emotion"
        );

        this.mixer = mixer;
        this.animation = {
            run: moveClip ? mixer.clipAction(moveClip) : undefined,
            expression: emotionClip ? mixer.clipAction(emotionClip) : undefined,
        };
        // this.animation.run?.play();
        this.animation.expression?.play();
        return this._playerMesh;
    }

    private clock = new Clock();

    private funcMap = {
        stand: () => {
            if (!(this.animation.run && this.animation.run.loop !== LoopOnce)) return;
            // roleAnimation.run.clampWhenFinished = true;
            this.animation.run.loop = LoopOnce;
        },
        run: () => {
            if (!(this.animation.run && this.animation.run.loop !== LoopRepeat)) return;
            // roleAnimation.run.clampWhenFinished = false;
            this.animation.run.reset();
            this.animation.run.loop = LoopRepeat;
            this.animation.run.play();
            this.animation.run.timeScale = 1.5;
        },
        jump: () => {
            //
        }
    };

    public update(playerData: I_Player) {
        const {x: px, y: py, z: pz} = playerData.position;
        this._playerMesh.position.set(px, py, pz);
        const {x: rx, y: ry, z: rz, w: rw} = playerData.position;
        const newQuaternion = new Quaternion(rx, ry, rz, rw);

        const headMesh = <Object3D>this._playerMesh.getObjectByName("head");
        const bodyMesh = <Object3D>this._playerMesh.getObjectByName("body_group");

        // 四元数变换为欧拉角
        const newEuler = new Euler().setFromQuaternion(newQuaternion, 'YXZ');
        const bodyEuler = new Euler().setFromQuaternion(bodyMesh.quaternion, 'YXZ');
        const diffEulerY = Math.abs(newEuler.y - bodyEuler.y);
        const threshold = Math.PI / 6;
        const pi2 = Math.PI * 2;
        // 头部与身体夹角超过Math.PI / 6之后，身体开始与头部旋转。
        if (diffEulerY > threshold) {
            let deltaDiff: number;
            //     dor：旋转方向   exceed：是否越过PI*2和0的边界
            const [dor, exceed] = [newEuler.y < bodyEuler.y, diffEulerY < Math.PI];
            if (dor && exceed) {
                deltaDiff = (newEuler.y - bodyEuler.y) + threshold;
            } else if (!dor && exceed) {
                deltaDiff = (newEuler.y - bodyEuler.y) - threshold;
            } else {
                const min = Math.min(newEuler.y, bodyEuler.y);
                const max = Math.max(newEuler.y, bodyEuler.y);
                deltaDiff = min + pi2 - max - threshold;
                deltaDiff = (!dor && !exceed) ? -deltaDiff : deltaDiff;
            }
            bodyMesh.rotation.set(0, bodyMesh.rotation.y + deltaDiff, 0);
        }
        // 限制头部上下转向角度
        newEuler.x = MathUtils.clamp(newEuler.x, -threshold, threshold);
        newQuaternion.setFromEuler(newEuler);
        headMesh.quaternion.copy(newQuaternion);

        this.mixer?.update(this.clock.getDelta())

        if (playerData.playerStatus) {
            this.funcMap[playerData.playerStatus]();
        }
    }
}