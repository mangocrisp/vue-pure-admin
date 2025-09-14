/** 流程节点 类型定义 */
declare namespace LfNodesType {
  /** 流程节点 接口数据结构 */
  export interface Domain extends DefaultParams {
    /** 主键（节点的id，这里是使用前端生成的 uuid） */
    id: string;
    /** 流程 id */
    processId?: string;
    /** 节点的属性数据 */
    properties?: string;
    /** 节点上的文字 */
    text?: string;
    /** 节点类型（字典项 lf_node_type） */
    type?: string;
  }
  /** 流程节点 新增数据结构 */
  export interface AddDTO {
    /** 流程 id */
    processId?: string;
    /** 节点的属性数据 */
    properties?: string;
    /** 节点上的文字 */
    text?: string;
    /** 节点类型（字典项 lf_node_type） */
    type?: string;
  }
  /** 流程节点 修改数据结构 */
  export interface UpdateDTO {
    /** 主键（节点的id，这里是使用前端生成的 uuid） */
    id: string;
    /** 流程 id */
    processId?: string;
    /** 节点的属性数据 */
    properties?: string;
    /** 节点上的文字 */
    text?: string;
    /** 节点类型（字典项 lf_node_type） */
    type?: string;
  }

  /**
   * 流程节点提交 DTO
   */
  export interface NodesSubmitDTO extends UpdateDTO {
    /** 待办 id */
    todoId: string;
    /** 哪个节点连接的当前节点 */
    edges?: string;
    /** 上一个节点的 id */
    lastNodesId: string;
    /** 处理的部门 */
    deptId?: string;
    /** 处理的岗位 */
    postId?: string;
  }

  /** 流程节点 查询条件 */
  export interface QueryDTO {
    /** 主键（节点的id，这里是使用前端生成的 uuid） */
    id?: string;
    /** 主键（节点的id，这里是使用前端生成的 uuid） */
    idSelection?: Array<string>;
    /** 流程 id */
    processId?: string;
    /** 节点的属性数据 */
    properties?: string;
    /** 节点上的文字 */
    text?: string;
    /** 节点类型（字典项 lf_node_type） */
    type?: string;
  }

  /** 流程节点 查询体 */
  export interface QueryBody {
    lfNodesQueryDTO: QueryDTO;
    /** 可以继续添加关联表的查询条件 */
  }
}
