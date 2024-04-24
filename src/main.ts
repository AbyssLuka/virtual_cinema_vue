import {createApp} from 'vue';

import router from "@/router";
import store from "@/store";

import "@/assets/css/element-luka.css";
import "@/assets/css/animation-luka.css";
import "remixicon/fonts/remixicon.css";

import imgLazy from "@/directives/imgLazy";
import horiAnimLazy from "@/directives/horiAnimLazy";

import App from "@/App.vue";

// import {baseUrl} from "@/global/global";
// import {ajaxRequest} from "@/request/api";
// import createPopUps from "@/util/createPopUps";
// //TypeScript选项式API全局声明
// declare module '@vue/runtime-core' {
//     interface ComponentCustomProperties {
//         $createPopUps: typeof createPopUps,
//         $ajaxRequest: typeof ajaxRequest,
//         // eslint-disable-next-line @typescript-eslint/no-explicit-any
//         $refs: any,
//     }
// }

const app = createApp(App);
// app.config.globalProperties.$ajaxRequest = ajaxRequest;
// app.config.globalProperties.$baseUrl = baseUrl;
// app.config.globalProperties.$createPopUps = createPopUps;
app.directive("img-lazy", imgLazy);
app.directive("hori-anim-lazy", horiAnimLazy);
app.use(router);
app.use(store);
app.mount('#app');