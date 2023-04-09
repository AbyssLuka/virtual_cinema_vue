import {PointerLockControls} from "three/examples/jsm/controls/PointerLockControls";
import {PerspectiveCamera, Vector3} from "three";
import {Capsule} from "three/examples/jsm/math/Capsule";
import {Octree} from "three/examples/jsm/math/Octree";

type Type_KeyCode = "KeyQ" | "KeyW" | "KeyE" | "KeyR" | "KeyT" | "KeyY" | "KeyU" | "KeyI" | "KeyO" | "KeyP" |
    "KeyA" | "KeyS" | "KeyD" | "KeyF" | "KeyG" | "KeyH" | "KeyJ" | "KeyK" | "KeyL" | "KeyZ" | "KeyX" | "KeyC" |
    "KeyV" | "KeyB" | "KeyN" | "KeyM" | "ShiftLeft" | "Space" | "Digit1" | "Digit2" | "Digit3" | "Digit4" | "Digit5" |
    "Digit6" | "Digit7" | "Digit8" | "Digit9" | "Digit0";

export class Controls {
    private readonly camera: PerspectiveCamera;
    private readonly controls: PointerLockControls;
    private readonly playerCollider: Capsule;
    private readonly playerVelocity;
    private readonly playerDirection;
    private playerOnFloor = false;
    private GRAVITY = 30;
    private keyAny_Status = {
        KeyQ: false, KeyW: false, KeyE: false, KeyR: false, KeyT: false, KeyY: false, KeyU: false, KeyI: false,
        KeyO: false, KeyP: false, KeyA: false, KeyS: false, KeyD: false, KeyF: false, KeyG: false, KeyH: false,
        KeyJ: false, KeyK: false, KeyL: false, KeyZ: false, KeyX: false, KeyC: false, KeyV: false, KeyB: false,
        KeyN: false, KeyM: false, ShiftLeft: false, Space: false, Digit1: false, Digit2: false, Digit3: false,
        Digit4: false, Digit5: false, Digit6: false, Digit7: false, Digit8: false, Digit9: false, Digit0: false,
    };

    constructor(camera: PerspectiveCamera, dom: HTMLElement) {
        this.camera = camera;
        const start = new Vector3().copy(camera.position);
        const end = new Vector3().copy(camera.position);
        end.y += 3;
        //角色体积
        this.playerCollider = new Capsule(start, end, 1);
        this.playerVelocity = new Vector3();
        this.playerDirection = new Vector3();
        this.controls = new PointerLockControls(camera, dom);
        const keydownFunc = (event) => {
            this.keyAny_Status[event.code as Type_KeyCode] = true;
            if (this.playerOnFloor && this.keyAny_Status.Space) {
                // 跳跃
                this.playerVelocity.y = 15;
            }
        };
        const keyupFunc = (event) => {
            this.keyAny_Status[event.code as Type_KeyCode] = false;
        };
        this.funcList.push({type: "keydown", func: keydownFunc});
        this.funcList.push({type: "keyup", func: keyupFunc});
        document.addEventListener("keydown", keydownFunc);
        document.addEventListener("keyup", keyupFunc);
    }

