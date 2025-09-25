import { reactive, ref, onMounted, toRaw } from "vue";
import type { PaginationProps } from "@pureadmin/table";
import { addDialog } from "@/components/ReDialog";
import { KeyName } from "./types";
import SchedulingApi from "@/api/scheduling/scheduling";

export function useRole() {
  const form = reactive<SchedulingType.LogQueryDTO>({
    /*任务键 */
    taskKey: undefined
  });
  const dataList = ref([]);
  const loading = ref(true);
  const pagination = reactive<PaginationProps>({
    total: 0,
    pageSize: 10,
    currentPage: 1,
    background: true
  });
  const columns: TableColumnList = [
    {
      label: "id",
      prop: "id",
      minWidth: 60
    },
    {
      label: "任务键",
      prop: "taskKey",
      minWidth: 100
    },
    {
      label: "任务描述",
      prop: "description",
      minWidth: 100
    },
    {
      label: "状态",
      prop: "status",
      minWidth: 100,
      cellRenderer: scope => (
        <>
          <el-tag type={scope.row.status === 1 ? "success" : "danger"}>
            {scope.row.status === 1 ? "成功" : "失败"}
          </el-tag>
        </>
      )
    },
    {
      label: "任务开始执行时间",
      prop: "startTime",
      minWidth: 100
    },
    {
      label: "任务结束执行时间",
      prop: "stopTime",
      minWidth: 100
    },
    {
      label: "操作",
      fixed: "right",
      slot: "operation"
    }
  ];

  function handleSizeChange(val: number) {
    pagination.pageSize = val;
    onSearch();
  }

  function handleCurrentChange(val: number) {
    pagination.currentPage = val;
    onSearch();
  }

  function handleSelectionChange(val) {
    console.log("handleSelectionChange", val);
  }

  async function onSearch() {
    loading.value = true;
    const { data } = await SchedulingApi.logPage({
      ...toRaw(form),
      ...{ pageSize: pagination.pageSize, pageNum: pagination.currentPage }
    });
    dataList.value = data.records;
    pagination.total = data.total;

    setTimeout(() => {
      loading.value = false;
    }, 500);
  }

  const resetForm = formEl => {
    if (!formEl) return;
    formEl.resetFields();
    pagination.currentPage = 1;
    onSearch();
  };

  const showDetail = (row: SchedulingType.Log) => {
    const entries = Object.entries(KeyName);
    addDialog({
      title: "任务调度日志详情",
      width: "70vw",
      contentRenderer: () => (
        <el-descriptions border column={2} size="small">
          {entries.map(([key, value]) => (
            <el-descriptions-item key={key} label={value}>
              <p style="max-width: 300px">{formatDate(row, key)}</p>
            </el-descriptions-item>
          ))}
        </el-descriptions>
      )
    });
  };

  const formatDate = (row: SchedulingType.Log, key) => {
    const value = row[key];
    if (key === "status") {
      return (
        <el-tag type={value === 1 ? "success" : "danger"}>
          {value === 1 ? "成功" : "失败"}
        </el-tag>
      );
    }
    return <span>{value}</span>;
  };

  onMounted(() => {
    onSearch();
  });

  return {
    form,
    loading,
    columns,
    dataList,
    pagination,
    onSearch,
    resetForm,
    handleSizeChange,
    handleCurrentChange,
    handleSelectionChange,
    showDetail
  };
}
