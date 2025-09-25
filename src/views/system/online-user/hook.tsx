import { message } from "@/utils/message";
import { reactive, ref, onMounted, toRaw } from "vue";
import type { PaginationProps } from "@pureadmin/table";
import SystemUserApi from "@/api/system/user";

export function useRole() {
  const form = reactive({
    username: ""
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
      label: "序号",
      prop: "id",
      minWidth: 60
    },
    {
      label: "jti",
      prop: "jti",
      minWidth: 150
    },
    {
      label: "用户名",
      prop: "userName",
      minWidth: 100
    },
    {
      label: "登录 IP",
      prop: "ip",
      minWidth: 140
    },
    // {
    //   label: "登录地点",
    //   prop: "address",
    //   minWidth: 140
    // },
    // {
    //   label: "操作系统",
    //   prop: "system",
    //   minWidth: 100
    // },
    // {
    //   label: "浏览器类型",
    //   prop: "browser",
    //   minWidth: 100
    // },
    {
      label: "登录时间",
      prop: "loginTime",
      minWidth: 180
    },
    {
      label: "超时时间",
      prop: "expTime",
      minWidth: 180
    },
    {
      label: "鉴权方式",
      prop: "authMethod",
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

  function handleOffline(row) {
    SystemUserApi.forceBatch([row.jti]).then(() => {
      message(`${row.userName}已被强制下线`, { type: "success" });
      onSearch();
    });
  }

  async function onSearch() {
    loading.value = true;
    const { data } = await SystemUserApi.online({
      ...toRaw(form),
      ...{ pageSize: pagination.pageSize, pageNum: pagination.currentPage }
    });
    dataList.value = data.records;
    pagination.total = data.total;
    pagination.pageSize = data.size;
    pagination.currentPage = data.current;

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
    handleOffline,
    handleSizeChange,
    handleCurrentChange,
    handleSelectionChange
  };
}
