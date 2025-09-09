import { ref, onMounted, reactive, defineAsyncComponent, h } from "vue";
import { useSystemDictParamsStoreHook } from "@/store/modules/system-dict-params";
import LfReleaseApi from "@/api/lf/lfRelease";
import "v-contextmenu/dist/themes/default.css";
import { useMultiTagsStoreHook } from "@/store/modules/multiTags";
import { useRouter } from "vue-router";
import { addDialog } from "@/components/ReDialog";
import { deviceDetection } from "@pureadmin/utils";
import LfFormApi from "@/api/lf/lfForm";
import { ElMessageBox } from "element-plus";
import { message } from "@/utils/message";
import { useFormCostumComponents } from "@/views/lf/form/components/form-designer/utils/costumComponents";
import type { LfFormTodoInfoModelValue } from "@/views/lf/form/custom-components/todoInfo/utils/types";

// 加载自定义组件
const { loadCostumComponents } = useFormCostumComponents(null);
loadCostumComponents();
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

  /**动态表单创建渲染器 */
  const LfFormRender = defineAsyncComponent(
    () => import("@/views/lf/received/components/form-render/index.vue")
  );
  const LfFormRenderRef = ref<InstanceType<typeof LfFormRender> | null>(null);

  const generateFlowInfo = (
    row: LfFormType.Domain
  ): LfFormTodoInfoModelValue => {
    console.log("row :>> ", row);
    const infoMap = new Map();
    infoMap.set("dddd", {
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
            value: "描述"
          },
          {
            label: "标题",
            value: "描述"
          },
          {
            label: "标题",
            value: "描述"
          },
          {
            label: "标题",
            value: "描述"
          },
          {
            label: "标题",
            value: "描述"
          }
        ]
      }
    });
    return {
      basic: {
        children: [
          {
            label: "姓名",
            value: "张三"
          },
          {
            label: "手机号",
            value: "13838380438"
          },
          {
            label: "地址",
            value: "广州天河"
          },
          {
            label: "理由",
            value: "有人打架闹事"
          }
        ]
      },
      records: [
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
                  value: "描述"
                },
                {
                  label: "标题",
                  value: "描述"
                },
                {
                  label: "标题",
                  value: "描述"
                },
                {
                  label: "标题",
                  value: "描述"
                },
                {
                  label: "标题",
                  value: "描述"
                }
              ]
            }
          }
        }
      ],
      infoMap: infoMap
    };
  };

  /**
   * 开始流程
   * @param row 数据
   */
  const handleClickInitiateProcess = async () => {
    const { data: lfForm } = await LfFormApi.publishDetail(
      "1964966245669912577"
    );
    const { rule, options } = JSON.parse(lfForm.data);
    console.log("row :>> ", JSON.parse(rule));

    const flowInfo = generateFlowInfo(lfForm);
    addDialog({
      title: `测试`,
      props: {
        isAddForm: false,
        rule: JSON.parse(rule),
        options: {
          ...JSON.parse(options),
          ...{ submitBtn: false, resetBtn: false }
        },
        modelValue: {
          real: true,
          flowInfo
        }
      },
      width: "60%",
      draggable: true,
      fullscreen: deviceDetection(),
      fullscreenIcon: true,
      closeOnClickModal: false,
      resetForm: () => LfFormRenderRef.value.resetForm(),
      contentRenderer: () =>
        h(LfFormRender, { ref: LfFormRenderRef, formData: null }),
      beforeSure: (done, {}) => {
        const ApiRef = LfFormRenderRef.value.getApiRef();
        function chores() {
          message(`操作成功`, {
            type: "success"
          });
          done(); // 关闭弹框
          //onSearch(); // 刷新表格数据
        }
        ApiRef.validate((valid, fail) => {
          if (valid === true) {
            // 实际开发先调用新增接口，再进行下面操作
            const formData = ApiRef.formData();
            // 这里清空一下流程信息，因为只是做展示用
            formData.flowInfo = undefined;
            ElMessageBox.alert(formData, "表单提交结果");
            console.log(formData);
            chores();
          } else {
            console.log("表单验证未通过", fail);
          }
        })
          .then(() => {
            //推荐
            console.log("Promise resolved: 表单验证通过");
          })
          .catch(() => {
            console.log("Promise rejected: 表单验证未通过");
          });
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
