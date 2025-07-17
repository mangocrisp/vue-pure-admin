<script setup lang="ts">
import { ref } from "vue";
import { formRules } from "./utils/rule";
import { transformI18n } from "@/plugins/i18n";
import type { PermissionEditFormDTO } from "./utils/types";

const props = withDefaults(defineProps<PermissionEditFormDTO>(), {
  formInline: () => ({
    higherMenuOptions: [],
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
    <el-form-item label="上级菜单">
      <el-cascader
        v-model="newFormInline.menuId"
        class="w-full"
        :options="newFormInline.higherMenuOptions"
        :props="{
          value: 'id',
          label: 'title',
          emitPath: false,
          checkStrictly: true
        }"
        clearable
        filterable
        placeholder="请选择上级菜单"
      >
        <template #default="{ node, data }">
          <span>{{ transformI18n(data.title) }}</span>
          <span v-if="!node.isLeaf"> ({{ data.children.length }}) </span>
        </template>
      </el-cascader>
    </el-form-item>
    <el-form-item label="权限名称" prop="name">
      <el-input
        v-model="newFormInline.name"
        clearable
        placeholder="请输入权限名称"
      />
    </el-form-item>
    <el-form-item label="接口权限" prop="urlPerm">
      <el-input
        v-model="newFormInline.urlPerm"
        clearable
        placeholder="请输入接口权限"
      />
    </el-form-item>
    <el-form-item label="按钮权限" prop="btnPerm">
      <el-input
        v-model="newFormInline.btnPerm"
        clearable
        placeholder="请输入按钮权限"
      />
    </el-form-item>
  </el-form>
</template>
