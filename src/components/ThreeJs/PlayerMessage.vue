<template>
    <div class="message-container" v-show="state.visible">
        <h1 class="message">{{ props.message }}</h1>
    </div>
</template>

<script setup lang="ts">
import {withDefaults, defineProps, watch, reactive} from "vue";

const props = withDefaults(defineProps<{
    message: string,
}>(), {
    message: "",
});

const state = reactive({
    visible: false
});

watch(() => props.message, () => {
    state.visible = true;
    setTimeout(() => {
        state.visible = false;
    }, 5000);
}, {immediate: true});

</script>

<style scoped>
.message-container {
    padding: 10px;
    background: rgba(168, 168, 168, 0.5);
    animation: x 1s forwards;
}

@keyframes x {
    from {
        opacity: 0;
    }
    to {
        opacity: 1;
    }
}

.message {
    color: orangered;
}
</style>