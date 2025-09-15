<script setup lang="ts">
import { defineAsyncComponent, ref } from "vue";

/**待办列表 */
const ProcessList = defineAsyncComponent(
  () => import("@/views/lf/process/list.vue")
);
/**
 * 代码编码器
 */
const ProcessListRef = ref<InstanceType<typeof ProcessList> | null>(null);
</script>

<template>
  <ProcessList ref="ProcessListRef" who="me" />
</template>
