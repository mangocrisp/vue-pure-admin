/** 流程管理 类型定义 */
declare namespace LfProcessType {
  /** 流程管理 接口数据结构 */
  export interface Domain extends DefaultParams {
    /** 主键 */
    id: string;
    /** 流程图 id（可以知道当前流程是基于什么原始设计运行的） */
    designId?: string;
    /** 流程标题 */
    title?: string;
    /** 流程发起人 id */
    userId?: string;
    /** 发起部门 */
    deptId?: string;
    /** 岗位 */
    postId?: string;
    /** 流程实时数据(方便实时查看流程走向) */
    data?: string;
    /** 流程发布 id（可以知道当前流程是基于什么版本的设计在运行的） */
    releaseId?: string;
    /** 流程运行过程中的所有表单数据 */
    formData?: string;
    /** 状态（1、流程进行中 0、流程已经完成 2、流程已归档 -1、流程中止） */
    status?: number;
    /** 备注 */
    remark?: string;
    /** 流程中止等原因 */
    cause?: string;
    /** 流程类型（字典项 lf_process_type） */
    type?: string;
    /** 图标 */
    icon?: string;
  }

  /** 流程列表查询 VO 对象 */
  export interface ProcessListVO {
    /** 待办 id */
    todoId: string;
    /** 流程发布 id（可以知道当前流程是基于什么版本的设计在运行的） */
    releaseId: string;
    /** 运行流程 id */
    processId: string;
    /** 流程标题 */
    title: string;
    /** 创建人 */
    createUser: string;
    /** 创建人姓名 */
    createUserName: string;
    /** 创建时间 */
    createTime: string;
    /** 所属流程图 id */
    designId: string;
    /** 所属流程名称 */
    designName: string;
    /** 当前节点 id */
    nodeId: string;
    /** 当前节点标题 */
    nodeText: string;
    /** 图标 */
    icon: string;
    /** 最后版本号 */
    lastVersion: string;
    /** 状态（1、待办、0、已办） */
    status: number;
    /** 流程类型（字典项 lf_process_type） */
    type: string;
    /** 待办状态（1、待处理 2、待阅 3、被退回  4、未读 5、反馈） */
    todoStatus: number;
    /** 已办状态（1、未归档 2、已归档 3、待回复 4、未读 5、反馈） */
    doneStatus: number;
    /** 待办类型（1、任务待办 2、抄送待办 ...其他类型自定义） */
    todoType: string;
  }

  /**
   * 未操作者
   */
  export interface UnOperator {
    /** 运行流程 id */
    processId: string;
    /** 操作者 id */
    id: string;
    /** 操作者名 */
    name: string;
    /** 操作者类型(user,role,dept) */
    type: string;
  }

  /** 待办统计 */
  export interface TodoCount {
    /** key */
    key: string;
    /** 数量 */
    count: number;
  }

  /** 待办数量查询 VO */
  export interface TodoListCountVO {
    /** 待办数量 */
    todoCount: TodoCount[];
    /** 已办数量 */
    doneCount: TodoCount[];
    /** 流程类型待办数量 */
    typeCount: TodoCount[];
    /** 设计待办数量 */
    designCount: TodoCount[];
  }

  /** 流程管理 新增数据结构 */
  export interface AddDTO {
    /** 流程图 id（可以知道当前流程是基于什么原始设计运行的） */
    designId?: string;
    /** 流程标题 */
    title?: string;
    /** 流程发布 id（可以知道当前流程是基于什么版本的设计在运行的） */
    releaseId?: string;
    /** 备注 */
    remark?: string;
    /** 流程类型（字典项 lf_process_type） */
    type?: string;
    /** 开始节点的属性数据，新建流程，是从第一个开始节点开始的，这里一般会传开始节点的属性数据 */
    startNodes: LfNodesType.AddDTO;
  }

