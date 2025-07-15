import editForm from "../form.vue";
import { handleTree } from "@/utils/tree";
import { message } from "@/utils/message";
import { transformI18n } from "@/plugins/i18n";
import { addDialog } from "@/components/ReDialog";
import { reactive, ref, onMounted, h } from "vue";
import { useRenderIcon } from "@/components/ReIcon/src/hooks";
import { cloneDeep, deviceDetection } from "@pureadmin/utils";
import type { FormProps, FormPropsItem } from "./types";
import SystemPermissionApi from "@/api/system/permission";
import SystemMenuApi from "@/api/system/menu";

export function useMenu() {
  const form = reactive({
    name: ""
  });

  const formRef = ref();
  const dataList = ref([]);
  const loading = ref(true);

  const getMenuType = (type, text = false) => {
    switch (type) {
      case 0:
        return text ? "菜单" : "primary";
      case 1:
        return text ? "iframe" : "warning";
      case 2:
        return text ? "外链" : "danger";
      case 3:
        return text ? "按钮" : "info";
    }
  };

  /**
   * 系统菜单类型
   * @param menu 系统菜单
   * @returns pure 菜单类型
   */
  const getMenuDataType = (menu: SystemMenuType.Menu): number => {
    if (menu.menuType === "M") {
      return 0;
    }
    if (
      menu.component?.startsWith("http://") ||
      menu.component?.startsWith("https://")
    ) {
      // iframe
      return 1;
    }
    if (
      menu.routeName?.startsWith("http://") ||
      menu.routeName?.startsWith("https://")
    ) {
      // outlink
      return 2;
    }
    return 0;
  };

  const columns: TableColumnList = [
    {
      label: "菜单名称",
      prop: "name",
      align: "left",
      cellRenderer: ({ row }) => (
        <>
          <span class="inline-block mr-1">
            {h(useRenderIcon(row.menuData.icon), {
              style: { paddingTop: "1px" }
            })}
          </span>
          <span>{transformI18n(row.menuData.name || row.permData.name)}</span>
        </>
      )
    },
    {
      label: "菜单类型",
      prop: "menuType",
      width: 100,
      cellRenderer: ({ row, props }) => (
        <el-tag
          size={props.size}
          type={getMenuType(row.menuType)}
          effect="plain"
        >
          {getMenuType(row.menuType, true)}
        </el-tag>
      )
    },
    {
      label: "路由名称/外链地址",
      prop: "menuData.routeName",
      formatter: ({ menuData }) => menuData?.routeName ?? ""
    },
    {
      label: "路由路径",
      prop: "menuData.routePath",
      formatter: ({ menuData }) => menuData?.routePath ?? ""
    },
    {
      label: "组件路径",
      prop: "component",
      formatter: ({ menuData }) => menuData?.component ?? ""
    },
    {
      label: "权限标识",
      prop: "btnPerm",
      formatter: ({ permData }) => permData?.btnPerm ?? ""
    },
    {
      label: "排序",
      prop: "sort",
      width: 100,
      formatter: ({ menuData }) => menuData?.sort ?? 0
    },
    {
      label: "启用",
      prop: "status",
      formatter: ({ menuData }) => (menuData?.status === 1 ? "是" : "否"),
      width: 100
    },
    {
      label: "隐藏",
      prop: "hidden",
      formatter: ({ menuData }) => (menuData?.hidden === 1 ? "是" : "否"),
      width: 100
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

  async function onSearch() {
    loading.value = true;
    // const { data } = await getMenuList(); // 这里是返回一维数组结构，前端自行处理成树结构，返回格式要求：唯一id加父节点parentId，parentId取父节点id
    const { data: menuData } = await SystemMenuApi.list({ name: form.name });
    const { data: permData } = await SystemPermissionApi.list({
      name: form.name
    });
    dataList.value = handleTree(mixMenuPermData(menuData, permData)); // 处理成树结构
    setTimeout(() => {
      loading.value = false;
    }, 500);
  }

  /**
   * 合成菜单权限数据
   * @param menuData 菜单数据
   * @param permData 权限数据
   */
  function mixMenuPermData(
    menuData: SystemMenuType.Menu[],
    permData: SystemPermissionType.Permission[]
  ): FormPropsItem[] {
    return (
      menuData
        ? menuData
            .filter(item => item.parentId)
            .map(item => {
              return {
                higherMenuOptions: [],
                id: item.id,
                parentId: item.parentId,
                menuType: getMenuDataType(item),
                meta: item.props
                  ? {
                      ...{
                        frameLoading: true,
                        hiddenTag: false,
                        fixedTag: false
                      },
                      ...JSON.parse(item.props)
                    }
                  : {
                      frameLoading: true,
                      hiddenTag: false,
                      fixedTag: false,
                      transition: {}
                    },
                menuData: {
                  id: item.id,
                  name: item.name,
                  parentId: item.parentId,
                  alwaysShow: item.alwaysShow,
                  props: item.props,
                  sort: item.sort,
                  routeName: item.routeName,
                  routePath: item.routePath,
                  component: item.component,
                  redirect: item.redirect,
                  isCache: item.isCache,
                  menuType: item.menuType,
                  hidden: item.hidden,
                  status: item.status,
                  icon: item.icon, // 可以设置，但是不能双向绑定，那个图标选择器有 BUG
                  isBlank: item.isBlank
                },
                permData: {
                  id: undefined,
                  menuId: undefined,
                  name: undefined,
                  urlPerm: undefined,
                  btnPerm: undefined
                }
              };
            })
        : []
    ).concat(
      permData
        ? permData.map(item => {
            return {
              higherMenuOptions: [],
              id: item.id,
              parentId: item.menuId,
              menuType: 3,
              meta: {
                frameLoading: true,
                hiddenTag: false,
                fixedTag: false,
                transition: {}
              },
              menuData: {
                id: undefined,
                name: undefined,
                parentId: undefined,
                alwaysShow: 1,
                props: undefined,
                sort: 0,
                routeName: undefined,
                routePath: undefined,
                component: undefined,
                redirect: undefined,
                isCache: 1,
                menuType: undefined,
                hidden: 0,
                status: 1,
                icon: undefined,
                isBlank: 1
              },
              permData: {
                id: item.id,
                menuId: item.menuId,
                name: item.name,
                urlPerm: item.urlPerm,
                btnPerm: item.btnPerm
              }
            };
          })
        : []
    );
  }

  function formatHigherMenuOptions(treeList) {
    if (!treeList || !treeList.length) return;
    const newTreeList = [];
    for (let i = 0; i < treeList.length; i++) {
      if (treeList[i].menuData.name) {
        treeList[i].menuData.name = transformI18n(treeList[i].menuData.name);
      }
      if (treeList[i].permData.name) {
        treeList[i].permData.name = transformI18n(treeList[i].permData.name);
      }
      treeList[i].title =
        treeList[i].menuData.name || treeList[i].permData.name;
      formatHigherMenuOptions(treeList[i].children);
      newTreeList.push(treeList[i]);
    }
    return newTreeList;
  }

  function openDialog(title = "新增", row?: FormPropsItem) {
    addDialog({
      title: `${title}菜单`,
      props: {
        formInline: {
          higherMenuOptions: formatHigherMenuOptions(cloneDeep(dataList.value)),
          parentId: row?.parentId,
          menuType: row?.menuType ?? 0,
          meta: row?.meta ?? {
            frameLoading: true,
            hiddenTag: false,
            fixedTag: false,
            transition: {}
          },
          menuData: row?.menuData ?? {
            id: undefined,
            name: undefined,
            parentId: undefined,
            alwaysShow: 1,
            props: undefined,
            sort: 0,
            routeName: undefined,
            routePath: undefined,
            component: undefined,
            redirect: undefined,
            isCache: 1,
            menuType: undefined,
            hidden: 0,
            status: 1,
            icon: undefined,
            isBlank: 1
          },
          permData: row?.permData ?? {
            id: undefined,
            menuId: undefined,
            name: undefined,
            urlPerm: undefined,
            btnPerm: undefined
          }
        }
      },
      width: "45%",
      draggable: true,
      fullscreen: deviceDetection(),
      fullscreenIcon: true,
      closeOnClickModal: false,
      contentRenderer: () => h(editForm, { ref: formRef, formInline: null }),
      beforeSure: (done, { options }) => {
        const FormRef = formRef.value.getRef();
        const curData = options.props as FormProps;
        function chores(name: string) {
          message(`您${title}了菜单名称为${transformI18n(name)}的这条数据`, {
            type: "success"
          });
          done(); // 关闭弹框
          onSearch(); // 刷新表格数据
        }
        FormRef.validate(async valid => {
          if (valid) {
            console.log("curData", curData);
            const { formInline: formInlineData } = curData;
            const menuType = formInlineData.menuType;
            const naem =
              menuType === 3
                ? formInlineData.permData.name
                : formInlineData.menuData.name;

            // 菜单管理的菜单类型，默认是目录，如果有父级就是菜单
            let menuDataType = "M";
            if (formInlineData.parentId) {
              menuDataType = "C";
            }
            // if (
            //   formInlineData.menuData.component?.startsWith("http://") ||
            //   formInlineData.menuData.component?.startsWith("https://") ||
            //   formInlineData.menuData.routeName?.startsWith("http://") ||
            //   formInlineData.menuData.routeName?.startsWith("https://")
            // ) {
            //   menuDataType = "L";
            // }
            // 权限数据
            const permData = {
              ...formInlineData.permData,
              // 上级菜单也就是权限绑定的菜单
              ...{ menuId: formInlineData.parentId }
            };
            const { props } = formInlineData.menuData;
            let propsJSON = {};
            if (props) {
              try {
                propsJSON = JSON.parse(props);
              } catch (error) {
                message(`自定义路由参数失败，必须是 JSON 类型配置${error}`, {
                  type: "error"
                });
              }
            }
            // 菜单数据
            const menuData = {
              ...formInlineData.menuData,
              // 上级菜单
              ...{
                parentId: formInlineData.parentId,
                menuType: menuDataType,
                props: JSON.stringify({
                  ...propsJSON,
                  ...formInlineData.meta
                })
              }
            };

            // 表单规则校验通过
            if (title === "新增") {
              // 实际开发先调用新增接口，再进行下面操作
              if (menuType === 3) {
                // 如果是权限直接保存权限
                await SystemPermissionApi.add(permData);
              } else {
                // 保存菜单
                await SystemMenuApi.add(menuData);
              }
              chores(naem);
            } else {
              // 实际开发先调用修改接口，再进行下面操作
              if (menuType === 3) {
                // 如果是权限直接保存权限
                await SystemPermissionApi.update(permData);
              } else {
                // 保存菜单
                await SystemMenuApi.update(menuData);
              }
              chores(naem);
            }
          }
        });
      }
    });
  }

  async function handleDelete(row) {
    if (row.menuType === 3) {
      // 权限
      await SystemPermissionApi.remove(row.id);
    }
    if ([0, 1, 2].indexOf(row.menuType) >= 0) {
      // 菜单
      await SystemMenuApi.remove(row.id);
    }
    message(`您删除了菜单/权限名称为${transformI18n(row.title)}的这条数据`, {
      type: "success"
    });
    onSearch();
  }

  onMounted(() => {
    onSearch();
  });

  return {
    form,
    loading,
    columns,
    dataList,
    /** 搜索 */
    onSearch,
    /** 重置 */
    resetForm,
    /** 新增、修改菜单 */
    openDialog,
    /** 删除菜单 */
    handleDelete,
    handleSelectionChange
  };
}
