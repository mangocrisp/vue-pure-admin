// 系统管理-权限管理
declare namespace SystemPermissionType {
  export interface Permission extends DefaultParams {
    id: string;
    name: string;
    groupId: string;
    groupName: string;
    menuId: string;
    menuName: string;
    urlPerm: string;
    btnPerm: string;
    roles: SystemRoleType.Role[];
  }

  /** 新增对象 */
  export interface PermissionAddDTO {
    id?: string;
    name: string;
    menuId: string;
    urlPerm: string;
    btnPerm: string;
  }

  /** 修改对象 */
  export interface PermissionUpdateDTO {
    id: string;
    name: string;
    menuId: string;
    urlPerm: string;
    btnPerm: string;
  }

  export interface PermissionEditFormDTO {
    formInline: PermissionAddDTO | PermissionUpdateDTO;
  }
}
