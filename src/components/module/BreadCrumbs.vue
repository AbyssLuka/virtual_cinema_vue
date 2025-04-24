<template>
    <div class="bread-crumbs">
        <div class="bread-crumbs-item" v-for="(item,index) in inList" :key="index"
             @click="callBack(item)">
            <span class="bread-crumbs-title"
                  :style="selectedIndex === index ? 'color:orangered':''">{{ item.title }}</span>
            <span v-if="index !== inList.length -1">&nbsp;&nbsp;{{ symbol }}&nbsp;&nbsp;</span>
        </div>
    </div>
</template>

<script setup lang="ts">
import {reactive, defineProps, watch, ref} from "vue";

interface I_BreadCrumbsItem {
    title: string,
    path: string,
}

const {
    symbol = "|",
    callBack = (item: I_BreadCrumbsItem) => console.log("面包屑被点击！！！", item),
    defaultIndex = 0,
} = defineProps<{
    inList: I_BreadCrumbsItem[],
    symbol?: string,
    callBack?: (item: I_BreadCrumbsItem) => void,
    defaultIndex?: number
}>();

const selectedIndex = ref<number>(-1);

watch(() => defaultIndex, (newIndex:number) => {
    selectedIndex.value = newIndex;
}, {immediate: true});
</script>

<style scoped>
.bread-crumbs {
    display: flex;
}

.bread-crumbs-item {
    user-select: none;
}

.bread-crumbs-title {
    cursor: pointer;
    color: white;
    transition: .5s;
}

.bread-crumbs-title:hover {
    color: orangered;
}
</style>