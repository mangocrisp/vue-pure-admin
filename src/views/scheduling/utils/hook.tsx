import dayjs from "dayjs";
import editForm from "../form.vue";
import { message } from "@/utils/message";
import { addDialog } from "@/components/ReDialog";
import type { PaginationProps } from "@pureadmin/table";
import { deviceDetection } from "@pureadmin/utils";
import { reactive, ref, onMounted, h, toRaw } from "vue";
import SchedulingApi from "@/api/scheduling/scheduling";
import type { EditFormDTO } from "./types";
import { ElMessageBox } from "element-plus";

export function useScheduledTask() {
  /**操作名 */
  const operateName = "调度任务示例";
  /** 查询表单 */
  const queryForm = reactive<SchedulingType.QueryDTO>({
    /** 主键 */
    id: undefined,
    /** 任务键 */
    taskKey: undefined,
    /** 任务描述 */
    description: undefined,
    /** 是否自动启动(1 是 0 否) */
    autoStart: undefined
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
      label: "主键",
      prop: "id",
      fixed: "left",
      width: 190
    },
    {
      label: "创建时间",
      prop: "createTime",
      minWidth: 160,
      formatter: ({ createTime }) =>
        createTime ? dayjs(createTime).format("YYYY-MM-DD HH:mm:ss") : "-"
    },
    {
      label: "修改时间",
      prop: "updateTime",
      minWidth: 160,
      formatter: ({ updateTime }) =>
        updateTime ? dayjs(updateTime).format("YYYY-MM-DD HH:mm:ss") : "-"
    },
    {
      label: "是否已删除",
      prop: "isDeleted"
    },
    {
      label: "任务键",
      prop: "taskKey"
    },
    {
      label: "任务描述",
      prop: "description"
    },
    {
      label: "cron 表达式",
      prop: "cron"
    },
    {
      label: "状态",
      prop: "startFlag",
      minWidth: 100,
      cellRenderer: scope => (
        <>
          <el-tag type={scope.row.startFlag === 1 ? "success" : "danger"}>
            {scope.row.startFlag === 1 ? "已启动" : "未启动"}
          </el-tag>
        </>
      )
    },
    {
      label: "是否自动启动",
      cellRenderer: scope => (
        <el-switch
          size={scope.props.size === "small" ? "small" : "default"}
          loading={switchLoadMap.value[scope.index]?.loading}
          v-model={scope.row.autoStart}
          active-value={1}
          inactive-value={0}
          active-text="已启用"
          inactive-text="已停用"
          inline-prompt
          onChange={() => toggleAutoStart(scope as any)}
        />
      ),
      minWidth: 90
    },
    {
      label: "排序",
      prop: "sort"
    },
    /** 如果是 JSON 类型，需要转换才能正常显示：formatter: ({ jsonType }) => (jsonType ? JSON.stringify(jsonType) : "-")*/
    { type: "selection", fixed: "right", reserveSelection: true },
    {
      label: "操作",
      fixed: "right",
      width: 250,
      slot: "operation"
    }
  ];

  /**
   * 状态修改
   * @param row 当前行
   */
  function toggleAutoStart({ row, index }) {
    ElMessageBox.confirm(
      `确认要<strong>${
        row.autoStart === 0 ? "停用" : "启用"
      }</strong><strong style='color:var(--el-color-primary)'>${
        row.taskKey
      }</strong>自动启动任务吗?`,
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
        await SchedulingApi.update({
          id: row.id,
          /** 任务键 */
          taskKey: row.taskKey,
          /** 任务描述 */
          description: row.description,
          /** cron 表达式 */
          cron: row.cron,
          /** 是否自动启动(1 是 0 否) */
          autoStart: row.autoStart,
          /** 排序 */
          sort: row.sort
        });
        switchLoadMap.value[index] = Object.assign(
          {},
          switchLoadMap.value[index],
          {
            loading: false
          }
        );
        message(`已${row.autoStart === 0 ? "停用" : "启用"}${row.taskKey}`, {
          type: "success"
        });
      })
      .catch(() => {
        row.autoStart === 0 ? (row.autoStart = 1) : (row.autoStart = 0);
      });
  }

  /** 选中的行 */
  const selectedRows: SchedulingType.Domain[] = [];

  /**
   * 删除
   * @param row 当前行
   */
  async function handleDelete(row) {
    if (row.startFlag === 1) {
      message(`当前任务正在执行中，请先停止！`, { type: "warning" });
      return;
    }
    message(`您删除了${operateName}名称为${row.taskKey}的这条数据`, {
      type: "success"
    });
    await SchedulingApi.remove(row.id);
    onSearch();
  }

  /**批量删除 */
  async function handleDeleteBatch() {
    if (selectedRows.length === 0) {
      message(`请至少勾选一条数据`, { type: "warning" });
      return;
    }
    if (selectedRows.some(item => item.startFlag === 1)) {
      message(`当前任务正在执行中，请先停止！`, { type: "warning" });
      return;
    }
    loading.value = true;
    try {
      const { message: msg } = await SchedulingApi.batchRemove(
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
    const { data } = await SchedulingApi.taskPage({
      ...toRaw(queryForm),
      ...{ pageSize: pagination.pageSize, pageNum: pagination.currentPage }
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
  function openDialog(title = "新增", row?: SchedulingType.Domain) {
    addDialog({
      title: `${title}${operateName}`,
      props: {
        isAddForm: title === "新增",
        formInline: {
          id: row?.id,
          /** 任务键 */
          taskKey: row?.taskKey,
          /** 任务描述 */
          description: row?.description,
          /** cron 表达式 */
          cron: row?.cron,
          /** 是否自动启动(1 是 0 否) */
          autoStart: row?.autoStart,
          /** 排序 */
          sort: row?.sort,
          /** 任务启动参数 */
          params: row?.params
          /* 如果是 json 类型，你可能需要转换一下 jsonType: row?.jsonType ? JSON.stringify(row?.jsonType) : undefined,
           * 其他类型如果有需要也是如此
           */
        }
      },
      width: "60%",
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
              await SchedulingApi.add(
                curData.formInline as SchedulingType.AddDTO
              );
              chores();
            } else {
              // 实际开发先调用修改接口，再进行下面操作
              await SchedulingApi.update(
                curData.formInline as SchedulingType.UpdateDTO
              );
              chores();
            }
          }
        });
      }
    });
  }

  const start = async (keySet = []) => {
    if (selectedRows.length === 0) {
      if (keySet.length === 0) {
        message(`请至少勾选一条数据`, { type: "warning" });
        return;
      }
    } else {
      if (keySet.length === 0) {
        keySet = selectedRows.map(item => item.taskKey);
      }
    }
    loading.value = true;
    try {
      const { message: msg } = await SchedulingApi.start(keySet);
      message(msg, { type: "success" });
      selectedRows.length = 0;
      onSearch();
    } catch (error) {
      console.error("error =>", error);
    } finally {
      loading.value = false;
    }
  };

  const stop = async (keySet = []) => {
    if (selectedRows.length === 0) {
      if (keySet.length === 0) {
        message(`请至少勾选一条数据`, { type: "warning" });
        return;
      }
    } else {
      if (keySet.length === 0) {
        keySet = selectedRows.map(item => item.taskKey);
      }
    }
    loading.value = true;
    try {
      const { message: msg } = await SchedulingApi.stop(keySet);
      message(msg, { type: "success" });
      selectedRows.length = 0;
      onSearch();
    } catch (error) {
      console.error("error =>", error);
    } finally {
      loading.value = false;
    }
  };

  const restart = async (keySet = []) => {
    if (selectedRows.length === 0) {
      if (keySet.length === 0) {
        message(`请至少勾选一条数据`, { type: "warning" });
        return;
      }
    } else {
      if (keySet.length === 0) {
        keySet = selectedRows.map(item => item.taskKey);
      }
    }
    loading.value = true;
    try {
      const { message: msg } = await SchedulingApi.restart(keySet);
      message(msg, { type: "success" });
      selectedRows.length = 0;
      onSearch();
    } catch (error) {
      console.error("error =>", error);
    } finally {
      loading.value = false;
    }
  };

  const tryOnce = async (row: SchedulingType.Domain) => {
    try {
      const { message: msg } = await SchedulingApi.tryOnce(
        row.taskKey,
        row.params
      );
      message(msg, { type: "success" });
      selectedRows.length = 0;
      onSearch();
    } catch (error) {
      console.error("error =>", error);
    } finally {
      loading.value = false;
    }
  };

  /** 行样式 */
  function rowStyle() {
    return {};
  }

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
    start,
    stop,
    tryOnce,
    restart
  };
}
