<template>
    <div class="document-content" id="document-content">
        <div v-for="(item ,index) in state.fileInfoLineList" :key="index"
             class="text-line horiz">
            <div class="text-line-index text-hidden">{{ index + 1 }}</div>
            <div class="text-line-content">{{ item }}</div>
        </div>
    </div>
</template>

<script setup lang="ts">
import util from "@/util/util";
import {baseUrl} from "@/global/global";
import {reactive, defineProps, watch, withDefaults} from "vue";
import {I_File} from "@/global/interface";

const state = reactive<{
    fileInfoLineList: string[]
}>({
    fileInfoLineList: [],
});
const props = withDefaults(defineProps<{
    data: I_File
}>(), {});

watch(() => props.data, (newData: I_File) => {
    openDocument(newData);
}, {immediate: true});

function openDocument(docObj: I_File) {
    let fileInfo = util.loadFile(baseUrl + "/file/" + docObj["fileUuid"]);
    if (fileInfo != null) {
        state.fileInfoLineList = fileInfo.split("\n");
    }
}
</script>

<style scoped>
.text-line {
    width: 100%;
    height: auto;
}

.text-line-index {
    width: 50px;
    border-right: solid 2px #82ff84;
    color: #5e96ff;
    margin-left: 5px;
}

.text-line-content {
    width: calc(100% - 100px);
    padding: 0 20px;
}

.document-content {
    width: 100%;
    height: 100%;
    overflow-y: auto;
}
</style>