<script lang="ts">
import { defineComponent } from "vue";
import {
  directive,
  Contextmenu,
  ContextmenuItem,
  ContextmenuDivider,
  ContextmenuSubmenu,
  ContextmenuGroup
} from "v-contextmenu";
export default defineComponent({
  name: "LfFormDeptSelector",
  components: {
    [Contextmenu.name]: Contextmenu,
    [ContextmenuItem.name]: ContextmenuItem,
    [ContextmenuDivider.name]: ContextmenuDivider,
    [ContextmenuSubmenu.name]: ContextmenuSubmenu,
    [ContextmenuGroup.name]: ContextmenuGroup
  },
  directives: {
    contextmenu: directive
  }
});
</script>
<script setup lang="ts">
import "v-contextmenu/dist/themes/default.css";
import {
  Search,
  Loading,
  ArrowRight,
  ArrowDown
} from "@element-plus/icons-vue";
import {
  type LfFormDeptSelector,
  ChooseData,
  DeptUserTreeNodeType
} from "./utils/types";
import SystemDeptApi from "@/api/system/dept";
import { useLfFormDeptSelector } from "./utils/hook";
import { ref, watch } from "vue";

defineOptions({
  name: "LfFormDeptSelector"
});

const props = withDefaults(defineProps<LfFormDeptSelector>(), {
  api: () => ({
    deptUserTree: SystemDeptApi.deptUserTree,
    deptUserTreeByCondition: SystemDeptApi.deptUserTreeByCondition
  }),
  modelValue: (): ChooseData[] => [],
  expandOnClickNode: false,
  checkOnClickNode: false,
  checkStrictly: false,
  height: "300px",
  includeUser: false
});

/**
 * 定义钩子
 */
const emit = defineEmits<{
  (e: "update:modelValue", value: ChooseData[]): void;
  (e: "change", value: ChooseData[]): void;
}>();

const {
  deptUserTreeRef,
  deptUserTreeQuery,
  handleDeptUserTreeQuery,
  deptUserTreeData,
  deptUserTreeProps,
  deptUserTreeFilterMethod,
  getDeptUserTreeChildren,
  deptUserTreeCheckChange,
  loadData,
  fillExistedTree,
  checkedNodesData,
  includeUser,
  checkStrictly,
  toggleIncludeUser,
  expandStatus,
  toggleExpandStatus,
  height
} = useLfFormDeptSelector(props, emit);

watch(
  () => props.includeUser,
  value => {
    toggleIncludeUser(value);
  }
);

watch(
  () => props.checkStrictly,
  value => {
    checkStrictly.value = value;
  }
);

watch(
  () => props.height,
  value => {
    height.value = value;
    toggleExpandStatus(true);
  }
);

defineExpose({
  loadData,
  setData: (value: ChooseData[]) => fillExistedTree(value),
  getData: (): ChooseData[] => checkedNodesData()
});
</script>

<template>
  <div class="lf-form-dept-selector">
    <el-input
      v-model="deptUserTreeQuery"
      placeholder="关键字搜索部门或者用户"
      clearable
      @keyup.enter="handleDeptUserTreeQuery"
    >
      <template #prepend>
        <el-button v-show="!expandStatus" @click="toggleExpandStatus(true)">
          <el-icon class="mr-[25px]"><ArrowRight /></el-icon>
        </el-button>
        <el-button v-show="expandStatus" @click="toggleExpandStatus(false)">
          <el-icon class="mr-[25px]"><ArrowDown /></el-icon>
        </el-button>
        <el-switch
          :model-value="includeUser"
          class="mr-[10px]"
          inline-prompt
          active-text="包含用户"
          inactive-text="排除用户"
          @update:model-value="toggleIncludeUser"
        />
        <el-switch
          :model-value="checkStrictly"
          class="mr-[10px]"
          inline-prompt
          active-text="单独选择"
          inactive-text="父子联动"
          @update:model-value="checkStrictly = $event"
        />
      </template>
      <template #append>
        <el-button type="primary" @click="handleDeptUserTreeQuery">
          <el-icon class="mr-5px"><Search /></el-icon>
        </el-button>
      </template>
    </el-input>
    <el-auto-resizer :style="`height: ${height}; border: 1px solid #eee`">
      <template #default="{ height, width }">
        <el-tree-v2
          ref="deptUserTreeRef"
          :width="width"
          :height="height"
          :data="deptUserTreeData"
          :props="deptUserTreeProps"
          show-checkbox
          highlight-current
          :expand-on-click-node="props.expandOnClickNode"
          :check-on-click-node="props.checkOnClickNode"
          :check-strictly="checkStrictly"
          :filter-method="deptUserTreeFilterMethod"
          :indent="props.indent ?? 30"
          :item-size="props.itemSize ?? 30"
          :icon="props.icon"
          @node-expand="getDeptUserTreeChildren"
          @check-change="deptUserTreeCheckChange"
        >
          <template #default="{ node, data }">
            <div v-contextmenu:contextmenu style="width: 100%">
              <el-tag
                v-if="data.type === DeptUserTreeNodeType.DEPT"
                type="primary"
              >
                部门
              </el-tag>
              <el-tag
                v-if="data.type === DeptUserTreeNodeType.USER"
                type="success"
              >
                用户
              </el-tag>
              <el-icon
                v-if="data.type === DeptUserTreeNodeType.PLACEHOLDER"
                class="mr-5px"
                ><Loading
              /></el-icon>
              <el-tooltip :content="node.label" :trigger-keys="[]">
                <span class="dept-user-tree-label ellipsis" style="width: 40vw"
                  >{{ node.label }}
                </span>
              </el-tooltip>
            </div>
          </template>
        </el-tree-v2>
      </template>
    </el-auto-resizer>

    <v-contextmenu ref="contextmenu">
      <v-contextmenu-item>操作1</v-contextmenu-item>
      <v-contextmenu-divider />
      <v-contextmenu-item disabled>操作2</v-contextmenu-item>
    </v-contextmenu>
  </div>
</template>
<style lang="css" scoped>
.lf-form-dept-selector {
  width: 100%;
  margin-bottom: 20px;
}
</style>
