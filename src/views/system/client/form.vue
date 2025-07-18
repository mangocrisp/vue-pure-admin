<script setup lang="ts">
import { ref } from "vue";
import { formRules } from "./utils/rule";
import type { EditFormDTO } from "./utils/types";
import { cloneDeep } from "@pureadmin/utils";

const props = withDefaults(defineProps<EditFormDTO>(), {
  isAddForm: true,
  formInline: () => ({
    /** 客户端id */
    clientId: undefined,
    /** 域 */
    scope: "all",
    /** 授权方式 */
    authorizedGrantTypes: undefined,
    /** 认证回调地址 */
    webServerRedirectUri: undefined,
    /** token 超时秒 */
    accessTokenValidity: 3600,
    /** refresh token 超时秒 */
    refreshTokenValidity: 604800,
    /** 是否自动授权 */
    autoApprove: "true",
    /** 客户端名称 */
    clientName: undefined
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
        <el-tooltip content="客户端ID" :trigger-keys="[]">
          <el-form-item label="客户端ID" prop="clientId">
            <el-input
              v-model="formData.clientId"
              clearable
              :readonly="!isAddForm"
              :disabled="!isAddForm"
              placeholder="请输入客户端ID"
            />
          </el-form-item>
        </el-tooltip>
      </el-col>
      <el-col :span="12" :xs="24" :sm="12">
        <el-tooltip content="客户端名称" :trigger-keys="[]">
          <el-form-item label="客户端名称" prop="clientName">
            <el-input
              v-model="formData.clientName"
              clearable
              placeholder="请输入客户端名称"
            />
          </el-form-item>
        </el-tooltip>
      </el-col>
      <el-col :span="12" :xs="24" :sm="12">
        <el-tooltip content="域(多个域逗号隔开)" :trigger-keys="[]">
          <el-form-item label="域" prop="scope">
            <el-input
              v-model="formData.scope"
              clearable
              placeholder="请输入域(多个域逗号隔开)"
            />
          </el-form-item>
        </el-tooltip>
      </el-col>
      <el-col :span="12" :xs="24" :sm="12">
        <el-tooltip content="认证令牌时效(秒)" :trigger-keys="[]">
          <el-form-item label="认证令牌时效" prop="accessTokenValidity">
            <el-input
              v-model="formData.accessTokenValidity"
              type="number"
              min="10"
              placeholder="请输入认证令牌时效"
            />
          </el-form-item>
        </el-tooltip>
      </el-col>
      <el-col :span="12" :xs="24" :sm="12">
        <el-tooltip content="刷新令牌时效(秒)" :trigger-keys="[]">
          <el-form-item label="刷新令牌时效" prop="refreshTokenValidity">
            <el-input
              v-model="formData.refreshTokenValidity"
              type="number"
              min="10"
              placeholder="请输入刷新令牌时效"
            />
          </el-form-item>
        </el-tooltip>
      </el-col>
      <el-col :span="12" :xs="24" :sm="12">
        <el-tooltip content="认证方式" :trigger-keys="[]">
          <el-form-item label="认证方式" prop="authorizedGrantTypes">
            <el-input
              v-model="formData.authorizedGrantTypes"
              type="textarea"
              placeholder="请输入认证方式"
            />
          </el-form-item>
        </el-tooltip>
      </el-col>
      <el-col :span="12" :xs="24" :sm="12">
        <el-tooltip content="回调地址" :trigger-keys="[]">
          <el-form-item label="回调地址" prop="webServerRedirectUri">
            <el-input
              v-model="formData.webServerRedirectUri"
              clearable
              type="textarea"
              placeholder="请输入回调地址"
            />
          </el-form-item>
        </el-tooltip>
      </el-col>
      <el-col :span="12" :xs="24" :sm="12">
        <el-tooltip content="自动授权" :trigger-keys="[]">
          <el-form-item label="自动授权" prop="autoApprove">
            <el-switch
              v-model="formData.autoApprove"
              inline-prompt
              :active-value="'true'"
              :inactive-value="'false'"
              active-text="是"
              inactive-text="否"
            />
          </el-form-item>
        </el-tooltip>
      </el-col>
    </el-row>
  </el-form>
</template>
