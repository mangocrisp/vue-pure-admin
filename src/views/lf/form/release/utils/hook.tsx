import type { PaginationProps } from "@pureadmin/table";
import { reactive, ref, onMounted } from "vue";
import LfFormReleaseApi from "@/api/lf/lfForm";
import { useMultiTagsStoreHook } from "@/store/modules/multiTags";
import { useRoute, useRouter } from "vue-router";
import { useSystemDictParamsStoreHook } from "@/store/modules/system-dict-params";
import LfFormApi from "@/api/lf/lfForm";
import { useLfCustomFrom } from "@/views/lf/form/components/form-designer/utils/custom";

const { logicFlowFormPreview } = useLfCustomFrom();
export function useLfFormRelease() {
  const route = useRoute();
  const router = useRouter();
  /**操作名 */
  const operateName = "流程表单发布表示例";
  /** 查询表单 */
  const queryForm = reactive<LfFormReleaseType.QueryDTO>({
    /** 发布 id */
    id: undefined,
    /** 表单 id */
    formId: route.params.id as string,
    /** 发布名称 */
    name: undefined,
    /** 状态(0 关闭 1 打开) */
    status: undefined,
    /** 备注说明 */
    description: undefined,
    /** 数据（每个版本的数据） */
    data: undefined,
    /** 版本号（yyyyMMddHHmmss） */
    version: undefined,
    /** 表单类型，是表单还是单组件（字典项 lf_form_type） */
    type: undefined,
    /** 表单组件路径 */
    path: undefined,
    /** 显示最新版本是否只显示最新版本 */
    showNewVersion: "false"
  });
  /** 列表数据 */
  const pageList = ref([]);
  /** 加载中 */
  const loading = ref(true);
  /** 分页 */
  const pagination = reactive<PaginationProps>({
    total: 0,
    pageSize: 10,
    currentPage: 1,
    background: true
  });

  const useSystemDictParamsStore = useSystemDictParamsStoreHook();
  const dictOption = (key: string) => {
    return useSystemDictParamsStore.dictOptions(key).value;
  };
  /** 列名 */
  const columns: TableColumnList = [
    {
      label: "发布 Id",
      prop: "id",
      fixed: "left",
      minWidth: 90
    },
    {
      label: "表单 id",
      prop: "formId"
    },
    {
      label: "发布名称",
      prop: "name"
    },
    {
      label: "状态",
      prop: "status",
      cellRenderer: scope => (
        <el-switch
          size={scope.props.size === "small" ? "small" : "default"}
          v-model={scope.row.status}
          active-value={1}
          inactive-value={0}
          active-text="已发布"
          inactive-text="未发布"
          inline-prompt
          disabled
        />
      ),
      minWidth: 90
    },
    {
      label: "备注说明",
      prop: "description"
    },
    {
      label: "版本号",
      prop: "version"
    },
    {
      label: "表单类型",
      prop: "type",
      formatter: ({ type }) =>
        useSystemDictParamsStore.dictK2V("lf_form_type", type).value
    },
    {
      label: "表单组件路径",
      prop: "path"
    },
    {
      label: "操作",
      fixed: "right",
      width: 210,
      slot: "operation"
    }
  ];

  /**
   * 页面大小修改
   * @param val 每页显示的条数
   */
  function handleSizeChange(val: number) {
    pagination.pageSize = val;
    onSearch();
  }
  /**
   * 页码修改
   * @param val 当前页码
   */
  function handleCurrentChange(val: number) {
    pagination.currentPage = val;
    onSearch();
  }
  /** 搜索 */
  async function onSearch() {
    loading.value = true;
    const { data } = await LfFormReleaseApi.publishList(queryForm, {
      pageNum: pagination.currentPage,
      pageSize: pagination.pageSize
    });
    pageList.value = data.records;
    pagination.total = data.total;

    setTimeout(() => {
      loading.value = false;
    }, 500);
  }
  /** 重置搜索条件表单 */
  const resetForm = formEl => {
    if (!formEl) return;
    formEl.resetFields();
    onSearch();
  };

  /** 行样式 */
  function rowStyle() {
    return {};
  }

  /**
   * 查看表单设计
   * @param row 当前行数据
   */
  const designD = (row: LfFormReleaseType.Domain) => {
    useMultiTagsStoreHook().handleTags("push", {
      path: `/lf/d/:source/:id`,
      name: "FlowFormDesignD",
      params: { source: "release", id: row.id },
      meta: {
        title: {
          zh: `动态表单设计`,
          en: `Flow Form Design`
        }
        // 如果使用的是非国际化精简版title可以像下面这么写
        // title: `No.${index} - 详情信息`,
      }
    });
    router.push({
      name: "FlowFormDesignD",
      params: { source: "release", id: row.id }
    });
  };

  /**
   * 动态表单预览
   * @param row 表单
   */
  const formPreview = async (row: LfFormReleaseType.Domain) => {
    const { data: lfForm } = await LfFormApi.publishDetail(row.id);
    const { rule, options } = JSON.parse(lfForm.data);
    logicFlowFormPreview(rule, options);
  };

  onMounted(async () => {
    onSearch();
  });

  return {
    operateName,
    queryForm,
    loading,
    columns,
    rowStyle,
    pageList,
    pagination,
    onSearch,
    resetForm,
    handleSizeChange,
    handleCurrentChange,
    designD,
    dictOption,
    formPreview
  };
}
