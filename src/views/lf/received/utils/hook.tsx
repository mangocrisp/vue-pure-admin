import { ref, onMounted, reactive, defineAsyncComponent } from "vue";
import { useSystemDictParamsStoreHook } from "@/store/modules/system-dict-params";
import "v-contextmenu/dist/themes/default.css";
import { useMultiTagsStoreHook } from "@/store/modules/multiTags";
import { useRouter } from "vue-router";
import { useFormCostumComponents } from "@/views/lf/form/components/form-designer/utils/costumComponents";
import LfProcessApi from "@/api/lf/lfProcess";

// 加载自定义组件
const { loadCostumComponents } = useFormCostumComponents(null);
loadCostumComponents();
export function useReceivedList(props) {
  const router = useRouter();
  const status = ref<"1" | "0" | undefined>(undefined);
  if (props.for === "todo") {
    status.value = "1";
  }
  if (props.for === "done") {
    status.value = "0";
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
   * 开始流程
   * @param row 数据
   */
  const handleClickInitiateProcess = async () => {};

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
    handleClickInitiateProcess,
    designD
  };
}
