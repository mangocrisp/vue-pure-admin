/** 系统菜单管理 */
declare namespace SystemMenuType {
  export interface MenuParams {
    parentId: string;
    permCheckId?: string;
  }
  export interface Menu {
    alwaysShow: number;
    component: string;
    hidden: number;
    icon: string;
    id: string;
    isCache: boolean;
    menuType: string;
    name: string;
    parentId: string;
    routeName: string;
    routePath: string;
    sort: number;
    status: 1 | 0;
    updateTime: string;
    hasChildren: boolean;
    checked: number;
    props: string;
    redirect: string;
    isBlank: number;
    children: Menu[];
  }

  interface Router {
    alwaysShow: number;
    children: Router[];
    component: any;
    hidden: number;
    icon: string;
    id: string;
    isBlank: number;
    isCache: number;
    menuType: string;
    name: string;
    parentId: string;
    path: string;
    sort: number;
    title: string;
    permissions: SystemPermissionType.Permission[];
    rolePermissions: SystemPermissionType.Permission[];
    redirect?: string;
    props?: string;
    meta?: any;
  }
}
