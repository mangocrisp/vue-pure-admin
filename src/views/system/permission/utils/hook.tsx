import dayjs from "dayjs";
import editForm from "../form.vue";
import { message } from "@/utils/message";
import { transformI18n } from "@/plugins/i18n";
import { addDialog } from "@/components/ReDialog";
import type { PaginationProps } from "@pureadmin/table";
import { cloneDeep, deviceDetection, handleTree } from "@pureadmin/utils";
import { reactive, ref, onMounted, h, toRaw } from "vue";
import SystemPermissionApi from "@/api/system/permission";
import SystemMenuApi from "@/api/system/menu";

export function usePermission() {
  /** 查询表单 */
  const form = reactive({
    name: ""
  });
  /** 当前行 */
  const curRow = ref();
  /** 编辑表单 */
  const formRef = ref();
  /** 列表数据 */
  const dataList = ref([]);
  /** 加载中 */
  const loading = ref(true);
  /** 分页 */
  const pagination = reactive<PaginationProps>({
    total: 0,
    pageSize: 10,
    currentPage: 1,
    background: true
  });
  // 纯菜单树，不包含权限
  const menuList = ref([]);
  /** 列名 */
  const columns: TableColumnList = [
    {
      label: "权限名称",
      prop: "name"
    },
    {
      label: "接口权限",
      prop: "urlPerm"
    },
    {
      label: "按钮权限",
      prop: "btnPerm"
    },
    {
      label: "所属菜单",
      prop: "menuName"
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
  const selectedRows: SystemPermissionType.Permission[] = [];

  /**
   * 删除
   * @param row 当前行
   */
  async function handleDelete(row) {
    message(`您删除了权限名称为${row.name}的这条数据`, { type: "success" });
    await SystemPermissionApi.remove(row.id);
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
      const { message: msg } = await SystemPermissionApi.batchRemove(
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
    const { data } = await SystemPermissionApi.page({
      ...{ pageNum: pagination.currentPage, pageSize: pagination.pageSize },
      ...toRaw(form)
    });
    dataList.value = data.records;
    pagination.total = data.total;

    setTimeout(() => {
      loading.value = false;
    }, 500);
  }
  async function loadMenuList() {
    const { data: menuData } = await SystemMenuApi.list({ name: form.name });
    menuList.value = handleTree(menuData.filter(item => item.parentId)); // 处理成树结构
  }
  /** 重置搜索条件表单 */
  const resetForm = formEl => {
    if (!formEl) return;
    formEl.resetFields();
    onSearch();
  };

  function formatHigherMenuOptions(treeList) {
    if (!treeList || !treeList.length) return;
    const newTreeList = [];
    for (let i = 0; i < treeList.length; i++) {
      if (treeList[i].name) {
        treeList[i].name = transformI18n(treeList[i].name);
      }
      treeList[i].title = treeList[i].name;
      formatHigherMenuOptions(treeList[i].children);
      newTreeList.push(treeList[i]);
    }
    return newTreeList;
  }

  /**
   * 打开编辑表单
   * @param title 表单标题
   * @param row 编辑的数据
   */
  function openDialog(title = "新增", row?: SystemPermissionType.Permission) {
    addDialog({
      title: `${title}权限`,
      props: {
        formInline: {
          higherMenuOptions: formatHigherMenuOptions(cloneDeep(menuList.value)),
          id: row?.id,
          name: row?.name,
          menuId: row?.menuId,
          urlPerm: row?.urlPerm,
          btnPerm: row?.btnPerm
        }
      },
      width: "40%",
      draggable: true,
      fullscreen: deviceDetection(),
      fullscreenIcon: true,
      closeOnClickModal: false,
      contentRenderer: () => h(editForm, { ref: formRef, formInline: null }),
      beforeSure: (done, { options }) => {
        const FormRef = formRef.value.getRef();
        const curData =
          options.props as SystemPermissionType.PermissionEditFormDTO;
        function chores() {
          message(
            `您${title}了权限名称为${curData.formInline.name}的这条数据`,
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
              await SystemPermissionApi.add(curData.formInline);
              chores();
            } else {
              // 实际开发先调用修改接口，再进行下面操作
              await SystemPermissionApi.update(curData.formInline);
              chores();
            }
          }
        });
      }
    });
  }

  /** 高亮当前权限选中行 */
  function rowStyle({ row: { id } }) {
    return {
      cursor: "pointer",
      background: id === curRow.value?.id ? "var(--el-fill-color-light)" : ""
    };
  }

  onMounted(async () => {
    onSearch();
    loadMenuList();
  });

  return {
    form,
    curRow,
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
    // handleDatabase,
    handleSizeChange,
    handleCurrentChange,
    handleSelectionChange
  };
}
