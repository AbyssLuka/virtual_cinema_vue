<template>
    <div style="width: 100%;height: 100%" ref="editor-view"></div>
</template>

<script setup lang="ts">
import {WindowProps} from "@/util/createPopUps";
import {basicSetup, EditorView} from "codemirror";
import {onMounted, useTemplateRef} from "vue";
import {EditorState} from "@codemirror/state";
import {json} from "@codemirror/lang-json";
import { oneDark } from '@codemirror/theme-one-dark'

const props = defineProps<WindowProps<{
    jsonStr:string
}>>();
const editorViewEl = useTemplateRef<HTMLDivElement>("editor-view");
onMounted(()=>{
    const fillParent = EditorView.theme({
        "&": { height: "100%" },
        ".cm-scroller": { height: "100%" }
    })
    const state = EditorState.create({
        doc: props.data.jsonStr,
        extensions: [basicSetup, json(),oneDark,fillParent]
    })
    const view = new EditorView({
        state,
        parent: editorViewEl.value!
    })
})
</script>

<style scoped>

</style>