<template>
    <div class="mask-container">
        <div class="mask" ref="mask-container">
            <div class="mask-1" ref="mask-1"></div>
            <div class="mask-2" ref="mask-2"></div>
        </div>
    </div>
</template>

<script setup lang="ts">
import {useTemplateRef} from "vue";

const maskContainerEl = useTemplateRef<HTMLDivElement>("mask-container");
const mask_1_El = useTemplateRef<HTMLDivElement>("mask-1");
const mask_2_El = useTemplateRef<HTMLDivElement>("mask-2");
const playLoading = () => {
    maskContainerEl.value!.style.display = "";
    const mask_1_ElAnimation = mask_1_El.value!.animate({transform: "translate(0,0)"}, {
        duration: 300,
        fill: "forwards"
    });
    const mask_2_ElAnimation = mask_2_El.value!.animate({transform: "translate(0,0)",}, {
        duration: 300,
        fill: "forwards"
    });
    mask_1_ElAnimation.finished.then(() => {
        const animation = maskContainerEl.value!.animate({transform: "rotate(-45deg)",}, {
            duration: 300,
            fill: "forwards",
        });
        animation.finished.then(() => {
            const intervalId = setInterval(()=>{
                if (document.readyState == "complete") {
                    const mask_1_ElAnimation_temp = mask_1_El.value!.animate({transform: "translate(0,-120vh)",}, {duration: 300,});
                    mask_2_El.value!.animate({transform: "translate(0,120vh)",}, {duration: 300,});
                    mask_1_ElAnimation_temp.finished.then(() => {
                        maskContainerEl.value!.style.display = "none";
                        animation.reverse();
                        mask_1_ElAnimation.reverse();
                        mask_2_ElAnimation.reverse();
                    });
                    clearInterval(intervalId);
                }
            },300);
        })
    })
}
window.playLoading = playLoading;
</script>

<style scoped>
.mask-container {
    position: fixed;
    height: 100vh;
    width: 100vw;
    top: 0;
    pointer-events: none;
    left: 0;
}

.mask {
    position: fixed;
    height: 300vh;
    width: 200vw;
    top: -100%;
    left: -50%;
    transform-origin: center;
    transform: rotate(45deg);
}

.mask-1, .mask-2 {
    width: 100%;
    height: 50%;
}

.mask-1 {
    background: rgb(255, 255, 255);
    transform: translate(0, -120vh);
}

.mask-2 {
    background: rgb(0, 0, 0);
    transform: translate(0, 120vh);
}
</style>