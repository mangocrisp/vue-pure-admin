<script setup lang="ts">
import { ref } from "vue";
import { useDept } from "./utils/hook";
import { PureTableBar } from "@/components/RePureTableBar";
import { useRenderIcon } from "@/components/ReIcon/src/hooks";

import Delete from "~icons/ep/delete";
import EditPen from "~icons/ep/edit-pen";
import Refresh from "~icons/ep/refresh";
import AddFill from "~icons/ri/add-circle-line";

defineOptions({
  name: "SystemDept"
});

const formRef = ref();
const {
  tableRef,
  form,
  loading,
  columns,
  dataList,
  onSearch,
  onLoad,
  clearLazyCache,
  resetForm,
  openDialog,
  handleDelete,
  handleSelectionChange
} = useDept();

function onFullscreen() {
  // 重置表格高度
  tableRef.value.setAdaptive();
}
</script>

<template>
  <div class="main">
    <el-form
      ref="formRef"
      :inline="true"
      :model="form"
      class="search-form bg-bg_color w-full pl-8 pt-[12px] overflow-auto"
    >
      <el-form-item label="部门名称：" prop="name">
        <el-input
          v-model="form.name"
          placeholder="请输入部门名称"
          clearable
          class="w-[180px]!"
        />
      </el-form-item>
      <el-form-item label="部门编码：" prop="code">
        <el-input
          v-model="form.code"
          placeholder="请输入部门编码"
          clearable
          class="w-[180px]!"
        />
      </el-form-item>
      <el-form-item>
        <el-button
          type="primary"
          :icon="useRenderIcon('ri/search-line')"
          :loading="loading"
          @click="onSearch"
        >
          搜索
        </el-button>
        <el-button :icon="useRenderIcon(Refresh)" @click="resetForm(formRef)">
          重置
        </el-button>
      </el-form-item>
    </el-form>

    <PureTableBar
      title="部门管理"
      :columns="columns"
      :tableRef="tableRef?.getTableRef()"
      @refresh="onSearch"
      @fullscreen="onFullscreen"
    >
      <template #buttons>
        <el-button
          type="primary"
          :icon="useRenderIcon(AddFill)"
          @click="openDialog()"
        >
          新增部门
        </el-button>
        <!-- <el-button
          type="warning"
          :icon="useRenderIcon(AntDesignReloadOutlined)"
          @click="clearLazyCache()"
        >
          清除缓存
        </el-button> -->
      </template>
      <template v-slot="{ size, dynamicColumns }">
        <pure-table
          ref="tableRef"
          adaptive
          :adaptiveConfig="{ offsetBottom: 45 }"
          align-whole="center"
          row-key="id"
          showOverflowTooltip
          table-layout="auto"
          :default-expand-all="false"
          :loading="loading"
          stripe
          :size="size"
          :data="dataList"
          lazy
          :load="onLoad"
          border
          :tree-props="{
            children: 'children',
            hasChildren: 'hasChildren',
            checkStrictly: false
          }"
          :columns="dynamicColumns"
          :header-cell-style="{
            background: 'var(--el-fill-color-light)',
            color: 'var(--el-text-color-primary)'
          }"
          @selection-change="handleSelectionChange"
        >
          <template #operation="{ row }">
            <el-button
              class="reset-margin"
              link
              type="primary"
              :size="size"
              :icon="useRenderIcon(EditPen)"
              @click="openDialog('修改', row)"
            >
              修改
            </el-button>
            <el-button
              class="reset-margin"
              link
              type="primary"
              :size="size"
              :icon="useRenderIcon(AddFill)"
              @click="
                openDialog('新增', { id: row.id, pidAll: row.pidAll } as any)
              "
            >
              新增
            </el-button>
            <el-popconfirm
              :title="`是否确认删除部门名称为${row.name}的这条数据`"
              @confirm="handleDelete(row)"
            >
              <template #reference>
                <el-button
                  class="reset-margin"
                  link
                  type="primary"
                  :size="size"
                  :icon="useRenderIcon(Delete)"
                >
                  删除
                </el-button>
              </template>
            </el-popconfirm>
          </template>
        </pure-table>
      </template>
    </PureTableBar>
  </div>
</template>

<style lang="scss" scoped>
:deep(.el-table__inner-wrapper::before) {
  height: 0;
}

.main-content {
  margin: 24px 24px 0 !important;
}

.search-form {
  :deep(.el-form-item) {
    margin-bottom: 12px;
  }
}
</style>
