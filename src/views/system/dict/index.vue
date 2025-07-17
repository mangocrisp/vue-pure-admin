<script setup lang="ts">
import { usePermission } from "./utils/hook";
import { ref, computed } from "vue";
import { PureTableBar } from "@/components/RePureTableBar";
import { useRenderIcon } from "@/components/ReIcon/src/hooks";
import { deviceDetection, storageSession } from "@pureadmin/utils";

import Delete from "~icons/ep/delete";
import EditPen from "~icons/ep/edit-pen";
import Refresh from "~icons/ep/refresh";
import AddFill from "~icons/ri/add-circle-line";
import AntDesignLeftOutlined from "~icons/ant-design/left-outlined";
import { useRouter } from "vue-router";

defineOptions({
  name: "dictType"
});

const router = useRouter();

const cachePathKey = "_dict_item_goback_route_";

const goBack = () => {
  const lastRoute = storageSession().getItem(cachePathKey);
  if (lastRoute === router.currentRoute.value.fullPath) {
    // 没有历史记录，跳转到默认页面
    router.replace({ path: "/dict-type" });
    storageSession().removeItem(cachePathKey);
    return;
  }
  storageSession().setItem(cachePathKey, router.currentRoute.value.fullPath);
  if (history.length > 1) {
    // 有历史记录，后退一步
    history.go(-1);
  } else {
    // 没有历史记录，跳转到默认页面
    router.replace({ path: "/dict-type" });
  }
};

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
  handleSelectionChange
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
      <el-form-item label="字典键：" prop="title">
        <el-input
          v-model="form.dictKey"
          placeholder="请输入字典键"
          clearable
          class="w-[180px]!"
        />
      </el-form-item>
      <el-form-item label="字典值：" prop="title">
        <el-input
          v-model="form.dictVal"
          placeholder="请输入字典值"
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
      <PureTableBar :columns="columns" @refresh="onSearch">
        <template #title>
          <div style="text-align: left">
            <el-button
              type="primary"
              :icon="useRenderIcon(AntDesignLeftOutlined)"
              @click="goBack"
            >
              返回
            </el-button>
            <el-divider direction="vertical" />
            <span>字典管理</span>
          </div>
        </template>
        <template #buttons>
          <el-button
            type="primary"
            :icon="useRenderIcon(AddFill)"
            @click="openDialog()"
          >
            新增
          </el-button>

          <el-popconfirm
            title="是否批量删除勾选字典?"
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
              <el-popconfirm
                :title="`是否确认删除字典名称为${row.name}的这条数据`"
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
