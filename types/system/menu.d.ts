/** 系统菜单管理 */
declare namespace SystemMenuType {
  export interface MenuParams {
    parentId: string;
    permCheckId?: string;
  }
  export interface Menu extends DefaultParams {
    id: string;
    name: string;
    parentId: string;
    alwaysShow: 1 | 0;
    props: string;
    sort: number;
    routeName: string;
    routePath: string;
    component: string;
    redirect: string;
    isCache: 1 | 0;
    menuType: string;
    hidden: 1 | 0;
    status: 1 | 0;
    icon: string;
    isBlank: 1 | 0;
    hasChildren: boolean;
    checked: 1 | 0;
    children: Menu[];
  }

  interface Router {
    alwaysShow: 1 | 0;
    children: Router[];
    component: any;
    hidden: 1 | 0;
    icon: string;
    id: string;
    isBlank: 1 | 0;
    isCache: 1 | 0;
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

  /** 新增对象*/
  export interface MenuAddDTO {
    id?: string;
    name: string;
    parentId: string;
    alwaysShow: 1 | 0;
    props: string;
    sort: number;
    routeName: string;
    routePath: string;
    component: string;
    redirect: string;
    isCache: 1 | 0;
    menuType: string;
    hidden: 1 | 0;
    status: 1 | 0;
    icon: string;
    isBlank: 1 | 0;
  }

  /** 修改对象*/
  export interface MenuUpdateDTO {
    id: string;
    name: string;
    parentId: string;
    alwaysShow: 1 | 0;
    props: string;
    sort: number;
    routeName: string;
    routePath: string;
    component: string;
    redirect: string;
    isCache: 1 | 0;
    menuType: string;
    hidden: 1 | 0;
    status: 1 | 0;
    icon: string;
    isBlank: 1 | 0;
  }

  /** 查询体 DTO */
  export interface MenuQueryDto {
    name: string;
  }

  /** 查询体 */
  export interface MenuQueryBody {
    queryDto: MenuQueryDto;
  }

  /** 新增修改表单属性 */
  export interface MenuEditFormDTO {
    formInline: MenuAddDTO | MenuUpdateDTO;
  }
}
