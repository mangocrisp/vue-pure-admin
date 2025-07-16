<script setup lang="ts">
import { ref } from "vue";
import ReCol from "@/components/ReCol";
import { formRules } from "./utils/rule";
import { FormProps } from "./utils/types";
import { usePublicHooks } from "../hooks";

const props = withDefaults(defineProps<FormProps>(), {
  formInline: () => ({
    lazyLoad: () => {},
    id: undefined,
    code: undefined,
    fullName: undefined,
    name: undefined,
    pid: undefined,
    pidAll: [],
    remark: undefined,
    sort: 0,
    type: undefined
  })
});

const ruleFormRef = ref();
const newFormInline = ref(props.formInline);
const typeOptions = [
  {
    label: "公司",
    value: 1
  },
  {
    label: "分公司",
    value: 2
  },
  {
    label: "部门",
    value: 3
  }
];

function getRef() {
  return ruleFormRef.value;
}

/**
 * 懒加载数据
 * @param node 节点数据
 * @param resolve 加载数据
 */
function lazyLoad(node, resolve) {
  props.formInline.lazyLoad(node, resolve);
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
    <el-row :gutter="30">
      <re-col>
        <el-form-item label="上级部门">
          <el-cascader
            v-model="newFormInline.pidAll"
            class="w-full"
            show-all-levels
            :props="{
              value: 'id',
              label: 'name',
              children: 'children',
              checkStrictly: true,
              lazy: true,
              lazyLoad
            }"
            clearable
            filterable
            placeholder="请选择上级部门"
          >
            <template #default="{ node, data }">
              <span>{{ data.name }}</span>
              <span v-if="!node.isLeaf"> ({{ data.children.length }}) </span>
            </template>
          </el-cascader>
        </el-form-item>
      </re-col>
      <re-col :value="12" :xs="24" :sm="24">
        <el-form-item label="部门名称" prop="name">
          <el-input
            v-model="newFormInline.name"
            clearable
            placeholder="请输入部门名称"
          />
        </el-form-item>
      </re-col>
      <re-col :value="12" :xs="24" :sm="24">
        <el-form-item label="部门编码" prop="code">
          <el-input
            v-model="newFormInline.code"
            clearable
            placeholder="请输入部门编码"
          />
        </el-form-item>
      </re-col>
      <re-col :value="12" :xs="24" :sm="24">
        <el-form-item label="部门全称">
          <el-input
            v-model="newFormInline.fullName"
            clearable
            placeholder="请输入部门全称"
          />
        </el-form-item>
      </re-col>
      <re-col :value="12" :xs="24" :sm="24">
        <el-form-item label="部门类型">
          <el-select
            v-model="newFormInline.type"
            placeholder="请选择部门类型"
            clearable
          >
            <el-option
              v-for="item in typeOptions"
              :key="item.value"
              :label="item.label"
              :value="item.value"
            />
          </el-select>
        </el-form-item>
      </re-col>
      <re-col :value="12" :xs="24" :sm="24">
        <el-form-item label="排序">
          <el-input-number
            v-model="newFormInline.sort"
            class="w-full!"
            :min="0"
            :max="9999"
            controls-position="right"
          />
        </el-form-item>
      </re-col>
      <re-col>
        <el-form-item label="备注">
          <el-input
            v-model="newFormInline.remark"
            placeholder="请输入备注信息"
            type="textarea"
          />
        </el-form-item>
      </re-col>
    </el-row>
  </el-form>
</template>
