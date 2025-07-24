import dayjs from "dayjs";
import editForm from "../form.vue";
import { message } from "@/utils/message";
import { transformI18n } from "@/plugins/i18n";
import { addDialog } from "@/components/ReDialog";
import type { PaginationProps } from "@pureadmin/table";
import { deviceDetection } from "@pureadmin/utils";
import { Md5 } from "ts-md5";
import { reactive, ref, onMounted, h, toRaw } from "vue";
import type { EditFormDTO } from "./types";
import SystemClientApi from "@/api/system/client";
import { ElMessageBox } from "element-plus";
import { Uuid } from "ts-uuid";

export function usePermission() {
  /** 查询表单 */
  const form = reactive<SystemClientType.QueryDTO>({
    clientId: "",
    clientName: ""
  });
  /** 当前行 */
  const curRow = ref();
  /** 编辑表单 */
  const formRef = ref();
  /** 列表数据 */
  const dataList = ref([]);
  /** 加载中 */
  const loading = ref(true);
  /**重置密钥后弹窗显示重置后的密码，方便复制 */
  const resetPasswordDialogConfig = reactive({
    resetPasswordDialogVisible: false,
    resetPasswordValue: "",
    title: ""
  });
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
      label: "客户端ID",
      prop: "clientId"
    },
    {
      label: "客户端名",
      prop: "clientName"
    },
    {
      label: "认证令牌时效(秒)",
      prop: "accessTokenValidity"
    },
    {
      label: "刷新令牌时效(秒)",
      prop: "refreshTokenValidity"
    },
    {
      label: "授权方式",
      prop: "authorizedGrantTypes"
    },
    {
      label: "域",
      prop: "scope"
    },
    {
      label: "认证回调地址",
      prop: "webServerRedirectUri"
    },
    {
      label: "是否自动授权",
      prop: "autoApprove"
    },
    {
      label: "创建时间",
      prop: "createTime",
      minWidth: 160,
      formatter: ({ createTime }) =>
        createTime ? dayjs(createTime).format("YYYY-MM-DD HH:mm:ss") : "-"
    },
    {
      label: "最后更新时间",
      prop: "updateTime",
      minWidth: 160,
      formatter: ({ updateTime }) =>
        updateTime ? dayjs(updateTime).format("YYYY-MM-DD HH:mm:ss") : "-"
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
  const selectedRows: SystemClientType.Domain[] = [];

  /**
   * 删除
   * @param row 当前行
   */
  async function handleDelete(row) {
    message(`您删除了客户端名称为${row.name}的这条数据`, { type: "success" });
    await SystemClientApi.remove(row.id);
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
      const { message: msg } = await SystemClientApi.batchRemove(
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
    const { data } = await SystemClientApi.page(toRaw(form), {
      pageNum: pagination.currentPage,
      pageSize: pagination.pageSize
    });
    dataList.value = data.records;
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
  function openDialog(title = "新增", row?: SystemClientType.Domain) {
    addDialog({
      title: `${title}客户端`,
      props: {
        isAddForm: title === "新增",
        formInline: {
          id: row?.id,
          /** 客户端id */
          clientId: row?.clientId,
          /** 域 */
          scope: row?.scope ?? "all",
          /** 授权方式 */
          authorizedGrantTypes: row?.authorizedGrantTypes,
          /** 认证回调地址 */
          webServerRedirectUri: row?.webServerRedirectUri,
          /** token 超时秒 */
          accessTokenValidity: row?.accessTokenValidity ?? 3600,
          /** refresh token 超时秒 */
          refreshTokenValidity: row?.refreshTokenValidity ?? 604800,
          /** 是否自动授权 */
          autoApprove: row?.autoApprove ?? "true",
          /** 客户端名称 */
          clientName: row?.clientName
        }
      },
      width: "50%",
      draggable: true,
      fullscreen: deviceDetection(),
      fullscreenIcon: true,
      closeOnClickModal: false,
      contentRenderer: () => h(editForm, { ref: formRef, formInline: null }),
      resetForm: () => formRef.value.resetForm(),
      beforeSure: (done, { options }) => {
        const FormRef = formRef.value.getFormRef();
        const curData = options.props as EditFormDTO;
        function chores() {
          message(
            `您${title}了客户端名称为${curData.formInline.clientName}的这条数据`,
            {
              type: "success"
            }
          );
          done(); // 关闭弹框
          onSearch(); // 刷新表格数据
        }
        FormRef.validate(async valid => {
          if (valid) {
            // console.log("curData", curData);
            // 表单规则校验通过
            if (title === "新增") {
              const password = Md5.hashStr(Uuid.create().toString());
              // 实际开发先调用新增接口，再进行下面操作
              await SystemClientApi.add({
                ...(curData.formInline as SystemClientType.AddDTO),
                ...{ clientSecret: password }
              });
              chores();
              resetPasswordDialogConfig.resetPasswordDialogVisible = true;
              resetPasswordDialogConfig.resetPasswordValue = password;
              resetPasswordDialogConfig.title = `${curData.formInline.clientName} 客户端的密钥(请妥善保存，请勿外泄)`;
            } else {
              // 实际开发先调用修改接口，再进行下面操作
              await SystemClientApi.update(
                curData.formInline as SystemClientType.UpdateDTO
              );
              chores();
            }
          }
        });
      }
    });
  }

  function handleReset(row: SystemClientType.Domain) {
    // 重置用户密码这种只能是用户自己去改密码，重置密码应该只能重置为一个系统默认的密码。
    ElMessageBox.confirm(
      `确认要<strong>重置</strong><strong style='color:var(--el-color-primary)'>${
        row.clientName
      }</strong>客户端的密钥吗?`,
      "系统提示",
      {
        confirmButtonText: "确定",
        cancelButtonText: "取消",
        type: "warning",
        dangerouslyUseHTMLString: true,
        draggable: true
      }
    ).then(async () => {
      const password = Md5.hashStr(Uuid.create().toString());
      await SystemClientApi.updatePart({
        id: row.id,
        clientSecret: password
      });
      resetPasswordDialogConfig.resetPasswordDialogVisible = true;
      resetPasswordDialogConfig.resetPasswordValue = password;
      resetPasswordDialogConfig.title = `已成功重置 ${row.clientName} 客户端的密钥(请妥善保存，请勿外泄)`;
      onSearch(); // 刷新表格数据
    });
  }

  /** 高亮当前选中行 */
  function rowStyle({ row: { id } }) {
    return {
      cursor: "pointer",
      background: id === curRow.value?.id ? "var(--el-fill-color-light)" : ""
    };
  }

  onMounted(async () => {
    onSearch();
  });

  return {
    form,
    loading,
    columns,
    rowStyle,
    dataList,
    pagination,
    onSearch,
    resetForm,
    openDialog,
    handleDelete,
    handleDeleteBatch,
    transformI18n,
    handleSizeChange,
    handleCurrentChange,
    handleSelectionChange,
    handleReset,
    resetPasswordDialogConfig
  };
}
