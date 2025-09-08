<script setup lang="ts">
import { useLogicFlowFormRender } from "./utils/hook";
import { type FormCreateCreatorProps } from "@/views/components/form-create/form-creator/utils/types";

defineOptions({
  name: "LfFormRender"
});

const props = withDefaults(defineProps<FormCreateCreatorProps>(), {
  isAddForm: false,
  rule: () => [
    {
      type: "input",
      field: "goods_name",
      title: "商品名称",
      value: "form-create"
    },
    {
      type: "checkbox",
      field: "label",
      title: "标签",
      value: [0, 1, 2, 3],
      options: [
        { label: "好用", value: 0 },
        { label: "快速", value: 1 },
        { label: "高效", value: 2 },
        { label: "全能", value: 3 }
      ]
    }
  ],
  options: () => ({
    // 考虑到不知道是弹窗还是新页面来编辑，所以这里把默认的操作按钮给隐藏了，可以使用 api.submit(formData, api) 和 api.resetFields() 来操作提交和重置表单
    submitBtn: false,
    resetBtn: false
  }),
  modelValue: () => ({}),
  api: null
});

/**
 * 定义钩子
 */
const emit = defineEmits<{
  /**保存数据 */
  (e: "submit", value: any): void;
  (e: "update:api", value: any): void;
  (e: "update:modelValue", value: any): void;
}>();

const {
  FormCreateCreator,
  FormCreateCreatorRef,
  isAddForm,
  modelValueRef,
  ruleRef,
  optionsRef,
  apiRef,
  handleSubmit,
  handleModelValueChange,
  handleApiChange
} = useLogicFlowFormRender(props, emit);

defineExpose({
  getFormCreateCreatorRef: () => FormCreateCreatorRef,
  getCreatorRef: () => FormCreateCreatorRef.value.getCreatorRef(),
  getApiRef: () => FormCreateCreatorRef.value.getApiRef(),
  resetForm: () => FormCreateCreatorRef.value.resetForm(),
  loadData: () => FormCreateCreatorRef.value.resetForm()
});
</script>

<template>
  <FormCreateCreator
    ref="FormCreateCreatorRef"
    :is-add-form="isAddForm"
    :rule="ruleRef"
    :options="optionsRef"
    :api="apiRef"
    :modelValue="modelValueRef"
    @submit="handleSubmit"
    @update:modelValue="handleModelValueChange"
    @update:api="handleApiChange"
  />
</template>
