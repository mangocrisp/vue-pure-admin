<script setup lang="ts">
import { defineAsyncComponent, ref } from "vue";
import { formRules } from "./utils/rule";
import type { EditFormDTO } from "./utils/types";
import { cloneDeep } from "@pureadmin/utils";
import { IconSelect } from "@/components/ReIcon";

const props = withDefaults(defineProps<EditFormDTO>(), {
  isAddForm: true,
  formInline: () => ({
    /** 字符串类型 */
    string: undefined,
    /** 整数类型 */
    numberInt: undefined,
    /** 长整数类型 */
    numberLong: undefined,
    /** 日期类型 */
    date: undefined,
    /** 日期时间类型 */
    dateTime: undefined,
    /** 字节类型 */
    numberByte: undefined,
    /** 布尔类型 */
    boolType: undefined,
    /** 长文本类型 */
    textType: undefined,
    /** JSON 类型 */
    jsonType: undefined,
    /** 单精度浮点类型 */
    floatType: undefined,
    /** 双精度浮点类型 */
    doubleType: undefined
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

//======================================== 代码编辑器 start ========================================================

/**可选字段导出面板 */
const CodeEditor = defineAsyncComponent(
  () => import("@/views/components/CodeEditor.vue")
);
/**
 * 代码编码器
 */
const codeEditorRef = ref<InstanceType<typeof CodeEditor> | null>(null);
/**
 * 是否打开代码编辑器抽屉
 */
const drawerDataView = ref<boolean>(false);

const editContentKey = ref<string>("");
/**
 * 打开代码编辑器
 * @param key 字段键
 * @param l 语言
 */
const showEditor = (key, l = "text") => {
  editContentKey.value = key;
  drawerDataView.value = !drawerDataView.value;
  // const loadingInstance = ElLoading.service({})
  setTimeout(() => {
    (codeEditorRef.value as any).render(formData.value[key], l);
    // loadingInstance.close()
  }, 50);
};
/**
 * 监听关闭事件
 * @param done use close drawer
 */
const handleEditorClose = (done: () => void) => {
  formData.value[editContentKey.value] = (
    codeEditorRef.value as any
  ).getValue();
  (codeEditorRef.value as any).render("");
  done();
};

//======================================== 代码编辑器 end ========================================================

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
        <el-tooltip content="字符串类型" :trigger-keys="[]">
          <el-form-item label="字符串类型" prop="string">
            <el-input
              v-model="formData.string"
              clearable
              :readonly="!isAddForm"
              :disabled="!isAddForm"
              placeholder="请输入字符串类型"
            />
          </el-form-item>
        </el-tooltip>
      </el-col>
      <el-col :span="12" :xs="24" :sm="12">
        <el-tooltip content="整数类型" :trigger-keys="[]">
          <el-form-item label="整数类型" prop="numberInt">
            <el-input
              v-model="formData.numberInt"
              clearable
              type="number"
              placeholder="请输入整数类型"
            />
          </el-form-item>
        </el-tooltip>
      </el-col>
      <el-col :span="12" :xs="24" :sm="12">
        <el-tooltip content="长整数类型" :trigger-keys="[]">
          <el-form-item label="长整数类型" prop="numberLong">
            <el-input
              v-model="formData.numberLong"
              clearable
              placeholder="请输入长整数类型"
            />
          </el-form-item>
        </el-tooltip>
      </el-col>
      <el-col :span="12" :xs="24" :sm="12">
        <el-tooltip content="日期类型" :trigger-keys="[]">
          <el-form-item label="日期类型" prop="date">
            <el-date-picker
              v-model="formData.date"
              clearable
              value-format="YYYY-MM-DD"
              type="date"
              placeholder="请输入日期类型"
            />
          </el-form-item>
        </el-tooltip>
      </el-col>
      <el-col :span="12" :xs="24" :sm="12">
        <el-tooltip content="日期时间类型" :trigger-keys="[]">
          <el-form-item label="日期时间类型" prop="dateTime">
            <el-date-picker
              v-model="formData.dateTime"
              clearable
              value-format="YYYY-MM-DD HH:mm:ss"
              type="datetime"
              placeholder="请输入日期时间类型"
            />
          </el-form-item>
        </el-tooltip>
      </el-col>
      <el-col :span="12" :xs="24" :sm="12">
        <el-tooltip content="字节类型" :trigger-keys="[]">
          <el-form-item label="字节类型" prop="numberByte">
            <el-input
              v-model="formData.numberByte"
              clearable
              placeholder="请输入字节类型"
            />
          </el-form-item>
        </el-tooltip>
      </el-col>
      <el-col :span="12" :xs="24" :sm="12">
        <el-tooltip content="布尔类型" :trigger-keys="[]">
          <el-form-item label="布尔类型" prop="boolType">
            <el-switch
              v-model="formData.boolType"
              inline-prompt
              :active-value="true"
              :inactive-value="false"
              active-text="启用"
              inactive-text="停用"
            />
          </el-form-item>
        </el-tooltip>
      </el-col>
      <el-col :span="20" :xs="20" :sm="20">
        <el-tooltip content="长文本类型" :trigger-keys="[]">
          <el-form-item label="长文本类型" prop="textType">
            <el-input
              v-model="formData.textType"
              type="textarea"
              clearable
              placeholder="请输入长文本类型"
            />
          </el-form-item>
        </el-tooltip>
      </el-col>
      <el-col :span="4" :xs="4" :sm="4">
        <el-tooltip content="代码编辑器" :trigger-keys="[]">
          <ElButton type="primary" @click="showEditor('textType', 'text')">
            {{ "<>" }}
          </ElButton>
        </el-tooltip>
      </el-col>
      <el-col :span="20" :xs="20" :sm="20">
        <el-tooltip content="JSON 类型" :trigger-keys="[]">
          <el-form-item label="JSON 类型" prop="jsonType">
            <el-input
              v-model="formData.jsonType"
              type="textarea"
              clearable
              placeholder="请输入JSON 类型"
            />
          </el-form-item>
        </el-tooltip>
      </el-col>
      <el-col :span="4" :xs="4" :sm="4">
        <el-tooltip content="代码编辑器" :trigger-keys="[]">
          <ElButton type="primary" @click="showEditor('jsonType', 'json')">
            {{ "<>" }}
          </ElButton>
        </el-tooltip>
      </el-col>
      <el-col :span="12" :xs="24" :sm="12">
        <el-tooltip content="单精度浮点类型" :trigger-keys="[]">
          <el-form-item label="单精度浮点类型" prop="floatType">
            <el-input
              v-model="formData.floatType"
              clearable
              placeholder="请输入单精度浮点类型"
            />
          </el-form-item>
        </el-tooltip>
      </el-col>
      <el-col :span="12" :xs="24" :sm="12">
        <el-tooltip content="双精度浮点类型" :trigger-keys="[]">
          <el-form-item label="双精度浮点类型" prop="doubleType">
            <el-input
              v-model="formData.doubleType"
              clearable
              placeholder="请输入双精度浮点类型"
            />
          </el-form-item>
        </el-tooltip>
      </el-col>
    </el-row>
  </el-form>

  <el-drawer
    v-model="drawerDataView"
    :with-header="true"
    size="50%"
    :z-index="99999"
    :before-close="handleEditorClose"
  >
    <CodeEditor ref="codeEditorRef" :options="{ readOnly: false }" />
  </el-drawer>
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
