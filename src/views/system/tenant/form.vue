<script setup lang="ts">
import { ref } from "vue";
import { formRules } from "./utils/rule";
import type { EditFormDTO } from "./utils/types";
import { cloneDeep } from "@pureadmin/utils";
import { IconSelect } from "@/components/ReIcon";

const props = withDefaults(defineProps<EditFormDTO>(), {
  isAddForm: true,
  formInline: () => ({
    /** 图标 */
    icon: undefined,
    /** 租户 id */
    tenantId: undefined,
    /** 租户管理员 */
    tenantManager: undefined,
    /** 租户名 */
    tenantName: undefined,
    /** 备注 */
    remark: undefined
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
        <el-tooltip content="租户ID" :trigger-keys="[]">
          <el-form-item label="租户ID" prop="tenantId">
            <el-input
              v-model="formData.tenantId"
              clearable
              :readonly="!isAddForm"
              :disabled="!isAddForm"
              placeholder="请输入租户ID"
            />
          </el-form-item>
        </el-tooltip>
      </el-col>
      <el-col :span="12" :xs="24" :sm="12">
        <el-tooltip content="租户名称" :trigger-keys="[]">
          <el-form-item label="租户名称" prop="tenantName">
            <el-input
              v-model="formData.tenantName"
              clearable
              placeholder="请输入租户名称"
            />
          </el-form-item>
        </el-tooltip>
      </el-col>
      <el-col :span="12" :xs="24" :sm="12">
        <el-tooltip content="租户管理员" :trigger-keys="[]">
          <el-form-item label="租户管理员" prop="tenantManager">
            <el-input
              v-model="formData.tenantManager"
              clearable
              placeholder="请输入租户管理员"
            />
          </el-form-item>
        </el-tooltip>
      </el-col>
      <el-col :span="12" :xs="24" :sm="12">
        <el-tooltip content="图标" :trigger-keys="[]">
          <el-form-item label="图标" prop="clientName">
            <IconSelect v-model="formData.icon" class="w-full" />
          </el-form-item>
        </el-tooltip>
      </el-col>
      <el-col :span="24" :xs="24" :sm="24">
        <el-tooltip content="备注" :trigger-keys="[]">
          <el-form-item label="备注" prop="remark">
            <el-input
              v-model="formData.remark"
              type="textarea"
              clearable
              placeholder="请输入备注"
            />
          </el-form-item>
        </el-tooltip>
      </el-col>
    </el-row>
  </el-form>
</template>
