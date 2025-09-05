/** 流程发布表 类型定义 */
declare namespace LfReleaseType {
  /** 流程发布表 接口数据结构 */
  export interface Domain extends DefaultParams {
    /** 主键 */
    id: string;
    /** 流程图 id */
    designId?: string;
    /** 发布名称 */
    name?: string;
    /** 状态(0 关闭 1 打开) */
    status?: string | number;
    /** 备注说明 */
    description?: string;
    /** 数据（每个版本的数据） */
    data?: string;
    /** 版本号（yyyyMMddHHmmss） */
    version?: string;
    /** 流程类型（字典项 lf_process_type） */
    type?: string;
    /** 图标 */
    icon?: string;
  }
  /** 流程发布表 新增数据结构 */
  export interface AddDTO {
    /** 流程图 id */
    designId?: string;
    /** 发布名称 */
    name?: string;
    /** 备注说明 */
    description?: string;
    /** 图标 */
    icon?: string;
  }
  /** 流程发布表 修改数据结构 */
  export interface UpdateDTO {
    /** 主键 */
    id: string;
    /** 流程图 id */
    designId?: string;
    /** 发布名称 */
    name?: string;
    /** 状态(0 关闭 1 打开) */
    status?: string | number;
    /** 备注说明 */
    description?: string;
    /** 数据（每个版本的数据） */
    data?: string;
    /** 版本号（yyyyMMddHHmmss） */
    version?: string;
    /** 流程类型（字典项 lf_process_type） */
    type?: string;
    /** 图标 */
    icon?: string;
  }

  /** 流程发布表 查询条件 */
  export interface QueryDTO {
    /** 主键 */
    id?: string;
    /** 创建时间 */
    createTimeBegin?: string;
    /** 创建时间 */
    createTimeEnd?: string;
    /** 流程图 id */
    designId?: string;
    /** 发布名称 */
    name?: string;
    /** 状态(0 关闭 1 打开) */
    status?: string | number;
    /** 备注说明 */
    description?: string;
    /** 数据（每个版本的数据） */
    data?: string;
    /** 版本号（yyyyMMddHHmmss） */
    version?: string;
    /** 流程类型（字典项 lf_process_type） */
    type?: string;
    /** 显示最新版本是否只显示最新版本 */
    showNewVersion?: boolean | string;
  }

  /** 流程发布表 查询体 */
  export interface QueryBody {
    lfReleaseQueryDTO: QueryDTO;
    /** 可以继续添加关联表的查询条件 */
  }
}
