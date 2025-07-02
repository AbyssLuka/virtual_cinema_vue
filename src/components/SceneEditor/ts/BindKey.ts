import * as SceneSave from "@/components/SceneEditor/ts/AutoSave";
import {editor} from "@/components/SceneEditor/ts/Editor";
import {undo} from "@/components/SceneEditor/ts/Operation";

const saveScene = () => {
    SceneSave.saveScene.save();
}

const deleteModel = () => {
    editor.removeFocusObject();
}

const key1 = [
    "a", "b", "c", "d", "e", "f", "g", "h",
    "i", "j", "k", "l", "m", "n", "o", "p",
    "q", "r", "s", "t", "u", "v", "w", "x",
    "y", "z", "0", "1", "2", "3", "4", "5",
    "6", "7", "8", "9", "Delete"
] as const;
const key2 = [
    "ctrl", "shift", "alt"
] as const;

//构建数组工具类型
type BuildArray<
    L extends number,
    E = any,
    A extends any[] = []
> = A['length'] extends L ? A : BuildArray<L, E, [...A, E]>;
//构建AB两个数组合并，取长度，实现相加
type Add<A extends number, B extends number> =
    A extends 0 ? B :
        B extends 0 ? A :
            [...BuildArray<A>, ...BuildArray<B>]['length'];

type KeyUnion<
    T extends readonly string[],
    I extends number = 0,
    J extends number = 0,
> = I extends T['length'] ? never :
    J extends T['length'] ? KeyUnion<T, Add<I, 1>, Add<I, 1>> :
        T[I] extends T[J] ? KeyUnion<T, I, Add<J, 1>> :
            `${T[I]}+${T[J]}` | KeyUnion<T, I, Add<J, 1>>;

type ControlsKey = KeyUnion<typeof key2> | typeof key2[number];
export type KeyType = `${ControlsKey}+${typeof key1[number]}` | typeof key1[number];


type Minus<A extends number, B extends number> =
    B extends 0 ? A :
        A extends 0 ? 0 :
            BuildArray<A> extends [...BuildArray<B>, ...infer R] ? R["length"] : 0

type Multi<A extends number, B extends number> =
    B extends 0 ? 0 : Add<A, Multi<A, Minus<B, 1>>>

type NumUnion<
    Min extends number,
    Max extends number,
> = Min extends Max ? Max :
    Min | NumUnion<Add<Min, 1>, Max>;

type Mod<
    A extends number,
    B extends number,
> = A extends NumUnion<0, Minus<B, 1>> ?
    A : Mod<Minus<A, B>, B>;

type Div<
    A extends number,
    B extends number,
    C extends number = 0
> = A extends NumUnion<0, Minus<B, 1>> ? C :
    Div<Minus<A, B>, B, Add<C, 1>>;

const fnMap: {
    [key in KeyType]?: Set<Function>
} = {}

const on = (key: KeyType, cb: Function) => {
    if (!fnMap[key]) {
        fnMap[key] = new Set<Function>();
    }
    fnMap[key]?.add(cb);
}

const emit = (key: KeyType, ...args: any[]) => {
    if (!fnMap[key]) {
        return;
    }
    fnMap[key]?.forEach(fn => fn(...args))
}

const generateKey = (event: KeyboardEvent): KeyType | undefined => {
    const key = <typeof key1[number]>event.key;
    if (!key) return void 0;
    const keyList: (typeof key1[number] | typeof key2[number])[] = [];
    if (event.ctrlKey) keyList.push("ctrl");
    if (event.shiftKey) keyList.push("shift");
    if (event.altKey) keyList.push("alt");
    keyList.push(key);
    return <KeyType>keyList.join("+").toLowerCase();
}

export const initKeyBind = () => {
    on("ctrl+s", saveScene);
    on("Delete", deleteModel);
    on("ctrl+z", undo);
    const keys = Object.keys(fnMap)
    document.addEventListener("keydown", (event) => {
        const unionKey = generateKey(event);
        if (keys.includes(<string>unionKey))
            event.preventDefault();
        console.log(unionKey)
        if (unionKey) emit(unionKey);
    });
}