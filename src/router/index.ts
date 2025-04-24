import {createRouter, createWebHashHistory} from "vue-router"

const routes = [
    {
        path: "/",
        name: "IndexView",
        component: () => import("@/views/IndexView.vue"),
        children: [
            {
                path: "/",
                name: "VideoView",
                component: () => import("@/views/VideoAlbumView.vue")
            },
            {
                path: "comic",
                name: "ComicView",
                component: () => import("@/views/ComicView.vue")
            },
            {
                path: "threejs/:room_id/:model_name",
                name: "ThreeJs",
                component: () => import("@/views/ThreeJsView.vue")
            },
            {
                path: "game_main",
                name: "GameMain",
                meta: {
                    requireAuth: true,
                },
                component: () => import("@/views/GameMain.vue")
            },
            {
                path: "model_detail",
                name: "ModelDetail",
                component: () => import("@/views/ModelDetailView.vue")
            },
            {
                path: "comic/detail",
                name: "ComicDetailView",
                component: () => import("@/views/ComicDetailView.vue")
            },
            {
                path: "/files",
                name: "FileView",
                component: () => import("@/views/FileView.vue")
            },
            {
                path: "video/detail",
                name: "VideoDetailView",
                component: () => import("@/views/VideoDetailView.vue")
            },
            {
                path: "/user",
                name: "UserOptionView",
                meta: {
                    requireAuth: true,
                },
                component: () => import("@/views/UserOptionView.vue"),
                children: [
                    {
                        path: "option",
                        name: "UserOption",
                        component: () => import("@/components/UserOption/UserOption.vue")
                    },
                    {
                        path: "collect",
                        name: "UserCollect",
                        component: () => import("@/components/UserOption/UserCollect.vue")
                    },
                ]
            },
        ]
    },
    {
        path: "/login",
        name: "LoginViewPlus",
        component: () => import("@/views/LoginViewPlus.vue")
    },
];

const index = createRouter({
    history: createWebHashHistory(),
    routes: routes
});

index.beforeEach((to, from, next) => {
    if (to.matched.some(res => res.meta.requireAuth)) {
        const token = localStorage.getItem("token");
        if (token !== null && token !== "") {
            next();
        } else {
            next({path: "/login", query: {redirect: to.fullPath}});
        }
    } else {
        next()
    }
    if (window.playLoading) {
        window.playLoading();
    }
});

export default index;