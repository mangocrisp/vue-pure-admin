/** 系统角色管理 */
declare namespace SystemRoleType {
  export interface Role extends DefaultParams {
    id: string;
    name: string;
    code: string;
    sort: number;
    status: 1 | 0;
    /** 是否由当前用户创建 */
    isCreateByLoginUser: string;
  }

  /** 新增对象*/
  export interface RoleAddDTO {
    id?: string;
    name: string;
    code: string;
    sort: number;
  }

  /** 修改对象*/
  export interface RoleUpdateDTO {
    id: string;
    name: string;
    code: string;
    sort: number;
    status?: 1 | 0;
  }

  /** 查询体 DTO */
  export interface RoleQueryDto {
    name: string;
    code: string;
    status: 1 | 0;
  }

  /** 查询体 */
  export interface RoleQueryBody {
    queryDto: RoleQueryDto;
  }

  /** 新增修改表单属性 */
  export interface RoleEditFormDTO {
    formInline: RoleAddDTO | RoleUpdateDTO;
  }
}
