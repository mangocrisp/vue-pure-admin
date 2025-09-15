import { ref, onMounted, reactive, defineAsyncComponent } from "vue";
import { useSystemDictParamsStoreHook } from "@/store/modules/system-dict-params";
import "v-contextmenu/dist/themes/default.css";
import { useMultiTagsStoreHook } from "@/store/modules/multiTags";
import { useRouter } from "vue-router";
import { useFormCostumComponents } from "@/views/lf/form/components/form-designer/utils/costumComponents";
import { useLfCustomFrom } from "@/views/lf/form/components/form-designer/utils/custom";
import LfProcessApi from "@/api/lf/lfProcess";
import { flowInfoDataSource } from "@/views/lf/form/components/form-designer/utils/types";
import LfFormApi from "@/api/lf/lfForm";
import { message } from "@/utils/message";
import LfHistoryApi from "@/api/lf/lfHistory";

// 加载自定义组件
const { loadCostumComponents } = useFormCostumComponents(null);
loadCostumComponents();
export function useReceivedList(props) {
  const { logicFlowFormEdit } = useLfCustomFrom();
  const router = useRouter();
  const status = ref<1 | 0 | undefined>(undefined);
  if (props.for === "todo") {
    status.value = 1;
  }
  if (props.for === "done") {
    status.value = 0;
  }
  if (props.for === "cc") {
    status.value = undefined;
  }
  const queryForm = reactive<LfProcessType.TodoListQueryDTO>({
    /** 流程图 id（可以知道当前流程是基于什么原始设计运行的） */
    designId: undefined,
    /** 流程标题 */
    title: undefined,
    /** 流程发布 id（可以知道当前流程是基于什么版本的设计在运行的） */
    releaseId: undefined,
    /** 运行流程 id */
    processId: undefined,
    /** 状态（1、待办、0、已办） */
    status: status.value,
    /** 待办状态（1、待处理 2、待阅 3、被退回  4、未读 5、反馈） */
    todoStatus: undefined,
    /** 已办状态（1、未归档 2、已归档 3、待回复 4、未读 5、反馈） */
    doneStatus: undefined,
    /** 流程类型（字典项 lf_process_type） */
    type: undefined,
    /** 待办类型（1、任务待办 2、抄送待办 ...其他类型自定义） */
    todoType: props.for === "cc" ? "2" : "1"
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
      const { data } = await LfProcessApi.todoList(queryForm, {
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
  const handleTodo = async (todoInfo: LfProcessType.ProcessListVO) => {
    // console.log(todoInfo);
    const { data: lfProcess } = await LfProcessApi.detail(todoInfo.processId);
    // console.log(lfProcess);
    if (lfProcess.data) {
      const flowData = JSON.parse(lfProcess.data);
      const { nodes, edges } = flowData;
      const todoNode = nodes.find(node => node.id === todoInfo.nodeId) as
        | LogicFlowTypes.EditData
        | undefined;
      const fromEdge = edges.filter(edge => edge.targetNodeId === todoNode.id);
      console.log(fromEdge);
      if (todoNode) {
        // const title = (todoNode.text as LogicFlowTypes.elementText).value;
        const { formBind } = todoNode.properties as
          | LogicFlowTypes.BusinessProperties
          | undefined;
        const { data: historyData } = await LfHistoryApi.historyList({
          processId: todoInfo.processId
        });

        // 如果没有绑定表单，也就是说没有可以处理的表单提交，只需要查看流程信息就好了，下面的默认是查看流程信息动态表单的配置
        const formCreateConfig = {
          rule: `[{\"type\":\"LfFormTodoInfo\",\"field\":\"flowInfo\",\"title\":\"\",\"info\":\"请不要修改字段 ID (flowInfo)，仅展示流程信息\",\"_fc_id\":\"id_F81hmfjjyd86abc\",\"name\":\"ref_F31fmfjjyd86acc\",\"display\":true,\"hidden\":false,\"_fc_drag_tag\":\"LfFormTodoInfo\"}]`,
          options: `{\"form\":{\"inline\":false,\"hideRequiredAsterisk\":false,\"labelPosition\":\"right\",\"size\":\"default\",\"labelWidth\":\"125px\"},\"resetBtn\":{\"show\":false,\"innerText\":\"重置\"},\"submitBtn\":{\"show\":true,\"innerText\":\"提交\"}}`
        };

        if (formBind && formBind.id) {
          const { data: lfFormRelease } = await LfFormApi.publishDetail(
            formBind.id
          );
          const { rule, options } = JSON.parse(lfFormRelease.data);
          formCreateConfig.rule = rule;
          formCreateConfig.options = options;
        }

        logicFlowFormEdit({
          title: (todoNode.text as LogicFlowTypes.elementText).value,
          rule: formCreateConfig.rule,
          options: formCreateConfig.options,
          readonly: todoInfo.status !== 1,
          flowInfoData: {
            source: flowInfoDataSource.process,
            data: lfProcess,
            historyData,
            flowData
          },
          onSubmit: (data: any) => {
            const { fields } = todoNode.properties;
            fields.forEach(field => {
              field.value = data[field.name];
            });
            console.log(todoNode);
            const submitData = JSON.stringify(todoNode.properties);
            return new Promise(resolve => {
              LfProcessApi.userSubmit({
                /** 主键（节点的id，这里是使用前端生成的 uuid） */
                id: todoInfo.nodeId,
                /** 流程 id */
                processId: todoInfo.processId,
                /** 节点的属性数据 */
                properties: submitData,
                /** 节点上的文字 */
                text: (todoNode.text as LogicFlowTypes.elementText).value,
                /** 节点类型（字典项 lf_node_type） */
                type: todoInfo.type,
                /** 待办 id */
                todoId: todoInfo.todoId,
                /** 上一个节点的 id */
                lastNodesId: fromEdge.sourceNodeId
              }).then(res => {
                if (res.code === "200") {
                  resolve(true);
                  onCurrentChange(1);
                } else {
                  message(res.message, { type: "error" });
                  resolve(false);
                }
              });
            });
          }
        });
      } else {
        message("流程数据异常[没有节点信息]", { type: "error" });
      }
    } else {
      message("流程数据异常[数据为空]", { type: "error" });
    }
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

  /**待办列表卡片 */
  const LfProcessInitiateCard = defineAsyncComponent(
    () => import("@/views/lf/received/components/LfReceivedListCard.vue")
  );

  const LfProcessInitiateCardRef = ref<InstanceType<
    typeof LfProcessInitiateCard
  > | null>(null);

  return {
    LfProcessInitiateCard,
    LfProcessInitiateCardRef,
    queryForm,
    pageList,
    dictOption,
    loading,
    onSearch,
    resetForm,
    pagination,
    onPageSizeChange,
    onCurrentChange,
    handleTodo,
    designD
  };
}
