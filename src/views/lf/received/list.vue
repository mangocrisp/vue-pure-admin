<script setup lang="ts">
import { ref, watch } from "vue";
import { useRenderIcon } from "@/components/ReIcon/src/hooks";
import "v-contextmenu/dist/themes/default.css";
import Refresh from "~icons/ep/refresh";
import { ReceviedListProps } from "./utils/types";
import { useReceivedList } from "./utils/hook";
import { DoneStatus, Status, TodoStatus, TodoType } from "./utils/enums";

defineOptions({
  name: "ReceivedList"
});

const props = withDefaults(defineProps<ReceviedListProps>(), {
  for: "todo"
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

/**
 * 监听 props
 */
watch(props, val => {});

const {
  LfProcessInitiateCard,
  queryForm,
  pageList,
  dictOption,
  loading,
  onSearch,
  resetForm,
  pagination,
  onPageSizeChange,
  onCurrentChange,
  handleClickInitiateProcess,
  designD
} = useReceivedList(props);
</script>

<template>
  <div>
    <el-form
      ref="formRef"
      :inline="true"
      :model="queryForm"
      class="search-form bg-bg_color w-full pl-8 pt-[12px] overflow-auto"
    >
      <el-form-item label="流程标题" prop="title">
        <el-input
          v-model="queryForm.title"
          placeholder="流程标题"
          clearable
          class="w-[180px]!"
        />
      </el-form-item>
      <!-- 只有抄送的时候可以选择状态 -->
      <el-form-item v-if="props.for === 'cc'" label="状态" prop="status">
        <el-select
          v-model="queryForm.status"
          placeholder="请选择"
          default-first-option
          value-key="status"
          clearable
          class="w-[180px]!"
          @change="
            queryForm.todoStatus = undefined;
            queryForm.doneStatus = undefined;
          "
        >
          <el-option
            v-for="(item, key) in Status"
            :key="key"
            :value="item.value"
            :label="item.label"
          />
        </el-select>
      </el-form-item>
      <el-form-item
        v-if="
          props.for === 'todo' || (props.for === 'cc' && queryForm.status === 1)
        "
        label="待办状态"
        prop="todoStatus"
      >
        <el-select
          v-model="queryForm.todoStatus"
          placeholder="请选择"
          default-first-option
          value-key="todoStatus"
          clearable
          class="w-[180px]!"
        >
          <el-option
            v-for="(item, key) in TodoStatus"
            :key="key"
            :value="item.value"
            :label="item.label"
          />
        </el-select>
      </el-form-item>
      <el-form-item
        v-if="
          props.for === 'done' || (props.for === 'cc' && queryForm.status === 0)
        "
        label="已办状态"
        prop="doneStatus"
      >
        <el-select
          v-model="queryForm.doneStatus"
          placeholder="请选择"
          default-first-option
          value-key="doneStatus"
          clearable
          class="w-[180px]!"
        >
          <el-option
            v-for="(item, key) in DoneStatus"
            :key="key"
            :value="item.value"
            :label="item.label"
          />
        </el-select>
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
        :description="`暂无`"
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
              @click="data.status === 1 ? handleClickInitiateProcess : {}"
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
