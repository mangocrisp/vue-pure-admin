<script setup lang="ts">
import { useLfFormRelease } from "./utils/hook";
import { defineAsyncComponent, ref } from "vue";
import { PureTableBar } from "@/components/RePureTableBar";
import { useRenderIcon } from "@/components/ReIcon/src/hooks";
import { deviceDetection, storageSession } from "@pureadmin/utils";

import Refresh from "~icons/ep/refresh";
import AntDesignLeftOutlined from "~icons/ant-design/left-outlined";
import IconoirDesignPencil from "~icons/iconoir/design-pencil";
import IconParkOutlinePreviewOpen from "~icons/icon-park-outline/preview-open";
import { useMultiTagsStoreHook } from "@/store/modules/multiTags";
import { useRouter } from "vue-router";

const router = useRouter();

const cachePathKey = "_flow_form_release_goback_route_";

const goBack = () => {
  useMultiTagsStoreHook().handleTags("splice", "/lf/frl/:id");
  const lastRoute = storageSession().getItem(cachePathKey);
  if (!lastRoute || lastRoute === router.currentRoute.value.fullPath) {
    // 没有历史记录，跳转到默认页面
    router.replace({ path: "/lf/form/design" });
    storageSession().removeItem(cachePathKey);
    return;
  }
  storageSession().setItem(cachePathKey, router.currentRoute.value.fullPath);
  if (history.length > 1) {
    // 有历史记录，后退一步
    history.go(-1);
  } else {
    // 没有历史记录，跳转到默认页面
    router.replace({ path: "/lf/form/design" });
  }
};
defineOptions({
  name: "LfFormReleaseList"
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
  handleSizeChange,
  handleCurrentChange,
  designD,
  dictOption,
  formPreview
} = useLfFormRelease();

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
      <el-form-item label="发布 id" prop="id">
        <el-input
          v-model="queryForm.id"
          placeholder="请输入发布 id"
          clearable
          class="w-[180px]!"
        />
      </el-form-item>
      <el-form-item label="表单 id" prop="formId">
        <el-input
          v-model="queryForm.formId"
          placeholder="请输入表单 id"
          clearable
          class="w-[180px]!"
        />
      </el-form-item>
      <el-form-item label="发布名称" prop="name">
        <el-input
          v-model="queryForm.name"
          placeholder="请输入发布名称"
          clearable
          class="w-[180px]!"
        />
      </el-form-item>
      <el-form-item label="状态" prop="status">
        <el-select
          v-model="queryForm.status"
          placeholder="请选择"
          default-first-option
          value-key="status"
          clearable
          class="w-[180px]!"
        >
          <el-option
            v-for="(item, key) in dictOption('system-status')"
            :key="key"
            :value="item.value"
            :label="item.label"
          />
        </el-select>
      </el-form-item>
      <el-form-item label="备注说明" prop="description">
        <el-input
          v-model="queryForm.description"
          placeholder="请输入备注说明"
          clearable
          class="w-[180px]!"
        />
      </el-form-item>
      <el-form-item label="版本号" prop="version">
        <el-input
          v-model="queryForm.version"
          placeholder="请输入版本号"
          clearable
          class="w-[180px]!"
        />
      </el-form-item>
      <el-form-item label="表单类型" prop="type">
        <el-select
          v-model="queryForm.type"
          placeholder="请选择"
          default-first-option
          value-key="type"
          clearable
          class="w-[180px]!"
        >
          <el-option
            v-for="(item, key) in dictOption('lf_form_type')"
            :key="key"
            :value="item.value"
            :label="item.label"
          />
        </el-select>
      </el-form-item>
      <el-form-item label="是否只显示最新版本" prop="showNewVersion">
        <el-radio-group v-model="queryForm.showNewVersion">
          <el-radio
            v-for="(item, key) in dictOption('system-is')"
            :key="key"
            :value="item.value"
            >{{ item.label }}</el-radio
          >
        </el-radio-group>
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
              关闭
            </el-button>
            <el-divider direction="vertical" />
            <span>{{ `${operateName}列表` }}</span>
          </div>
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
            @page-size-change="handleSizeChange"
            @page-current-change="handleCurrentChange"
          >
            <template #operation="{ row }">
              <!-- <el-button
                class="reset-margin"
                link
                type="primary"
                :size="size"
                :icon="useRenderIcon(IconoirDesignPencil)"
                @click="designD(row)"
              >
                设计流程图
              </el-button> -->
              <el-button
                class="reset-margin"
                link
                type="primary"
                :size="size"
                :icon="useRenderIcon(IconParkOutlinePreviewOpen)"
                @click="formPreview(row)"
              >
                预览表单
              </el-button>
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
