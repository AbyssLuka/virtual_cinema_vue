import {createRouter, createWebHistory} from "vue-router"

const routes = [
    {
        path: "/",
        name: "IndexView",
        meta: {
            requireAuth: true,
        },
        component: () => import("@/view/IndexView.vue"),
        children: [
            {
                path: "/",
                name: "AnimeView",
                component: () => import("@/view/AnimeView.vue")
            },
            {
                path: "comic",
                name: "ComicView",
                component: () => import("@/view/ComicView.vue")
            },
            {
                path: "threejs",
                name: "ThreeJs",
                component: () => import("@/view/ThreeJsView.vue")
            },
            {
                path: "comic/detail",
                name: "ComicDetailView",
                component: () => import("@/view/ComicDetailView.vue")
            },
            {
                path: "/files",
                name: "FileView",
                component: () => import("@/view/FileView.vue")
            },
            {
                path: "anime/detail",
                name: "AnimeDetailView",
                component: () => import("@/view/AnimeDetailView.vue")
            },
            {
                path: "/user",
                name: "UserOptionView",
                component: () => import("@/view/UserOptionView.vue"),
                children: [
                    {
                        path: "option",
                        name: "UserOption",
                        component: () => import("@/components/UserOption/UserOption.vue")
                    },
                    {
                        path: "collect",
                        name: "Collect",
                        component: () => import("@/components/UserOption/Collect.vue")
                    },
                ]
            },
        ]
    },
    {
        path: "/login",
        name: "LoginViewPlus",
        component: () => import("@/view/LoginViewPlus.vue")
    },
];

const router = createRouter({
    history: createWebHistory(),
    routes: routes
});

// router.beforeEach((to,from,next)=>{
//     if (to.matched.some(res => res.meta.requireAuth)){
//         console.log(localStorage.getItem("username"));
//         if (localStorage.getItem("username")){
//             next();
//         }else {
//             next({
//                 path:"/login",
//                 query:{redirect:to.fullPath}
//             });
//         }
//     }else {
//         next()
//     }
// });

export default router;