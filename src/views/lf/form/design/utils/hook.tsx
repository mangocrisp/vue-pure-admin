import dayjs from "dayjs";
import editForm from "../form.vue";
import { message } from "@/utils/message";
import { addDialog } from "@/components/ReDialog";
import type { PaginationProps } from "@pureadmin/table";
import { deviceDetection } from "@pureadmin/utils";
import { reactive, ref, onMounted, h, defineAsyncComponent } from "vue";
import LfFormApi from "@/api/lf/lfForm";
import type { EditFormDTO } from "./types";
import { useSystemDictParamsStoreHook } from "@/store/modules/system-dict-params";
import { ElForm, ElFormItem, ElInput, ElMessageBox } from "element-plus";
import { useRouter } from "vue-router";
import { useMultiTagsStoreHook } from "@/store/modules/multiTags";

export function useLfForm() {
  const router = useRouter();
  const useSystemDictParamsStore = useSystemDictParamsStoreHook();
  const dictOption = (key: string) => {
    return useSystemDictParamsStore.dictOptions(key).value;
  };

  /**操作名 */
  const operateName = "流程表单示例";
  /** 查询表单 */
  const queryForm = reactive<LfFormType.QueryDTO>({
    /** 主键 */
    id: undefined,
    /** 名称 */
    name: undefined,
    /** 状态(0未发布，1已经发布) */
    status: undefined,
    /** 备注说明 */
    description: undefined,
    /** 表单类型，是表单还是单组件（字典项 lf_form_type） */
    type: undefined
  });
  /** 编辑表单 */
  const editFormRef = ref();
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
  const switchLoadMap = ref({});
  /** 列名 */
  const columns: TableColumnList = [
    {
      label: "表单 id",
      prop: "id",
      fixed: "left",
      minWidth: 90
    },
    {
      label: "名称",
      prop: "name",
      minWidth: 90
    },
    {
      label: "状态(0未发布，1已经发布)",
      prop: "status",
      cellRenderer: scope => {
        return (
          <span>
            <el-switch
              size={scope.props.size === "small" ? "small" : "default"}
              loading={switchLoadMap.value[scope.index]?.loading}
              v-model={scope.row.status}
              active-value={1}
              inactive-value={0}
              active-text="已发布"
              inactive-text="未发布"
              inline-prompt
              onChange={() => onChange(scope as any)}
            />
            <br />
            <el-button
              v-show={scope.row.status === 1}
              type="primary"
              link
              size="small"
              onClick={() => formRL(scope.row)}
            >
              发布列表（最新版本：{scope.row.lastVersion}）
            </el-button>
          </span>
        );
      },
      minWidth: 90
    },
    {
      label: "备注说明",
      prop: "description"
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
    /** 如果是 JSON 类型，需要转换才能正常显示：formatter: ({ jsonType }) => (jsonType ? JSON.stringify(jsonType) : "-")*/
    { type: "selection", fixed: "right", reserveSelection: true },
    {
      label: "操作",
      fixed: "right",
      width: 210,
      slot: "operation"
    }
  ];

  /** 选中的行 */
  const selectedRows: LfFormType.Domain[] = [];

  /**
   * 状态修改
   * @param row 当前行
   */
  function onChange({ row, index }) {
    ElMessageBox.confirm(
      `确认要<strong>${
        row.status === 0 ? "停用" : "启用"
      }</strong><strong style='color:var(--el-color-primary)'>${
        row.name
      }</strong>吗?`,
      "系统提示",
      {
        confirmButtonText: "确定",
        cancelButtonText: "取消",
        type: "warning",
        dangerouslyUseHTMLString: true,
        draggable: true
      }
    )
      .then(async () => {
        switchLoadMap.value[index] = Object.assign(
          {},
          switchLoadMap.value[index],
          {
            loading: true
          }
        );
        await LfFormApi.update({
          id: row.id,
          status: row.status
        });
        switchLoadMap.value[index] = Object.assign(
          {},
          switchLoadMap.value[index],
          {
            loading: false
          }
        );
        message(`已${row.status === 0 ? "停用" : "启用"}${row.name}`, {
          type: "success"
        });
      })
      .catch(() => {
        row.status === 0 ? (row.status = 1) : (row.status = 0);
      });
  }
  /**
   * 删除
   * @param row 当前行
   */
  async function handleDelete(row) {
    message(`您删除了${operateName}名称为${row.name}的这条数据`, {
      type: "success"
    });
    await LfFormApi.remove(row.id);
    onSearch();
  }

  /**批量删除 */
  async function handleDeleteBatch() {
    if (selectedRows.length === 0) {
      message(`请至少勾选一条数据`, { type: "warning" });
      return;
    }
    loading.value = true;
    try {
      const { message: msg } = await LfFormApi.batchRemove(
        selectedRows.map(item => item.id)
      );
      message(msg, { type: "success" });
      selectedRows.length = 0;
      onSearch();
    } catch (error) {
      console.error("error =>", error);
    } finally {
      loading.value = false;
    }
  }
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
  /**
   * 多选
   * @param val 选中的行数据
   */
  function handleSelectionChange(val) {
    selectedRows.length = 0;
    selectedRows.push(...val);
  }
  /** 搜索 */
  async function onSearch() {
    loading.value = true;
    const { data } = await LfFormApi.page(queryForm, {
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

  /**
   * 打开编辑表单
   * @param title 表单标题
   * @param row 编辑的数据
   */
  function openDialog(title = "新增", row?: LfFormType.Domain) {
    addDialog({
      title: `${title}${operateName}`,
      props: {
        isAddForm: title === "新增",
        formInline: {
          /** id */
          id: row?.id,
          /** 名称 */
          name: row?.name,
          /** 备注说明 */
          description: row?.description,
          /** 表单类型，是表单还是单组件（字典项 lf_form_type） */
          type: row?.type,
          /** 表单组件路径 */
          path: row?.path
          /* 如果是 json 类型，你可能需要转换一下 jsonType: row?.jsonType ? JSON.stringify(row?.jsonType) : undefined,
           * 其他类型如果有需要也是如此
           */
        }
      },
      width: "40%",
      draggable: true,
      fullscreen: deviceDetection(),
      fullscreenIcon: true,
      closeOnClickModal: false,
      resetForm: () => editFormRef.value.resetForm(),
      contentRenderer: () =>
        h(editForm, { ref: editFormRef, formInline: null }),
      beforeSure: (done, { options }) => {
        const FormRef = editFormRef.value.getFormRef();
        const curData = options.props as EditFormDTO;
        function chores() {
          message(`您${title}了${operateName}数据`, {
            type: "success"
          });
          done(); // 关闭弹框
          onSearch(); // 刷新表格数据
        }
        FormRef.validate(async valid => {
          if (valid) {
            // 表单规则校验通过
            if (title === "新增") {
              // 实际开发先调用新增接口，再进行下面操作
              await LfFormApi.add(curData.formInline as LfFormType.AddDTO);
              chores();
            } else {
              // 实际开发先调用修改接口，再进行下面操作
              await LfFormApi.update(
                curData.formInline as LfFormType.UpdateDTO
              );
              chores();
            }
          }
        });
      }
    });
  }

  /** 行样式 */
  function rowStyle() {
    return {};
  }

  /**
   * 设置表单
   * @param row 当前行数据
   */
  const formD = (row: LfFormType.Domain) => {
    useMultiTagsStoreHook().handleTags("push", {
      path: `/lf/fd/:source/:id`,
      name: "FlowFormDesignD",
      params: { source: "design", id: row.id },
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
      params: { source: "design", id: row.id }
    });
  };

  const releaseFormRef = ref(null);
  const releaseForm = reactive<LfFormReleaseType.AddDTO>({
    /** 表单 id */
    formId: "",
    /** 发布名称 */
    name: "",
    /** 描述 */
    description: ""
    /** 数据（每个版本数据） */
  });
  /**
   * 发布表单
   * @param dto 发布表单数据
   */
  const formR = (row: LfFormType.Domain) => {
    releaseForm.formId = row.id;
    releaseForm.name =
      row.name + ".release." + dayjs(new Date()).format("YYYYMMDDHHmmss");
    addDialog({
      title: `发布表单：${row.name}`,
      width: "30%",
      draggable: true,
      closeOnClickModal: false,
      fullscreen: deviceDetection(),
      contentRenderer: () => (
        <>
          <ElForm ref={releaseFormRef} model={releaseForm}>
            <ElFormItem
              prop="name"
              rules={[
                {
                  required: true,
                  message: "请输入发布名称",
                  trigger: "blur"
                }
              ]}
            >
              <ElInput
                clearable
                v-model={releaseForm.name}
                placeholder="请输入发布名称"
              />
            </ElFormItem>
            <ElFormItem prop="description">
              <ElInput
                clearable
                type="textarea"
                v-model={releaseForm.description}
                placeholder="请输入发布描述"
              />
            </ElFormItem>
          </ElForm>
        </>
      ),
      beforeSure: done => {
        releaseFormRef.value.validate(valid => {
          if (valid) {
            LfFormApi.publish(releaseForm).then(() => {
              // 表单规则校验通过
              message(`已成功发布 ${releaseForm.name}`, {
                type: "success"
              });
              LfFormApi.update({ id: row.id, status: "1" }).then(() => {
                // 刷新表格数据
                onSearch();
              });
              done(); // 关闭弹框
            });
          }
        });
      }
    });
  };
  /**
   * 流程列表
   * @param row 当前行
   */
  const formRL = (row: LfFormType.Domain) => {
    useMultiTagsStoreHook().handleTags("push", {
      path: `/lf/frl/:id`,
      name: "FlowFormDesignRL",
      params: { id: row.id },
      meta: {
        title: {
          zh: `${row.name} - 表单发布列表`,
          en: `${row.name} - Flow Form Release`
        }
        // 如果使用的是非国际化精简版title可以像下面这么写
        // title: `No.${index} - 详情信息`,
      }
    });
    router.push({ name: "FlowFormDesignRL", params: { id: row.id } });
  };

  /**可选字段导出面板 */
  const FormCreateCreator = defineAsyncComponent(
    () => import("@/views/components/form-create/form-creator/index.vue")
  );
  const FormCreateCreatorRef = ref<InstanceType<
    typeof FormCreateCreator
  > | null>(null);
  /**
   * 动态表单预览
   * @param row 表单
   */
  const formPreview = async (row: LfFormType.Domain) => {
    const { data: lfForm } = await LfFormApi.detail(row.id);
    const { rule, options } = JSON.parse(lfForm.data);
    addDialog({
      title: `${operateName}`,
      props: {
        isAddForm: false,
        rule: JSON.parse(rule),
        options: {
          ...JSON.parse(options),
          ...{ submitBtn: false, resetBtn: false }
        },
        formData: {}
      },
      width: "40%",
      draggable: true,
      fullscreen: deviceDetection(),
      fullscreenIcon: true,
      closeOnClickModal: false,
      resetForm: () => FormCreateCreatorRef.value.resetForm(),
      contentRenderer: () =>
        h(FormCreateCreator, { ref: FormCreateCreatorRef, formData: null }),
      beforeSure: (done, {}) => {
        const ApiRef = FormCreateCreatorRef.value.getApiRef();
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
    openDialog,
    handleDelete,
    handleDeleteBatch,
    handleSizeChange,
    handleCurrentChange,
    handleSelectionChange,
    dictOption,
    formD,
    formPreview,
    formR
  };
}
