import { ref, onMounted, reactive, defineAsyncComponent, h } from "vue";
import { useSystemDictParamsStoreHook } from "@/store/modules/system-dict-params";
import LfReleaseApi from "@/api/lf/lfRelease";
import "v-contextmenu/dist/themes/default.css";
import { useMultiTagsStoreHook } from "@/store/modules/multiTags";
import { useRouter } from "vue-router";
import { addDialog } from "@/components/ReDialog";
import { deviceDetection } from "@pureadmin/utils";
export function useReceivedList() {
  const router = useRouter();
  const queryForm = reactive<LfReleaseType.QueryDTO>({
    /** 发布名称 */
    name: undefined,
    /** 状态(0 关闭 1 打开) */
    status: "1",
    /** 备注说明 */
    description: undefined,
    /** 版本号（yyyyMMddHHmmss） */
    version: undefined,
    /** 流程类型（字典项 lf_process_type） */
    type: undefined,
    /** 显示最新版本是否只显示最新版本 */
    showNewVersion: "true"
  });

  /** 列表数据 */
  const pageList = ref<LfReleaseType.Domain[]>([]);
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
      const { data } = await LfReleaseApi.publishList(queryForm, {
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

  /**可选字段导出面板 */
  const FormTodoInfo = defineAsyncComponent(
    () => import("@/views/lf/form/components/todoInfo/index.vue")
  );
  const FormTodoInfoRef = ref<InstanceType<typeof FormTodoInfo> | null>(null);
  /**
   * 开始流程
   * @param row 数据
   */
  const handleClickInitiateProcess = async (row: any) => {
    const { data } = await LfReleaseApi.detail(row.id);
    console.log(data);

    addDialog({
      title: `测试`,
      props: {},
      width: "60%",
      draggable: true,
      fullscreen: deviceDetection(),
      fullscreenIcon: true,
      closeOnClickModal: false,
      // resetForm: () => FormTodoInfoRef.value.resetForm(),
      contentRenderer: () =>
        h(FormTodoInfo, { ref: FormTodoInfoRef, formData: null }),
      beforeSure: (done, {}) => {
        done();
      }
    });
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

  /**可选字段导出面板 */
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
