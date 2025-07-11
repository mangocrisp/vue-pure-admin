/** 部门管理 */
declare namespace SystemDeptType {
  export interface Dept extends DefaultParams {
    /** id */
    id: string;
    /** 部门，组织机构代码 */
    code: string;
    /** 全称 */
    fullName: string;
    /** 部门名称 */
    name: string;
    /** 上级部门 */
    pid: string;
    /** 所有的父 id（可以多级） */
    pidAll: string;
    /** 备注 */
    remark: string;
    /** 排序 */
    sort: number;
    /** 部门类型 */
    type: string;
    /** 是否按数据权限过滤展示:默认false */
    includeAll?: boolean;
  }

  export interface DeptTree extends Dept {
    /** 子集 */
    children: Dept[];
    /** 是否有子集 */
    hasChildren: boolean;
  }

  /** 新增对象*/
  export interface DeptAddDTO {
    id?: string;
    code: string;
    fullName: string;
    name: string;
    pid: string;
    pidAll: string | string[];
    remark: string;
    sort: number;
    type?: string;
  }

  /** 修改对象*/
  export interface DeptUpdateDTO {
    id: string;
    code?: string;
    fullName?: string;
    name?: string;
    pid: string;
    pidAll: string | string[];
    remark?: string;
    sort?: number;
    type?: string;
  }

  /** 查询体 DTO */
  export interface DeptQueryDto {
    name: string;
    code: string;
  }

  /** 查询体 */
  export interface DeptQueryBody {
    queryDto: DeptQueryDto;
  }

  /** 新增修改表单属性 */
  export interface DeptEditFormDTO {
    formInline: DeptAddDTO | DeptUpdateDTO;
  }
}
