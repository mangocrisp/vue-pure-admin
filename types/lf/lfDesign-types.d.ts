/** 流程图设计 类型定义 */
declare namespace LfDesignType {
  /** 流程图设计 接口数据结构 */
  export interface Domain extends DefaultParams {
    /** 主键 */
    id: string;
    /** 名称 */
    name?: string;
    /** 状态(0未发布，1已经发布) */
    status?: string;
    /** 备注说明 */
    description?: string;
    /** 数据（实时设计最新的流程数据） */
    data?: any;
    /** 流程类型（字典项 lf_process_type） */
    type?: string;
    /** 图标 */
    icon?: string;
    /**最新版本 */
    lastVersion?: string;
  }
  /** 流程图设计 新增数据结构 */
  export interface AddDTO {
    /** 名称 */
    name?: string;
    /** 备注说明 */
    description?: string;
    /** 流程类型（字典项 lf_process_type） */
    type?: string;
    /** 图标 */
    icon?: string;
  }
  /** 流程图设计 修改数据结构 */
  export interface UpdateDTO {
    /** 主键 */
    id: string;
    /** 名称 */
    name?: string;
    /** 状态(0未发布，1已经发布) */
    status?: string;
    /** 备注说明 */
    description?: string;
    /** 数据（实时设计最新的流程数据） */
    data?: any;
    /** 流程类型（字典项 lf_process_type） */
    type?: string;
    /** 图标 */
    icon?: string;
  }

  /** 流程图设计 查询条件 */
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
    /** 名称 */
    name?: string;
    /** 状态(0未发布，1已经发布) */
    status?: string;
    /** 备注说明 */
    description?: string;
    /** 流程类型（字典项 lf_process_type） */
    type?: string;
  }

  /** 流程图设计 查询体 */
  export interface QueryBody {
    lfDesignQueryDTO: QueryDTO;
    /** 可以继续添加关联表的查询条件 */
  }
}
