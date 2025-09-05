import type { PaginationProps } from "@pureadmin/table";
import { reactive, ref, onMounted, h } from "vue";
import LfReleaseApi from "@/api/lf/lfRelease";
import { useSystemDictParamsStoreHook } from "@/store/modules/system-dict-params";
import { useRoute, useRouter } from "vue-router";
import { useMultiTagsStoreHook } from "@/store/modules/multiTags";
import { useRenderIcon } from "@/components/ReIcon/src/hooks";
import { transformI18n } from "@/plugins/i18n";

export function useLfRelease() {
  const route = useRoute();
  const router = useRouter();

  /**操作名 */
  const operateName = "流程发布";
  /** 查询表单 */
  const queryForm = reactive<LfReleaseType.QueryDTO>({
    /** 主键 */
    id: undefined,
    /** 流程图 id */
    designId: route.params.id as string,
    /** 发布名称 */
    name: undefined,
    /** 状态(0 关闭 1 打开) */
    status: undefined,
    /** 备注说明 */
    description: undefined,
    /** 版本号（yyyyMMddHHmmss） */
    version: undefined,
    /** 流程类型（字典项 lf_process_type） */
    type: undefined,
    /** 显示最新版本是否只显示最新版本 */
    showNewVersion: "false"
  });
  /** 列表数据 */
  const pageList = ref<LfReleaseType.Domain[]>([]);
  /** 加载中 */
  const loading = ref(true);

  const switchLoadMap = ref({});

  const useSystemDictParamsStore = useSystemDictParamsStoreHook();
  const dictOption = (key: string) => {
    return useSystemDictParamsStore.dictOptions(key).value;
  };

  /** 分页 */
  const pagination = reactive<PaginationProps>({
    total: 0,
    pageSize: 10,
    currentPage: 1,
    background: true
  });
  /** 列名 */
  const columns: TableColumnList = [
    {
      label: "发布 id",
      prop: "id",
      fixed: "left",
      minWidth: 90
    },
    {
      label: "发布名称",
      prop: "name",
      cellRenderer: ({ row }) => (
        <>
          <span class="inline-block mr-1">
            {h(
              useRenderIcon(
                row.icon ?? "streamline-sharp-color:text-flow-rows"
              ),
              {
                style: { paddingTop: "2px", width: "16px", height: "16px" }
              }
            )}
          </span>
          <span>{transformI18n(row.name || row.name)}</span>
        </>
      )
    },
    {
      label: "流程图 id",
      prop: "designId"
    },
    {
      label: "状态(0 关闭 1 打开)",
      hide: true,
      prop: "status",
      cellRenderer: scope => (
        <el-switch
          size={scope.props.size === "small" ? "small" : "default"}
          loading={switchLoadMap.value[scope.index]?.loading}
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
      label: "流程类型",
      prop: "type",
      formatter: ({ type }) =>
        useSystemDictParamsStore.dictK2V("lf_process_type", type).value
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
    const { data } = await LfReleaseApi.publishList(queryForm, {
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
   * 设置流程图
   * @param row 当前行数据
   */
  const designD = (row: LfReleaseType.Domain) => {
    useMultiTagsStoreHook().handleTags("push", {
      path: `/lf/d/:source/:id`,
      name: "FlowDesignD",
      params: { source: "release", id: row.id },
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
      params: { source: "release", id: row.id }
    });
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
    dictOption,
    designD
  };
}
