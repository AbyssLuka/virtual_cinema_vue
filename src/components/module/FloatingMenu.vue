<template>
    <div class="floating-menu horiz vert-center">
        <img class="avatar" alt="" :src="state.profileUrl" @click="toLogin"/>
        <div v-for="(item,index) in props.menu" :key="index" class="floating-menu-item">
            <router-link :to="item.url">
                <div class="menu-icon center" :class="item.icon"
                     :style="[state.routePath===item.url?'color:orangered;font-weight:bold':'color:white']"></div>
                <div class="menu-title"
                     :style="[state.routePath===item.url?'color:orangered;font-weight:bold':'color:white']">
                    {{item.title}}
                </div>
            </router-link>
        </div>
        <!--        移动设备-->
        <div class="collage ri-collage-line center" @click="[state.mobile = !state.mobile]">
            <div class="floating-menu-mobile" v-show="state.mobile">
                <div v-for="(item,index) in props.menu" :key="index" class="floating-menu-mobile-item">
                    <router-link :to="item.url" style="display: flex;align-items: center;">
                        <div class="menu-icon center" :class="item.icon"
                             :style="[state.routePath===item.url?'color:orangered;font-weight:bold':'color:white']"></div>
                        <div class="menu-title-mobile"
                             :style="[state.routePath===item.url?'color:orangered;font-weight:bold':'color:white']">
                            {{item.title}}
                        </div>
                    </router-link>
                </div>
            </div>
        </div>
    </div>
</template>

<script setup lang="ts">
    import api from "@/request/api";
    import {reactive, defineProps, onMounted, watch} from "vue";
    import {useRoute} from "vue-router";


    interface I_VueData {
        profileUrl: string,
        mobile: boolean,
        routePath: string,
    }

    const state: I_VueData = reactive({
        profileUrl: "",
        mobile: false,
        routePath: "",
    });

    const route = useRoute();
    //监听当前路由地址
    watch(() => route.path, () => {
        state.routePath = route.path;
    }, {immediate: true});

    interface I_Menu {
        title: string,
        icon: string,
        url: string,
    }

    const props = defineProps<{
        menu: I_Menu[],
        toLogin: () => void,
    }>();

    onMounted(async () => {
        state.profileUrl = await api.profileUrl();
    });
</script>

<style scoped>

    @media (max-width: 768px) {
        .floating-menu-item {
            display: none;
        }

        .floating-menu-mobile {
            display: block;
            position: fixed;
            top: 75px;
            right: 10px;
            width: auto;
            height: auto;
            background: #111111;
        }

        .floating-menu-mobile-item {
            width: auto;
            height: 40px;
            overflow: hidden;
            cursor: pointer;
        }

        .menu-title-mobile {
            width: 30px;
            font-size: 10px;
            font-weight: bold;
            color: white;
            display: flex;
            align-items: center;
        }

        .collage {
            height: 40px;
            width: 40px;
            background: black;
            border-radius: 50%;
            margin-left: auto;
            color: white;
        }
    }

    @media (min-width: 768px) {
        .floating-menu-item {
            width: 40px;
            height: 40px;
            overflow: hidden;
            cursor: pointer;
        }

        .floating-menu-mobile {
            display: none;
        }

        .collage {
            display: none;
        }
    }

    .floating-menu {
        width: auto;
    }

    .menu-icon {
        width: 30px;
        height: 30px;
        margin: 5px 5px;
        position: relative;
        transition: .5s;
        top: 0;
        font-size: 24px;
    }

    .menu-title {
        width: 30px;
        height: 20px;
        margin: 5px 5px;
        position: relative;
        text-align: center;
        font-size: 10px;
        transition: .5s;
        top: 0;
        opacity: 0;
        font-weight: bold;
        color: white;
    }

    .floating-menu-item:hover .menu-icon {
        top: -30px;
        opacity: 0;
    }

    .floating-menu-item:hover .menu-title {
        top: -30px;
        opacity: 1;
    }

    .avatar {
        height: 40px;
        width: 40px;
        border-radius: 50%;
        margin: 0 5px;
    }

    .avatar[src=""], .avatar:not([src]) {
        opacity: 1;
    }
</style>