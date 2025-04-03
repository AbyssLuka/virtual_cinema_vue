<template>
    <div class="page-content">
        <ul class="page-ul">
            <li :class="[pageIndex === 1?'selectPage':'unSelectPage']"
                class="ri-arrow-left-double-line" style="font-size: 30px;"
                @click="[active(0),pageIndex = 1]">
            </li>
            <li :class="[pageIndex === 1?'selectPage':'unSelectPage']"
                class="ri-arrow-left-s-line" style="font-size: 30px;"
                @click="[active(pageIndex-2),pageIndex -= 1]">
            </li>
            <li v-for="(item,index) in Math.ceil(total/size)" :key="item"
                @click="[active(index),pageIndex = index + 1]" style="font-weight: bold;"
                v-show="index + 1 > pageIndex - 3 && index + 1 < pageIndex + 3"
                :class="[pageIndex === index+1?'selectPage':'unSelectPage']">{{ index + 1 }}
            </li>
            <li :class="[pageIndex === Math.ceil(total / size)?'selectPage':'unSelectPage']"
                class="ri-arrow-right-s-line" style="font-size: 30px;"
                @click="[active(pageIndex),pageIndex += 1]">
            </li>
            <li :class="[pageIndex === Math.ceil(total/size)?'selectPage':'unSelectPage']"
                class="ri-arrow-right-double-line" style="font-size: 30px;"
                @click="[active(Math.ceil(total / size) - 1),pageIndex = Math.ceil(total / size)]">
            </li>
        </ul>
    </div>
</template>

<script setup lang="ts">

import { defineProps, watch, withDefaults, ref} from "vue";

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

const pageIndex = ref(1)

watch(() => props.page, (newIndex) => {
    pageIndex.value = newIndex + 1;
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