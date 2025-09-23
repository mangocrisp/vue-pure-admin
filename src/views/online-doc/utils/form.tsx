import { computed, reactive, ref } from "vue";
import {
  ElMessage,
  ElMessageBox,
  type ElTreeV2,
  type FormInstance,
  type FormRules
} from "element-plus";
import type {
  TreeNode,
  TreeNodeData
} from "element-plus/es/components/tree-v2/src/types";
import { useUserStoreHook } from "@/store/modules/user";
import OnlineDocApi from "@/api/online-doc/online-doc";
import { DeptUserTreeNodeType } from "./types";
import { Uuid } from "ts-uuid";
import SystemDeptApi from "@/api/system/dept";
export const useOnlineDocForm = (props, emit) => {
  const userStore = useUserStoreHook();

  /**
   * 弹窗显示状态
   */
  const visible = computed({
    get() {
      return props.modelValue;
    },
    set(paramsVal: boolean) {
      emit("update:modelValue", paramsVal);
    }
  });

  /**
   * 操作类型：新增/编辑
   */
  const actionType = ref<"add" | "update">("add");
  /**
   * 文档的 Ref 对象
   */
  const formRef = ref<FormInstance | null>();

  /**
   * 上传文件
   */
  interface UploadFileType {
    file: any;
  }
  /**
   * 新增对象 DTO
   */
  const addDTO = {
    /** 主键 */
    id: undefined,
    /** 文档名称 */
    name: undefined,
    /** 文档是否共享 */
    share: 0,
    /** 文档属性设置（字段等） */
    properties: undefined,
    /** 文档共享范围 */
    onlineDocPermitSet: [],
    /** excel 文件 */
    file: undefined,
    /** 文档属性设置（字段等） */
    onlineDocProperties: undefined
  };

  /** 文档数据 Ref */
  const form = ref<
    (OnlineDocType.OnlineDocAddDTO | OnlineDocType.OnlineDocUpdateDTO) &
      UploadFileType
  >(JSON.parse(JSON.stringify(addDTO)));

  /** 默认数据 Ref */
  const defaultConfigForm = ref<
    OnlineDocType.OnlineDocAddDTO | OnlineDocType.OnlineDocUpdateDTO
  >();

  /** 重置文档方法 Ref */
  const restFormFnRef = ref<any>(null);

  /** 初始化新增文档 */
  const iniAddForm = () => {
    form.value = JSON.parse(JSON.stringify(addDTO));
    restFormFnRef.value = () => JSON.parse(JSON.stringify(addDTO));
    defaultConfigForm.value = JSON.parse(JSON.stringify(addDTO));
  };
  /**
   * 初始化编辑修改文档
   * @param data 需要被编辑的数据
   */
  const iniUpdateForm = (data: OnlineDocType.OnlineDocUpdateDTO) => {
    form.value = JSON.parse(JSON.stringify(data));
    restFormFnRef.value = () => JSON.parse(JSON.stringify(data));
    defaultConfigForm.value = JSON.parse(JSON.stringify(data));
  };

  const rules = reactive<FormRules>({
    name: [{ required: true, message: "请输入文档名称", trigger: "blur" }],
    share: [{ required: true, message: "请选择是否需要共享", trigger: "blur" }],
    file: [{ required: true, message: "请上传文件", trigger: "blur" }]
  });

  const loading = ref<boolean>(false);

  const setLoading = (val: boolean) => {
    loading.value = val;
  };

  const handleSubmit = async () => {
    await formRef.value?.validate(async valid => {
      if (valid) {
        if (form.value.id && form.value.file) {
          ElMessageBox.confirm(
            "是否确认导入文档？导入替换不可恢复",
            "导入替换文档",
            {
              confirmButtonText: "确认",
              customClass: "customMessage",
              cancelButtonText: "取消",
              type: "warning"
            }
          )
            .then(() => {
              submitData();
            })
            .catch(() => {});
        } else {
          submitData();
        }
      }
    });
  };

  /**
   * 保存数据
   */
  const submitData = async () => {
    setLoading(true);
    try {
      form.value.onlineDocPermitSet = form.value.share
        ? checkedNodesData()
        : [];
      const params = { ...form.value, ...{ file: undefined } };
      const { message, data } = await (actionType.value === "add"
        ? OnlineDocApi.add(params as any, form.value.file)
        : OnlineDocApi.update(params as any));
      ElMessage.success(message);
      visible.value = false;
      emit("resetTable", data);
    } catch (error) {
      console.error("handleSubmit => error", error);
    } finally {
      setLoading(false);
    }
  };

  /**
   * 关闭弹窗
   */
  const close = () => {
    actionType.value = "add";
    iniAddForm();
    getDeptUserTreeData();
    clearPermissions(deptUserTreeData.value);
  };

  /**
   * 加载更新文档
   * @param data 更新数据
   */
  const initUpdateForm = (data: OnlineDocType.OnlineDocVO) => {
    const {
      id,
      name,
      share,
      deptName,
      createUser,
      createUserName,
      updateUserName,
      createTime,
      updateTime,
      onlineDocPermitSet
    } = data;
    // 这里如果是 json 对象，需要拿出他里面的 value 属性的值
    iniUpdateForm({
      id,
      name,
      share,
      deptName,
      createUser,
      createUserName,
      updateUserName,
      createTime,
      updateTime,
      onlineDocPermitSet
    });
    actionType.value = "update";
    clearPermissions(deptUserTreeData.value);
    fillExistedTree(onlineDocPermitSet as OnlineDocType.OnlineDocPermit[]);
  };

  /**
   * 填充已存在的数据
   */
  const fillExistedTree = async (
    onlineDocPermitSet: OnlineDocType.OnlineDocPermit[]
  ) => {
    if (!onlineDocPermitSet || onlineDocPermitSet.length === 0) {
      return;
    }
    // todo 去后端查询数据回来，填回去这个列表，然后才能搜索
    const { data } = await SystemDeptApi.deptUserTree(
      [...onlineDocPermitSet.map(item => item.deptId)],
      false
    );
    if (
      data &&
      data.length > 0 &&
      deptUserTreeData.value &&
      deptUserTreeData.value.length > 0
    ) {
      // 绑定权限
      const convertData = onlineDocPermitSet.map(item => {
        return {
          key: item.userId ? `u_${item.userId}` : `d_${item.deptId}`,
          id: item.userId ? `u_${item.userId}` : `d_${item.deptId}`,
          permissions: item.permissions
            ? JSON.parse(item.permissions as string)
            : undefined,
          isAdmin: item.isAdmin
        };
      });
      data.forEach(i => {
        const same = convertData.filter(j => j.id === i.id);
        if (same && same.length > 0) {
          if (same[0].permissions && typeof same[0].permissions !== "string") {
            i.permissions = same[0]
              .permissions as OnlineDocType.OnlineDocPermitPermissions;
            i.isAdmin = same[0].isAdmin;
            if (
              (form.value as OnlineDocType.OnlineDocUpdateDTO).createUser &&
              (form.value as OnlineDocType.OnlineDocUpdateDTO).createUser !==
                userStore.id
            ) {
              i.disabled = true;
            }
          } else {
            // 找不到对应的就给空权限
            i.permissions = undefined;
            i.isAdmin = 0;
          }
        }
      });
      mergeQueryDeptUserTree(deptUserTreeData.value, data);
      deptUserTreeRender(() => {
        setTimeout(() => {
          // todo 展开对应的节点
          // todo 把权限赋值给对应的节点
          onlineDocPermitSet.forEach(item => {
            const key = item.userId ? `u_${item.userId}` : `d_${item.deptId}`;
            const node = deptUserTreeRef.value!.getNode(key);
            if (node) {
              expandNodeUntilTop(node);
              deptUserTreeRef.value!.setChecked(key, true);
              // 展开父级节点
            }
          });
        }, 10);
      });
    }
  };

  const expandNodeUntilTop = (node: TreeNode) => {
    if (node && node.parent) {
      setTimeout(() => {
        if (node.parent) {
          deptUserTreeRef.value!.expandNode(node.parent);
        }
      }, 10);
      expandNodeUntilTop(node.parent);
    }
  };

  /**
   * 重置文档
   * @param formEl 文档引用
   */
  const rest = (formEl: FormInstance | undefined | null) => {
    if (!formEl) return;
    if (actionType.value === "add") {
      formEl.resetFields();
      getDeptUserTreeData();
      clearPermissions(deptUserTreeData.value);
    } else {
      form.value.share = 0;
      setTimeout(() => {
        form.value = restFormFnRef.value();
        initUpdateForm(form.value as any);
      }, 50);
    }
  };

  /**
   * 文档选项
   */
  const formOptions = ref<OnlineDocType.OnlineDoc[]>([]);

  /**
   * 远程查询文档
   * @param formName 文档名称
   * @param andThen 查询成功后回调
   */
  const searchFormName = async (formName: string, andThen?: () => void) => {
    setLoading(true);
    try {
      formOptions.value = await OnlineDocApi.page({
        pageNum: 1,
        pageSize: 10,
        onlineDocQueryDTO: {
          name: formName
        }
      }).then(res => res.data.records);
      if (andThen) {
        andThen();
      }
    } catch (err) {
      console.error("searchFormName => err", err);
    } finally {
      setLoading(false);
    }
  };

  /** 覆盖默认的上传行为 */
  const requestUpload = () => Promise.resolve();

  /**
   * 允许上传的文件类型
   */
  // todo 这里需要做这个限制
  // const allowedFileTypes = ['csv', 'djvu', 'doc', 'docm', 'docx', 'docxf', 'dot', 'dotm', 'dotx', 'epub', 'fb2', 'fodp', 'fods', 'fodt', 'htm', 'html', 'key', 'mht', 'numbers', 'odp', 'ods', 'odt', 'oform', 'otp', 'ots', 'ott', 'oxps', 'pages', 'pdf', 'pot', 'potm', 'potx', 'pps', 'ppsm', 'ppsx', 'ppt', 'pptm', 'pptx', 'rtf', 'txt', 'xls', 'xlsb', 'xlsm', 'xlsx', 'xlt', 'xltm', 'xltx', 'xml', 'xps']
  /**
   * 导入数据
   * @param file 文件
   */
  const beforeUpload = async file => {
    if (file.status === "success") {
      form.value.file = file.raw;
    }
  };

  /**
   * 选择文档改变选中
   * @param formName 选中的文档名称
   */
  const searchFormNameChangeHandle = async (formName: string) => {
    if (actionType.value === "add") {
      // 只有是新增页面的时候才做这个自动填充数据的操作
      const choosedForm = formOptions.value.find(
        item => item.name === formName
      );
      if (choosedForm && choosedForm.id) {
        const { data: detail } = await OnlineDocApi.detail(choosedForm.id);
        const {
          id,
          name,
          share,
          deptName,
          createUser,
          createUserName,
          updateUserName,
          createTime,
          updateTime,
          onlineDocPermitSet
        } = detail;
        // 这里如果是 json 对象，需要拿出他里面的 value 属性的值
        iniUpdateForm({
          id,
          name,
          share,
          deptName,
          createUser,
          createUserName,
          updateUserName,
          createTime,
          updateTime,
          onlineDocPermitSet
        });
      } else {
        if (form.value.id) {
          /** 主键 */
          form.value.id = undefined;
          /** 文档是否共享 */
          form.value.share = 0;
          /** 文档属性设置（字段等） */
          (form.value as OnlineDocType.OnlineDocUpdateDTO).deptName = undefined;
          /** 所属部门id */
          form.value.onlineDocPermitSet = [];
          /** excel 文件 */
          form.value.file = undefined;
        }
      }
    }
  };

  /**
   * 设置选中当前文档
   * @param formName 文档名称
   */
  const setChooseCurrentForm = (formName: string) => {
    form.value.name = formName;
  };

  // ================ 共享范围 start

  /** 配置选项 */
  const deptUserTreeProps = {
    value: "id",
    label: "name",
    children: "children"
  };

  /** 共享范围树数据 */
  const deptUserTreeData = ref<OnlineDocType.DeptUserTree[]>([]);
  /**
   * 获取共享范围树数据选择器
   */
  const deptUserTreeRef = ref<InstanceType<typeof ElTreeV2> | null>(null);

  /** 获取部门树数据 */
  const getDeptUserTreeData = async () => {
    const { data } = await SystemDeptApi.deptUserTree(["0"]);
    addPlaceholder(data);
    deptUserTreeData.value = data;
  };

  /**
   * 添加占位符
   * @param data 数据
   */
  const addPlaceholder = (data: OnlineDocType.DeptUserTree[]) => {
    data.forEach(item => {
      // 如果是部门，并且没有子集，就加上一个占位符
      if (
        item.type === DeptUserTreeNodeType.DEPT &&
        (!item.children || item.children.length === 0)
      ) {
        const key = Uuid.create().toString().replace(/-/g, "");
        item.children = [
          {
            key: key,
            name: "",
            type: DeptUserTreeNodeType.PLACEHOLDER,
            disabled: false,
            id: key,
            pid: item.id,
            isAdmin: 0
          }
        ];
      } else if (item.type === DeptUserTreeNodeType.DEPT) {
        if (item.children) {
          addPlaceholder(item.children);
        }
      }
    });
  };

  /**
   * 根据选择的节点获取他的下级数据
   * @param node 选择的节点
   */
  const getDeptUserTreeChildren = async (
    treeNodeData: TreeNodeData,
    treeNode: TreeNode
  ) => {
    console.log(treeNode);
    if (
      treeNodeData.children &&
      treeNodeData.children.length === 1 &&
      treeNodeData.children[0].type === DeptUserTreeNodeType.PLACEHOLDER
    ) {
      // 如果是占位节点，这里直接清零，然后再去后端查询，查询到了就添加进去
      const { data } = await SystemDeptApi.deptUserTree(
        [treeNodeData.deptId],
        false
      );
      if (
        data &&
        data.length > 0 &&
        deptUserTreeData.value &&
        deptUserTreeData.value.length > 0
      ) {
        mergeQueryDeptUserTree(deptUserTreeData.value, data);
        deptUserTreeRender();
      }
    }
  };

  /** 搜索关键字 */
  const deptUserTreeQuery = ref("");
  /**
   * 搜索数据
   */
  const onDeptUserTreeQueryChanged = async () => {
    if (!deptUserTreeQuery.value || deptUserTreeQuery.value.length === 0) {
      deptUserTreeRef.value!.filter(deptUserTreeQuery.value);
      // 如果没有关键字，就折叠所有节点
      // if (deptUserTreeData.value && deptUserTreeData.value.length > 0) {
      //   deptUserTreeData.value.map(item => item.id)
      //     .map(key => deptUserTreeRef.value!.getNode(key))
      //     .forEach((node) => {
      //       if (node) {
      //         deptUserTreeRef.value!.collapseNode(node)
      //       }
      //     })
      // }
      return;
    }
    // todo 去后端查询数据回来，填回去这个列表，然后才能搜索
    const { data } = await SystemDeptApi.deptUserTreeByCondition(
      deptUserTreeQuery.value,
      false
    );
    if (
      data &&
      data.length > 0 &&
      deptUserTreeData.value &&
      deptUserTreeData.value.length > 0
    ) {
      if (form.value.onlineDocPermitSet) {
        // 绑定权限
        const convertData = form.value.onlineDocPermitSet.map(item => {
          return {
            key: item.userId ? `u_${item.userId}` : `d_${item.deptId}`,
            id: item.userId ? `u_${item.userId}` : `d_${item.deptId}`,
            permissions: item.permissions
              ? JSON.parse(item.permissions as string)
              : undefined,
            isAdmin: item.isAdmin
          };
        });
        data.forEach(i => {
          const same = convertData.filter(j => j.id === i.id);
          if (same && same.length > 0) {
            if (
              same[0].permissions &&
              typeof same[0].permissions !== "string"
            ) {
              i.permissions = same[0]
                .permissions as OnlineDocType.OnlineDocPermitPermissions;
              i.isAdmin = same[0].isAdmin;
              if (
                (form.value as OnlineDocType.OnlineDocUpdateDTO).createUser &&
                (form.value as OnlineDocType.OnlineDocUpdateDTO).createUser !==
                  userStore.id
              ) {
                i.disabled = true;
              }
            } else {
              // 找不到对应的就给空权限
              i.permissions = undefined;
              i.isAdmin = 0;
            }
          }
        });
      }

      mergeQueryDeptUserTree(deptUserTreeData.value, data);
      deptUserTreeRender(() => {
        setTimeout(() => {
          deptUserTreeRef.value!.filter(deptUserTreeQuery.value);
        }, 10);
      });
    }
  };

  /**
   * 合并查询回来的数据
   * @param currentData  现有的数据
   * @param queryData  查询回来的数据
   */
  const mergeQueryDeptUserTree = (
    currentData: OnlineDocType.DeptUserTree[],
    queryData: OnlineDocType.DeptUserTree[]
  ) => {
    if (currentData && currentData.length > 0) {
      // 先把当前同 pid 的数据添加进来顶级
      const pid = currentData[0].pid;
      // 已经有有相同pid的数据，也就是顶层已经有了哪些数据了
      const idSet = currentData.map(item => item.id);
      const appendData = queryData
        .filter(data => data.pid === pid)
        .filter(data => !idSet.includes(data.id));
      if (appendData && appendData.length > 0) {
        // 这里也要为 placeholder 添加 点位符
        addPlaceholder(appendData);
        // 过滤掉同步 pid 但是不同 id 的数据也就是可以直接添加到顶级的数据了
        currentData.push(...appendData);
      }
      for (let i = 0; i < currentData.length; i++) {
        const item = currentData[i];
        const same = queryData.filter(j => j.id === item.id);
        if (same && same.length > 0) {
          if (same[0].permissions && typeof same[0].permissions !== "string") {
            item.permissions = same[0]
              .permissions as OnlineDocType.OnlineDocPermitPermissions;
            item.isAdmin = same[0].isAdmin;
          } else {
            item.permissions = undefined;
            item.isAdmin = 0;
          }
        }
        if (item.children) {
          if (
            item.children.length === 1 &&
            item.children[0].type === DeptUserTreeNodeType.PLACEHOLDER
          ) {
            // 如果是占位节点，这里直接清零，然后再去后端查询，查询到了就添加进去
            const children = queryData.filter(data => data.pid === item.id);
            if (children && children.length > 0) {
              addPlaceholder(children);
              item.children = [];
              item.children.push(...children);
              item.hasChildren = true;
              // 递归调用这个方法，过滤掉当前节点和已经添加到当前节点的子集的数据
              mergeQueryDeptUserTree(
                item.children,
                queryData
                  .filter(data => data.id !== item.id)
                  .filter(data => data.pid !== item.id)
              );
            }
          } else {
            // 如果有子集，就递归调用这个方法，过滤掉当前节点的数据
            mergeQueryDeptUserTree(
              item.children,
              queryData.filter(data => data.id !== item.id)
            );
          }
        }
      }
    }
  };

  /**
   * 选择状态改变事件
   * @param treeNodeData 节点数据
   * @param checked 选择状态
   */
  const deptUserTreeCheckChange = (
    treeNodeData: TreeNodeData,
    checked: boolean
  ) => {
    treeNodeData.checked = checked;
    if (!checked) {
      const { children } = treeNodeData;
      if (children) {
        clearChecked(children);
      }
    } else {
      const checkedNodes = deptUserTreeRef.value!.getCheckedNodes();
      if (checkedNodes && checkedNodes.length > 0) {
        for (let i = 0; i < checkedNodes.length; i++) {
          checkedNodes[i].checked = checked;
        }
      }
    }
    deptUserTreeRender();
  };

  /**
   * 清除全部权限
   * @param children 子集
   */
  const clearChecked = (children: TreeNodeData[]) => {
    for (let i = 0; i < children.length; i++) {
      children[i].checked = false;
      const { children: child } = children[i];
      if (child) {
        clearChecked(child);
      }
    }
  };

  /**
   * 添加权限
   * @param treeNode  节点
   * @param treeNodeData 节点数据
   */
  const addPermissions = (
    treeNode: TreeNode | undefined,
    treeNodeData: TreeNodeData
  ) => {
    treeNodeData.permissions = {
      /** 聊天 */
      chat: false,
      /** 下载 */
      download: false,
      /** 复制 */
      copy: false,
      /** 评论 */
      comment: false,
      /** 编辑 */
      edit: false,
      /** 打印 */
      print: false
    };
    treeNodeData.isAdmin = 0;
    deptUserTreeRender();
  };

  /**
   * 删除权限
   * @param treeNode  节点
   * @param treeNodeData 节点数据
   */
  const deletePermissions = (
    treeNode: TreeNode | undefined,
    treeNodeData: TreeNodeData
  ) => {
    treeNodeData.permissions = undefined;
    treeNodeData.isAdmin = 0;
    deptUserTreeRender();
  };

  /**
   * 删除全部权限
   * @param treeNode  节点
   * @param treeNodeData 节点数据
   */
  const deleteAllPermissions = (
    treeNode: TreeNode,
    treeNodeData: TreeNodeData
  ) => {
    deletePermissions(treeNode, treeNodeData);
    const { data } = treeNode;
    if (data) {
      const { children } = data;
      clearPermissions(children);
    }
    deptUserTreeRender();
  };
  /**
   * 清除全部权限
   * @param children 子集
   */
  const clearPermissions = (children: OnlineDocType.DeptUserTree[]) => {
    for (let i = 0; i < children.length; i++) {
      if (
        children[i].type === DeptUserTreeNodeType.DEPT ||
        (children[i].type === DeptUserTreeNodeType.USER &&
          (!(form.value as OnlineDocType.OnlineDocUpdateDTO).createUser ||
            (form.value as OnlineDocType.OnlineDocUpdateDTO).createUser ===
              userStore.id ||
            !children[i].isAdmin ||
            children[i].isAdmin === 0))
      ) {
        children[i].permissions = undefined;
        children[i].isAdmin = 0;
      }
      const { children: child } = children[i];
      if (child) {
        clearPermissions(child);
      }
    }
  };
  /**
   * 过滤规则
   * @param query 关键字
   * @param node 节点数据
   */
  const deptUserTreeFilterMethod = (query: string, data: TreeNodeData) =>
    query ? data.name!.includes(query) : true;

  /**
   * 获取选中的节点数据
   */
  const checkedNodesData = (): OnlineDocType.OnlineDocPermit[] => {
    const checkedNodes = deptUserTreeRef.value!.getCheckedNodes();
    // TODO 这里可以得到顶层数据
    // const checkedKeys = checkedNodes.map(i => i.id)
    // const topNodes: TreeNodeData[] = []
    // checkedNodes.forEach((i) => {
    //   if (!checkedKeys.includes(i.parentId)) {
    //     // 如果找父级不到了就往 tree 里面放在第一级
    //     topNodes.push(i)
    //   }
    // })
    return checkedNodes
      .filter(i => i.type !== DeptUserTreeNodeType.PLACEHOLDER)
      .map(i => {
        return {
          deptId: i.deptId,
          userId: i.userId,
          permissions: i.permissions
            ? JSON.stringify(i.permissions)
            : undefined,
          isAdmin: i.isAdmin
        };
      });
  };

  /**
   * 是否在渲染中
   */
  const deptUserTreeRendering = ref(false);
  /**
   * 渲染树结构
   */
  const deptUserTreeRender = (callback = () => {}) => {
    if (deptUserTreeRendering.value) {
      return;
    }
    deptUserTreeRendering.value = true;
    setTimeout(() => {
      deptUserTreeRef.value!.setData(deptUserTreeData.value);
      deptUserTreeRendering.value = false;
      if (callback) {
        callback();
      }
    }, 10);
  };
  // ================ 共享范围 end

  return {
    visible,
    form,
    rules,
    formOptions,
    deptUserTreeQuery,
    deptUserTreeData,
    initUpdateForm,
    setChooseCurrentForm,
    searchFormName,
    searchFormNameChangeHandle,
    iniAddForm,
    getDeptUserTreeData,
    close,
    loading,
    onDeptUserTreeQueryChanged,
    deptUserTreeProps,
    deptUserTreeFilterMethod,
    getDeptUserTreeChildren,
    deptUserTreeCheckChange,
    userStore,
    deleteAllPermissions,
    addPermissions,
    deletePermissions,
    actionType,
    requestUpload,
    beforeUpload,
    rest,
    formRef,
    handleSubmit,
    deptUserTreeRef
  };
};
