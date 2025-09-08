import type { FormCreateCreatorProps } from "@/views/components/form-create/form-creator/utils/types";
import { defineAsyncComponent, ref } from "vue";

export function useLogicFlowFormRender(props: FormCreateCreatorProps, emit) {
  /**动态表单创建渲染器 */
  const FormCreateCreator = defineAsyncComponent(
    () => import("@/views/components/form-create/form-creator/index.vue")
  );
  const FormCreateCreatorRef = ref<InstanceType<
    typeof FormCreateCreator
  > | null>(null);

  const isAddForm = ref(props.isAddForm);
  const modelValueRef = ref(props.modelValue);
  const ruleRef = ref(props.rule);
  const optionsRef = ref(props.options);
  const apiRef = ref(props.api);

  /**
   * 提交表单
   * @param value 表单数据
   */
  const handleSubmit = (value: any) => emit("submit", value);

  const handleModelValueChange = (modelValue: any) => {
    modelValueRef.value = modelValue;
    emit("update:modelValue", modelValueRef.value);
  };

  const handleApiChange = (api: any) => {
    apiRef.value = api;
    emit("update:api", apiRef.value);
  };

  return {
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
  };
}
