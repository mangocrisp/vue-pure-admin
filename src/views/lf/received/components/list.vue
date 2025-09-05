<script setup lang="ts">
import { nextTick, onMounted, ref, watch } from "vue";
import { ReceviedListProps } from "../utils/types";

defineOptions({
  name: "ReceivedList"
});

const props = withDefaults(defineProps<ReceviedListProps>(), {
  for: "todo"
});

/**
 * 表单
 */
const queryForm = ref();

/**
 * 监听 props
 */
watch(props, val => {});
</script>

<template>
  <div>for: {{ props.for }}</div>
</template>
