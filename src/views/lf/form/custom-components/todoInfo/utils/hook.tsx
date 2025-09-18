import {
  defineAsyncComponent,
  nextTick,
  ref,
  defineEmits,
  computed,
  reactive
} from "vue";
import type {
  LfFormTodoInfo,
  LfFormTodoInfoBasic,
  LfFormTodoInfoFlowChart,
  LfFormTodoInfoModelValue,
  LfFormTodoInfoRecord,
  LfFormTodoInfoRecordDetail
} from "./types";
import type { ElCollapse } from "element-plus";
import staticAvatar from "@/assets/user.jpg";
import AdminFileApi from "@/api/admin/file";
import { blobToDataURI } from "@/utils";
export const useTodoInfo = props => {
  const config = ref<LfFormTodoInfo>(props);
  const flowChart = ref<LfFormTodoInfoFlowChart>(props.modelValue.flowChart);
  const basic = ref<LfFormTodoInfoBasic>(props.modelValue.basic);
  const records = ref<LfFormTodoInfoRecord[]>(props.modelValue.records);
  const infoMap = ref<Map<string, LfFormTodoInfoRecordDetail>>(
    props.modelValue.infoMap
  );

  /**
   * 定义钩子
   */
  const emit = defineEmits<{
    /**保存数据 */
    (e: "update:modelValue", value: LfFormTodoInfoModelValue): void;
  }>();

  /**流程图设计器 */
  const LogicFlowDesigner = defineAsyncComponent(
    () => import("@/views/lf/design/components/flow-designer/index.vue")
  );
  const infoElCollapseRef = ref<InstanceType<typeof ElCollapse> | null>(null);
  const LogicFlowDesignerRef = ref<InstanceType<
    typeof LogicFlowDesigner
  > | null>(null);
  const showFlowRef = ref(false);
  const infoPannelLoading = ref<boolean>(false);
  const handleInfoChange = (val: string) => {
    if (val === "flowChart") {
      nextTick(() => {
        if (!LogicFlowDesignerRef.value) {
          infoPannelLoading.value = true;
        }
        setTimeout(() => {
          handleShowFlow(flowChart.value);
        }, 100);
      });
    }
  };

  /**
   * 显示流程
   * @param flowChart 流程实例 id
   */
  const handleShowFlow = (flowChart: LfFormTodoInfoFlowChart) => {
    if (!flowChart || !flowChart.flowData) {
      return;
    }
    if (showFlowRef.value) {
      return;
    }
    if (LogicFlowDesignerRef.value) {
      LogicFlowDesignerRef.value.loadData(
        flowChart.flowData,
        flowChart.readonly ?? true
      );
      showFlowRef.value = true;
    }
  };

  const avatarCache = reactive<{ [key: string]: string }>({});

  const getAvatar = (
    avatarPath: string,
    callBack?: (base64Data: string) => void,
    reject?: (error: any) => void
  ) => {
    if (!avatarPath || avatarCache[avatarPath]) {
      callBack ? callBack(avatarCache[avatarPath]) : {};
      return;
    }
    avatarCache[avatarPath] = staticAvatar;
    AdminFileApi.fileDownload(avatarPath)
      .then((res: Blob) => {
        blobToDataURI(res)
          .then(dataURI => {
            avatarCache[avatarPath] = dataURI;
            callBack ? callBack(dataURI) : {};
          })
          .catch(error => {
            console.error(error);
            reject ? reject(error) : {};
          });
      })
      .catch(error => {
        console.error(error);
        reject ? reject(error) : {};
      });
  };

  const avatarComputed = computed(() => (avatarPath: string) => {
    if (!avatarPath) {
      return staticAvatar;
    }
    if (avatarCache[avatarPath]) {
      return avatarCache[avatarPath];
    }
    getAvatar(avatarPath);
    return avatarCache[avatarPath] || staticAvatar;
  });

  return {
    config,
    flowChart,
    basic,
    records,
    infoMap,
    LogicFlowDesigner,
    LogicFlowDesignerRef,
    infoElCollapseRef,
    showFlowRef,
    infoPannelLoading,
    handleInfoChange,
    handleShowFlow,
    emit,
    avatarComputed
  };
};
