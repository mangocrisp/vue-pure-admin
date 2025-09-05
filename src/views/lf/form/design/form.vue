<script setup lang="ts">
import { ref } from "vue";
import { formRules } from "./utils/rule";
import type { EditFormDTO } from "./utils/types";
import { cloneDeep } from "@pureadmin/utils";
import { useSystemDictParamsStoreHook } from "@/store/modules/system-dict-params";

const useSystemDictParamsStore = useSystemDictParamsStoreHook();
const dictOption = useSystemDictParamsStore.dictOptions("lf_form_type");

const props = withDefaults(defineProps<EditFormDTO>(), {
  isAddForm: true,
  formInline: () => ({
    /** 创建人 */
    createUser: undefined,
    /** 创建时间 */
    createTime: undefined,
    /** 修改人 */
    updateUser: undefined,
    /** 修改时间 */
    updateTime: undefined,
    /** 是否已删除 */
    isDeleted: undefined,
    /** 名称 */
    name: undefined,
    /** 状态(0未发布，1已经发布) */
    status: undefined,
    /** 备注说明 */
    description: undefined,
    /** 数据（实时设计最新的表单数据） */
    data: undefined,
    /** 表单类型，是表单还是单组件（字典项 lf_form_type） */
    type: undefined,
    /** 表单组件路径 */
    path: undefined,
    /** 最后发布版本号 */
    lastVersion: undefined
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
        <el-tooltip content="表单类型" :trigger-keys="[]">
          <el-form-item label="表单类型" prop="type">
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
        <el-tooltip content="表单组件路径" :trigger-keys="[]">
          <el-form-item label="表单组件路径" prop="path">
            <el-input
              v-model="formData.path"
              clearable
              placeholder="请输入表单组件路径"
            />
          </el-form-item>
        </el-tooltip>
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
