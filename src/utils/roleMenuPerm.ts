import { getKeyList } from "@pureadmin/utils";

export enum MenuPermEnum {
  /** 菜单 */
  MENU = "M",
  /** 权限 */
  PERM = "P"
}

/** 角色关联的菜单和权限数据 */
export interface MenuPermData {
  /** 父级 id */
  parentId: string;
  /** id */
  id: string;
  /** 类型 */
  menuType: MenuPermEnum.MENU | MenuPermEnum.PERM;
  /** 名称 */
  title: string;
}

export const generateMenuPermData = (
  menuData: SystemMenuType.Menu[],
  permData: SystemPermissionType.Permission[]
): MenuPermData[] => {
  const menuIds = getKeyList(menuData, "id");
  return makeMenuPermData(
    menuData.filter(item => item.parentId),
    MenuPermEnum.MENU
  ).concat(
    makeMenuPermData(
      permData.filter(item => menuIds.indexOf(item.menuId) >= 0),
      MenuPermEnum.PERM
    )
  );
};
/**
 * 合成需要的菜单数据
 * @param data 菜单数据，权限数据
 * @returns 合成数据
 */
export const makeMenuPermData = (
  data: SystemMenuType.Menu[] | SystemPermissionType.Permission[],
  menuType: MenuPermEnum
): MenuPermData[] => {
  if (!data || data.length === 0) {
    return [];
  }
  return data.map(
    (item: SystemMenuType.Menu | SystemPermissionType.Permission) => {
      return {
        parentId:
          menuType === MenuPermEnum.MENU
            ? (item as SystemMenuType.Menu).parentId
            : (item as SystemPermissionType.Permission).menuId,
        id: item.id,
        menuType: menuType,
        title: item.name
      };
    }
  );
};

/**
 * 合成关联菜单和权限的数据
 * @param roleMenuData 角色和菜单关联数据
 * @param rolePermData 角色和权限关联数据
 * @returns 关联数据
 */
export const generateRoleMenuPermData = (
  roleMenuData: SystemRoleMenuType.RoleMenu[],
  rolePermData: SystemRolePermType.RolePerm[]
): string[] => {
  return roleMenuData
    .map(item => item.menuId)
    .concat(rolePermData.map(item => item.permissionId));
};
