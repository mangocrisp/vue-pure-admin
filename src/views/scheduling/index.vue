<script setup lang="ts">
import { useScheduledTask } from "./utils/hook";
import { defineAsyncComponent, ref } from "vue";
import { PureTableBar } from "@/components/RePureTableBar";
import { useRenderIcon } from "@/components/ReIcon/src/hooks";
import { deviceDetection } from "@pureadmin/utils";

import Delete from "~icons/ep/delete";
import EditPen from "~icons/ep/edit-pen";
import Refresh from "~icons/ep/refresh";
import AddFill from "~icons/ri/add-circle-line";
import CodiconDebugStart from "~icons/codicon/debug-start";
import SolarStopBold from "~icons/solar/stop-bold";
import CodiconDebugRestart from "~icons/codicon/debug-restart";
import More from "~icons/ep/more-filled";

defineOptions({
  name: "permission"
});

const formRef = ref();
const tableRef = ref();
const contentRef = ref();
const {
  operateName,
  queryForm,
  loading,
  columns,
  rowStyle,
  pageList,
  pagination,
  onSearch,
  resetForm,
  openDialog,
  handleDelete,
  handleDeleteBatch,
  handleSizeChange,
  handleCurrentChange,
  handleSelectionChange,
  start,
  stop,
  tryOnce,
  restart
} = useScheduledTask();

/**覆盖默认的上传行为 */
const requestUpload = () => Promise.resolve();
</script>

<template>
  <div class="main">
    <el-form
      ref="formRef"
      :inline="true"
      :model="queryForm"
      class="search-form bg-bg_color w-full pl-8 pt-[12px] overflow-auto"
    >
      <el-form-item label="主键" prop="id">
        <el-input
          v-model="queryForm.id"
          placeholder="请输入主键"
          clearable
          class="w-[180px]!"
        />
      </el-form-item>
      <el-form-item label="任务键" prop="taskKey">
        <el-input
          v-model="queryForm.taskKey"
          placeholder="请输入任务键"
          clearable
          class="w-[180px]!"
        />
      </el-form-item>
      <el-form-item label="任务描述" prop="description">
        <el-input
          v-model="queryForm.description"
          placeholder="请输入任务描述"
          clearable
          class="w-[180px]!"
        />
      </el-form-item>
      <el-form-item label="是否自动启动" prop="autoStart">
        <el-select
          v-model="queryForm.autoStart"
          placeholder="请选择"
          clearable
          class="w-[180px]!"
        >
          <el-option label="是" value="1" />
          <el-option label="否" value="0" />
        </el-select>
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
      <PureTableBar
        :title="`${operateName}管理`"
        :columns="columns"
        @refresh="onSearch"
      >
        <template #buttons>
          <el-button
            type="success"
            :icon="useRenderIcon(CodiconDebugStart)"
            @click="start()"
          >
            启动
          </el-button>
          <el-button
            type="danger"
            :icon="useRenderIcon(SolarStopBold)"
            @click="stop()"
          >
            停止
          </el-button>
          <el-button
            type="warning"
            :icon="useRenderIcon(CodiconDebugRestart)"
            @click="restart()"
          >
            重启
          </el-button>
          <el-button
            type="primary"
            :icon="useRenderIcon(AddFill)"
            @click="openDialog()"
          >
            新增
          </el-button>

          <el-popconfirm
            :title="`是否批量删除勾选的${operateName}?`"
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
            :data="pageList"
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
              <el-popconfirm
                :title="`是否确认删除这条${operateName}数据`"
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
              <el-dropdown>
                <el-button
                  class="ml-3! mt-[2px]!"
                  link
                  type="primary"
                  :size="size"
                  :icon="useRenderIcon(More)"
                />
                <template #dropdown>
                  <el-dropdown-menu>
                    <el-dropdown-item>
                      <el-button
                        class="reset-margin"
                        link
                        type="primary"
                        :size="size"
                        :icon="useRenderIcon(CodiconDebugStart)"
                        @click="tryOnce(row)"
                      >
                        执行一次
                      </el-button>
                    </el-dropdown-item>
                    <el-dropdown-item>
                      <el-button
                        link
                        type="success"
                        :size="size"
                        :icon="useRenderIcon(CodiconDebugStart)"
                        @click="start([row.taskKey])"
                      >
                        启动
                      </el-button>
                    </el-dropdown-item>
                    <el-dropdown-item>
                      <el-button
                        type="danger"
                        link
                        :size="size"
                        :icon="useRenderIcon(SolarStopBold)"
                        @click="stop([row.taskKey])"
                      >
                        停止
                      </el-button>
                    </el-dropdown-item>
                    <el-dropdown-item>
                      <el-button
                        type="warning"
                        link
                        :size="size"
                        :icon="useRenderIcon(CodiconDebugRestart)"
                        @click="restart([row.taskKey])"
                      >
                        重启
                      </el-button>
                    </el-dropdown-item>
                  </el-dropdown-menu>
                </template>
              </el-dropdown>
            </template>
          </pure-table>
        </template>
      </PureTableBar>
    </div>
  </div>
</template>

<style lang="scss" scoped>
:deep(.el-dropdown-menu__item i) {
  margin: 0;
}

.operation_bar_btn_interval {
  margin-left: 12px;
}

.search-form {
  :deep(.el-form-item) {
    margin-bottom: 12px;
  }
}
</style>
