import { nextTick, onMounted, ref } from "vue";
import { Uuid } from "ts-uuid";
import {
  type DeptUserTree,
  type ChooseData,
  DeptUserTreeNodeType
} from "./types";
import type {
  TreeNode,
  TreeNodeData
} from "element-plus/es/components/tree-v2/src/types";

export const useLfFormDeptSelector = (props, emit) => {
  const api = ref(props.api);

  const deptUserTreeRef = ref(null);
  /** 共享范围树数据 */
  const deptUserTreeData = ref<DeptUserTree[]>([]);
  /** 配置选项 */
  const deptUserTreeProps = {
    value: "id",
    label: "name",
    children: "children"
  };
  /** 搜索关键字 */
  const deptUserTreeQuery = ref("");

  /** 获取部门树数据 */
  const loadData = async () => {
    const { data } = await api?.value.deptUserTree(["0"], true);
    addPlaceholder(data);
    deptUserTreeData.value = data;
    nextTick(() => {
      setTimeout(() => {
        fillExistedTree(props.modelValue);
      }, 10);
    });
  };

  /**
   * 搜索数据
   */
  const onDeptUserTreeQueryChanged = async () => {
    if (!deptUserTreeQuery.value || deptUserTreeQuery.value.length === 0) {
      deptUserTreeRef.value!.filter(deptUserTreeQuery.value);
      // 如果没有关键字，就折叠所有节点
      // if (deptUserTreeData.value && deptUserTreeData.value.length > 0) {
      //   deptUserTreeData.value.map(item => item.key)
      //     .map(key => deptUserTreeRef.value!.getNode(key))
      //     .forEach((node) => {
      //       if (node) {
      //         deptUserTreeRef.value!.collapseNode(node)
      //       }
      //     })
      // }
      return;
    }
    // 去后端查询数据回来，填回去这个列表，然后才能搜索
    const { data } = await api?.value.deptUserTreeByCondition(
      deptUserTreeQuery.value,
      false
    );
    if (
      data &&
      data.length > 0 &&
      deptUserTreeData.value &&
      deptUserTreeData.value.length > 0
    ) {
      mergeQueryDeptUserTree(deptUserTreeData.value, data);
      deptUserTreeRender(() => {
        setTimeout(() => {
          deptUserTreeRef.value!.filter(deptUserTreeQuery.value);
        }, 10);
      });
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
   * 根据选择的节点获取他的下级数据
   * @param node 选择的节点
   */
  const getDeptUserTreeChildren = async (
    treeNodeData: TreeNodeData
    // ,treeNode: TreeNode
  ) => {
    if (
      treeNodeData.children &&
      treeNodeData.children.length === 1 &&
      treeNodeData.children[0].type === DeptUserTreeNodeType.PLACEHOLDER
    ) {
      // 如果是占位节点，这里直接清零，然后再去后端查询，查询到了就添加进去
      const { data } = await api?.value.deptUserTree(
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

  /**
   * 合并查询回来的数据
   * @param currentData  现有的数据
   * @param queryData  查询回来的数据
   */
  const mergeQueryDeptUserTree = (
    currentData: DeptUserTree[],
    queryData: DeptUserTree[]
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
   * 添加占位符
   * @param data 数据
   */
  const addPlaceholder = (data: DeptUserTree[]) => {
    data.forEach(item => {
      // 如果是部门，并且没有子集，就加上一个占位符
      if (
        item.type === DeptUserTreeNodeType.DEPT &&
        (!item.children || item.children.length === 0)
      ) {
        item.children = [
          {
            name: "",
            type: DeptUserTreeNodeType.PLACEHOLDER,
            id: Uuid.create().toString().replace(/-/g, ""),
            pid: item.id
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
    deptUserTreeRender(() => {
      const data = checkedNodesData();
      emit("update:modelValue", data);
      emit("change", data);
      // console.log("data :>> ", data);
    });
  };

  /**
   * 清除全部
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

  /**
   * 获取选中的节点数据
   */
  const checkedNodesData = (): ChooseData[] => {
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
          id: i.id,
          name: i.name,
          checked: i.checked,
          pid: i.pid,
          type: i.type,
          deptId: i.deptId,
          userId: i.userId
        };
      });
  };
  /**
   * 展开节点直到顶级
   * @param node 节点
   */
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
   * 填充已存在的数据
   */
  const fillExistedTree = async (loadData: ChooseData[]) => {
    if (!loadData || loadData.length === 0) {
      return;
    }
    // todo 去后端查询数据回来，填回去这个列表，然后才能搜索
    const { data } = await api?.value.deptUserTree(
      [...loadData.map(item => item.deptId)],
      false
    );
    if (
      data &&
      data.length > 0 &&
      deptUserTreeData.value &&
      deptUserTreeData.value.length > 0
    ) {
      mergeQueryDeptUserTree(deptUserTreeData.value, data);
      deptUserTreeRender(() => {
        setTimeout(() => {
          // todo 展开对应的节点
          // todo 把权限赋值给对应的节点
          loadData.forEach(item => {
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

  onMounted(() => {
    loadData();
  });

  return {
    deptUserTreeRef,
    deptUserTreeQuery,
    onDeptUserTreeQueryChanged,
    deptUserTreeData,
    deptUserTreeProps,
    deptUserTreeFilterMethod,
    getDeptUserTreeChildren,
    deptUserTreeCheckChange,
    loadData,
    checkedNodesData
  };
};
