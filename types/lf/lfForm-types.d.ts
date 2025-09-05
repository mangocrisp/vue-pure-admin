/** 流程表单 类型定义 */
declare namespace LfFormType {
  /** 流程表单 接口数据结构 */
  export interface Domain extends DefaultParams {
    /** 主键 */
    id: string;
    /** 名称 */
    name?: string;
    /** 状态(0未发布，1已经发布) */
    status?: string;
    /** 备注说明 */
    description?: string;
    /** 数据（实时设计最新的表单数据） */
    data?: string;
    /** 表单类型，是表单还是单组件（字典项 lf_form_type） */
    type?: string;
    /** 表单组件路径 */
    path?: string;
    /** 最后发布版本号 */
    lastVersion?: string;
  }
  /** 流程表单 新增数据结构 */
  export interface AddDTO {
    /** 名称 */
    name?: string;
    /** 备注说明 */
    description?: string;
    /** 表单类型，是表单还是单组件（字典项 lf_form_type） */
    type?: string;
    /** 表单组件路径 */
    path?: string;
  }
  /** 流程表单 修改数据结构 */
  export interface UpdateDTO {
    /** 主键 */
    id: string;
    /** 名称 */
    name?: string;
    /** 状态(0未发布，1已经发布) */
    status?: string;
    /** 备注说明 */
    description?: string;
    /** 数据（实时设计最新的表单数据） */
    data?: string;
    /** 表单类型，是表单还是单组件（字典项 lf_form_type） */
    type?: string;
    /** 表单组件路径 */
    path?: string;
  }

  /** 流程表单 查询条件 */
  export interface QueryDTO {
    /** 主键 */
    id?: string;
    /** 名称 */
    name?: string;
    /** 状态(0未发布，1已经发布) */
    status?: string;
    /** 备注说明 */
    description?: string;
    /** 表单类型，是表单还是单组件（字典项 lf_form_type） */
    type?: string;
  }

  /** 流程表单 查询体 */
  export interface QueryBody {
    lfFormQueryDTO: QueryDTO;
    /** 可以继续添加关联表的查询条件 */
  }
}
