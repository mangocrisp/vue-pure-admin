import dayjs from "dayjs";
import editForm from "../form.vue";
import { message } from "@/utils/message";
import { addDialog } from "@/components/ReDialog";
import type { PaginationProps } from "@pureadmin/table";
import { deviceDetection, downloadByData } from "@pureadmin/utils";
import { reactive, ref, onMounted, h, defineAsyncComponent } from "vue";
import VueTemplateApi from "@/api/system/vueTemplate";
import type { EditFormDTO } from "./types";
import { useToggle } from "@/hooks/web/useToggle";
import type { AnyObject } from "@/hooks";

export function useVueTemplate() {
  /**操作名 */
  const operateName = "前端模板示例";
  /** 查询表单 */
  const queryForm = reactive<VueTemplateType.QueryDTO>({
    string: undefined,
    date: undefined,
    date_ge: undefined,
    date_le: undefined,
    boolType: undefined
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
  /** 列名 */
  const columns: TableColumnList = [
    {
      label: "主键",
      prop: "id",
      fixed: "left"
    },
    {
      label: "字符串类型",
      prop: "string"
    },
    {
      label: "整数类型",
      prop: "numberInt"
    },
    {
      label: "长整数类型",
      prop: "numberLong"
    },
    {
      label: "日期类型",
      prop: "date",
      minWidth: 160,
      formatter: ({ date }) => (date ? dayjs(date).format("YYYY-MM-DD") : "-")
    },
    {
      label: "日期时间类型",
      prop: "dateTime",
      minWidth: 160,
      formatter: ({ dateTime }) =>
        dateTime ? dayjs(dateTime).format("YYYY-MM-DD HH:mm:ss") : "-"
    },
    {
      label: "字节类型",
      prop: "numberByte"
    },
    {
      label: "布尔类型",
      prop: "boolType"
    },
    {
      label: "长文本类型",
      prop: "textType"
    },
    {
      label: "JSON 类型",
      prop: "jsonType",
      formatter: ({ jsonType }) => (jsonType ? JSON.stringify(jsonType) : "-")
    },
    {
      label: "单精度浮点类型",
      prop: "floatType"
    },
    {
      label: "双精度浮点类型",
      prop: "doubleType"
    },
    { type: "selection", fixed: "right", reserveSelection: true },
    {
      label: "操作",
      fixed: "right",
      width: 210,
      slot: "operation"
    }
  ];

  /** 选中的行 */
  const selectedRows: VueTemplateType.Domain[] = [];

  /**
   * 删除
   * @param row 当前行
   */
  async function handleDelete(row) {
    message(`您删除了${operateName}名称为${row.name}的这条数据`, {
      type: "success"
    });
    await VueTemplateApi.remove(row.id);
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
      const { message: msg } = await VueTemplateApi.batchRemove(
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
    const { data } = await VueTemplateApi.page(
      {
        vueTemplateQueryDTO: queryForm
      },
      { pageNum: pagination.currentPage, pageSize: pagination.pageSize }
    );
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
  function openDialog(title = "新增", row?: VueTemplateType.Domain) {
    addDialog({
      title: `${title}${operateName}`,
      props: {
        isAddForm: title === "新增",
        formInline: {
          /** 主键 */
          id: row?.id,
          /** 字符串类型 */
          string: row?.string,
          /** 整数类型 */
          numberInt: row?.numberInt,
          /** 长整数类型 */
          numberLong: row?.numberLong,
          /** 日期类型 */
          date: row?.date,
          /** 日期时间类型 */
          dateTime: row?.dateTime,
          /** 字节类型 */
          numberByte: row?.numberByte,
          /** 布尔类型 */
          boolType: row?.boolType,
          /** 长文本类型 */
          textType: row?.textType,
          /** JSON 类型 */
          jsonType: row?.jsonType ? JSON.stringify(row?.jsonType) : null,
          /** 单精度浮点类型 */
          floatType: row?.floatType,
          /** 双精度浮点类型 */
          doubleType: row?.doubleType
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
              await VueTemplateApi.add(
                curData.formInline as VueTemplateType.AddDTO
              );
              chores();
            } else {
              // 实际开发先调用修改接口，再进行下面操作
              await VueTemplateApi.update(
                curData.formInline as VueTemplateType.UpdateDTO
              );
              chores();
            }
          }
        });
      }
    });
  }

  /**excel 模板 */
  function excelTemplate() {
    VueTemplateApi.getImportExcelTemplate().then(res => {
      const xlsx = "application/vnd.ms-excel";
      const blob = new Blob([res], { type: xlsx });
      downloadByData(blob, `${operateName}导入模板.xlsx`);
    });
  }

  /**
   * 导入数据
   * @param file 文件
   */
  const beforeUpload = async file => {
    if (file.status == "success") {
      if (!file.name.includes(".xls")) {
        message("文件格式错误，请上传xlsx类型,如：xlsx，xls后缀的文件。", {
          type: "error"
        });
        return;
      }
      const formData = new FormData();
      formData.append("file", file.raw);
      await VueTemplateApi.importExcel(formData).then(res => {
        if (res.code === "200") {
          message("导入成功", { type: "success" });
          onSearch(); // 刷新表格数据
        }
      });
    }
  };

  /** 行样式 */
  function rowStyle() {
    return {};
  }

  //------------- 可选字段导出 start ---------------

  /**可选字段导出面板 */
  const SelectionExport = defineAsyncComponent(
    () => import("@/views/components/selectionExport.vue")
  );

  /**可选字段导出面板 Ref */
  const SelectionExportRef = ref<InstanceType<typeof SelectionExport> | null>();

  /**弹窗显示显示状态 */
  const [visibleExportExcelField, exportExcelField] = useToggle(false);

  /**打开导出面板 */
  const showSelectionExport = async () => {
    if (SelectionExportRef.value?.getSelectionFields().length === 0) {
      const { data } = await VueTemplateApi.getExportSelectedField({});
      SelectionExportRef.value?.init(data);
    }
    exportExcelField(true);
  };

  /**默认需要导出的字段 */
  const defaultExportFieldKeys = [];

  /**
   * 提交导出
   * @param exportForm 导出的数据
   */
  const confirmExportExcel = exportForm => {
    exportExcel(exportForm);
    SelectionExportRef.value?.pass();
  };

  /**导出查询条件 */
  const exportExcelQueryParams = ref<VueTemplateType.QueryBody>({
    vueTemplateQueryDTO: {
      idSelection: []
    }
  });

  /**
   * 导出 Excel
   * @param exportForm 需要导出的数据
   */
  const exportExcel = (exportForm: AnyObject) => {
    console.log(exportForm.exportTemplateField);
    if (
      !exportForm.exportTemplateField ||
      exportForm.exportTemplateField.length === 0
    ) {
      message("请至少勾选一个字段导出!", { type: "warning" });
      return;
    }
    const params = {
      fileName: exportForm.fileName || "数据同步数据导出表",
      mergeSameStartRow: 3,
      exportTemplateField: exportForm.exportTemplateField,
      params: exportExcelQueryParams.value,
      sqlPageParams: {
        pageNum: 1,
        pageSize: exportForm.maxSize,
        pageOrder: "id asc,updateTime desc"
      }
    };
    if (Reflect.ownKeys(queryForm).length > 0) {
      params.params.vueTemplateQueryDTO = { ...queryForm };
    }
    if (selectedRows.length > 0) {
      params.params.vueTemplateQueryDTO = {};
      params.params.vueTemplateQueryDTO.idSelection = selectedRows.map(
        row => row.id
      );
      params.sqlPageParams.pageSize = selectedRows.length;
    }
    VueTemplateApi.exportExcelSelectedField(params).then(res => {
      const xlsx = "application/vnd.ms-excel";
      const blob = new Blob([res], { type: xlsx });
      downloadByData(
        blob,
        `${exportForm?.fileName || operateName + "数据导出表"}.xlsx`
      );
    });
  };

  //------------- 可选字段导出 end ---------------

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
    excelTemplate,
    beforeUpload,
    handleDelete,
    handleDeleteBatch,
    handleSizeChange,
    handleCurrentChange,
    handleSelectionChange,
    SelectionExport,
    SelectionExportRef,
    visibleExportExcelField,
    defaultExportFieldKeys,
    confirmExportExcel,
    showSelectionExport
  };
}
