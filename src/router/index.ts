import {createRouter, createWebHistory} from "vue-router"

const routes = [
    {
        path: "/",
        name: "IndexView",
        component: () => import("@/views/IndexView.vue"),
        children: [
            {
                path: "/",
                name: "AnimeView",
                component: () => import("@/views/VideoAlbumView.vue")
            },
            {
                path: "comic",
                name: "ComicView",
                component: () => import("@/views/ComicView.vue")
            },
            {
                path: "threejs/:room_id/:model_name/:video_id",
                name: "ThreeJs",
                component: () => import("@/views/ThreeJsView.vue")
            },
            {
                path: "game_main",
                name: "GameMain",
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
                path: "anime/detail",
                name: "AnimeDetailView",
                component: () => import("@/views/AnimeDetailView.vue")
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
    history: createWebHistory(),
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
});

export default index;