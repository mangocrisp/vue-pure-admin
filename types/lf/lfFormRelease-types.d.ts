/** 流程表单发布表 类型定义 */
declare namespace LfFormReleaseType {
  /** 流程表单发布表 接口数据结构 */
  export interface Domain extends DefaultParams {
    /** 主键 */
    id: string;
    /** 表单 id */
    formId?: string;
    /** 发布名称 */
    name?: string;
    /** 状态(0 关闭 1 打开) */
    status?: string;
    /** 备注说明 */
    description?: string;
    /** 数据（每个版本的数据） */
    data?: string;
    /** 版本号（yyyyMMddHHmmss） */
    version?: string;
    /** 表单类型，是表单还是单组件（字典项 lf_form_type） */
    type?: string;
    /** 表单组件路径 */
    path?: string;
  }
  /** 流程表单发布表 新增数据结构 */
  export interface AddDTO {
    /** 表单 id */
    formId?: string;
    /** 发布名称 */
    name?: string;
    /** 备注说明 */
    description?: string;
  }
  /** 流程表单发布表 修改数据结构 */
  export interface UpdateDTO {
    /** 主键 */
    id: string;
    /** 发布名称 */
    name?: string;
    /** 状态(0 关闭 1 打开) */
    status?: string;
    /** 备注说明 */
    description?: string;
    /** 数据（每个版本的数据） */
    data?: string;
  }

  /** 流程表单发布表 查询条件 */
  export interface QueryDTO {
    /** 主键 */
    id?: string;
    /** 创建时间 */
    createTimeBegin?: string;
    /** 创建时间 */
    createTimeEnd?: string;
    /** 表单 id */
    formId?: string;
    /** 发布名称 */
    name?: string;
    /** 状态(0 关闭 1 打开) */
    status?: string;
    /** 备注说明 */
    description?: string;
    /** 数据（每个版本的数据） */
    data?: string;
    /** 版本号（yyyyMMddHHmmss） */
    version?: string;
    /** 表单类型，是表单还是单组件（字典项 lf_form_type） */
    type?: string;
    /** 表单组件路径 */
    path?: string;
    /** 显示最新版本是否只显示最新版本 */
    showNewVersion?: boolean | string;
  }

  /** 流程表单发布表 查询体 */
  export interface QueryBody {
    lfFormReleaseQueryDTO: QueryDTO;
    /** 可以继续添加关联表的查询条件 */
  }
}
