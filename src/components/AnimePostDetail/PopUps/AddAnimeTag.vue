<template>
    <div class="add-tag-container">
        <div class="tag-item-container">
            <div class="tag-item" v-for="(item,index) in 100" :key="index">hello</div>
            <div class="tag-item" @click="addTag()">+</div>
        </div>
    </div>
</template>

<script setup lang="ts">
    import {reactive, defineProps} from "vue";

    reactive({
        tagList: [],
    });

    defineProps({
        data: Object,
        updateTitle: Function,
    });

    function addTag() {
        console.log("添加TAG");
    }
</script>

<style scoped>
    .tag-item {
        height: 30px;
        min-width: 40px;
        padding: 0 10px;
        display: flex;
        justify-content: center;
        align-items: center;
        background: black;
        color: white;
        margin: 5px 5px;
        border-radius: 2px;
    }

    .tag-item:hover {
        color: orangered;
    }

    .tag-item:active {
        transform: translate(0, 5px);

    }

    .tag-item-container {
        display: flex;
        flex-wrap: wrap;
    }

    .add-tag-container {
        width: 100%;
        height: 100%;
        overflow-y: auto;
    }
</style>