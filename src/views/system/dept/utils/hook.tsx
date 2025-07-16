import dayjs from "dayjs";
import editForm from "../form.vue";
import { message } from "@/utils/message";
import { addDialog } from "@/components/ReDialog";
import { reactive, ref, onMounted, h, nextTick } from "vue";
import { deviceDetection } from "@pureadmin/utils";
import SystemDeptApi from "@/api/system/dept";
import type { TreeNode } from "element-plus";

export function useDept() {
  const form = reactive({
    name: undefined,
    code: undefined
  });

  const formRef = ref();
  const tableRef = ref();
  const dataList = ref<SystemDeptType.Dept[]>([]);
  const loading = ref(false);

  const columns: TableColumnList = [
    {
      label: "部门名称",
      prop: "name",
      minWidth: 200,
      align: "left"
    },
    {
      label: "部门id",
      prop: "id",
      minWidth: 70,
      hide: true
    },
    {
      label: "部门编码",
      prop: "code",
      minWidth: 100
    },
    {
      label: "部门全称",
      prop: "fullName",
      width: 180,
      align: "left"
    },
    {
      label: "全称",
      prop: "fullName",
      minWidth: 70
    },
    {
      label: "创建时间",
      minWidth: 200,
      prop: "createTime",
      formatter: ({ createTime }) =>
        dayjs(createTime).format("YYYY-MM-DD HH:mm:ss")
    },
    {
      label: "备注",
      prop: "remark",
      minWidth: 320
    },
    {
      label: "排序",
      prop: "sort",
      minWidth: 320
    },
    {
      label: "操作",
      fixed: "right",
      width: 210,
      slot: "operation"
    }
  ];

  function handleSelectionChange(val) {
    console.log("handleSelectionChange", val);
  }

  function resetForm(formEl) {
    if (!formEl) return;
    formEl.resetFields();
    onSearch();
  }

  /**
   * 加载部门列表
   * @param paramsSearch 是否是按查询参数搜索
   * @param pid 父级 id
   * @returns 部门列表
   */
  async function loadDeptList(
    paramsSearch = false,
    pid = "0",
    hasChildren = true
  ): Promise<SystemDeptType.DeptTree[]> {
    const { data } = await SystemDeptApi.loadDeptList(
      paramsSearch ? { ...form, includeAll: true } : { pid, includeAll: true }
    );
    return data.map(item => ({
      ...item,
      children: [],
      hasChildren: hasChildren,
      __uniqueId: Date.now()
    }));
  }

  async function onSearch() {
    loading.value = true;
    clearLazyCache();
    dataList.value = await loadDeptList(form.name || form.code);
    loading.value = false;
  }

  /**
   * 清除缓存方法
   */
  const clearLazyCache = () => {
    const originalData = [...dataList.value];
    dataList.value = []; // 清空数据
    nextTick(() => {
      dataList.value = originalData; // 恢复数据
    });
  };

  type LazyLoadType = {
    row: SystemDeptType.DeptTree;
    treeNode: TreeNode;
    resolve: (date: SystemDeptType.DeptTree[]) => void;
  };

  const lastParentNode = new Map<string, LazyLoadType>();

  async function onLoad(
    row: SystemDeptType.DeptTree,
    treeNode: TreeNode,
    resolve: (data: SystemDeptType.DeptTree[]) => void
  ) {
    const children = await loadDeptList(false, row.id);
    // 处理节点被删除的情况（返回空数组）
    if (children.length === 0) {
      const loadData = lastParentNode.get(row.pid);
      row.children = [];
      (treeNode as any).childNodes = [];
      (treeNode as any).children = [];
      treeNode.expanded = false;
      treeNode.loading = false;
      treeNode.noLazyChildren = true;
      if (loadData) {
        const ddd = await loadDeptList(false, row.pid, true);
        console.log("ddd", ddd);
        loadData.resolve(ddd);
        return;
      }
    } else {
      lastParentNode.set(row.id, { row, treeNode, resolve });
    }
    resolve(children);
  }

  /** 懒加载的间隔时间 */
  const lazyLoadInterval = ref(50);

  /** 懒加载的缓存 */
  const lazyLoadChildrenStore = new Map<string, SystemDeptType.DeptTree[]>();

  /**
   * 懒加载数据
   * @param node 节点数据
   * @param resolve 加载数据
   */
  function lazyLoad(node, resolve) {
    if (lazyLoadChildrenStore.has(node.value)) {
      resolve(lazyLoadChildrenStore.get(node.value));
      return;
    }
    setTimeout(async () => {
      const children = await loadDeptList(false, node.value);
      lazyLoadChildrenStore.set(node.value, children);
      resolve(children);
      lazyLoadInterval.value = 50;
    }, lazyLoadInterval.value);
    lazyLoadInterval.value += 50;
  }

  function openDialog(title = "新增", row?: SystemDeptType.Dept) {
    // 每次打开弹框时，清空懒加载缓存
    lazyLoadChildrenStore.keys().forEach(k => lazyLoadChildrenStore.delete(k));
    const pidAll = row?.pidAll?.split(",").filter(item => item !== "0") ?? [];
    addDialog({
      title: `${title}部门`,
      props: {
        formInline: {
          lazyLoad,
          id: row?.code ? row?.id : undefined,
          code: row?.code,
          fullName: row?.fullName,
          name: row?.name,
          pid: row?.pid,
          pidAll: row?.code ? pidAll : pidAll.concat(row?.id),
          remark: row?.remark,
          sort: row?.sort ?? 0,
          type: row?.type
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
        const curData = options.props as SystemDeptType.DeptEditFormDTO;
        function chores() {
          message(
            `您${title}了部门名称为${curData.formInline.name}的这条数据`,
            {
              type: "success"
            }
          );
          done(); // 关闭弹框
          onSearch(); // 刷新表格数据
        }
        FormRef.validate(async valid => {
          if (valid) {
            const { formInline: formInlineData } = curData;
            const pidAllArr = formInlineData.pidAll as string[];
            const saveData = {
              ...formInlineData,
              ...(pidAllArr.length > 0
                ? {
                    pid: pidAllArr[pidAllArr.length - 1],
                    pidAll: ["0"].concat(pidAllArr).join(",")
                  }
                : { pid: "0", pidAll: "" })
            };
            // 表单规则校验通过
            if (title === "新增") {
              // 实际开发先调用新增接口，再进行下面操作
              await SystemDeptApi.add(saveData as SystemDeptType.DeptAddDTO);
              chores();
            } else {
              // 实际开发先调用修改接口，再进行下面操作
              await SystemDeptApi.update(
                saveData as SystemDeptType.DeptUpdateDTO
              );
              chores();
            }
          }
        });
      }
    });
  }

  async function handleDelete(row) {
    await SystemDeptApi.delete(row.id);
    message(`您删除了部门名称为${row.name}的这条数据`, { type: "success" });
    onSearch();
  }

  onMounted(() => {
    onSearch();
  });

  return {
    tableRef,
    form,
    loading,
    columns,
    dataList,
    /** 搜索 */
    onSearch,
    /** 展开 */
    onLoad,
    clearLazyCache,
    /** 重置 */
    resetForm,
    /** 新增、修改部门 */
    openDialog,
    /** 删除部门 */
    handleDelete,
    handleSelectionChange
  };
}
