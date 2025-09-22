<script lang="ts"></script>

<script setup lang="ts">
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
import { DeptUserTreeNodeType } from "./utils/types";
import { Uuid } from "ts-uuid";
import SystemDeptApi from "@/api/system/dept";
import { Plus, Search } from "@element-plus/icons-vue";

defineOptions({
  name: "OnlineDocEdit"
});

const props = defineProps({
  modelValue: {
    type: Boolean,
    required: true
  }
});

/**
 * 回调钩子用来控制弹窗显隐
 */
const emit = defineEmits(["update:modelValue", "resetTable"]);

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
    form.value.onlineDocPermitSet = form.value.share ? checkedNodesData() : [];
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
    const choosedForm = formOptions.value.find(item => item.name === formName);
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
        permissions: i.permissions ? JSON.stringify(i.permissions) : undefined,
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

/**
 * 暴露方法
 */
defineExpose({
  initUpdateForm,
  setChooseCurrentForm,
  searchFormName,
  searchFormNameChangeHandle
});

// 进来就初始化新增的 form
iniAddForm();

getDeptUserTreeData();
</script>

<template>
  <ElDialog
    v-model="visible"
    width="75vw"
    :title="`${form.name || '新建文件'} `"
    @close="close"
  >
    <template #header>
      <el-tag type="primary">
        {{ `${form.name ?? "新建文件"}` }}
      </el-tag>
    </template>
    <ElForm
      ref="formRef"
      v-loading="loading"
      :model="form"
      :rules="rules"
      class="edit-form"
    >
      <ElRow :gutter="20">
        <ElCol :span="24">
          <ElTooltip content="文档名称">
            <ElFormItem class="edit-form-item" label="文档名称" prop="name">
              <el-select
                v-model="form.name"
                filterable
                remote
                :reserve-keyword="false"
                default-first-option
                allow-create
                placeholder="搜索文档名或者新建文档名"
                value-key="name"
                remote-show-suffix
                :remote-method="searchFormName"
                :loading="loading"
                style="width: 100%"
                @change="searchFormNameChangeHandle"
              >
                <el-option
                  v-for="(item, i) in formOptions"
                  :key="i"
                  :label="item.name"
                  :value="item.name"
                />
              </el-select>
            </ElFormItem>
          </ElTooltip>
        </ElCol>
        <el-alert title="注意" show-icon type="error" :closable="false">
          <template #default>
            选择已经创建的同文档名的文件会覆盖且会更新操作记录（无法还原），请谨慎操作！
          </template>
        </el-alert>
        <ElCol
          v-show="(form as OnlineDocType.OnlineDocUpdateDTO).deptName"
          :span="24"
        >
          <ElTooltip content="创建部门">
            <ElFormItem class="edit-form-item" label="创建部门">
              <ElInput
                v-model="(form as OnlineDocType.OnlineDocUpdateDTO).deptName"
                readonly
                disabled
              />
            </ElFormItem>
          </ElTooltip>
        </ElCol>
        <ElCol
          v-show="(form as OnlineDocType.OnlineDocUpdateDTO).createUserName"
          :span="12"
        >
          <ElTooltip content="创建人">
            <ElFormItem class="edit-form-item" label="创建人">
              <ElInput
                v-model="
                  (form as OnlineDocType.OnlineDocUpdateDTO).createUserName
                "
                readonly
                disabled
              />
            </ElFormItem>
          </ElTooltip>
        </ElCol>
        <ElCol
          v-show="(form as OnlineDocType.OnlineDocUpdateDTO).createTime"
          :span="12"
        >
          <ElTooltip content="创建时间">
            <ElFormItem class="edit-form-item" label="创建时间">
              <ElInput
                v-model="(form as OnlineDocType.OnlineDocUpdateDTO).createTime"
                readonly
                disabled
              />
            </ElFormItem>
          </ElTooltip>
        </ElCol>
        <ElCol
          v-show="(form as OnlineDocType.OnlineDocUpdateDTO).updateUserName"
          :span="12"
        >
          <ElTooltip content="最后修改人">
            <ElFormItem class="edit-form-item" label="最后修改人">
              <ElInput
                v-model="
                  (form as OnlineDocType.OnlineDocUpdateDTO).updateUserName
                "
                readonly
                disabled
              />
            </ElFormItem>
          </ElTooltip>
        </ElCol>
        <ElCol
          v-show="(form as OnlineDocType.OnlineDocUpdateDTO).updateTime"
          :span="12"
        >
          <ElTooltip content="最后修改时间">
            <ElFormItem class="edit-form-item" label="最后修改时间">
              <ElInput
                v-model="(form as OnlineDocType.OnlineDocUpdateDTO).updateTime"
                readonly
                disabled
              />
            </ElFormItem>
          </ElTooltip>
        </ElCol>
        <ElCol :span="24">
          <ElTooltip content="文档是否共享">
            <ElFormItem
              class="edit-form-item"
              label="文档是否共享"
              prop="share"
            >
              <el-radio-group v-model="form.share">
                <el-radio border :value="1"> 是 </el-radio>
                <el-radio border :value="0"> 否 </el-radio>
              </el-radio-group>
            </ElFormItem>
          </ElTooltip>
        </ElCol>
        <ElCol v-if="form.share === 1" :span="24">
          <ElInput
            v-model="deptUserTreeQuery"
            placeholder="关键字搜索部门或者用户"
            clearable
            @keyup.enter="onDeptUserTreeQueryChanged"
          >
            <template #append>
              <ElButton type="primary" @click="onDeptUserTreeQueryChanged">
                <el-icon><Search /></el-icon>
              </ElButton>
            </template>
          </ElInput>
        </ElCol>
        <ElCol v-if="form.share === 1" :span="24">
          <el-auto-resizer :style="`height: 300px; border: 1px solid #eee`">
            <template #default="{ height, width }">
              <ElTreeV2
                ref="deptUserTreeRef"
                :width="width"
                :height="height"
                :data="deptUserTreeData"
                :props="deptUserTreeProps"
                show-checkbox
                highlight-current
                :expand-on-click-node="false"
                :filter-method="deptUserTreeFilterMethod"
                :indent="10"
                :item-size="30"
                @node-expand="getDeptUserTreeChildren"
                @check-change="deptUserTreeCheckChange"
              >
                <template #default="{ node, data }">
                  <el-tag
                    v-if="data.type === DeptUserTreeNodeType.DEPT"
                    type="primary"
                  >
                    部门
                  </el-tag>
                  <el-tag
                    v-if="data.type === DeptUserTreeNodeType.USER"
                    type="success"
                  >
                    用户
                  </el-tag>
                  <el-tag
                    v-if="data.type === DeptUserTreeNodeType.PLACEHOLDER"
                    type="info"
                  >
                    ...
                  </el-tag>
                  <ElTooltip :content="node.label">
                    <span
                      class="dept-user-tree-label ellipsis"
                      style="width: 40vw"
                      >{{ node.label }}</span
                    >
                  </ElTooltip>
                  <ElButton
                    v-if="
                      data.isAdmin &&
                      (form as OnlineDocType.OnlineDocUpdateDTO).createUser &&
                      (form as OnlineDocType.OnlineDocUpdateDTO).createUser !==
                        userStore.id
                    "
                    disabled
                    type="warning"
                    size="small"
                    plain
                  >
                    无权操作管理员
                  </ElButton>
                  <ElButton
                    v-show="data.hasChildren"
                    type="danger"
                    plain
                    size="small"
                    @click="deleteAllPermissions(node, data)"
                  >
                    删除全部权限
                  </ElButton>
                  <ElButton
                    v-show="
                      data.type !== DeptUserTreeNodeType.PLACEHOLDER &&
                      !data.permissions
                    "
                    type="warning"
                    plain
                    size="small"
                    @click="addPermissions(node, data)"
                  >
                    添加权限
                  </ElButton>
                  <ElButton
                    v-show="
                      data.type !== DeptUserTreeNodeType.PLACEHOLDER &&
                      data.permissions &&
                      (!data.isAdmin ||
                        data.isAdmin === 0 ||
                        !(form as OnlineDocType.OnlineDocUpdateDTO)
                          .createUser ||
                        (form as OnlineDocType.OnlineDocUpdateDTO)
                          .createUser === userStore.id)
                    "
                    type="danger"
                    plain
                    size="small"
                    @click="deletePermissions(node, data)"
                  >
                    删除权限
                  </ElButton>
                  <label
                    v-show="
                      data.type === DeptUserTreeNodeType.USER &&
                      data.permissions &&
                      (data.isAdmin === 1 ||
                        !(form as OnlineDocType.OnlineDocUpdateDTO)
                          .createUser ||
                        (form as OnlineDocType.OnlineDocUpdateDTO)
                          .createUser === userStore.id)
                    "
                    class="dept-user-tree-permissions-label"
                    ><span>管理员</span>
                    <ElSwitch
                      v-if="
                        (form as OnlineDocType.OnlineDocUpdateDTO).createUser
                      "
                      v-model="data.isAdmin"
                      size="small"
                      :disabled="
                        (form as OnlineDocType.OnlineDocUpdateDTO)
                          .createUser !== userStore.id
                      "
                      :active-value="1"
                      :inactive-value="0"
                    />
                    <ElSwitch
                      v-else
                      v-model="data.isAdmin"
                      size="small"
                      :active-value="1"
                      :inactive-value="0"
                    />
                  </label>
                  <el-popover
                    v-if="
                      data.type !== DeptUserTreeNodeType.PLACEHOLDER &&
                      data.permissions &&
                      (!data.isAdmin || data.isAdmin === 0)
                    "
                    title="文档操作权限"
                    placement="right"
                    trigger="hover"
                  >
                    <template #reference>
                      <el-tag class="dept-user-tree-label" type="warning">
                        权限
                      </el-tag>
                    </template>
                    <template #default>
                      <label class="dept-user-tree-permissions-label"
                        ><span>聊天</span>
                        <ElSwitch
                          v-model="data.permissions.chat"
                          size="small"
                        />
                      </label>
                      <label class="dept-user-tree-permissions-label"
                        ><span>下载</span>
                        <ElSwitch
                          v-model="data.permissions.download"
                          size="small"
                        />
                      </label>
                      <label class="dept-user-tree-permissions-label"
                        ><span>复制</span>
                        <ElSwitch
                          v-model="data.permissions.copy"
                          size="small"
                        />
                      </label>
                      <label class="dept-user-tree-permissions-label"
                        ><span>评论</span>
                        <ElSwitch
                          v-model="data.permissions.comment"
                          size="small"
                        />
                      </label>
                      <label class="dept-user-tree-permissions-label"
                        ><span>编辑</span>
                        <ElSwitch
                          v-model="data.permissions.edit"
                          size="small"
                        />
                      </label>
                      <label class="dept-user-tree-permissions-label"
                        ><span>打印</span>
                        <ElSwitch
                          v-model="data.permissions.print"
                          size="small"
                        />
                      </label>
                    </template>
                  </el-popover>
                </template>
              </ElTreeV2>
            </template>
          </el-auto-resizer>
        </ElCol>
        <ElCol v-if="actionType === 'add'" :span="24">
          <ElTooltip content="文档文件">
            <ElFormItem class="edit-form-item" label="文档文件" prop="file">
              <ElUpload
                action="#"
                :http-request="requestUpload"
                :show-file-list="false"
                :on-change="beforeUpload"
                drag
                style="display: inline-block"
              >
                <el-icon><Plus /></el-icon>
                <div class="el-upload__text">
                  将文件拖到此处或者 <em>点击上传</em>
                </div>
                <template #tip>
                  <div class="el-upload__tip">
                    文件格式仅支持xls、xlsx文件格式，且暂不支持合并表头格式的文件上传
                    <!-- <br>
                    <a href="#" style="color: #409EFF;">点击下载导入示例模板</a> -->
                    <br />
                    <em style="color: #409eff">
                      {{ form.file?.name ?? "" }}
                    </em>
                  </div>
                </template>
              </ElUpload>
            </ElFormItem>
          </ElTooltip>
        </ElCol>
        <el-alert title="注意" show-icon type="warning" :closable="false">
          <template #default>
            1.
            请确保勾选的部门或者用户设置了正确的权限，如果不添加权限，默认对文档只有只读权限
            <br />2.
            如果是选择了整个部门所有的人，代表的是设置了整个部门的权限，取消全选部门，表示逐个设置部门下面的用户以及部门
            <br />3.
            如果同步设置了父级部门的权限和子级部门以及用户的权限，子级的优先级比父级高
            <br />4. 管理员权限拥有所有权限，只能给人员设置管理员权限
            创建文档的人即是文档拥有者，只能文档拥有者才能赋予和取消用户管理员权限
          </template>
        </el-alert>
      </ElRow>
    </ElForm>
    <template #footer>
      <span class="dialog-footer">
        <el-button type="primary" :loading="loading" @click="handleSubmit"
          >确定</el-button
        >
        <el-button @click="rest(formRef)">重置</el-button>
        <el-button :loading="loading" @click="visible = false">取消</el-button>
      </span>
    </template>
  </ElDialog>
</template>

<style lang="scss" scoped>
.dept-user-tree-permissions-label {
  display: block;
  margin-top: 10px;
  margin-bottom: 10px;
}

.dept-user-tree-label,
.dept-user-tree-permissions-label > span {
  margin-right: 10px;
  margin-left: 10px;
}
</style>

<style lang="scss">
// 文字显示省略号
.edit-form-item > label,
.ellipsis {
  display: inline-block;
  overflow: hidden;
  text-overflow: ellipsis;
  color: #000;
  white-space: nowrap;
}

// 编辑元素的标题
.edit-form-item > label,
.edit-form-item > div.el-form-item__label {
  width: 120px;
}

.edit-form-item > div.el-form-item__label {
  justify-content: start;
  color: #000;
}
</style>
