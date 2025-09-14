/** 流程历史 类型定义 */
declare namespace LfHistoryType {
  /** 流程历史 接口数据结构 */
  export interface Domain extends DefaultParams {
    /** 主键 */
    id: string;
    /** 操作时间 */
    time?: string;
    /** 操作人 id */
    userId?: string;
    /** 操作人的部门 */
    deptId?: string;
    /** 流程 id */
    processId?: string;
    /** 动作（节点的 text 或者单独有个 action 的属性） */
    action?: string;
    /** 操作顺序 */
    sort?: string;
    /** 当前节点操作的数据 */
    data?: string;
    /** 当前操作的节点 id */
    nodeId?: string;
    /** 操作人的岗位 */
    postId?: string;
    /** 当前节点类型（字典项 lf_node_type） */
    nodeType?: string;
  }

  /**
   * 流程历史 VO
   */
  export interface HistoryListVO extends Domain {
    /** 操作用户昵称 */
    userName: string;
    /** 操作者部门名称 */
    deptName: string;
    /** 用户头像 */
    avatar: string;
  }

  /** 流程历史 新增数据结构 */
  export interface AddDTO {
    /** 操作时间 */
    time?: string;
    /** 操作人 id */
    userId?: string;
    /** 操作人的部门 */
    deptId?: string;
    /** 流程 id */
    processId?: string;
    /** 动作（节点的 text 或者单独有个 action 的属性） */
    action?: string;
    /** 操作顺序 */
    sort?: string;
    /** 当前节点操作的数据 */
    data?: string;
    /** 当前操作的节点 id */
    nodeId?: string;
    /** 操作人的岗位 */
    postId?: string;
    /** 当前节点类型（字典项 lf_node_type） */
    nodeType?: string;
  }
  /** 流程历史 修改数据结构 */
  export interface UpdateDTO {
    /** 主键 */
    id: string;
    /** 操作时间 */
    time?: string;
    /** 操作人 id */
    userId?: string;
    /** 操作人的部门 */
    deptId?: string;
    /** 流程 id */
    processId?: string;
    /** 动作（节点的 text 或者单独有个 action 的属性） */
    action?: string;
    /** 操作顺序 */
    sort?: string;
    /** 当前节点操作的数据 */
    data?: string;
    /** 当前操作的节点 id */
    nodeId?: string;
    /** 操作人的岗位 */
    postId?: string;
    /** 当前节点类型（字典项 lf_node_type） */
    nodeType?: string;
  }

  /** 流程历史 查询条件 */
  export interface QueryDTO {
    /** 主键 */
    id?: string;
    /** 主键 */
    idSelection?: Array<string>;
    /** 操作时间 */
    time?: string;
    /** 操作时间 */
    time_ge?: string;
    /** 操作时间 */
    time_le?: string;
    /** 操作人 id */
    userId?: string;
    /** 操作人的部门 */
    deptId?: string;
    /** 流程 id */
    processId?: string;
    /** 动作（节点的 text 或者单独有个 action 的属性） */
    action?: string;
    /** 操作顺序 */
    sort?: string;
    /** 当前节点操作的数据 */
    data?: string;
    /** 当前操作的节点 id */
    nodeId?: string;
    /** 操作人的岗位 */
    postId?: string;
    /** 当前节点类型（字典项 lf_node_type） */
    nodeType?: string;
  }

  /** 流程历史记录查询 DTO */
  export interface HistoryListQueryDTO {
    /** 运行流程 id */
    processId: string;
    /** 当前节点类型（字典项 lf_node_type） */
    nodeType?: string;
    /** 与我相关 */
    relatedToMe?: 1 | 0;
  }

  /** 流程历史 查询体 */
  export interface QueryBody {
    lfHistoryQueryDTO: QueryDTO;
    /** 可以继续添加关联表的查询条件 */
  }
}
