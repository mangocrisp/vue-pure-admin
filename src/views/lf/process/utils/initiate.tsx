import LfFormApi from "@/api/lf/lfForm";
import LfReleaseApi from "@/api/lf/lfRelease";
import { useMultiTagsStoreHook } from "@/store/modules/multiTags";
import { useSystemDictParamsStoreHook } from "@/store/modules/system-dict-params";
import { message } from "@/utils/message";
import { onMounted, reactive, ref } from "vue";
import { useRouter } from "vue-router";
import { useLfCustomFrom } from "@/views/lf/form/components/form-designer/utils/custom";
import LfProcessApi from "@/api/lf/lfProcess";

const { logicFlowFormEdit } = useLfCustomFrom();

export const useLfProcessInitiate = () => {
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

  /**
   * 开始流程
   * @param row 数据
   */
  const handleClickInitiateProcess = async (row: any) => {
    const { data: lfRelease } = await LfReleaseApi.detail(row.id);
    if (lfRelease.data) {
      const { nodes } = JSON.parse(lfRelease.data);
      const startNode = nodes.find(
        node => node.type === "custom-node-start"
      ) as LogicFlowTypes.EditData | undefined;
      if (startNode) {
        const title = (startNode.text as LogicFlowTypes.elementText).value;
        const { formBind } = startNode.properties as
          | LogicFlowTypes.BusinessProperties
          | undefined;
        LfFormApi.publishDetail(formBind.id).then(res => {
          const { data: lfFormRelease } = res;
          const { rule, options } = JSON.parse(lfFormRelease.data);
          logicFlowFormEdit({
            title: (startNode.text as LogicFlowTypes.elementText).value,
            rule,
            options,
            flowInfoData: {
              source: "processInitiate",
              data: lfRelease
            },
            onSubmit: (data: any) => {
              const { fields } = startNode.properties;
              fields.forEach(field => {
                field.value = data[field.name];
              });
              const submitData = JSON.stringify(startNode.properties);
              return new Promise(resolve => {
                LfProcessApi.newProcess({
                  /** 流程图 id（可以知道当前流程是基于什么原始设计运行的） */
                  designId: lfRelease.designId,
                  /** 流程标题 */
                  title: lfRelease.description,
                  /** 流程发布 id（可以知道当前流程是基于什么版本的设计在运行的） */
                  releaseId: lfRelease.id,
                  /** 备注 */
                  remark: lfRelease.description,
                  /** 流程类型（字典项 lf_process_type） */
                  type: lfFormRelease.type,
                  /** 开始节点的属性数据，新建流程，是从第一个开始节点开始的，这里一般会传开始节点的属性数据 */
                  startNodes: {
                    /** 节点的属性数据 */
                    properties: submitData,
                    /** 节点上的文字 */
                    text: title,
                    /** 节点类型（字典项 lf_node_type） */
                    type: startNode.type
                  }
                }).then(res => {
                  if (res.code === "200") {
                    resolve(true);
                  } else {
                    message(res.message, { type: "error" });
                    resolve(false);
                  }
                });
              });
            }
          });
        });
      } else {
        message("流程数据异常[没有开始节点]", { type: "error" });
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
  return {
    queryForm,
    dictOption,
    loading,
    onSearch,
    pagination,
    handleClickInitiateProcess,
    onPageSizeChange,
    onCurrentChange,
    designD,
    pageList,
    resetForm
  };
};
