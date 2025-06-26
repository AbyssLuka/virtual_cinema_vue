import {saveScene} from "@/components/SceneEditor/ts/AutoSave";
import {editor} from "@/components/SceneEditor/ts/Editor";
import {undo} from "@/components/SceneEditor/ts/Operation";

const SaveScene = () => {
    saveScene.save();
}

const DeleteModel = () => {
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

// 1. 构建数组工具类型
type BuildArray<
    L extends number,
    E = any,
    A extends any[] = []
> = A['length'] extends L ? A : BuildArray<L, E, [...A, E]>;

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
export type keyType =
    `${
        KeyUnion<typeof key2> |
        typeof key2[number]
    }+${typeof key1[number]}` | typeof key1[number];


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
    [key in keyType]?: Set<Function>
} = {}

const on = (key: keyType, cb: Function) => {
    if (!fnMap[key]) {
        fnMap[key] = new Set<Function>();
    }
    fnMap[key]?.add(cb);
}

const emit = (key: keyType, ...args: any[]) => {
    if (!fnMap[key]) {
        return;
    }
    fnMap[key]?.forEach(fn => fn(...args))
}

const generateKey = (event: KeyboardEvent): keyType | undefined => {
    const key = <typeof key1[number]>event.key;
    if (!key) return void 0;
    const keyList: (typeof key1[number] | typeof key2[number])[] = [];
    if (event.ctrlKey) keyList.push("ctrl");
    if (event.shiftKey) keyList.push("shift");
    if (event.altKey) keyList.push("alt");
    keyList.push(key);
    return <keyType>keyList.join("+")
}

export const initKeyBind = () => {
    on("ctrl+s", SaveScene);
    on("Delete", DeleteModel);
    on("ctrl+z", undo);

    document.addEventListener("keydown", (event) => {
        const unionKey = generateKey(event);
        if (unionKey === "ctrl+s") event.preventDefault();
        console.log(unionKey)
        if (unionKey) emit(unionKey);
    });
}