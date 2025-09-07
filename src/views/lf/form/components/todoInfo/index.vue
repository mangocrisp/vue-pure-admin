<!--待办信息-->
<script lang="ts" setup>
import {
  InfoFilled,
  Guide,
  TrendCharts,
  DataLine,
  Bell
} from "@element-plus/icons-vue";
import { defineAsyncComponent, h, nextTick, ref } from "vue";
import { LfFormTodoInfo } from "./utils/types";

defineOptions({
  name: "LfFormTodoInfo"
});

const props = withDefaults(defineProps<LfFormTodoInfo>(), {
  basic: () => {
    return {
      border: true,
      column: 2,
      direction: "horizontal",
      size: "default",
      title: "",
      extra: "",
      labelWidth: 120,
      children: [
        {
          label: "标题",
          value: "标题"
        },
        {
          label: "标题",
          value: "标题"
        },
        {
          label: "标题",
          value: "标题"
        },
        {
          label: "标题",
          value: "标题"
        },
        {
          label: "标题",
          value: "标题"
        }
      ]
    };
  },
  records: () => [
    {
      timestamp: "2021-09-01 09:00:00",
      title: "标题",
      description: "描述"
    },
    {
      timestamp: "2021-09-01 10:00:00",
      title: "标题",
      description: "描述",
      detail: {
        title: "标题",
        name: "名称",
        basic: {
          border: true,
          column: 2,
          direction: "horizontal",
          size: "default",
          title: "",
          extra: "",
          labelWidth: 120,
          children: [
            {
              label: "标题",
              value: "标题"
            },
            {
              label: "标题",
              value: "标题"
            },
            {
              label: "标题",
              value: "标题"
            },
            {
              label: "标题",
              value: "标题"
            },
            {
              label: "标题",
              value: "标题"
            }
          ]
        }
      }
    }
  ],
  infoMap: () => {
    let a = new Map();
    a.set("dddd", {
      title: "相关信息",
      name: "dddd",
      basic: {
        border: true,
        column: 2,
        direction: "horizontal",
        size: "default",
        title: "",
        extra: "",
        labelWidth: 120,
        children: [
          {
            label: "标题",
            value: "标题"
          },
          {
            label: "标题",
            value: "标题"
          },
          {
            label: "标题",
            value: "标题"
          },
          {
            label: "标题",
            value: "标题"
          },
          {
            label: "标题",
            value: "标题"
          }
        ]
      }
    });
    return a;
  }
});

const config = ref<LfFormTodoInfo>(props);

/**可选字段导出面板 */
const LogicFlowDesigner = defineAsyncComponent(
  () => import("@/views/lf/design/components/d.vue")
);
const FormTodoInfoRef = ref<InstanceType<typeof LogicFlowDesigner> | null>(
  null
);
const showFlowRef = ref(false);
const handleInfoChange = (val: string) => {
  if (val === "flowChart") {
    nextTick(() => {
      handleShowFlow(config.value.releaseId);
    });
  }
};
/**
 * 显示流程
 * @param releaseId 流程发布 id
 */
