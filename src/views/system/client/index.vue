<script setup lang="ts">
import { usePermission } from "./utils/hook";
import { ref } from "vue";
import { PureTableBar } from "@/components/RePureTableBar";
import { useRenderIcon } from "@/components/ReIcon/src/hooks";
import { deviceDetection, storageSession } from "@pureadmin/utils";

import Delete from "~icons/ep/delete";
import EditPen from "~icons/ep/edit-pen";
import Refresh from "~icons/ep/refresh";
import AddFill from "~icons/ri/add-circle-line";
import Password from "~icons/ri/lock-password-line";

defineOptions({
  name: "dictType"
});

const formRef = ref();
const tableRef = ref();
const contentRef = ref();
const {
  form,
  loading,
  columns,
  rowStyle,
  dataList,
  pagination,
  onSearch,
  resetForm,
  openDialog,
  handleDelete,
  handleDeleteBatch,
  handleSizeChange,
  handleCurrentChange,
  handleSelectionChange,
  handleReset,
  resetPasswordDialogConfig
} = usePermission();
</script>

<template>
  <div class="main">
    <el-form
      ref="formRef"
      :inline="true"
      :model="form"
      class="search-form bg-bg_color w-full pl-8 pt-[12px] overflow-auto"
    >
      <el-form-item label="客户端ID：" prop="clientId">
        <el-input
          v-model="form.clientId"
          placeholder="请输入客户端ID"
          clearable
          class="w-[180px]!"
        />
      </el-form-item>
      <el-form-item label="客户端名称：" prop="clientName">
        <el-input
          v-model="form.clientName"
          placeholder="请输入客户端名称"
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

    <div
      ref="contentRef"
      :class="['flex', deviceDetection() ? 'flex-wrap' : '']"
    >
      <PureTableBar :columns="columns" title="系统客户端" @refresh="onSearch">
        <template #buttons>
          <el-button
            type="primary"
            :icon="useRenderIcon(AddFill)"
            @click="openDialog()"
          >
            新增
          </el-button>

          <el-popconfirm
            title="是否批量删除勾选客户端?"
            placement="right"
            @confirm="handleDeleteBatch"
          >
            <template #reference>
              <el-button type="danger" :icon="useRenderIcon(Delete)">
                删除
              </el-button>
            </template>
          </el-popconfirm>
        </template>
        <template v-slot="{ size, dynamicColumns }">
          <pure-table
            ref="tableRef"
            align-whole="center"
            showOverflowTooltip
            table-layout="auto"
            :loading="loading"
            :size="size"
            adaptive
            select-on-indeterminate
            stripe
            border
            :row-style="rowStyle"
            :adaptiveConfig="{ offsetBottom: 108 }"
            :data="dataList"
            :columns="dynamicColumns"
            :pagination="{ ...pagination, size }"
            :header-cell-style="{
              background: 'var(--el-fill-color-light)',
              color: 'var(--el-text-color-primary)'
            }"
            :row-key="row => row.id"
            @selection-change="handleSelectionChange"
            @page-size-change="handleSizeChange"
            @page-current-change="handleCurrentChange"
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
                type="warning"
                :size="size"
                :icon="useRenderIcon(Password)"
                @click="handleReset(row)"
              >
                重置密钥
              </el-button>
              <el-popconfirm
                :title="`是否确认删除客户端名称为${row.clientName}的这条数据`"
                @confirm="handleDelete(row)"
              >
                <template #reference>
                  <el-button
                    class="reset-margin"
                    link
                    type="danger"
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
    <el-dialog
      v-model="resetPasswordDialogConfig.resetPasswordDialogVisible"
      :title="resetPasswordDialogConfig.title"
      width="500"
      align-center
      :close-on-click-modal="false"
      :close-on-press-escape="false"
      >点击复制密钥
      <span
        v-copy:click="resetPasswordDialogConfig.resetPasswordValue"
        class="text-sky-500"
        >{{ resetPasswordDialogConfig.resetPasswordValue }}</span
      >
      <template #footer>
        <div class="dialog-footer">
          <el-button
            type="primary"
            @click="
              resetPasswordDialogConfig.resetPasswordDialogVisible = false
            "
            >确定</el-button
          >
        </div>
      </template>
    </el-dialog>
  </div>
</template>

<style lang="scss" scoped>
:deep(.el-dropdown-menu__item i) {
  margin: 0;
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
