<script setup lang="ts">
import { ref } from "vue";
import { formRules } from "./utils/rule";
import type { EditFormDTO } from "./utils/types";
import { ParamsTypeOptions, ParamsType } from "./utils/enums";
import { cloneDeep } from "@pureadmin/utils";

const props = withDefaults(defineProps<EditFormDTO>(), {
  isAddForm: true,
  formInline: () => ({
    type: ParamsType.STRING,
    title: undefined,
    paramsKey: undefined,
    paramsVal: undefined,
    realValue: undefined,
    status: undefined,
    remark: undefined
  })
});

const formRef = ref();
const isAddForm = ref(props.isAddForm);
const newFormInline = ref(props.formInline);
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
    newFormInline.value = cloneDeep(restFormValue);
  }
}

defineExpose({ getFormRef, resetForm });
</script>

<template>
  <el-form
    ref="formRef"
    :model="newFormInline"
    :rules="formRules"
    label-width="82px"
  >
    <el-form-item label="参数名" prop="title">
      <el-input
        v-model="newFormInline.title"
        clearable
        placeholder="请输入参数名"
      />
    </el-form-item>
    <el-form-item label="参数键" prop="paramsKey">
      <el-input
        v-model="newFormInline.paramsKey"
        clearable
        placeholder="请输入参数键"
      />
    </el-form-item>
    <el-form-item label="参数类型" prop="type">
      <el-radio-group v-model="newFormInline.type">
        <el-radio-button
          v-for="item in ParamsTypeOptions"
          :key="item.value"
          :label="item.label"
          :value="item.value"
        />
        >" />
      </el-radio-group>
    </el-form-item>
    <el-form-item label="参数值" prop="paramsVal">
      <el-input
        v-if="newFormInline.type === ParamsType.STRING"
        v-model="newFormInline.paramsVal"
        clearable
        type="textarea"
        placeholder="请输入参数值"
      />
      <el-input
        v-if="newFormInline.type === ParamsType.NUMBER"
        v-model="newFormInline.paramsVal"
        clearable
        type="number"
        placeholder="请输入参数值"
      />
      <el-switch
        v-if="newFormInline.type === ParamsType.BOOLEAN"
        v-model="newFormInline.realValue"
        inline-prompt
        active-text="是"
        inactive-text="否"
        @change="
          val =>
            val === undefined
              ? (newFormInline.paramsVal = undefined)
              : (newFormInline.paramsVal = String(val))
        "
      />
      <el-date-picker
        v-if="newFormInline.type === ParamsType.DATE_TIME"
        v-model="newFormInline.paramsVal"
        type="datetime"
        placeholder="Select date and time"
        :default-time="new Date()"
        value-format="YYYY-MM-DD HH:mm:ss"
      />
    </el-form-item>
    <el-form-item label="备注" prop="remark">
      <el-input
        v-model="newFormInline.remark"
        type="textarea"
        clearable
        placeholder="请输入备注"
      />
    </el-form-item>
  </el-form>
</template>
