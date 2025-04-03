import {PointerLockControls} from "three/examples/jsm/controls/PointerLockControls";
import {Euler, PerspectiveCamera, Quaternion, Vector3} from "three";
import {Capsule} from "three/examples/jsm/math/Capsule";
import {Octree} from "three/examples/jsm/math/Octree";
import * as CANNON from "cannon-es"

type Type_KeyCode = "KeyQ" | "KeyW" | "KeyE" | "KeyR" | "KeyT" | "KeyY" | "KeyU" | "KeyI" | "KeyO" | "KeyP" |
    "KeyA" | "KeyS" | "KeyD" | "KeyF" | "KeyG" | "KeyH" | "KeyJ" | "KeyK" | "KeyL" | "KeyZ" | "KeyX" | "KeyC" |
    "KeyV" | "KeyB" | "KeyN" | "KeyM" | "ShiftLeft" | "Space" | "Digit1" | "Digit2" | "Digit3" | "Digit4" | "Digit5" |
    "Digit6" | "Digit7" | "Digit8" | "Digit9" | "Digit0";

export class Controls {
    private readonly controls: PointerLockControls;
    private readonly playerCollider: Capsule;
    private readonly playerVelocity: Vector3;
    private readonly playerDirection: Vector3;
    private readonly playerBody: CANNON.Body;
    private playerOnFloor = false;
    private GRAVITY = 30;
    private keyAny_Status = {
        KeyQ: false, KeyW: false, KeyE: false, KeyR: false, KeyT: false, KeyY: false, KeyU: false, KeyI: false,
        KeyO: false, KeyP: false, KeyA: false, KeyS: false, KeyD: false, KeyF: false, KeyG: false, KeyH: false,
        KeyJ: false, KeyK: false, KeyL: false, KeyZ: false, KeyX: false, KeyC: false, KeyV: false, KeyB: false,
        KeyN: false, KeyM: false, ShiftLeft: false, Space: false, Digit1: false, Digit2: false, Digit3: false,
        Digit4: false, Digit5: false, Digit6: false, Digit7: false, Digit8: false, Digit9: false, Digit0: false,
    };

    constructor(public camera: PerspectiveCamera, public dom: HTMLElement) {
        const start = new Vector3().copy(camera.position);
        const end = new Vector3().copy(camera.position);
        end.y += 2;
        //角色体积
        this.playerCollider = new Capsule(start, end, 1);
        this.playerVelocity = new Vector3();
        this.playerDirection = new Vector3();
        this.controls = new PointerLockControls(camera, dom);
        const cylinder = new CANNON.Cylinder(1, 1, 6, 20);

        this.playerBody = new CANNON.Body({
            mass: 45,
            shape: cylinder,
            position: camera.position as unknown as CANNON.Vec3,
            allowSleep: false,
        });

        const keydownFunc = (event: KeyboardEvent) => {
            this.keyAny_Status[event.code as Type_KeyCode] = true;
            if (this.playerOnFloor && this.keyAny_Status.Space) {
                // 跳跃
                this.playerVelocity.y = 15;
            }
        };
        const keyupFunc = (event: KeyboardEvent) => {
            this.keyAny_Status[event.code as Type_KeyCode] = false;
        };
        this.funcList.push({type: "keydown", func: keydownFunc});
        this.funcList.push({type: "keyup", func: keyupFunc});
        document.addEventListener("keydown", keydownFunc);
        document.addEventListener("keyup", keyupFunc);

        this.controls.addEventListener('change', () => {
            this.allowRotate && this.camera.rotation.copy(this.tempCameraRotation);
        });
    }

    private allowRotate = false;
    private tempCameraRotation: Euler = new Euler();

    public lockAngle(status: boolean) {
        this.tempCameraRotation = this.camera.rotation.clone();
        this.allowRotate = status;
    }

    public getPlayerBody() {
        return this.playerBody;
    }

    //键盘时间监听
    public addKeydownEventListener(keyCode: string | string[], callback: (code: KeyboardEvent) => void) {
        const keydownFunc = (event: KeyboardEvent) => {
            if (keyCode instanceof Array && keyCode.includes(event.code as Type_KeyCode)) {
                callback(event);
            } else if (event.code === keyCode) {
                callback(event);
            }
        };
        this.funcList.push({type: "keydown", func: keydownFunc});
        document.addEventListener("keydown", keydownFunc);
    }

    // 鼠标点击事件监听
    public addMousedownEventListener(button: number, callback: (code: MouseEvent) => void) {
        const mousedownFunc = (event: MouseEvent) => {
            if (button === event.button) {
                callback(event);
            }
        };
        this.funcList.push({type: "mousedown", func: mousedownFunc});
        document.addEventListener("mousedown", mousedownFunc);
    }

    private funcList: { type: string, func: ((...any) => void) }[] = [];

    //销毁监听器
    public dispose() {
        this.funcList.forEach((item) => {
            document.removeEventListener(item.type, item.func);
        });
        this.controls.disconnect();
        this.controls.dispose();
    }

