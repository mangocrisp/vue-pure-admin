// 系统模块-鉴权管理
declare namespace AuthType {
  interface LoginParams {
    password: string;
    username: string;
    captcha_code: string;
    captcha_uuid: string;
    grant_type: "password" | "gx_cloud";
    scope: "all";
  }

  interface LoginReturn {
    access_token: string;
    authenticationMethod: string;
    expires_in: number;
    jti: string;
    refresh_token: string;
    scope: "all";
    token_type: "bearer";
    userId: number;
    username: string;
  }

  export interface Login {
    (params: LoginParams): HttpReturn<LoginReturn>;
  }
}

// 系统管理-菜单管理
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

  export interface MenuListReturn {
    (params: Partial<Menu> & { permCheckId?: string }): HttpReturn<Menu[]>;
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

  export interface RouterReturn {
    (): HttpReturn<Router[]>;
  }
}

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

// 权限组
declare namespace SystemPermissionGroupType {
  interface PermissionGroup {
    createTime: string;
    createUser: string;
    id: string;
    name: string;
    updateTime: string;
    updateUser: string;
  }

  interface PermissionGroupList {
    (): HttpReturn<PermissionGroup[]>;
  }

  interface PermissionGroupAdd {
    (params: Pick<PermissionGroup, "name">): HttpReturn<PermissionGroup>;
  }

  interface PermissionGroupUpdate {
    (params: Pick<PermissionGroup, "name" | "id">): HttpReturn<PermissionGroup>;
  }
}

// 系统管理-角色管理
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

  export type SearchFormType = Pick<
    Role,
    "name" | "code" | "status" | "isCreateByLoginUser"
  >;

  export interface RolePageReturn {
    (params: any): HttpReturnPage<Role>;
  }

  export interface RoleListReturn {
    (): HttpReturn<Role[]>;
  }

  export type AddRoleParams = OmitDefaultParams<Role, "id">;

  export type UpdateRoleParams = OmitDefaultParams<Role>;

  export interface AddRoleReturn {
    (params: AddRoleParams): HttpReturn<Role>;
  }

  export interface UpdateRoleReturn {
    (params: UpdateRoleParams): HttpReturn<Role>;
  }

  export interface RoleMenu {
    checked: number;
    menuId: string;
    roleId: string;
  }
  export interface RoleMenuReturn {
    (params: { roleId?: string; menuId?: string }): HttpReturn<RoleMenu[]>;
  }

  export interface RoleMenuVO {
    code: string;
    id: string;
    menus: SystemMenuType.Menu[];
    name: string;
    sort: number;
    status: number;
  }

  export interface RoleMenuVOReturn {
    (menuId?: string): HttpReturn<RoleMenuVO[]>;
  }

  export interface RoleMenuBatchReturn {
    (roleMenus: RoleMenu[]): HttpReturn<string>;
  }

  export interface RolePerm {
    permissionId: string;
    roleId: string;
  }

  export interface RolePermReturn {
    (params: Partial<RolePerm>): HttpReturn<Required<RolePerm>[]>;
  }

  export interface RolePermBatchReturn {
    (
      rolePerms: RolePerm[] | [{ roleId: string }] | [{ permissionId: string }],
      primaryBy?: 1 | 2
    ): HttpReturn;
  }
}

// 系统管理-用户管理
declare namespace SystemUserType {
  export interface User extends DefaultParams {
    id: string;
    avatar: string;
    loginIp: string;
    email: string;
    gender: string;
    nickname: string;
    password?: string;
    phone: string;
    realName: string;
    userType: string;
    username: string;
    status: NumStatus;
  }

  interface UserListSearch {
    username: string;
    phone: string;
    gender: string;
    userType: string;
    status: NumStatus;
    isCreateByLoginUser: string;
  }

  export interface UserListReturn {
    (params: Partial<UserListSearch>): HttpReturnPage<User>;
  }

  type FormType = MultiplePartial<
    OmitDefaultParams<User>,
    "id" | "avatar" | "loginIp"
  > & {
    userRoles: string[];
    userDepts: string[];
  };

  export interface Add {
    (params: FormType): HttpReturn<User>;
  }

  export interface Update {
    (params: FormType): HttpReturn<User>;
  }

  export interface UpdatePart {
    (
      params: Partial<OmitDefaultParams<User, "loginIp">> & { id: string }
    ): HttpReturn<User>;
  }

  export interface PatchMyInfo {
    (params: Partial<OmitDefaultParams<User>>): HttpReturn<User>;
  }

  export interface EditPassword {
    (params: { now: string; old: string }): HttpReturn<string>;
  }

  export interface UserRole {
    userId: string;
    roleId: string;
  }

  export interface UserRoleReturn {
    (userId: string): HttpReturn<UserRole[]>;
  }

  export interface UserRoleBatch {
    (userRoles: UserRole[]): HttpReturn<string>;
  }

  export interface UserOnline {
    clientId: string;
    exp: number;
    expTime: string;
    jti: string;
    ip: string;
    loginTime: string;
    userId: number;
    updateTime: string;
  }

