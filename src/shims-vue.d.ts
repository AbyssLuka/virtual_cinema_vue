declare module '*.js';
declare module 'subsrt';
declare module 'assjs';
declare module "*.png";
declare module "*.glsl";

// declare module '*.vue' {
//     import {ComponentOptions} from "vue";
//     const ComponentOptions: ComponentOptions;
//     export default ComponentOptions
// }

interface Window {
    dropWindow?: (id: string) => void;
    setBackgroundImage?: (url: string) => void;
    playLoading?: () => void;
}