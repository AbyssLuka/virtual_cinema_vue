import {createApp} from 'vue';

import router from "@/router";
import store from "@/store";

import "@/assets/css/element-luka.css";
import "@/assets/css/animation-luka.css";
import "remixicon/fonts/remixicon.css";

import imgLazy from "@/directives/imgLazy";
import horiAnimLazy from "@/directives/horiAnimLazy";

import App from "@/App.vue";


const app = createApp(App);
app.directive("img-lazy", imgLazy);
app.directive("hori-anim-lazy", horiAnimLazy);
app.use(router);
app.use(store);
app.mount('#app');