    //物品栏循环
    public loopNumber(maxLen: number, index: number, callback: (index: number) => void) {
        const mousewheelFunc = (event: WheelEvent) => {
            if (!this.controls.isLocked || event.ctrlKey) return;
            // 1 2 3 4 5 6 7 8 9 10 ... n-2 n-1 n循环
            if (event.deltaY < 0) {
                //左移 超过n 回到 1
                index %= maxLen;
                index += 1;
            } else if (event.deltaY > 0) {
                // 右移 小于1 回到 n
                index += (maxLen - 2);
                index %= maxLen;
                index += 1;
            }
            callback(index);
        };
        this.funcList.push({type: "wheel", func: mousewheelFunc});
        document.addEventListener("wheel", mousewheelFunc);
    }

    //指针锁
    get isLocked() {
        return this.controls.isLocked;
    }

    //角色碰撞检测
    private playerCollisions(worldOctree: Octree) {
        // 八叉树检测
        const result = worldOctree.capsuleIntersect(this.playerCollider);
        this.playerOnFloor = false;
        if (result) {
            // y大于零在地面 否则相反
            this.playerOnFloor = result.normal.y > 0;
            // 空中碰撞
            if (!this.playerOnFloor) {
                this.playerVelocity.addScaledVector(result.normal, -result.normal.dot(this.playerVelocity));
            }
            this.playerCollider.translate(result.normal.multiplyScalar(result.depth));
        }
    }

    //前后移动
    private getForwardVector() {
        // 获取相机在世界中的方向复制給角色方向
        this.camera.getWorldDirection(this.playerDirection);
        //只需要前后左右四个方向
        this.playerDirection.y = 0;
        // 将该向量转换为单位向量
        this.playerDirection.normalize();
        // 返回方向向量
        return this.playerDirection;
    }

    //左右移动
    private getSideVector() {
        this.camera.getWorldDirection(this.playerDirection);
        this.playerDirection.y = 0;
        this.playerDirection.normalize();
        //叉乘
        this.playerDirection.cross(this.camera.up);
        return this.playerDirection;
    }

    //更新角色
    private updatePlayer(deltaTime: number, worldOctree: Octree) {
        // 阻尼
        let damping = Math.exp(-4 * deltaTime) - 1;
        if (!this.playerOnFloor) {
            // 角色引力
            this.playerVelocity.y -= this.GRAVITY * deltaTime;
            damping *= 0.1;
        }
        //角色速度+=(阻尼*角色速度)
        this.playerVelocity.addScaledVector(this.playerVelocity, damping);
        // 计算位置 //玩家位置=角色速度*时间差
        const deltaPosition = this.playerVelocity.clone().multiplyScalar(deltaTime);
        // 移动位置
        this.playerCollider.translate(deltaPosition);
        //碰撞检测
        this.playerCollisions(worldOctree);
        // 更新控制器和相机位置
        this.camera.position.copy(this.playerCollider.end);

        const x = this.playerCollider.start.x;
        const y = this.playerCollider.start.y + 2;
        const z = this.playerCollider.start.z;

        this.playerBody.position.set(x, y, z);
        this.playerBody.quaternion.set(0, 0, 0, 1);
    }

    public create() {
        return this.controls;
    }

    //指针锁
    public controlsLock(dom: HTMLElement) {
        let setTime: number | null | ReturnType<typeof setTimeout> = 0;
        dom.addEventListener("click", () => {
            if (setTime != null) clearTimeout(setTime as number);
            //延迟1.25s锁定指针，防止报错
            setTime = setTimeout(() => {
                this.controls.lock();
            }, 1250);
        });
    }

    //刷新角色和相机
    public update(worldOctree: Octree, delta: number) {
        if (this.controls.isLocked) {
            this.updatePlayer(delta, worldOctree);
            //加速级别
            const quicken = this.keyAny_Status.ShiftLeft ? 1.5 : 1;
            //计算移动距离
            const speedDelta = delta * (this.playerOnFloor ? 50 : 15) * quicken;
            //移动
            if (this.keyAny_Status.KeyA)
                this.playerVelocity.add(
                    this.getSideVector().multiplyScalar(-speedDelta)
                );
            if (this.keyAny_Status.KeyD)
                this.playerVelocity.add(
                    this.getSideVector().multiplyScalar(speedDelta)
                );
            if (this.keyAny_Status.KeyW)
                this.playerVelocity.add(
                    this.getForwardVector().multiplyScalar(speedDelta)
                );
            if (this.keyAny_Status.KeyS)
                this.playerVelocity.add(
                    this.getForwardVector().multiplyScalar(-speedDelta)
                );
            if (this.keyAny_Status.KeyA ||
                this.keyAny_Status.KeyD ||
                this.keyAny_Status.KeyW ||
                this.keyAny_Status.KeyS) {
                this.playerStatus = "run";
            } else {
                this.playerStatus = "stand";
            }
        }
    }

    private playerStatus: "run" | "stand" | "jump" = "stand";

    get position(): Vector3 {
        const x = this.playerCollider.start.x;
        const y = this.playerCollider.start.y;
        const z = this.playerCollider.start.z;
        return new Vector3().set(x, y - 1, z);
    }

    get rotation(): Quaternion {
        return this.camera.quaternion;
    }

    get playerState(): string {
        return this.playerStatus;
    }
}