  /** 流程管理 修改数据结构 */
  export interface UpdateDTO {
    /** 主键 */
    id: string;
    /** 流程图 id（可以知道当前流程是基于什么原始设计运行的） */
    designId?: string;
    /** 流程标题 */
    title?: string;
    /** 流程发起人 id */
    userId?: string;
    /** 发起部门 */
    deptId?: string;
    /** 岗位 */
    postId?: string;
    /** 流程实时数据(方便实时查看流程走向) */
    data?: string;
    /** 流程发布 id（可以知道当前流程是基于什么版本的设计在运行的） */
    releaseId?: string;
    /** 流程运行过程中的所有表单数据 */
    formData?: string;
    /** 状态（1、流程进行中 0、流程已经完成 2、流程已归档 -1、流程中止） */
    status?: number;
    /** 备注 */
    remark?: string;
    /** 流程中止等原因 */
    cause?: string;
    /** 流程类型（字典项 lf_process_type） */
    type?: string;
    /** 图标 */
    icon?: string;
  }

  /** 流程管理 查询条件 */
  export interface QueryDTO {
    /** 主键 */
    id?: string;
    /** 主键 */
    idSelection?: Array<string>;
    /** 创建人 */
    createUser?: string;
    /** 创建时间 */
    createTime?: string;
    /** 创建时间 */
    createTime_ge?: string;
    /** 创建时间 */
    createTime_le?: string;
    /** 修改人 */
    updateUser?: string;
    /** 修改时间 */
    updateTime?: string;
    /** 修改时间 */
    updateTime_ge?: string;
    /** 修改时间 */
    updateTime_le?: string;
    /** 是否已删除 */
    isDeleted?: string;
    /** 流程图 id（可以知道当前流程是基于什么原始设计运行的） */
    designId?: string;
    /** 流程标题 */
    title?: string;
    /** 流程发起人 id */
    userId?: string;
    /** 发起部门 */
    deptId?: string;
    /** 岗位 */
    postId?: string;
    /** 流程实时数据(方便实时查看流程走向) */
    data?: string;
    /** 流程发布 id（可以知道当前流程是基于什么版本的设计在运行的） */
    releaseId?: string;
    /** 流程运行过程中的所有表单数据 */
    formData?: string;
    /** 状态（1、流程进行中 0、流程已经完成 2、流程已归档 -1、流程中止） */
    status?: number;
    /** 备注 */
    remark?: string;
    /** 流程中止等原因 */
    cause?: string;
    /** 流程类型（字典项 lf_process_type） */
    type?: string;
    /** 图标 */
    icon?: string;
  }

  /** 待办查询 DTO */
  export interface TodoListQueryDTO {
    /** 流程图 id（可以知道当前流程是基于什么原始设计运行的） */
    designId?: string;
    /** 流程标题 */
    title: string;
    /** 流程发布 id（可以知道当前流程是基于什么版本的设计在运行的） */
    releaseId: string;
    /** 运行流程 id */
    processId: string;
    /** 状态（1、待办、0、已办） */
    status: number;
    /** 待办状态（1、待处理 2、待阅 3、被退回  4、未读 5、反馈） */
    todoStatus: number;
    /** 已办状态（1、未归档 2、已归档 3、待回复 4、未读 5、反馈） */
    doneStatus: number;
    /** 流程类型（字典项 lf_process_type） */
    type: string;
    /** 待办类型（1、任务待办 2、抄送待办 ...其他类型自定义） */
    todoType: string;
  }

  /**
   * 用户申请的 流程查询 DTO
   */
  export interface UserRequestListQueryDTO {
    /** 流程图 id（可以知道当前流程是基于什么原始设计运行的） */
    designId: string;
    /** 流程标题 */
    title: string;
    /** 流程发布 id（可以知道当前流程是基于什么版本的设计在运行的） */
    releaseId: string;
    /** 已办状态（1、未归档 2、已归档 3、待回复 4、未读 5、反馈） */
    doneStatus: number;
    /** 流程类型（字典项 lf_process_type） */
    type: string;
  }

  /** 流程管理 查询体 */
  export interface QueryBody {
    lfProcessQueryDTO: QueryDTO;
    /** 可以继续添加关联表的查询条件 */
  }
}
