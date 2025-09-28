<script setup lang="ts">
import { defineAsyncComponent, ref } from "vue";
import { formRules } from "./utils/rule";
import type { EditFormDTO } from "./utils/types";
import { cloneDeep } from "@pureadmin/utils";
import "vue3-cron-plus-picker/style.css";
import { Vue3CronPlusPicker } from "vue3-cron-plus-picker";
import { message } from "@/utils/message";

const props = withDefaults(defineProps<EditFormDTO>(), {
  isAddForm: true,
  formInline: () => ({
    /** 任务键 */
    taskKey: undefined,
    /** 任务描述 */
    description: undefined,
    /** cron 表达式 */
    cron: undefined,
    /** 是否自动启动(1 是 0 否) */
    autoStart: undefined,
    /** 排序 */
    sort: undefined,
    /** 任务启动参数 */
    params: undefined
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

const showCron = ref(false);

const cronFill = (expression: string) => {
  if (expression && expression.length > 0) {
    formRef.value.clearValidate("cron");
  }
  const cronArr = expression.split(" ");
  /*
  cron 表达式有几种格式：quartz 或者 spring
   0 0 0/1 * * ?
   秒 分 时 日 月 周
   crontab（5位没有秒）
   0 0/1 * * ?
   分 时 日 月 周
  */
  if (cronArr.length < 6) {
    message("请输入正确的六位cron表达式，如：0 0 0/1 * * ?");
    return;
  } else if (cronArr.length > 6) {
    formData.value.cron = cronArr.splice(0, 6).join(" ");
    return;
  }
  formData.value.cron = expression;
};

const cronHide = () => {
  showCron.value = false;
};

//======================================== 代码编辑器 start ========================================================

const codeEditorLoading = ref(false);

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
  codeEditorLoading.value = true;
  editContentKey.value = key;
  drawerDataView.value = !drawerDataView.value;
  setTimeout(
    () => {
      (codeEditorRef.value as any).render(formData.value[key] ?? "", l);
      codeEditorLoading.value = false;
    },
    codeEditorRef.value ? 50 : 500
  );
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
  <div class="w-[100%]">
    <el-form
      ref="formRef"
      :model="formData"
      :rules="formRules"
      label-width="auto"
    >
      <el-row :gutter="20">
        <el-col :span="12" :xs="24" :sm="12">
          <el-tooltip content="任务键" :trigger-keys="[]">
            <el-form-item label="任务键" prop="taskKey">
              <el-input
                v-model="formData.taskKey"
                clearable
                placeholder="请输入任务键"
              />
            </el-form-item>
          </el-tooltip>
        </el-col>
        <el-col :span="12" :xs="24" :sm="12">
          <el-tooltip content="任务描述" :trigger-keys="[]">
            <el-form-item label="任务描述" prop="description">
              <el-input
                v-model="formData.description"
                clearable
                placeholder="请输入任务描述"
              />
            </el-form-item>
          </el-tooltip>
        </el-col>
        <el-col :span="24" :xs="24" :sm="24">
          <el-tooltip content="cron 表达式" :trigger-keys="[]">
            <el-form-item label="cron 表达式" prop="cron">
              <el-input
                v-model="formData.cron"
                clearable
                placeholder="请输入cron 表达式"
                @focus="showCron = true"
              />
              <!-- 这个不一定好用，将就着用吧 -->
              <vue3-cron-plus-picker
                v-show="showCron"
                style="width: 100%"
                :expression="formData.cron"
                @fill="cronFill"
                @hide="cronHide"
              />
            </el-form-item>
          </el-tooltip>
        </el-col>
        <el-col :span="12" :xs="24" :sm="12">
          <el-tooltip content="是否自动启动" :trigger-keys="[]">
            <el-form-item label="是否自动启动" prop="autoStart">
              <el-select
                v-model="formData.autoStart"
                placeholder="请选择"
                clearable
                class="w-[100%]!"
              >
                <el-option label="是" :value="1" />
                <el-option label="否" :value="0" />
              </el-select>
            </el-form-item>
          </el-tooltip>
        </el-col>
        <el-col :span="12" :xs="24" :sm="12">
          <el-tooltip content="排序" :trigger-keys="[]">
            <el-form-item label="排序" prop="sort">
              <el-input
                v-model="formData.sort"
                clearable
                type="number"
                placeholder="请输入排序"
              />
            </el-form-item>
          </el-tooltip>
        </el-col>
        <el-col :span="20" :xs="20" :sm="20">
          <el-tooltip content="任务启动参数" :trigger-keys="[]">
            <el-form-item label="任务启动参数" prop="params">
              <el-input
                v-model="formData.params"
                clearable
                type="textarea"
                placeholder="请输入任务启动参数"
              />
            </el-form-item>
          </el-tooltip>
        </el-col>
        <el-col :span="4" :xs="4" :sm="4">
          <el-tooltip content="代码编辑器" :trigger-keys="[]">
            <ElButton type="primary" @click="showEditor('params', 'json')">
              {{ "<>" }}
            </ElButton>
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
      <CodeEditor
        ref="codeEditorRef"
        v-loading="codeEditorLoading"
        :options="{ readOnly: false }"
      />
    </el-drawer>
  </div>
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
