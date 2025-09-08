<script setup lang="ts">
import { defineAsyncComponent, ref } from "vue";

/**待办列表 */
const ReceivedList = defineAsyncComponent(
  () => import("@/views/lf/received/list.vue")
);
/**
 * 代码编码器
 */
const ReceivedListRef = ref<InstanceType<typeof ReceivedList> | null>(null);
</script>

<template>
  <ReceivedList ref="ReceivedListRef" for="cc" />
</template>