const handleShowFlow = (releaseId: string) => {
  if (!releaseId) {
    return;
  }
  if (showFlowRef.value) {
    return;
  }
  FormTodoInfoRef.value.reloadData("release", releaseId);
};
</script>
<template>
  <el-tabs type="border-card" class="lf-form-todo-info">
    <el-tab-pane>
      <template #label>
        <el-button :icon="InfoFilled" link>基本信息</el-button>
      </template>
      <template #default>
        <el-descriptions
          :border="basic?.border ?? true"
          :size="basic?.size ?? 'small'"
          :column="basic?.column ?? 2"
          :direction="basic?.direction ?? 'horizontal'"
          :title="basic?.title ?? ''"
          :extra="basic?.extra ?? ''"
          :label-width="basic?.labelWidth ?? ''"
        >
          <el-descriptions-item
            v-for="(b, index) in basic?.children"
            :key="`basic-${index}`"
            :label="b.label"
            :span="b.span ?? 1"
            :rowspan="b.rowspan ?? 1"
            :width="b.width ?? ''"
            :min-width="b.minWidth ?? ''"
            :label-width="b.labelWidth ?? ''"
            :label-align="b.labelAlign ?? 'right'"
            :align="b.align ?? 'left'"
            :class="b.className"
            :label-class-name="b.labelClassName"
            >{{ b.value }}
          </el-descriptions-item>
        </el-descriptions>
      </template>
    </el-tab-pane>
    <el-tab-pane>
      <template #label>
        <el-button :icon="Guide" link>流转记录</el-button>
      </template>
      <template #default>
        <el-timeline>
          <el-timeline-item
            v-for="(record, r) in records"
            :key="r"
            :center="record?.center ?? true"
            :timestamp="record?.timestamp ?? '未知时间'"
            :hide-timestamp="record?.hideTimestamp ?? false"
            :type="record?.type ?? 'success'"
            :placement="record?.placement ?? 'top'"
            :color="record?.color ?? ''"
            :size="record?.size ?? 'normal'"
            :icon="record?.icon ?? ''"
            :hollow="record?.hollow ?? false"
          >
            <el-card>
              <h4>{{ record?.title ?? `第${r}步` }}</h4>
              <p>{{ record?.description ?? "" }}</p>
              <el-collapse v-if="record?.detail">
                <el-collapse-item
                  :title="record?.detail?.title ?? '详细信息'"
                  :name="record?.detail?.name ?? 'record.detail.name'"
                >
                  <el-descriptions
                    :border="record?.detail?.basic?.border ?? true"
                    :size="record?.detail?.basic?.size ?? 'small'"
                    :column="record?.detail?.basic?.column ?? 2"
                    :direction="
                      record?.detail?.basic?.direction ?? 'horizontal'
                    "
                    :title="record?.detail?.basic?.title ?? ''"
                    :extra="record?.detail?.basic?.extra ?? ''"
                    :label-width="record?.detail?.basic?.labelWidth ?? ''"
                  >
                    <el-descriptions-item
                      v-for="(rd, i) in record?.detail?.basic?.children"
                      :key="`record-${record?.detail?.name}-${i}`"
                      :label="rd.label"
                      :span="rd.span ?? 1"
                      :rowspan="rd.rowspan ?? 1"
                      :width="rd.width ?? ''"
                      :min-width="rd.minWidth ?? ''"
                      :label-width="rd.labelWidth ?? ''"
                      :label-align="rd.labelAlign ?? 'right'"
                      :align="rd.align ?? 'left'"
                      :class="rd.className"
                      :label-class-name="rd.labelClassName"
                      >{{ rd.value }}
                    </el-descriptions-item>
                  </el-descriptions>
                </el-collapse-item>
              </el-collapse>
            </el-card>
            <div class="record-operator">
              {{ record?.operator ?? "未知操作者信息" }}
            </div>
          </el-timeline-item>
        </el-timeline>
      </template>
    </el-tab-pane>
    <el-tab-pane>
      <template #label>
        <el-button :icon="TrendCharts" link>流程信息</el-button>
      </template>
      <template #default>
        <el-collapse accordion @change="handleInfoChange">
          <el-collapse-item name="flowChart">
            <template #title>
              <el-button :icon="DataLine" type="primary" link>流程图</el-button>
            </template>
            <template #default>
              <div class="flow-container">
                <LogicFlowDesigner
                  ref="FormTodoInfoRef"
                  :show-close-button="false"
                />
              </div>
            </template>
          </el-collapse-item>
          <el-collapse-item
            v-for="[key, info] in infoMap"
            :key="key"
            :name="info?.name ?? key"
          >
            <template #title>
              <el-button :icon="Bell" type="primary" link>{{
                info?.title ?? `相关信息${info?.name ?? key}`
              }}</el-button>
            </template>
            <template #default>
              <el-descriptions
                :border="info?.basic?.border ?? true"
                :size="info?.basic?.size ?? 'small'"
                :column="info?.basic?.column ?? 2"
                :direction="info?.basic?.direction ?? 'horizontal'"
                :title="info?.basic?.title ?? ''"
                :extra="info?.basic?.extra ?? ''"
                :label-width="info?.basic?.labelWidth ?? ''"
              >
                <el-descriptions-item
                  v-for="(b, index) in info?.basic?.children"
                  :key="`basic-${index}`"
                  :label="b.label"
                  :span="b.span ?? 1"
                  :rowspan="b.rowspan ?? 1"
                  :width="b.width ?? ''"
                  :min-width="b.minWidth ?? ''"
                  :label-width="b.labelWidth ?? ''"
                  :label-align="b.labelAlign ?? 'right'"
                  :align="b.align ?? 'left'"
                  :class="b.className"
                  :label-class-name="b.labelClassName"
                  >{{ b.value }}
                </el-descriptions-item>
              </el-descriptions>
            </template>
          </el-collapse-item>
        </el-collapse>
      </template>
    </el-tab-pane>
  </el-tabs>
</template>
<style lang="scss" scoped>
.lf-form-todo-info {
  width: 100%;
}

.flow-container {
  height: 60vh;
}

.record-operator {
  box-sizing: inherit;
  margin-top: 8px;
  margin-bottom: 8px;
  font-size: var(--el-font-size-small);
  line-height: 1;
  color: var(--el-text-color-secondary);
}
</style>
