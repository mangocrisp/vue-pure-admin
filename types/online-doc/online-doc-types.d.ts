/** 在线文档 类型定义 */
declare namespace OnlineDocType {
  /** 部门和用户树类型 */
  export interface DeptUserTree {
    /** 唯一键，用来放在 el-checkbox 的唯一键 */
    key: string;
    /** 显示的 label，用户名或者部门名 */
    name: string;
    /** 类型，user 或者 dept */
    type: "dept" | "user" | "placeholder";
    /** 部门id */
    deptId?: string;
    /** 用户id，用户是有部门id的，因为是用户属于哪个部门 */
    userId?: string;
    /** 共享权限 */
    permissions?: OnlineDocPermitPermissions;
    /** 子集，只有部门会有子集 */
    children?: DeptUserTree[];
    /** 树节点是否被选中 */
    checked?: boolean;
    /** 节点是否可用 */
    disabled?: boolean;
    /** 是否有子集 */
    hasChildren?: boolean;
    /** 当前级别的id */
    id: string;
    /** 父级id */
    pid: string;
    /** 是否是管理员 */
    isAdmin: number;
  }

  /** 部门和用户树类型api(按条件) */
  export interface ApiConditionDeptUserTree {
    (keyWord: string): HttpReturn<DeptUserTree[]>;
  }

  /** 部门和用户树类型api（按部门 id 集合） */
  export interface ApiDeptUserTree {
    (deptIdSet: string[], makeTree: boolean): HttpReturn<DeptUserTree[]>;
  }

  /** 在线文档 数据实体类型 */
  export interface OnlineDoc extends DefaultParams {
    /** 主键 */
    id: string;
    /** 文档名称 */
    name: string;
    /** 文档是否共享 */
    share?: number;
    /** 唯一字段 */
    uniqueField?: string;
    /** 文档属性设置（字段等） */
    properties?: string;
    /** 所属部门id */
    deptId?: string;
    /** 所属部门名称 */
    deptName?: string;
    /** 创建人姓名 */
    createUserName?: string;
    /** 最后修改人姓名 */
    updateUserName?: string;
    /** 数据 */
    data?: string;
    /** 是否是管理员 */
    isAdmin?: number;
  }

  /** 共享权限 */
  export interface OnlineDocPermitPermissions extends AnyObject {
    /** 聊天 */
    chat: boolean;
    /** 下载 */
    download: boolean;
    /** 复制 */
    copy: boolean;
    /** 评论 */
    comment: boolean;
    /** 编辑 */
    edit: boolean;
    /** 打印 */
    print: boolean;
  }

  /** 在线文档共享范围 数据实体类型 */
  export interface OnlineDocPermit extends AnyObject {
    /** 主键 */
    id?: string;
    /** 文档id */
    docId?: string;
    /** 部门id */
    deptId: string;
    /** 用户id */
    userId: string;
    /** 共享权限 */
    permissions?: OnlineDocPermitPermissions | string;
    /** 是否是管理员 */
    isAdmin?: number;
  }

  /**
   * 文档返回结果 vo
   */
  export interface OnlineDocVO extends OnlineDoc {
    /** 文档共享范围 */
    onlineDocPermitSet?: OnlineDocPermit[];
  }

  /**
   * 查询条件
   */
  export interface OnlineDocQueryDTO {
    /** 关键词搜索 */
    keyWords?: string;
    /** 文档名称 */
    name?: string;
  }

  /** 在线文档查询体 */
  export interface OnlineDocQueryBody extends AnyObject {
    /** 在线文档查询条件 DTO */
    onlineDocQueryDTO: OnlineDocQueryDTO;
    /** 可以继续添加关联表的查询条件 */
  }

  /** 在线文档新增 DTO */
  export interface OnlineDocAddDTO extends AnyObject {
    /** 主键 */
    id?: string;
    /** 文档名称 */
    name: string;
    /** 文档是否共享 */
    share: number;
    /** 文档共享范围 */
    onlineDocPermitSet?: OnlineDocPermit[];
  }

  /** 在线文档修改更新 DTO */
  export interface OnlineDocUpdateDTO extends AnyObject {
    /** 主键 */
    id: string;
    /** 文档名称 */
    name?: string;
    /** 文档是否共享 */
    share?: number;
    /** 所属部门名称 */
    deptName?: string;
    /** 创建人id */
    createUser: string;
    /** 创建时间 */
    createTime: string;
    /** 最后修改时间 */
    updateTime: string;
    /** 创建人姓名 */
    createUserName?: string;
    /** 最后修改人姓名 */
    updateUserName?: string;
    /** 文档共享范围 */
    onlineDocPermitSet?: OnlineDocPermit[];
    /** 数据 */
    data?: string;
  }
}
