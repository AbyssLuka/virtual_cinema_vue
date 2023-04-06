<template>
    <div class="header">
        <router-link class="horiz" to="/">
            <div class="logo ri-eye-2-line ri-4x"></div>
            <div class="luka-title center">Luka</div>
        </router-link>
        <floating-menu :menu="state.floatingMenu" :to-login="toLogin" :collage="collage"
                       id="floating-window" class="floating-window"></floating-menu>
    </div>
</template>

<script setup lang="ts">
    import FloatingMenu from "@/components/module/FloatingMenu.vue";

    import {reactive} from "vue";
    import {useRouter} from "vue-router";

    const state = reactive({
        floatingMenu: [
            {
                title: "主页",
                icon: "ri-home-line",
                url: "/",
            },
            {
                title: "3D",
                icon: "ri-code-box-fill",
                url: "/threejs",
            },
            {
                title: "漫画",
                icon: "ri-image-2-line",
                url: "/comic",
            },
            {
                title: "收藏",
                icon: "ri-star-line",
                url: "/user/collect",
            },
            {
                title: "设置",
                icon: "ri-settings-2-line",
                url: "/user/option",
            },
            {
                title: "文件",
                icon: "ri-folder-line",
                url: "/files",
            },
        ]
    });

    const router = useRouter();

    function toLogin() {
        if (![null, undefined, "undefined", "null", ""].includes(localStorage.getItem("token"))) {
            router.push("/user/option")
        } else {
            router.push("/login")
        }
    }

    function collage() {
        //
    }
</script>

<style scoped>
    .header {
        display: flex;
        align-items: center;
        justify-content: flex-start;
    }

    .floating-window {
        /*width: 320px;*/
        /*height: 50px;*/
        top: 100px;
        right: -150px;
        margin-left: auto;
    }

    .logo {
        width: 50px;
        height: 50px;
        margin: 0 10px 0 50px;
        cursor: pointer;
        display: flex;
        justify-content: center;
        align-items: center;
        animation: rotate 2s linear infinite;
        color: black;
    }

    .logo:hover {
        font-size: 80px;
        text-shadow: 0 0 10px rgba(50, 50, 50, 0.5);
    }

    @keyframes rotate {
        from {
            transform: rotate(0deg);
        }
        to {
            transform: rotate(365deg);
        }
    }

</style>