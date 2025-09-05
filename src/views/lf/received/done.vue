<script setup lang="ts">
import { defineAsyncComponent, ref } from "vue";

/**可选字段导出面板 */
const ReceivedList = defineAsyncComponent(
  () => import("@/views/lf/received/components/list.vue")
);
/**
 * 代码编码器
 */
const ReceivedListRef = ref<InstanceType<typeof ReceivedList> | null>(null);
</script>

<template>
  <ReceivedList ref="ReceivedListRef" for="done" />
</template>
