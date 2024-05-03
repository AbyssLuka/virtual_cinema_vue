<template>
    <label class="search">
        <div class="ri-search-eye-line ri-3x search-logo"
             @click="props.active(keyword)"></div>
        <input class="search-input"
               type="text"
               v-model="keyword"
               @keydown.enter="props.active(keyword)"/>
    </label>
</template>

<script setup lang="ts">
import {defineProps, withDefaults, ref} from "vue";

const keyword = ref("");

const props = withDefaults(defineProps<{
    active: (keyword: string) => void,
}>(), {
    active: (keyword: string) => console.log(keyword)
})

</script>

<style scoped>
.search-logo {
    cursor: pointer;
    transition: 0.2s;
}

.search-logo:hover {
    color: orangered;
    transform: rotateZ(90deg);
}
.search-logo:active {
    transform: translateY(5px);
}

.search {
    color: white;
}

.search-input {
    border: 0 solid white;
    border-bottom: 2px solid white;
    color: white;
}

.search {
    height: 50px;
    display: flex;
    align-items: center;
}

.search-input {
    background: transparent;
    outline: none;
    height: 35px;
    transition: .2s linear;
    width: 0;
}

.search:hover .search-input {
    width: 150px
}

.search-input:focus,
.search-input:valid {
    width: 150px
}
</style>