  export interface UserOnlineReturn {
    (params: any): HttpReturnPage<UserOnline>;
  }

  export interface forceBatch {
    (params: string[]): HttpReturn<string>;
  }

  export interface MyInfo {
    (): HttpReturn<{
      avatar: string;
      email: string;
      id: string;
      nickname: string;
      roles: string[];
      status: number;
      userType: string;
      username: string;
    }>;
  }

  export interface MoreInfo {
    (id: string): HttpReturn<
      {
        avatar: string;
        email: string;
        gender: string;
        id: string;
        nickname: string;
        phone: string;
        realName: string;
        status: number;
        userType: string;
        username: string;
      } & DefaultParams
    >;
  }
}

// 系统管理-字典类型管理
declare namespace SystemDictType {
  export interface DictType extends DefaultParams {
    id: string;
    title: string;
    dictCode: string;
    remark: string;
    status: 1 | 0;
  }

  export interface DictPageReturn {
    (params: any): HttpReturnPage<DictType>;
  }

  export interface Add {
    (params: OmitDefaultParams<DictType, "id">): HttpReturn<DictType>;
  }

  export interface Update {
    (params: OmitDefaultParams<DictType>): HttpReturn<DictType>;
  }
}

// 系统管理-字典管理
declare namespace SystemDict {
  type statusClass = "" | "success" | "info" | "warning" | "danger";

  export interface Dict<T = string> extends DefaultParams {
    id: string;
    dictCode: T;
    dictKey: string;
    dictVal: string;
    cssClass: string;
    statusClass: statusClass;
    sort: number;
    remark: string;
    status: NumStatus;
  }

  export interface DictPageReturn {
    (params: any): HttpReturnPage<Dict>;
  }

  export interface Add {
    (params: OmitDefaultParams<Dict, "id">): HttpReturn<Dict>;
  }

  export interface Update {
    (params: OmitDefaultParams<Dict>): HttpReturn<Dict>;
  }
}

// 系统管理-参数管理
declare namespace SystemConfigType {
  export interface Config extends DefaultParams {
    id: string;
    title: string;
    type: string;
    paramsKey: string;
    paramsVal: string | number | boolean;
    remark: string;
    status: 1 | 0;
  }

  export interface Page {
    (params: any): HttpReturnPage<Config>;
  }

  export interface Add {
    (params: OmitDefaultParams<Config, "id">): HttpReturn<Config>;
  }

  export interface Update {
    (params: OmitDefaultParams<Config>): HttpReturn<Config>;
  }

  export interface Get {
    (paramsKey: string): HttpReturn<Config>;
  }
}

// 系统管理-客户端管理
declare namespace SystemClientType {
  export interface Client {
    id: string;
    accessTokenValidity: number;
    authorizedGrantTypes: string;
    autoApprove: string;
    clientId: string;
    clientSecret?: string;
    refreshTokenValidity: number;
    scope: string;
    webServerRedirectUri: string;
    isDeleted: NumStatus;
    updateTime: string;
  }

  export interface Page {
    (params: any): HttpReturnPage<Client>;
  }

  export interface Add {
    (
      params: Omit<Client, "id" | "isDeleted" | "updateTime">
    ): HttpReturn<Client>;
  }

  export interface Update {
    (params: Omit<Client, "isDeleted" | "updateTime">): HttpReturn<Client>;
  }

  export interface updatePart {
    (
      params: Partial<Omit<Client, "isDeleted" | "updateTime">> & { id: string }
    ): HttpReturn<Client>;
  }
}

declare namespace SystemAdminLogType {
  export interface AdminLog extends DefaultParams {
    client: string;
    code: string;
    description: string;
    id: string;
    ip: string;
    method: string;
    module: string;
    params: string;
    result: string;
    tenantId: string;
    title: string;
    type: string;
    url: string;
    username: string;
  }

  export interface Page {
    (params: any): HttpReturnPage<AdminLog[]>;
  }

  export interface Clear {
    (): HttpReturn<string>;
  }
}

declare namespace SystemTenantType {
  export interface Tenant extends DefaultParams {
    id: string /** 主键 */;
    icon: string /** 图标 */;
    tenantId: string /** 租户 id */;
    tenantManager: string /** 租户管理员 */;
    tenantName: string /** 租户名 */;
    remark: string /** 备注 */;
    status: 1 | 0 /** 状态 */;
  }

  export interface Page {
    (params: any): HttpReturnPage<Tenant>;
  }

  export interface List {
    (params: any): HttpReturn<Tenant[]>;
  }

  export interface Add {
    (params: OmitDefaultParams<Tenant, "id">): HttpReturn<Tenant>;
  }

  export interface Update {
    (params: OmitDefaultParams<Tenant>): HttpReturn<Tenant>;
  }

  export interface CurrentList {
    (): HttpReturn<Tenant[]>;
  }

  export interface UserAndTenant {
    tenantId: string;
    userId: string;
  }

  export interface loadUserHaveTenant {
    (userId: string): HttpReturn<UserAndTenant[]>;
  }

  export interface Current {
    (): HttpReturn<Tenant>;
  }
}
