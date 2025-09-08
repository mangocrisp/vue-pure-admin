<script setup lang="ts">
import { cloneDeep } from "@pureadmin/utils";
import { type FormCreateCreatorProps } from "./utils/types";
import { computed, ref } from "vue";
import { useI18n } from "vue-i18n";

const { locale: $locale } = useI18n();

defineOptions({
  name: "FormCreateCreator"
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

const isAddForm = ref(props.isAddForm);
const modelValueRef = ref(props.modelValue);
const ruleRef = ref(props.rule);
const optionsRef = ref(props.options);
const apiRef = ref(props.api);
const creatorRef = ref(null);
/** 重置表单方法 Ref */
const restFormValue = cloneDeep(props.modelValue);

/**
 * 定义钩子
 */
const emit = defineEmits<{
  /**保存数据 */
  (e: "submit", value: any): void;
  (e: "update:api", value: any): void;
  (e: "update:modelValue", value: any): void;
}>();
/**
 * 提交表单
 * @param value 表单数据
 */
const handleSubmit = (value: any) => emit("submit", value);

/**
 * 加载数据
 * @param rule 规则
 * @param options 选项
 * @param formData 表单数据
 */
const loadData = ({ rule, options, formData }) => {
  ruleRef.value = rule;
  optionsRef.value = options;
  modelValueRef.value = formData;
};

const getCreatorRef = () => creatorRef.value;
const getApiRef = () => apiRef.value;

/**
 * 国际化和系统的语言切换关联
 */
const locale = computed(() => {
  switch ($locale.value) {
    case "en":
      return "en";
    case "zh":
      return "zh-cn";
  }
  return "zh-cn";
});

/**
 * 重置表单
 * @param formEl 表单引用
 */
function resetForm() {
  if (!apiRef.value) return;
  if (isAddForm.value) {
    // 调用这个方法会清空表单
    apiRef.value.resetFields();
  } else {
    // 如果是修改表单，则把数据覆盖到表单中
    modelValueRef.value = cloneDeep(restFormValue);
    apiRef.value.coverValue(modelValueRef.value);
  }
}

const handleModelValueChange = (modelValue: any) => {
  modelValueRef.value = modelValue;
  emit("update:modelValue", modelValueRef.value);
};

const handleApiChange = (api: any) => {
  apiRef.value = api;
  emit("update:api", apiRef.value);
};

defineExpose({ getCreatorRef, getApiRef, resetForm, loadData });
</script>

<template>
  <form-create
    v-if="ruleRef.length"
    ref="creatorRef"
    :locale="locale"
    :api="apiRef"
    :modelValue="modelValueRef"
    :rule="ruleRef"
    :option="optionsRef"
    @submit="handleSubmit"
    @update:modelValue="handleModelValueChange"
    @update:api="handleApiChange"
  />
</template>
