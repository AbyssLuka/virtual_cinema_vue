<template>
    <div class="input-container">
        <div class="input-title">{{ title }}:</div>
        <input class="number-input"
               type="number"
               v-model="value"/>
    </div>
</template>

<script setup lang="ts">
import {defineProps, defineModel, computed} from "vue";

const model = defineModel<number>();
const value = computed({
    get: () => +(model.value?.toFixed(2) || "0.00"),
    set: (val) => {
        if (!val) val = 0;
        model.value = val;
    }
});
const {
    title = "TITLE",
} = defineProps<{
    title: string
}>();
</script>

<style scoped>
.input-container {
    width: 100%;
    height: auto;
    display: flex;
    justify-content: center;
}

.input-title {
    margin: 0 .2rem;
}

input {
    background: transparent;
    border: transparent;
    display: flex;
    align-items: center;
    justify-content: center;
    outline: none;
    width: 4rem;
    padding: 0 .1rem;
    color: orangered;
}
</style>