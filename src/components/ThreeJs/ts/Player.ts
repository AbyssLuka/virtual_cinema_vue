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

export default class Player {
    get mesh(): Object3D {
        return this._playerMesh;
    }

    private _playerMesh: Object3D = new Object3D();
    public message: SpriteMessage | undefined;
    public mixer: AnimationMixer | undefined;
    public animation: {
        run?: AnimationAction,
        stand?: AnimationAction,
        jump?: AnimationAction,
        expression?: AnimationAction,
    } = {};

    constructor(public readonly userId: string) {}

    public create(url: string):Promise<Object3D> {
        const gltfLoader = new GLTFLoader();
        return new Promise((resolve, reject) => {
            gltfLoader.load(url, (gltf) => {
                const headMesh = gltf.scene.getObjectByName("head") as Object3D;
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

                const spriteMessage = new SpriteMessage();
                // spriteMessage.setText("HelloLuka");
                playerMesh.add(spriteMessage.object);
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
                resolve(this._playerMesh);
            }, undefined, (err) => {
                reject(err);
            });
        });
    }

    private clock = new Clock();
    public update(playerData) {
        this._playerMesh.position.set(
            playerData.position.x,
            playerData.position.y,
            playerData.position.z,
        );
        const newQuaternion = new Quaternion(
            playerData.rotation.x,
            playerData.rotation.y,
            playerData.rotation.z,
            playerData.rotation.w
        );

        const headMesh = this._playerMesh.getObjectByName("head") as Object3D;
        const bodyMesh = this._playerMesh.getObjectByName("body_group") as Object3D;

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
        const funcMap = {
            stand: () => {
                if (this.animation.run && this.animation.run.loop !== LoopOnce) {
                    // roleAnimation.run.clampWhenFinished = true;
                    this.animation.run.loop = LoopOnce;
                }
            },
            run: () => {
                if (this.animation.run && this.animation.run.loop !== LoopRepeat) {
                    // roleAnimation.run.clampWhenFinished = false;
                    this.animation.run.reset();
                    this.animation.run.loop = LoopRepeat;
                    this.animation.run.play();
                    this.animation.run.timeScale = 1.5;
                }
            },
            jump: () => {
                //
            }
        };
        if (playerData.playerStatus) {
            funcMap[playerData.playerStatus]();
        }
    }
}