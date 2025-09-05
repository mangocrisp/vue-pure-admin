<script setup lang="ts">
import { ref } from "vue";
import { formRules } from "./utils/rule";
import type { EditFormDTO } from "./utils/types";
import { cloneDeep } from "@pureadmin/utils";
import { IconSelect } from "@/components/ReIcon";
import { useSystemDictParamsStoreHook } from "@/store/modules/system-dict-params";

const useSystemDictParamsStore = useSystemDictParamsStoreHook();
const dictOption = useSystemDictParamsStore.dictOptions("lf_process_type");

const props = withDefaults(defineProps<EditFormDTO>(), {
  isAddForm: true,
  formInline: () => ({
    /** 名称 */
    name: undefined,
    /** 备注说明 */
    description: undefined,
    /** 流程类型（字典项 lf_process_type） */
    type: undefined,
    /** 图标 */
    icon: "streamline-sharp-color:text-flow-rows"
  })
});

const formRef = ref();
const isAddForm = ref(props.isAddForm);
const formData = ref(props.formInline);
/** 重置表单方法 Ref */
const restFormValue = cloneDeep(props.formInline);
/**获取表单Ref方法 */
function getFormRef() {
  return formRef.value;
}

/**
 * 重置表单
 * @param formEl 表单引用
 */
function resetForm() {
  if (!formRef.value) return;
  if (isAddForm.value) {
    formRef.value.resetFields();
  } else {
    formData.value = cloneDeep(restFormValue);
  }
}

defineExpose({ getFormRef, resetForm });
</script>

<template>
  <el-form
    ref="formRef"
    :model="formData"
    :rules="formRules"
    label-width="auto"
  >
    <el-row :gutter="20">
      <el-col :span="12" :xs="24" :sm="12">
        <el-tooltip content="名称" :trigger-keys="[]">
          <el-form-item label="名称" prop="name">
            <el-input
              v-model="formData.name"
              clearable
              placeholder="请输入名称"
            />
          </el-form-item>
        </el-tooltip>
      </el-col>
      <el-col :span="12" :xs="24" :sm="12">
        <el-tooltip content="流程类型（字典项）" :trigger-keys="[]">
          <el-form-item label="流程类型（字典项)" prop="type">
            <el-select
              v-model="formData.type"
              placeholder="请选择"
              default-first-option
              value-key="type"
              clearable
            >
              <el-option
                v-for="(item, key) in dictOption"
                :key="key"
                :value="item.value"
                :label="item.label"
              />
            </el-select>
          </el-form-item>
        </el-tooltip>
      </el-col>
      <el-col :span="12" :xs="24" :sm="12">
        <el-form-item label="图标">
          <IconSelect v-model="formData.icon" class="w-full" />
        </el-form-item>
      </el-col>
      <el-col :span="24" :xs="24" :sm="24">
        <el-tooltip content="备注说明" :trigger-keys="[]">
          <el-form-item label="备注说明" prop="description">
            <el-input
              v-model="formData.description"
              clearable
              type="textarea"
              placeholder="请输入备注说明"
            />
          </el-form-item>
        </el-tooltip>
      </el-col>
    </el-row>
  </el-form>
</template>

<style lang="scss" scoped>
.ellipsis {
  display: inline-block;
  overflow: hidden;
  text-overflow: ellipsis;
  color: #000;
  white-space: nowrap;
}
</style>