    //键盘时间监听
    public addKeydownEventListener(keyCode: string | string[], callback: (code: KeyboardEvent) => void) {
        const keydownFunc = (event) => {
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
        const mousedownFunc = (event) => {
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
    }

    //物品栏循环
    public loopNumber(maxLen: number, index: number, callback: (index: number) => void) {

        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const mousewheelFunc = (event: any) => {
            if (!this.controls.isLocked || event.ctrlKey) return;
            // 1 2 3 4 5 6 7 8 9 10 ... n-2 n-1 n循环
            if (event.deltaY < 0) {
                //右移 超过10 回到 最小
                index %= maxLen;
                index += 1;
            } else if (event.deltaY > 0) {
                // 左移 小于0 回到 最大
                index += (maxLen - 2);
                index %= maxLen;
                index += 1;
            }
            callback(index);
        };
        this.funcList.push({type: "mousewheel", func: mousewheelFunc});
        document.addEventListener("mousewheel", mousewheelFunc);
    }

    //指针锁
    public isLocked() {
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
        //方向变换(-pi/2) // 例 (1,0,0) => (0,0,-1) x和y交换,并正负取反符号
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
        this.controls.getObject().position.copy(this.playerCollider.end);
    }

    public create() {
        return this.controls;
    }

    //指针锁
    public controlsLock(dom: HTMLElement) {
        let setTime: number | null | ReturnType<typeof setTimeout> = 0;
        dom.addEventListener("click", async () => {
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
            if (this.keyAny_Status.KeyA) this.playerVelocity.add(this.getSideVector().multiplyScalar(-speedDelta));
            if (this.keyAny_Status.KeyD) this.playerVelocity.add(this.getSideVector().multiplyScalar(speedDelta));
            if (this.keyAny_Status.KeyW) this.playerVelocity.add(this.getForwardVector().multiplyScalar(speedDelta));
            if (this.keyAny_Status.KeyS) this.playerVelocity.add(this.getForwardVector().multiplyScalar(-speedDelta));
        }
    }
}


/* //移动控制器
    private velocity = new Vector3();
    private direction = new Vector3();
if (this.controls.isLocked) {
    this.velocity.x -= this.velocity.x * 10.0 * delta;
    this.velocity.z -= this.velocity.z * 10.0 * delta;
    this.direction.z = Number(this.keyW_Status) - Number(this.keyS_Status);
    this.direction.x = Number(this.keyD_Status) - Number(this.keyA_Status);
    if (this.keyA_Status || this.keyD_Status) this.velocity.x -= this.direction.x * 400.0 * delta;
    if (this.keyW_Status || this.keyS_Status) this.velocity.z -= this.direction.z * 400.0 * delta;
    this.direction.normalize(); // 确保各个方向的一致运动
    //下面两个&&是判断是否有moveRight。如果有就执行。不然没加载完毕，就循环执行会报错
    // controls && controls.moveRight(-velocity.x * delta);
    // controls && controls.moveForward(-velocity.z * delta);

    //加速级别
    this.quicken = this.keyShift_Status ? 0.6 : 0.3;
    //计算移动距离
    const rightDistance = -this.velocity.x * delta * this.quicken;
    const forwardDistance = -this.velocity.z * delta * this.quicken;
    //设置最终移动值
    if (this.keyA_Status || this.keyD_Status) this.controls.moveRight(rightDistance);
    if (this.keyW_Status || this.keyS_Status) this.controls.moveForward(forwardDistance);
}*/
/*physicalObjects.forEach((e: { mesh: THREE.Mesh | THREE.PerspectiveCamera, body: CANNON.Body }) => {
           if (this.camera === e.mesh) {
               // e.body.quaternion.y = e.mesh.quaternion.y;                      //跟随相机y轴旋转
               e.body.angularFactor.copy(new CANNON.Vec3(0, 0, 0));    //防止碰撞刚体旋转
               if (this.keyA_Status || this.keyD_Status || this.keyW_Status || this.keyS_Status) {
                   e.body.position.z = e.mesh.position.z;
                   e.body.position.x = e.mesh.position.x;
                   e.mesh.position.y = e.body.position.y;//移动时相机受到重力影响
               } else {
                   e.mesh.position.copy(e.body.position as unknown as Vector3);//非移动时受到所有重力影响
               }
               if (this.keySpace_Status) {
                   e.body.velocity.set(0, 10, 0);//跳跃
               }
               e.body.angularVelocity.set(0, -1, 0);
           } else {
               e.mesh.position.copy(e.body.position as unknown as Vector3);
               e.mesh.quaternion.copy(e.body.quaternion as unknown as typeof e.mesh.quaternion);
           }
       });*/