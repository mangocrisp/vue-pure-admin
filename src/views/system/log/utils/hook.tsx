import { reactive, ref, onMounted, toRaw } from "vue";
import type { PaginationProps } from "@pureadmin/table";
import ApiLogApi from "@/api/system/apiLog";
import { addDialog } from "@/components/ReDialog";
import { KeyName } from "./types";

export function useRole() {
  const form = reactive<ApiLogType.QueryDTO>({
    /*模块标题 */
    title: undefined,
    /*操作人员 */
    username: undefined,
    /*客户端类型 */
    client: undefined,
    /*模块 */
    module: undefined,
    /*主机地址 */
    ip: undefined,
    /*业务类型 */
    type: undefined,
    /*请求方式 */
    method: undefined,
    /*请求URL */
    url: undefined,
    /*状态码 */
    code: undefined,
    /*租户 id 区分不同租户的日志 */
    tenantId: undefined,
    /*租户 id 开始时间 */
    startTime: undefined,
    /*结束时间 */
    endTime: undefined
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
      label: "业务类型",
      prop: "type",
      minWidth: 100
    },
    {
      label: "模块",
      prop: "module",
      minWidth: 100
    },
    {
      label: "接口标题",
      prop: "title",
      minWidth: 100
    },
    {
      label: "接口描述",
      prop: "description",
      minWidth: 200
    },
    {
      label: "请求方法",
      prop: "method",
      minWidth: 100
    },
    {
      label: "请求地址",
      prop: "url",
      minWidth: 200
    },
    {
      label: "状态码",
      prop: "code",
      minWidth: 100,
      cellRenderer: scope => (
        <>
          <el-tag type={scope.row.code === "SUCCESS" ? "success" : "danger"}>
            {scope.row.code}
          </el-tag>
        </>
      )
    },
    {
      label: "操作人员",
      prop: "username",
      minWidth: 100
    },
    {
      label: "客户端",
      prop: "client",
      minWidth: 140
    },
    {
      label: "ip 地址",
      prop: "ip",
      minWidth: 140
    },
    {
      label: "操作时间",
      prop: "createTime",
      minWidth: 180
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
    const { data } = await ApiLogApi.page({
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

  const showDetail = (row: ApiLogType.Domain) => {
    const entries = Object.entries(KeyName);
    addDialog({
      title: "接口日志详情",
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

  const formatDate = (row: ApiLogType.Domain, key) => {
    const value = row[key];
    if (key === "code") {
      return (
        <el-tag type={value === "SUCCESS" ? "success" : "danger"}>
          {value}
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
