<script setup lang="ts">
import { ref, onMounted, reactive } from "vue";
import LfProcessInitiateCard from "./components/LfProcessInitiateCard.vue";
import { useSystemDictParamsStoreHook } from "@/store/modules/system-dict-params";
import { useRenderIcon } from "@/components/ReIcon/src/hooks";
import LfReleaseApi from "@/api/lf/lfRelease";
import "v-contextmenu/dist/themes/default.css";
import Refresh from "~icons/ep/refresh";
import { useMultiTagsStoreHook } from "@/store/modules/multiTags";
import { useRoute, useRouter } from "vue-router";

const route = useRoute();
const router = useRouter();

defineOptions({
  name: "CardList"
});

const svg = `
        <path class="path" d="
          M 30 15
          L 28 17
          M 25.61 25.61
          A 15 15, 0, 0, 1, 15 30
          A 15 15, 0, 1, 1, 27.99 7.5
          L 15 15
        " style="stroke-width: 4px; fill: rgba(0, 0, 0, 0)"/>
      `;

/** 查询表单 */
const formRef = ref();
const queryForm = reactive<LfReleaseType.QueryDTO>({
  /** 发布名称 */
  name: undefined,
  /** 状态(0 关闭 1 打开) */
  status: "1",
  /** 备注说明 */
  description: undefined,
  /** 版本号（yyyyMMddHHmmss） */
  version: undefined,
  /** 流程类型（字典项 lf_process_type） */
  type: undefined,
  /** 显示最新版本是否只显示最新版本 */
  showNewVersion: "true"
});

/** 列表数据 */
const pageList = ref<LfReleaseType.Domain[]>([]);
/** 加载中 */
const loading = ref(true);

const useSystemDictParamsStore = useSystemDictParamsStoreHook();
const dictOption = (key: string) => {
  return useSystemDictParamsStore.dictOptions(key).value;
};
const pagination = ref({ current: 1, pageSize: 12, total: 0 });

const onSearch = async () => {
  try {
    loading.value = true;
    const { data } = await LfReleaseApi.publishList(queryForm, {
      pageNum: pagination.value.current,
      pageSize: pagination.value.pageSize
    });
    pageList.value = data.records;
    pagination.value.total = data.total;
  } catch (e) {
    console.error(e);
  } finally {
    setTimeout(() => {
      loading.value = false;
    }, 500);
  }
};

/** 重置搜索条件表单 */
const resetForm = formEl => {
  if (!formEl) return;
  formEl.resetFields();
  onSearch();
};

onMounted(() => {
  onSearch();
});

const onPageSizeChange = (size: number) => {
  pagination.value.pageSize = size;
  pagination.value.current = 1;
  onSearch();
};
const onCurrentChange = (current: number) => {
  pagination.value.current = current;
  onSearch();
};

/**
 * 开始流程
 * @param row 数据
 */
const handleClickInitiateProcess = async (row: any) => {
  const { data } = await LfReleaseApi.detail(row.id);
  console.log(data);
};

/**
 * 设置流程图
 * @param row 当前行数据
 */
const designD = (row: LfReleaseType.Domain) => {
  useMultiTagsStoreHook().handleTags("push", {
    path: `/lf/d/:source/:id`,
    name: "FlowDesignD",
    params: { source: "processInitiate", id: row.id },
    meta: {
      title: {
        zh: `${row.name} - 流程图`,
        en: `${row.name} - Flow Design`
      }
      // 如果使用的是非国际化精简版title可以像下面这么写
      // title: `No.${index} - 详情信息`,
    }
  });
  router.push({
    name: "FlowDesignD",
    params: { source: "processInitiate", id: row.id }
  });
};
</script>

<template>
  <div>
    <el-form
      ref="formRef"
      :inline="true"
      :model="queryForm"
      class="search-form bg-bg_color w-full pl-8 pt-[12px] overflow-auto"
    >
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
      <el-form-item label="流程类型" prop="type">
        <el-select
          v-model="queryForm.type"
          placeholder="请选择"
          default-first-option
          value-key="type"
          clearable
          class="w-[180px]!"
        >
          <el-option
            v-for="(item, key) in dictOption('lf_process_type')"
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
        <el-button :icon="useRenderIcon(Refresh)" @click="resetForm">
          重置
        </el-button>
      </el-form-item>
    </el-form>
    <div
      v-loading="loading"
      class="mt-2.5"
      :element-loading-svg="svg"
      element-loading-svg-view-box="-10, -10, 50, 50"
    >
      <el-empty
        v-show="pagination.total === 0 && !loading"
        :description="`没有提供可以申请的流程`"
      />
      <template v-if="pagination.total > 0">
        <el-row :gutter="16">
          <el-col
            v-for="(data, index) in pageList"
            :key="index"
            :xs="24"
            :sm="12"
            :md="8"
            :lg="6"
            :xl="4"
          >
            <LfProcessInitiateCard
              :data="data"
              @click="data.status === 1 ? handleClickInitiateProcess(data) : {}"
              @initiate-process="handleClickInitiateProcess"
              @show-design="designD"
            />
          </el-col>
        </el-row>
        <el-pagination
          v-model:currentPage="pagination.current"
          class="justify-center"
          :page-size="pagination.pageSize"
          :total="pagination.total"
          :page-sizes="[12, 24, 36]"
          :background="true"
          layout="total, sizes, prev, pager, next, jumper"
          @size-change="onPageSizeChange"
          @current-change="onCurrentChange"
        />
      </template>
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
