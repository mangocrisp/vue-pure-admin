import { ref, onMounted, reactive, defineAsyncComponent } from "vue";
import { useSystemDictParamsStoreHook } from "@/store/modules/system-dict-params";
import "v-contextmenu/dist/themes/default.css";
import { useMultiTagsStoreHook } from "@/store/modules/multiTags";
import { useRouter } from "vue-router";
import { useFormCostumComponents } from "@/views/lf/form/components/form-designer/utils/costumComponents";
import { useLfCustomFrom } from "@/views/lf/form/components/form-designer/utils/custom";
import LfProcessApi from "@/api/lf/lfProcess";
import { flowInfoDataSource } from "@/views/lf/form/components/form-designer/utils/types";
import { message } from "@/utils/message";
import LfHistoryApi from "@/api/lf/lfHistory";

// 加载自定义组件
const { loadCostumComponents } = useFormCostumComponents(null);
loadCostumComponents();
export function useProcessList(props) {
  const { logicFlowFormEdit } = useLfCustomFrom();
  const router = useRouter();
  const queryForm = reactive<LfProcessType.UserRequestListQueryDTO>({
    /** 流程图 id（可以知道当前流程是基于什么原始设计运行的） */
    designId: undefined,
    /** 流程标题 */
    title: undefined,
    /** 流程发布 id（可以知道当前流程是基于什么版本的设计在运行的） */
    releaseId: undefined,
    /** 流程状态（1、流程进行中 0、流程已经完成 2、流程已归档 -1、流程中止） */
    processStatus: undefined,
    /** 流程类型（字典项 lf_process_type） */
    type: undefined,
    /** 是否是我发起的请求 */
    isMe: props.who === "me"
  });

  /** 列表数据 */
  const pageList = ref<LfProcessType.ProcessListVO[]>([]);
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
      const { data } = await LfProcessApi.userRequestList(queryForm, {
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
   * 处理待办
   * @param row 数据
   */
  const handleShowDetail = async (todoInfo: LfProcessType.ProcessListVO) => {
    const { data: lfProcess } = await LfProcessApi.detail(todoInfo.processId);
    if (lfProcess.data) {
      const flowData = JSON.parse(lfProcess.data);
      const { data: historyData } = await LfHistoryApi.historyList({
        processId: todoInfo.processId
      });
      // 如果没有绑定表单，也就是说没有可以处理的表单提交，只需要查看流程信息就好了，下面的默认是查看流程信息动态表单的配置
      const formCreateConfig = {
        rule: `[{\"type\":\"LfFormTodoInfo\",\"field\":\"flowInfo\",\"title\":\"\",\"info\":\"请不要修改字段 ID (flowInfo)，仅展示流程信息\",\"_fc_id\":\"id_F81hmfjjyd86abc\",\"name\":\"ref_F31fmfjjyd86acc\",\"display\":true,\"hidden\":false,\"_fc_drag_tag\":\"LfFormTodoInfo\"}]`,
        options: `{\"form\":{\"inline\":false,\"hideRequiredAsterisk\":false,\"labelPosition\":\"right\",\"size\":\"default\",\"labelWidth\":\"125px\"},\"resetBtn\":{\"show\":false,\"innerText\":\"重置\"},\"submitBtn\":{\"show\":true,\"innerText\":\"提交\"}}`
      };
      logicFlowFormEdit({
        title: todoInfo.title,
        rule: formCreateConfig.rule,
        options: formCreateConfig.options,
        readonly: true,
        flowInfoData: {
          source: flowInfoDataSource.process,
          data: lfProcess,
          historyData,
          flowData
        }
      });
    } else {
      message("流程数据异常[数据为空]", { type: "error" });
    }
  };

  /**
   * 查看流程图
   * @param row 当前流程信息数据
   */
  const designD = (row: LfProcessType.ProcessListVO) => {
    useMultiTagsStoreHook().handleTags("push", {
      path: `/lf/d/:source/:id`,
      name: "FlowDesignD",
      params: { source: "process", id: row.releaseId },
      meta: {
        title: {
          zh: `${row.designName} - 流程图`,
          en: `${row.designName} - Flow Design`
        }
        // 如果使用的是非国际化精简版title可以像下面这么写
        // title: `No.${index} - 详情信息`,
      }
    });
    router.push({
      name: "FlowDesignD",
      params: { source: "process", id: row.releaseId }
    });
  };

  /**待办列表卡片 */
  const LfProcessListCard = defineAsyncComponent(
    () => import("@/views/lf/process/components/LfProcessListCard.vue")
  );

  const LfProcessListCardCardRef = ref<InstanceType<
    typeof LfProcessListCard
  > | null>(null);

  return {
    LfProcessListCard,
    LfProcessListCardCardRef,
    queryForm,
    pageList,
    dictOption,
    loading,
    onSearch,
    resetForm,
    pagination,
    onPageSizeChange,
    onCurrentChange,
    handleShowDetail,
    designD
  };
}
