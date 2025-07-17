<script setup lang="ts">
import { ref } from "vue";
import { formRules } from "./utils/rule";
import { transformI18n } from "@/plugins/i18n";
import type { DictTtypeEditFormDTO } from "./utils/types";

const props = withDefaults(defineProps<DictTtypeEditFormDTO>(), {
  formInline: () => ({
    id: undefined,
    name: undefined,
    menuId: undefined,
    urlPerm: undefined,
    btnPerm: undefined
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
    <el-form-item label="字典名称" prop="title">
      <el-input
        v-model="newFormInline.title"
        clearable
        placeholder="请输入字典名称"
      />
    </el-form-item>
    <el-form-item label="字典编码" prop="dictCode">
      <el-input
        v-model="newFormInline.dictCode"
        clearable
        placeholder="请输入字典编码"
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
