<template>
    <div class="index">
        <div class="index-router-view">
            <div class="router-view-container">
                <router-view v-slot="{Component}">
                    <transition>
                        <component :is="Component"/>
                    </transition>
                </router-view>
            </div>
            <header-menu class="header-menu"></header-menu>
        </div>
    </div>
</template>

<script setup lang="ts">
import HeaderMenu from "@/components/module/HeaderMenu.vue";
</script>

<style scoped>

.v-enter-active,
.v-leave-active {
    transition: opacity 0.5s ease;
}

.v-enter-from,
.v-leave-to {
    opacity: 0;
}

.header-menu {
    min-height: 75px;
    height: auto;
    width: 100vw;
    backdrop-filter: blur(10px);
    background: rgba(255, 255, 255, 0.5);
}

.router-view-container {
    width: 100%;
    height: calc(100% - 75px);
    overflow: hidden;
}

.index {
    display: flex;
    flex-direction: column-reverse;
    width: 100vw;
    height: 100vh;
    background-size: cover;
}

.index-router-view {
    display: flex;
    flex-direction: column-reverse;
    width: 100vw;
    height: 100vh;
    position: absolute;
    top: 0;
    left: 0;
}
</style>