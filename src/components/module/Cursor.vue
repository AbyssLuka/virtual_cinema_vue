<template>
    <div class="cursor-box" ref="cursorBox">
        <div class="revolve" ref="revolve"></div>
        <div class="cursor" ref="cursor"></div>
        <div class="cross"></div>
    </div>
</template>

<script setup lang="ts">
import {onMounted, ref} from "vue";

let cursorBox = ref();
let revolve = ref();
let cursor = ref();

onMounted(() => {
    document.body.style.cursor = "none";
    let top = 0, left = 0;
    window.addEventListener("mousemove", (event) => {
        top = event.y - cursorBox.value.clientWidth / 2;
        left = event.x - cursorBox.value.clientHeight / 2;
        if (cursorBox.value.style.top !== top && cursorBox.value.style.left !== left) {
            cursorBox.value.style.top = top + "px";
            cursorBox.value.style.left = left + "px";
        }
    });

    window.addEventListener("mousedown", (event) => {
        // cursor.style.width = 60 + "px";
        // cursor.style.height = 60 + "px";
        revolve.value.style.width = 28 + "px";
        revolve.value.style.height = 28 + "px";
        cursor.value.style.transform = "scale(1.3)";
        let ripples = document.createElement("span");
        ripples.setAttribute("class", "circle");
        document.body.appendChild(ripples);
        ripples.style.top = event.y - ripples.clientHeight / 2 + "px";
        ripples.style.left = event.x - ripples.clientWidth / 2 + "px";
        setTimeout(() => {
            ripples.remove();
        }, 350);
    });
    window.addEventListener("mouseup", () => {
        cursor.value.style.transform = "scale(1)";
        // cursor.style.width = 40 + "px";
        // cursor.style.height = 40 + "px";
        revolve.value.style.width = 20 + "px";
        revolve.value.style.height = 20 + "px";
    });
    // setInterval(() => {
    //     if (cursorBox.value.style.top !== top && cursorBox.value.style.left !== left) {
    //         cursorBox.value.style.top = top + "px";
    //         cursorBox.value.style.left = left + "px";
    //     }
    // }, 20)
});
</script>

<style>
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