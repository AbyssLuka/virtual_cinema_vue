<template>
  <div class="bread-crumbs">
    <div class="bread-crumbs-item" v-for="(item,index) in inList" :key="index"
         @click="callBack(item)">
            <span class="bread-crumbs-title"
                  :style="state.selectedIndex === index ? 'color:orangered':''">{{ item.title }}</span>
      <span v-if="index !== inList.length -1">&nbsp;&nbsp;{{ symbol }}&nbsp;&nbsp;</span>
    </div>
  </div>
</template>

<script setup lang="ts">
import {reactive, defineProps, watch, onMounted} from "vue";

interface I_BreadCrumbsItem {
  title: string,
  path: string,
}

const {
  symbol = "|",
  callBack = (item: I_BreadCrumbsItem) => {
    console.log("面包屑被点击！！！", item);
  },
  defaultIndex = 0,
} = defineProps<{
  inList: I_BreadCrumbsItem[],
  symbol?: string,
  callBack?: (item: I_BreadCrumbsItem) => void,
  defaultIndex?: number
}>();

const state = reactive<{
  selectedIndex: number
}>({
  selectedIndex: -1,
});

onMounted(() => {
  // state.selectedIndex = props.defaultIndex as number;
});

watch(() => defaultIndex, (newIndex) => {
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