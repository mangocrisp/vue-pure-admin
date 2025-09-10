<script setup lang="ts">
import { ref, h, onMounted, shallowRef } from "vue";
import LfFormCustomComponentsCard from "./LfFormCustomComponentsCard.vue";
import "v-contextmenu/dist/themes/default.css";
import { addDialog } from "@/components/ReDialog";
import { deviceDetection } from "@pureadmin/utils";
import { LfFormCustomComponent } from "./utils/types";
import LfFormTodoInfo from "@/views/lf/form/custom-components/todoInfo/index.vue";
import LfFormDeptSelector from "@/views/lf/form/custom-components/deptSelector/index.vue";
import MaterialSymbolsInfo from "~icons/material-symbols/info";
import TablerSelector from "~icons/tabler/selector";

defineOptions({
  name: "LfProcessInitiate"
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

const lfFormTodoInfoRef = shallowRef(LfFormTodoInfo);
const lfFormDeptSelectorRef = shallowRef(LfFormDeptSelector);

const components = [
  {
    name: "流程待办信息",
    status: 1,
    icon: MaterialSymbolsInfo,
    type: "component",
    description: "流程待办信息",
    component: lfFormTodoInfoRef
  },
  {
    name: "部门选择器",
    status: 1,
    icon: TablerSelector,
    type: "component",
    description:
      "部门选择器（虚拟树版本），可以同时选择到部门下面的用户，当然这个是可选的",
    component: lfFormDeptSelectorRef
  }
] as LfFormCustomComponent[];

/** 列表数据 */
const pageList = ref<LfFormCustomComponent[]>(components);
/** 加载中 */
const loading = ref(true);
/**
 * 开始流程
 * @param row 数据
 */
const showComponent = async (row: LfFormCustomComponent) => {
  console.log(row);

  /**可选字段导出面板 */
  const CustomComponent = row.component;
  const CustomComponentRef = ref<InstanceType<typeof CustomComponent> | null>(
    null
  );
  addDialog({
    title: `测试`,
    props: {},
    width: "60%",
    draggable: true,
    fullscreen: deviceDetection(),
    fullscreenIcon: true,
    closeOnClickModal: false,
    contentRenderer: () => h(CustomComponent, { ref: CustomComponentRef }),
    beforeSure: (done, {}) => {
      const data = CustomComponentRef.value?.getData?.();
      console.log(data);
      done();
    }
  });
};

onMounted(() => {
  setTimeout(() => {
    loading.value = false;
  }, 1000);
});
</script>

<template>
  <div>
    <div
      v-loading="loading"
      class="mt-2.5"
      :element-loading-svg="svg"
      element-loading-svg-view-box="-10, -10, 50, 50"
    >
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
          <LfFormCustomComponentsCard
            :data="data"
            @click="data.status === 1 ? showComponent(data) : {}"
            @show-component="showComponent"
          />
        </el-col>
      </el-row>
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
