<template>
    <div class="gui-container">
        <div class="foresight-container" style="justify-content: center;">
            <h1>+</h1>
        </div>
        <div class="role-gui-container" style="justify-content: flex-end;">
            <div v-show="props.detectShow">按E互动</div>
            <h1 style="background: rgba(0,0,0,0.5)">{{props.subtitle}}</h1>
            <h2>{{props.activeInfo}}</h2>
            <table style="border-collapse: collapse">
                <tr>
                    <td v-for="index in 10" :key="index"
                        style="width: 60px;height: 60px;border: #111111 2px solid;background: rgba(255,255,255,0.2);flex-shrink: 0"
                        :style="[props.roleGoodsIndex===index?'background:orangered':'background:']">
                        <div style="width: 100%;height: 100%;display: flex;justify-content: center;align-items: center;"
                             v-if="index <= props.roleGoods.length">
                            {{props.roleGoods[index - 1]?.userData?.type}}
                        </div>
                    </td>
                </tr>
            </table>
        </div>
    </div>

</template>

<script setup lang="ts">
    import {defineProps} from "vue";
    import {default as THREE} from "three";


    const props = defineProps<{
        roleGoods: THREE.Object3D[],
        activeInfo: string,
        roleGoodsIndex: number,
        subtitle: string,
        detectShow: boolean,
    }>();


</script>

<style scoped>
    .gui-container{
        bottom: 0;
        left: 0;
        width: 100%;
        height: 100%;
        transform: translate(0,-100%);
    }
    .role-gui-container, .foresight-container {
        position: fixed;
        width: 100%;
        height: 100%;
        display: flex;
        align-items: center;
        flex-direction: column;
        pointer-events: none;
        color: white;
    }
</style>