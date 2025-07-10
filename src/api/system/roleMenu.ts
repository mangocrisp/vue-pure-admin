import useAxios from "@/hooks/core/useAxios";

const request = useAxios();

const URL = "/system/v1/roleMenu";

export default class SystemRoleMenuApi {
  /** 与角色关联的菜单列表 */
  static roleMenuList = (params: {
    roleId?: string;
    menuId?: string;
  }): HttpReturn<SystemRoleMenuType.RoleMenu[]> => {
    return request.get({
      url: `${URL}/list`,
      params: {
        ...params,
        checked: 1
      }
    });
  };

  /** 与菜单关联的角色列表 */
  static roleMenuListVO = (
    menuId?: string
  ): HttpReturn<SystemRoleMenuType.RoleMenuVO[]> => {
    return request.get({
      url: `${URL}/listVO`,
      params: {
        menuId,
        checked: 1
      }
    });
  };

  /** 保存角色与菜单的关联 */
  static roleMenuBatch = (
    roleMenus: SystemRoleMenuType.RoleMenu[]
  ): HttpReturn<string> => {
    return request.post({
      url: `${URL}/batch?primaryBy=1`,
      data: roleMenus
    });
  };
}
