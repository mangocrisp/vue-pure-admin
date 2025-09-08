/** 部门和用户树类型 */
enum DeptUserTreeNodeType {
  DEPT = "dept",
  USER = "user",
  PLACEHOLDER = "placeholder"
}

interface ApiDeptUserTree {
  (
    /** 按部门查询 */
    deptIdSet: string[],
    /** 是否要生成树结构 */
    makeTree?: boolean,
    /** 是否包含搜索用户 */
    includeUser?: boolean
  ): HttpReturn<DeptUserTree[]>;
}

interface ApiConditionDeptUserTree {
  (
    keyWord: string,
    /** 是否要生成树结构 */
    makeTree?: boolean,
    /** 是否包含搜索用户 */
    includeUser?: boolean
  ): HttpReturn<DeptUserTree[]>;
}

interface DeptUserTree {
  /** 显示的 label，用户名或者部门名 */
  name: string;
  /** 类型，user 或者 dept */
  type: DeptUserTreeNodeType;
  /** 部门id */
  deptId?: string;
  /** 用户id，用户是有部门id的，因为是用户属于哪个部门 */
  userId?: string;
  /** 子集，只有部门会有子集 */
  children?: DeptUserTree[];
  /** 树节点是否被选中 */
  checked?: boolean;
  /** 节点是否可用 */
  disabled?: boolean;
  /** 是否有子集 */
  hasChildren?: boolean;
  /** 唯一键，用来放在 el-checkbox 的唯一键 */
  id: string;
  /** 父级id */
  pid: string;
}

interface ChooseData {
  /** id */
  id: string;
  /** 显示的 label，用户名或者部门名 */
  name: string;
  /** 树节点是否被选中 */
  checked?: boolean;
  /** 父级id */
  pid: string;
  /** 类型，user 或者 dept */
  type: DeptUserTreeNodeType;
  /** 部门id */
  deptId: string;
  /** 用户id */
  userId: string;
}

interface LfFormDeptSelectorModelValue {
  api: {
    deptUserTree: ApiDeptUserTree;
    deptUserTreeByCondition: ApiConditionDeptUserTree;
  };
  chooseData?: ChooseData[];
}

interface LfFormDeptSelector {
  modelValue?: LfFormDeptSelectorModelValue;
}
export { DeptUserTreeNodeType };
export type {
  LfFormDeptSelector,
  LfFormDeptSelectorModelValue,
  DeptUserTree,
  ApiDeptUserTree,
  ApiConditionDeptUserTree,
  ChooseData
};
