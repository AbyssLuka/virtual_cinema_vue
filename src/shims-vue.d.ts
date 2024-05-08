// declare module '*.vue' {
//     import type { DefineComponent } from 'vue'
//     // eslint-disable-next-line @typescript-eslint/ban-types,@typescript-eslint/no-explicit-any
//     const component: DefineComponent<{}, {}, any>;
//     export default component
// }

declare module '*.js';
declare module 'subsrt';
declare module 'assjs';
declare module "*.png";
declare module "*.glsl";

declare module '*.vue' {
    import {ComponentOptions} from "vue";
    const ComponentOptions: ComponentOptions;
    export default ComponentOptions
}

interface Window {
    dropWindow?: (id: string) => void;
    setBackgroundImage?: (url: string) => void;
}