<script setup lang="ts">
import { ref } from "vue";
import { formRules } from "./utils/rule";
import { transformI18n } from "@/plugins/i18n";
import type { DictEditFormDTO } from "./utils/types";

const props = withDefaults(defineProps<DictEditFormDTO>(), {
  formInline: () => ({
    dictKey: undefined,
    dictVal: undefined,
    dictCode: undefined,
    cssClass: undefined,
    statusClass: undefined,
    sort: undefined,
    remark: undefined
  })
});

const ruleFormRef = ref();
const newFormInline = ref(props.formInline);

function getRef() {
  return ruleFormRef.value;
}

defineExpose({ getRef });
</script>

<template>
  <el-form
    ref="ruleFormRef"
    :model="newFormInline"
    :rules="formRules"
    label-width="82px"
  >
    <el-form-item label="字典键" prop="dictKey">
      <el-input
        v-model="newFormInline.dictKey"
        clearable
        placeholder="请输入字典键"
      />
    </el-form-item>
    <el-form-item label="字典值" prop="dictVal">
      <el-input
        v-model="newFormInline.dictVal"
        clearable
        placeholder="请输入字典值"
      />
    </el-form-item>
    <el-form-item label="样式值">
      <el-input
        v-model="newFormInline.cssClass"
        clearable
        placeholder="请输入样式值"
      />
    </el-form-item>
    <el-form-item label="状态样式">
      <el-input
        v-model="newFormInline.statusClass"
        clearable
        placeholder="请输入状态样式"
      />
    </el-form-item>
    <el-form-item label="备注">
      <el-input
        v-model="newFormInline.remark"
        type="textarea"
        clearable
        placeholder="请输入备注"
      />
    </el-form-item>
  </el-form>
</template>
