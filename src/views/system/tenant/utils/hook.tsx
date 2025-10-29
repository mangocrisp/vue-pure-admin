import editForm from "../form.vue";
import { message } from "@/utils/message";
import { transformI18n } from "@/plugins/i18n";
import { addDialog } from "@/components/ReDialog";
import type { PaginationProps } from "@pureadmin/table";
import { deviceDetection } from "@pureadmin/utils";
import { reactive, ref, onMounted, h, toRaw } from "vue";
import type { EditFormDTO } from "./types";
import { ElMessageBox } from "element-plus";
import { useRenderIcon } from "@/components/ReIcon/src/hooks";
import { usePublicHooks } from "../../hooks";
import SystemTenantApi from "@/api/system/tenant";
import router from "@/router";
import { hasAuth } from "@/router/utils";

export function usePermission() {
  /** 查询表单 */
  const form = reactive<SystemTenantType.QueryDTO>({
    /** 租户 id */
    tenantId: undefined,
    /** 租户管理员 */
    tenantManager: undefined,
    /** 租户名 */
    tenantName: undefined,
    /** 状态 */
    status: undefined
  });
  /** 当前行 */
  const curRow = ref();
  /** 编辑表单 */
  const formRef = ref();
  /** 列表数据 */
  const dataList = ref([]);
  /** 加载中 */
  const loading = ref(true);
  /**状态开关 */
  const switchLoadMap = ref({});
  const { switchStyle } = usePublicHooks();
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
      label: "租户ID",
      prop: "tenantId",
      align: "left",
      cellRenderer: ({ row }) => (
        <>
          <span class="inline-block mr-1">
            {h(useRenderIcon(row.icon), {
              style: { paddingTop: "1px" }
            })}
          </span>
          <span>{transformI18n(row.tenantId)}</span>
        </>
      )
    },
    {
      label: "租户名",
      prop: "tenantName"
    },
    {
      label: "租户管理员",
      prop: "tenantManager"
    },
    {
      label: "状态",
      prop: "status",
      minWidth: 90,
      cellRenderer: scope => (
        <el-switch
          disabled={!hasAuth(["system:tenant:edit"])}
          size={scope.props.size === "small" ? "small" : "default"}
          loading={switchLoadMap.value[scope.index]?.loading}
          v-model={scope.row.status}
          active-value={1}
          inactive-value={0}
          active-text="已启用"
          inactive-text="已停用"
          inline-prompt
          style={switchStyle.value}
          onChange={() => onChange(scope as any)}
        />
      )
    },
    {
      label: "备注",
      prop: "remark"
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
  const selectedRows: SystemTenantType.Domain[] = [];

  function onChange({ row, index }) {
    ElMessageBox.confirm(
      `确认要<strong>${
        row.status === 0 ? "停用" : "启用"
      }</strong><strong style='color:var(--el-color-primary)'>${
        row.username
      }</strong>用户吗?`,
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
        await SystemTenantApi.update({
          id: row.id,
          status: row.status,
          tenantName: row.tenantName,
          tenantManager: row.tenantManager
        });
        switchLoadMap.value[index] = Object.assign(
          {},
          switchLoadMap.value[index],
          {
            loading: false
          }
        );
        message("已成功修改用户状态", {
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
    message(`您删除了租户名称为${row.name}的这条数据`, { type: "success" });
    await SystemTenantApi.remove(row.id);
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
      const { message: msg } = await SystemTenantApi.batchRemove(
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
  /**
   * 选择租户
   * @param tenant 租户信息
   */
  function handleChooseTenant(tenant: SystemTenantType.Domain) {
    SystemTenantApi.changeCurrent(tenant.tenantId).then(async () => {
      await router.push({ path: "/" });
      location.reload();
    });
  }
  /** 搜索 */
  async function onSearch() {
    loading.value = true;
    const { data } = await SystemTenantApi.page(toRaw(form), {
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
  function openDialog(title = "新增", row?: SystemTenantType.Domain) {
    addDialog({
      title: `${title}租户`,
      props: {
        isAddForm: title === "新增",
        formInline: {
          id: row?.id,
          /** 图标 */
          icon: row?.icon,
          /** 租户 id */
          tenantId: row?.tenantId,
          /** 租户管理员 */
          tenantManager: row?.tenantManager,
          /** 租户名 */
          tenantName: row?.tenantName,
          /** 备注 */
          remark: row?.remark
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
            `您${title}了租户名称为${curData.formInline.tenantId}的这条数据`,
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
              // 实际开发先调用新增接口，再进行下面操作
              await SystemTenantApi.add(
                curData.formInline as SystemTenantType.AddDTO
              );
              chores();
            } else {
              // 实际开发先调用修改接口，再进行下面操作
              await SystemTenantApi.update(
                curData.formInline as SystemTenantType.UpdateDTO
              );
              chores();
            }
          }
        });
      }
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
    handleChooseTenant
  };
}
