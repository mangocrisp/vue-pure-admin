<script setup lang="ts">
import { ref, defineAsyncComponent, h, onMounted } from "vue";
import LfFormCustomComponentsCard from "./LfFormCustomComponentsCard.vue";
import "v-contextmenu/dist/themes/default.css";
import { useRouter } from "vue-router";
import { useFormCostumComponents } from "@/views/lf/form/components/form-designer/utils/costumComponents";
import { addDialog } from "@/components/ReDialog";
import { deviceDetection } from "@pureadmin/utils";
import { LfFormCustomComponent } from "./utils/types";

// 加载自定义组件
const { loadCostumComponents } = useFormCostumComponents(null);
loadCostumComponents();

const router = useRouter();

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

const components = [
  {
    name: "",
    status: 1,
    icon: "material-symbols:info",
    type: "component",
    description: "流程待办信息",
    component: defineAsyncComponent(
      () => import("@/views/lf/form/custom-components/todoInfo/index.vue")
    )
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
