<template>
    <teleport to="html">
        <div class="cursor-box" ref="cursorBox" v-show="isNotLock">
            <div class="revolve" ref="revolve"></div>
            <div class="cursor" ref="cursor"></div>
            <div class="cross"></div>
        </div>
    </teleport>
</template>

<script setup lang="ts">
import {onMounted, onUnmounted, ref, useTemplateRef} from "vue";

let cursorBox = useTemplateRef<HTMLDivElement>("cursorBox");
let revolve = useTemplateRef<HTMLDivElement>("revolve");
let cursor = useTemplateRef<HTMLDivElement>("cursor");
let isNotLock = ref(true);

let [x, y] = [0, 0];
let gap = 30, count = 0, angle = 20, fallSpeed = 1;

const mousemoveFunc = (event: MouseEvent) => {
    x = event.x;
    y = event.y;
    let top = y - cursorBox.value!.clientWidth / 2;
    let left = x - cursorBox.value!.clientHeight / 2;
    if (+cursorBox.value!.style.top !== top && +cursorBox.value!.style.left !== left) {
        cursorBox.value!.style.top = top + "px";
        cursorBox.value!.style.left = left + "px";
    }
}

const createRipple = () => {
    const ripples = document.createElement("span");
    ripples.setAttribute("class", "circle");
    document.body.appendChild(ripples);
    ripples.style.top = y - ripples.clientHeight / 2 + "px";
    ripples.style.left = x - ripples.clientWidth / 2 + "px";
    return ripples;
}

const mousedownFunc = () => {
    if (document.pointerLockElement) return;
    revolve.value!.style.width = 28 + "px";
    revolve.value!.style.height = 28 + "px";
    cursor.value!.style.transform = "scale(1.3)";
    [angle, fallSpeed, gap] = [80, 1.5, 0];
    setTimeout(() => {
        [angle, fallSpeed, gap] = [20, 1, 30];
    }, 100)
    const ripples = createRipple();
    ripples.addEventListener("animationend", () => {
        ripples.remove();
    })
}

const mouseupFunc = () => {
    cursor.value!.style.transform = "scale(1)";
    revolve.value!.style.width = 20 + "px";
    revolve.value!.style.height = 20 + "px";
}

const pointerlockchangeFunc = () => {
    isNotLock.value = !document.pointerLockElement;
    if (!isNotLock.value) {
        cancelAnimationFrame(requestAnimationFrameId);
    } else {
        animation();
    }
}

onMounted(() => {
    window.addEventListener("mousemove", mousemoveFunc);
    window.addEventListener("mousedown", mousedownFunc);
    window.addEventListener("mouseup", mouseupFunc);
    document.addEventListener("pointerlockchange", pointerlockchangeFunc);
    document.body.style.cursor = "none";
    animation();
});

let requestAnimationFrameId = 0;

const createStar = () => {
    let star = document.createElement("div");
    star.setAttribute("class", "star");
    document.body.appendChild(star);

    const size = Math.random() * 30 + 30;
    star.style.width = size + "px";
    star.style.height = size + "px";

    star.style.top = y - star.clientWidth / 2 + "px";
    star.style.left = x - star.clientHeight / 2 + "px";
    return star;
}


const animation = () => {
    requestAnimationFrameId = requestAnimationFrame(animation);
    count++;
    if (count < gap) return
    count = 0;
    const star = createStar();
    // 随机旋转方向和速度
    const rotationDirection = Math.random() > 0.5 ? 1 : -1;
    const rotationSpeed = Math.random() * 10 + 2;
    const curFallSpeed = (Math.random() * 350 + 150) * fallSpeed;
    // 随机角度
    const randomAngle = (Math.random() - 0.5) * angle;

    let keyframes: { [key: string]: string | number }[] = [];
    const totalDistance = window.innerHeight - y;
    const step = 15; // 步数，可调整动画流畅度
    const gravity = 1; // 重力加速度，可调整
    for (let i = 0; i <= totalDistance; i += step) {
        const opacityValue = .5 - (i / totalDistance); // 计算透明度
        const translateY = gravity * ((i / step) ** 2); // 模拟重力加速度
        const translateX = (Math.tan((randomAngle * Math.PI) / 180)) * i;
        keyframes.push({
            transform: `
        translate(${translateX}px,${translateY}px)
        rotate(${rotationDirection * 360 * rotationSpeed * (i / totalDistance)}deg)`,
            opacity: opacityValue
        });
    }

    const options = {
        duration: 1000 * ((window.innerHeight - y) / curFallSpeed),
        iterations: 1,
        easing: 'linear'
    };

    star.animate(keyframes, options).finished.then(() => {
        star.remove()
    });
}

onUnmounted(() => {
    window.removeEventListener("mousemove", mousemoveFunc);
    window.removeEventListener("mousedown", mousedownFunc);
    window.removeEventListener("mouseup", mouseupFunc);
    document.removeEventListener("pointerlockchange", pointerlockchangeFunc);
    document.body.style.cursor = "auto";
    cancelAnimationFrame(requestAnimationFrameId);
})

</script>

<style>

.star {
    position: fixed;
    background-image: url('data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><path d="M50 0 A5 5 0 0 1 55 5 L63 38 A5 5 0 0 1 68 43 L100 38 A5 5 0 0 1 105 43 L75 62 A5 5 0 0 1 80 67 L83 100 A5 5 0 0 1 88 105 L50 80 A5 5 0 0 1 45 85 L17 100 A5 5 0 0 1 12 105 L25 62 A5 5 0 0 1 20 67 L0 38 A5 5 0 0 1 -5 43 L37 38 A5 5 0 0 1 32 43 Z" fill="rgba(255, 255, 255, 0.8)"/></svg>');
    filter: drop-shadow(0 0 10px white);
    pointer-events: none;
}

.circle {
    position: fixed;
    left: 0;
    top: 0;
    border-radius: 50%;
    width: 50px;
    height: 50px;
    border: 1px solid white;
    animation: ripple .4s linear forwards;
    pointer-events: none;
}

@keyframes ripple {
    100% {
        transform: scale(5);
        opacity: 0;
    }
}

</style>

<style scoped>

.cursor-box {
    width: 100px;
    height: 100px;
    left: 0;
    top: 0;
    position: fixed;
    pointer-events: none;
    display: flex;
    justify-content: center;
    align-items: center;
}

.revolve {
    width: 20px;
    height: 20px;
    position: absolute;
    border-radius: 50%;
    border-top: 6px solid rgba(255, 255, 255, 0.5);
    border-bottom: 6px solid rgba(255, 255, 255, 0.5);
    border-left: 6px solid transparent;
    border-right: 6px solid transparent;
    animation: rx 8s infinite linear;
    transition: 0.1s;
}

@keyframes rx {
    from {
        transform: rotate(0deg)
    }
    to {
        transform: rotate(360deg)
    }
}

.cursor {
    width: 40px;
    height: 40px;
    border-radius: 50%;
    border: 4px solid white;
    box-shadow: 0 0 8px 5px rgb(255, 139, 209), 0 0 10px 5px white;
    background: radial-gradient(circle, transparent, transparent, transparent, white, white);
    font-size: 25px;
    color: white;
    display: flex;
    justify-content: center;
    align-items: center;
    transition: 0.1s;
}

.cross {
    position: absolute;
    box-shadow: 0 0 0 0.15em dodgerblue,
    0.2em 0 0 0.1em dodgerblue,
    -0.2em 0 0 0.1em dodgerblue,
    0 0.2em 0 0.1em dodgerblue,
    0 -0.2em 0 0.1em dodgerblue;
}

</style>