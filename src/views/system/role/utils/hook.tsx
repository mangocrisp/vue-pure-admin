import dayjs from "dayjs";
import editForm from "../form.vue";
import { handleTree } from "@/utils/tree";
import { message } from "@/utils/message";
import { ElMessageBox } from "element-plus";
import { usePublicHooks } from "../../hooks";
import { transformI18n } from "@/plugins/i18n";
import { addDialog } from "@/components/ReDialog";
import type { PaginationProps } from "@pureadmin/table";
import { getKeyList, deviceDetection } from "@pureadmin/utils";
import { type Ref, reactive, ref, onMounted, h, toRaw, watch } from "vue";
import SystemRoleApi from "@/api/system/role";
import SystemMenuApi from "@/api/system/menu";
import SystemPermissionApi from "@/api/system/permission";
import {
  generateRoleMenuPermData,
  generateMenuPermData
} from "@/utils/roleMenuPerm";
import SystemRoleMenuApi from "@/api/system/roleMenu";
import SystemRolePermApi from "@/api/system/rolePerm";

export function useRole(treeRef: Ref) {
  /** 查询表单 */
  const form = reactive({
    name: "",
    code: "",
    status: ""
  });
  /** 当前行 */
  const curRow = ref();
  /** 编辑表单 */
  const formRef = ref();
  /** 列表数据 */
  const dataList = ref([]);
  /**  */
  const treeIds = ref([]);
  const treeData = ref([]);
  /** 权限面板 */
  const isShow = ref(false);
  /** 加载中 */
  const loading = ref(true);
  /** 树结构父子联动 */
  const isLinkage = ref(true);
  /** 树结构搜索值 */
  const treeSearchValue = ref();
  const switchLoadMap = ref({});
  /** 树结构是否展开全部 */
  const isExpandAll = ref(false);
  /** 树结构全选 */
  const isSelectAll = ref(false);
  const { switchStyle } = usePublicHooks();
  const treeProps = {
    value: "id",
    label: "title",
    children: "children"
  };
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
      label: "角色id",
      prop: "id"
    },
    {
      label: "角色名称",
      prop: "name"
    },
    {
      label: "角色标识",
      prop: "code"
    },
    {
      label: "状态",
      cellRenderer: scope => (
        <el-switch
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
      ),
      minWidth: 90
    },
    {
      label: "创建时间",
      prop: "createTime",
      minWidth: 160,
      formatter: ({ createTime }) =>
        dayjs(createTime).format("YYYY-MM-DD HH:mm:ss")
    },
    { type: "selection", fixed: "right", reserveSelection: true },
    {
      label: "操作",
      fixed: "right",
      width: 210,
      slot: "operation"
    }
  ];
  // const buttonClass = computed(() => {
  //   return [
  //     "h-[20px]!",
  //     "reset-margin",
  //     "text-gray-500!",
  //     "dark:text-white!",
  //     "dark:hover:text-primary!"
  //   ];
  // });

  /** 选中的行 */
  const selectedRows = reactive<SystemRoleType.Role[]>([]);

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
        await SystemRoleApi.updateStatus(row);
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
    message(`您删除了角色名称为${row.name}的这条数据`, { type: "success" });
    await SystemRoleApi.remove(row.id);
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
      const { message } = await SystemRoleApi.batchRemove(
        selectedRows.map(item => item.id)
      );
      message(message, { type: "success" });
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
    // console.log(`${val} items per page`);
    pagination.pageSize = val;
    onSearch();
  }
  /**
   * 页码修改
   * @param val 当前页码
   */
  function handleCurrentChange(val: number) {
    // console.log(`current page: ${val}`);
    pagination.currentPage = val;
    onSearch();
  }
  /**
   * 多选
   * @param val 选中的行数据
   */
  function handleSelectionChange(val) {
    //console.log("handleSelectionChange", val);
    selectedRows.length = 0;
    selectedRows.push(...val);
  }
  /** 搜索 */
  async function onSearch() {
    loading.value = true;
    // const { data } = await getRoleList(toRaw(form));
    const { data } = await SystemRoleApi.page({
      ...{ pageNum: pagination.currentPage, pageSize: pagination.pageSize },
      ...toRaw(form)
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
  function openDialog(title = "新增", row?: SystemRoleType.Role) {
    addDialog({
      title: `${title}角色`,
      props: {
        formInline: {
          id: row?.id,
          name: row?.name ?? "",
          code: row?.code ?? "",
          sort: row?.sort ?? 0
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
        const curData = options.props as SystemRoleType.RoleEditFormDTO;
        function chores() {
          message(
            `您${title}了角色名称为${curData.formInline.name}的这条数据`,
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
              await SystemRoleApi.add(curData);
              chores();
            } else {
              // 实际开发先调用修改接口，再进行下面操作
              await SystemRoleApi.update(curData);
              chores();
            }
          }
        });
      }
    });
  }

  /** 加载菜单和权限 */
  async function loadMenuPermissions() {
    // const { data } = await getRoleMenu();
    const { data: menuData } = await SystemMenuApi.list({});
    const { data: permData } = await SystemPermissionApi.listWithMenu();
    const menuPermData = generateMenuPermData(menuData, permData);
    treeIds.value = getKeyList(menuPermData, "id");
    treeData.value = handleTree(menuPermData);
  }

  /** 角色菜单权限 */
  async function handleMenu(row?: any) {
    const { id } = row;
    if (id) {
      curRow.value = row;
      isShow.value = true;
      const { data: roleMenuData } = await SystemRoleMenuApi.roleMenuList({
        roleId: id
      });
      const { data: rolePermData } = await SystemRolePermApi.rolePermList({
        roleId: id
      });
      treeRef.value.setCheckedKeys(
        generateRoleMenuPermData(roleMenuData, rolePermData)
      );
    } else {
      curRow.value = null;
      isShow.value = false;
    }
  }

  /** 高亮当前权限选中行 */
  function rowStyle({ row: { id } }) {
    return {
      cursor: "pointer",
      background: id === curRow.value?.id ? "var(--el-fill-color-light)" : ""
    };
  }

  /** 菜单权限-保存 */
  async function handleSave() {
    const { name, id } = curRow.value;
    // 根据用户 id 调用实际项目中菜单权限修改接口
    const checkedNodes = treeRef.value.getCheckedNodes();
    const checkedMenus = checkedNodes
      .filter(item => item.menuType === "M")
      .map(item => {
        return { menuId: item.id, roleId: id, checked: 1 };
      });
    const checkedPerms = checkedNodes
      .filter(item => item.menuType === "P")
      .map(item => {
        return { permissionId: item.id, roleId: id };
      });
    const halfCheckedMenus = treeRef.value.getHalfCheckedNodes().map(item => {
      return { menuId: item.id, roleId: id, checked: 0 };
    });
    await SystemRoleMenuApi.roleMenuBatch(
      checkedMenus.concat(halfCheckedMenus)
    );
    await SystemRolePermApi.rolePermBatch(checkedPerms);
    message(`角色名称为${name}的菜单权限修改成功`, {
      type: "success"
    });
  }

  const onQueryChanged = (query: string) => {
    treeRef.value!.filter(query);
  };

  /**
   * 菜单权限搜索
   * @param query 关键字
   * @param node 节点
   * @returns 结果
   */
  const filterMethod = (query: string, node) =>
    query ? transformI18n(node.title)!.includes(query) : true;

  onMounted(async () => {
    onSearch();
    loadMenuPermissions();
  });

  watch(isExpandAll, val => {
    val
      ? treeRef.value.setExpandedKeys(treeIds.value)
      : treeRef.value.setExpandedKeys([]);
  });

  watch(isSelectAll, val => {
    val
      ? treeRef.value.setCheckedKeys(treeIds.value)
      : treeRef.value.setCheckedKeys([]);
  });

  return {
    form,
    isShow,
    curRow,
    loading,
    columns,
    rowStyle,
    dataList,
    treeData,
    treeProps,
    isLinkage,
    pagination,
    isExpandAll,
    isSelectAll,
    treeSearchValue,
    // buttonClass,
    onSearch,
    resetForm,
    openDialog,
    handleMenu,
    handleSave,
    handleDelete,
    handleDeleteBatch,
    filterMethod,
    transformI18n,
    onQueryChanged,
    // handleDatabase,
    handleSizeChange,
    handleCurrentChange,
    handleSelectionChange
  };
}
