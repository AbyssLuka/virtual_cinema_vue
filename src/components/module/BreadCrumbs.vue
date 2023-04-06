<template>
    <div class="bread-crumbs">
        <div class="bread-crumbs-item" v-for="(item,index) in props.inList" :key="index"
             @click="props.callBack(item)">
            <span class="bread-crumbs-title"
                  :style="state.selectedIndex === index ? 'color:orangered':''">{{item.title}}</span>
            <span v-if="index !== props.inList.length -1">&nbsp;&nbsp;{{symbol}}&nbsp;&nbsp;</span>
        </div>
    </div>
</template>

<script setup lang="ts">
    import {reactive, defineProps, watch, onMounted, withDefaults} from "vue";

    interface I_VueData {
        selectedIndex: number
    }

    interface I_BreadCrumbsItem {
        title: string,
        path: string,
    }

    const props = withDefaults(defineProps<{
        inList: I_BreadCrumbsItem[],
        symbol?: string,
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        callBack?: (item: any) => void,
        defaultIndex?: number
    }>(), {
        symbol: "|",
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        callBack: (item: any) => {
            console.log("面包屑被点击！！！");
            console.log(item);
        },
        defaultIndex: 0,
    });

    const state: I_VueData = reactive({
        selectedIndex: -1,
    });

    onMounted(() => {
        // state.selectedIndex = props.defaultIndex as number;
    });

    watch(() => props.defaultIndex, (newIndex) => {
        state.selectedIndex = newIndex as number;
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