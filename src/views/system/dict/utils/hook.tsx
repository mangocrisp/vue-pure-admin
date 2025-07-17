import dayjs from "dayjs";
import editForm from "../form.vue";
import { message } from "@/utils/message";
import { transformI18n } from "@/plugins/i18n";
import { addDialog } from "@/components/ReDialog";
import type { PaginationProps } from "@pureadmin/table";
import { deviceDetection } from "@pureadmin/utils";
import { reactive, ref, onMounted, h, toRaw } from "vue";
import { ElMessageBox } from "element-plus";
import { usePublicHooks } from "../../hooks";
import { onBeforeRouteUpdate, useRoute } from "vue-router";
import type { DictEditFormDTO } from "./types";
import SystemDictApi from "@/api/system/dict";

export function usePermission() {
  const route = useRoute();
  /** 查询表单 */
  const form = reactive({
    dictVal: "",
    dictKey: "",
    dictCode: ""
  });
  /** 当前行 */
  const curRow = ref();
  /** 编辑表单 */
  const formRef = ref();
  /** 列表数据 */
  const dataList = ref([]);
  const switchLoadMap = ref({});
  const { switchStyle } = usePublicHooks();
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
      label: "字典键",
      prop: "dictKey"
    },
    {
      label: "字典值",
      prop: "dictVal"
    },
    {
      label: "排序",
      prop: "sort"
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
      label: "备注",
      prop: "remark"
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
        await SystemDictApi.update({ id: row.id, status: row.status });
        switchLoadMap.value[index] = Object.assign(
          {},
          switchLoadMap.value[index],
          {
            loading: false
          }
        );
        message(`已${row.status === 0 ? "停用" : "启用"}${row.title}`, {
          type: "success"
        });
      })
      .catch(() => {
        row.status === 0 ? (row.status = 1) : (row.status = 0);
      });
  }

  /** 选中的行 */
  const selectedRows: SystemPermissionType.Permission[] = [];

  /**
   * 删除
   * @param row 当前行
   */
  async function handleDelete(row) {
    message(`您删除了权限名称为${row.name}的这条数据`, { type: "success" });
    await SystemDictApi.remove(row.id);
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
      const { message: msg } = await SystemDictApi.batchRemove(
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
    const { data } = await SystemDictApi.page({
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
  function openDialog(title = "新增", row?: SystemDictType.Dict) {
    addDialog({
      title: `${title}权限`,
      props: {
        formInline: {
          id: row?.id,
          dictKey: row?.dictKey,
          dictVal: row?.dictVal,
          dictCode: form.dictCode,
          cssClass: row?.cssClass,
          statusClass: row?.statusClass,
          sort: row?.sort,
          remark: row?.remark
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
        const curData = options.props as DictEditFormDTO;
        function chores() {
          message(
            `您${title}了权限名称为${curData.formInline.dictVal}的这条数据`,
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
              await SystemDictApi.add(
                curData.formInline as SystemDictType.DictAddDTO
              );
              chores();
            } else {
              // 实际开发先调用修改接口，再进行下面操作
              await SystemDictApi.update(
                curData.formInline as SystemDictType.DictUpdateDTO
              );
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
    form.dictCode = route.params.dictCode as string;
    onSearch();
  });

  onBeforeRouteUpdate(async to => {
    form.dictCode = to.params.dictCode as string;
    onSearch();
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
