declare namespace SystemRoleMenuType {
  export interface RoleMenu {
    checked: number;
    menuId: string;
    roleId: string;
  }
  export interface RoleMenuVO {
    code: string;
    id: string;
    menus: SystemMenuType.Menu[];
    name: string;
    sort: number;
    status: number;
  }
}
