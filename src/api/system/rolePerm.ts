import useAxios from "@/hooks/core/useAxios";

const request = useAxios();

const URL = "/system/v1/rolePerm";

export default class SystemRolePermApi {
  /** 与权限关联的角色列表 */
  static rolePermList = (
    params: Partial<SystemRolePermType.RolePerm>
  ): HttpReturn<SystemRolePermType.RolePerm[]> => {
    return request.get({
      url: `${URL}/list`,
      params
    });
  };

  /** 保存角色与权限的关联 */
  static rolePermBatch = (
    rolePerms:
      | SystemRolePermType.RolePerm[]
      | [{ roleId: string }]
      | [{ permissionId: string }],
    primaryBy = 1
  ) => {
    return request.post({
      url: `${URL}/batch?primaryBy=${primaryBy}`,
      data: rolePerms
    });
  };
}
