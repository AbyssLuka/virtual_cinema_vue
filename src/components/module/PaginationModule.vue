<template>
    <div class="page-content">
        <ul class="page-ul">
            <li :class="[state.pageIndex === 1?'selectPage':'unSelectPage']"
                class="ri-arrow-left-circle-line" style="font-size: 30px;"
                @click="[props.active(0),state.pageIndex = 1]">
            </li>
            <li :class="[state.pageIndex === 1?'selectPage':'unSelectPage']"
                class="ri-arrow-left-s-line" style="font-size: 30px;"
                @click="[props.active(state.pageIndex-2),state.pageIndex -= 1]">
            </li>
            <li v-for="(item,index) in Math.ceil(total/size)" :key="index"
                @click="[props.active(index),state.pageIndex = index + 1]" style="font-weight: bold;"
                v-show="index + 1 > state.pageIndex - 3 && index + 1 < state.pageIndex + 3"
                :class="[state.pageIndex === index+1?'selectPage':'unSelectPage']">{{index+1}}
            </li>
            <li :class="[state.pageIndex === Math.ceil(total / size)?'selectPage':'unSelectPage']"
                class="ri-arrow-right-s-line" style="font-size: 30px;"
                @click="[props.active(state.pageIndex),state.pageIndex += 1]">
            </li>
            <li :class="[state.pageIndex === Math.ceil(total/size)?'selectPage':'unSelectPage']"
                class="ri-arrow-right-circle-line" style="font-size: 30px;"
                @click="[props.active(Math.ceil(props.total / size) - 1),state.pageIndex = Math.ceil(total / size)]">
            </li>
        </ul>
    </div>
</template>

<script setup lang="ts">

    import {reactive, defineProps, watch, withDefaults} from "vue";

    const props = withDefaults(defineProps<{
        page?: number,
        size?: number,
        total?: number,
        active?: (index: number) => void,
    }>(), {
        page: 0,
        size: 1,
        total: 1,
        active: (index: number) => console.log(index),
    });

    const state = reactive({
        pageIndex: 1,
    });

    watch(() => props.page, (newIndex) => {
        state.pageIndex = newIndex + 1;
    }, {immediate: true});
</script>

<style scoped>
    @media (max-width: 768px) {
    }

    @media (min-width: 768px) and (max-width: 1400px) {
    }

    @media (min-width: 1400px ) {
    }

    .page-content {
        width: 100%;
        user-select: none;
    }

    .page-ul {
        display: flex;
        justify-content: center;
    }

    .page-ul li {
        width: 40px;
        height: 40px;
        display: flex;
        justify-content: center;
        align-items: center;
        cursor: pointer;
        border-radius: 50%;
    }

    .page-ul li:hover {
        background: black;
        color: white;
    }

    .selectPage {
        background: black;
        color: white;
        pointer-events: none;
    }

    .unSelectPage {
        background: transparent;
    }
</style>