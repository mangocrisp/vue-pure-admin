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
  }

  export interface PermissionPageReturn {
    (params: any): HttpReturnPage<Permission>;
  }
  export interface PermissionListReturn {
    (params?: any): HttpReturn<Permission[]>;
  }

  interface PermissionListGroupWithMenu {
    groupId: string;
    groupName: string;
    menuId: string;
    menuName: string;
    permissionVOS: Permission[];
  }

  export interface PermissionListGroupWithMenuReturn {
    (): HttpReturn<PermissionListGroupWithMenu[]>;
  }

  export interface BatchSave {
    (
      params: OmitDefaultParams<Permission>[] | [{ menuId: string }]
    ): HttpReturn<string>;
  }
}
