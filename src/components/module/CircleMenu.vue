<template>
    <div class="menu">
        <div class="six-pointed-star"></div>
        <div v-for="(menuObject,index) in props.menuList"
             :style="'--i:'+index" class="menu-sub"
             :key="index" @click="menuObject.active()">
            <div :class="menuObject.icon"></div>
        </div>
        <div class="ri-add-line menu-active"></div>
        <div class="selected"></div>
    </div>
</template>

<script setup lang="ts">

import {defineProps} from "vue";

const props = defineProps<{
    menuList: {
        icon: string,
        active: () => void
    }[],
}>();

</script>

<style scoped>
.menu {
    position: relative;
    width: 40px;
    height: 40px;
    border-radius: 50%;
    cursor: pointer;
    transition: .2s;
    display: flex;
    justify-content: center;
    align-items: center;
    color: white;
    font-weight: bold;
    font-size: 30px;
    backdrop-filter: blur(10px);
    background: black;
    transform: translate(50%, 50%);
    user-select: none;
}

.six-pointed-star::before, .six-pointed-star::after {
    content: "";
    border-top: 120px solid rgba(255, 45, 00, 0.5);
    border-left: 70px solid transparent;
    border-right: 70px solid transparent;
    position: absolute;
    transform: translate(-70px, -40px);
    opacity: 0;
    transition: 5s;
    transition-delay: .5s;
}

.six-pointed-star::after {
    transform: translate(-70px, -80px) rotate(180deg);
}

.six-pointed-star {
    position: absolute;
    animation: 20s infinite linear menu-revolve;
}

.menu-sub {
    color: black;
    position: fixed;
    left: -80px;
    transform: rotate(calc(360deg / 6 * var(--i))) translate(100px);
    transform-origin: 100px;
    transition: .2s;
    opacity: 0;
    width: 50px;
    height: 50px;
    display: flex;
    justify-content: center;
    align-items: center;
    border: black 5px solid;
    pointer-events: none;
}

.menu-sub div {
    transform: rotate(calc(360deg / -6 * var(--i)));
}

.menu-sub:hover div {
    transform: rotate(calc(360deg / -6 * var(--i))) scale(1.3);
}

.menu-sub:hover {
    border: orangered 5px solid;
}

.selected {
    position: absolute;
    height: 0;
    width: 100px;
    pointer-events: none;
}

.selected:before {
    content: "";
    position: absolute;
    width: 50px;
    height: 50px;
    border: 5px orangered solid;
    border-radius: 50%;
    transform: translate(20px, -50%);
}

.menu div:nth-child(2):hover ~ .selected {
    transform: rotate(calc(360deg / 6 * 0)) translate(-65px, -50%);
    animation: forwards .2s selectAnim-1;
}

.menu div:nth-child(3):hover ~ .selected {
    transform: rotate(calc(360deg / 6 * 1)) translate(-65px, -50%);
    animation: forwards .2s selectAnim-2;
}

.menu div:nth-child(4):hover ~ .selected {
    transform: rotate(calc(360deg / 6 * 2)) translate(-65px, -50%);
    animation: forwards .2s selectAnim-3;
}

.menu div:nth-child(5):hover ~ .selected {
    transform: rotate(calc(360deg / 6 * 3)) translate(-65px, -50%);
    animation: forwards .2s selectAnim-4;
}

.menu div:nth-child(6):hover ~ .selected {
    transform: rotate(calc(360deg / 6 * 4)) translate(-65px, -50%);
    animation: forwards .2s selectAnim-5;
}

.menu div:nth-child(7):hover ~ .selected {
    transform: rotate(calc(360deg / 6 * 5)) translate(-65px, -50%);
    animation: forwards .2s selectAnim-6;
}

@keyframes selectAnim-1 {
    0% {
        transform: rotate(calc(360deg / 6 * 0));
    }
    50% {
        transform: rotate(calc(360deg / 6 * 0)) translate(-65px, -50%);
    }
}

@keyframes selectAnim-2 {
    0% {
        transform: rotate(calc(360deg / 6 * 1));
    }
    50% {
        transform: rotate(calc(360deg / 6 * 1)) translate(-65px, -50%);
    }
}

@keyframes selectAnim-3 {
    0% {
        transform: rotate(calc(360deg / 6 * 2));
    }
    50% {
        transform: rotate(calc(360deg / 6 * 2)) translate(-65px, -50%);
    }
}

@keyframes selectAnim-4 {
    0% {
        transform: rotate(calc(360deg / 6 * 3));
    }
    50% {
        transform: rotate(calc(360deg / 6 * 3)) translate(-65px, -50%);
    }
}

@keyframes selectAnim-5 {
    0% {
        transform: rotate(calc(360deg / 6 * 4));
    }
    50% {
        transform: rotate(calc(360deg / 6 * 4)) translate(-65px, -50%);
    }
}

@keyframes selectAnim-6 {
    0% {
        transform: rotate(calc(360deg / 6 * 5));
    }
    50% {
        transform: rotate(calc(360deg / 6 * 5)) translate(-65px, -50%);
    }
}

.menu:hover {
    border: 50px solid black;
    background: transparent;
}

.menu:hover .six-pointed-star::after, .menu:hover .six-pointed-star::before {
    opacity: 1;
}

@keyframes menu-revolve {
    from {
        transform: rotate(0deg);
    }
    to {
        transform: rotate(360deg);
    }
}

.menu-active {
    border-radius: 50%;
    display: flex;
    justify-content: center;
    align-items: center;
    transition: .2s;
    width: 100%;
    height: 100%;
}

.menu:hover .menu-sub {
    pointer-events: auto;
    transform: rotate(calc(360deg / 6 * var(--i))) translate(5px);
    opacity: 1;
    border-radius: 50%;
    background: rgba(255, 255, 255, 0.5);
}

.menu:hover .menu-active {
    animation: 1.5s menu-revolve linear infinite reverse;
    color: black;
    background: white;
}

</style>