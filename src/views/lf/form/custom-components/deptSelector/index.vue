<script setup lang="ts">
import { Search } from "@element-plus/icons-vue";
import {
  type LfFormDeptSelector,
  ChooseData,
  DeptUserTreeNodeType
} from "./utils/types";
import SystemDeptApi from "@/api/system/dept";
import { useLfFormDeptSelector } from "./utils/hook";

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
  checkStrictly: true,
  height: "300px"
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
  onDeptUserTreeQueryChanged,
  deptUserTreeData,
  deptUserTreeProps,
  deptUserTreeFilterMethod,
  getDeptUserTreeChildren,
  deptUserTreeCheckChange,
  loadData,
  checkedNodesData
} = useLfFormDeptSelector(props, emit);

defineExpose({
  loadData,
  getData: () => checkedNodesData
});
</script>

<template>
  <div class="lf-form-dept-selector">
    <ElInput
      v-model="deptUserTreeQuery"
      placeholder="关键字搜索部门或者用户"
      clearable
    >
      <template #append>
        <ElButton type="primary" @click="onDeptUserTreeQueryChanged">
          <el-icon class="mr-5px"><Search /></el-icon>
        </ElButton>
      </template>
    </ElInput>
    <el-auto-resizer :style="`height: ${props.height}; border: 1px solid #eee`">
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
          :check-strictly="props.checkStrictly"
          :filter-method="deptUserTreeFilterMethod"
          :indent="props.indent ?? 30"
          :item-size="props.itemSize ?? 30"
          :icon="props.icon"
          @node-expand="getDeptUserTreeChildren"
          @check-change="deptUserTreeCheckChange"
        >
          <template #default="{ node, data }">
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
            <el-tag
              v-if="data.type === DeptUserTreeNodeType.PLACEHOLDER"
              type="info"
            >
              ...
            </el-tag>
            <el-tooltip :content="node.label" :trigger-keys="[]">
              <span class="dept-user-tree-label ellipsis" style="width: 40vw">{{
                node.label
              }}</span>
            </el-tooltip>
          </template>
        </el-tree-v2>
      </template>
    </el-auto-resizer>
  </div>
</template>
<style lang="css" scoped>
.lf-form-dept-selector {
  width: 100%;
  margin-bottom: 20px;
}
</style>
