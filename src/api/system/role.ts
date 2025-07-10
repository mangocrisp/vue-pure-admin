import { groupBatchIds } from "@/utils";
import useAxios from "@/hooks/core/useAxios";

const request = useAxios();

const URL = "/system/v1/role";

export default class SystemRoleApi {
  /** 角色管理列表(分页) */
  static page = (params: any): HttpReturnPage<SystemRoleType.Role> => {
    return request.get({
      url: `${URL}/page`,
      params: {
        ...params,
        pageOrder: "sort asc,update_time desc"
      }
    });
  };

  /** 角色管理列表 */
  static list = (): HttpReturn<SystemRoleType.Role[]> => {
    return request.get({
      url: `${URL}/list`
    });
  };

  /**
   * 角色管理列表
   * 如果不是 ROOT 或者 ADMIN 角色，就需要过滤只能查询出自己拥有的角色
   */
  static listFilterRole = (): HttpReturn<SystemRoleType.Role[]> => {
    return request.get({
      url: `${URL}/listFilterRole`
    });
  };

  /** 角色新增 */
  static add = (
    data: SystemRoleType.RoleEditFormDTO
  ): HttpReturn<SystemRoleType.Role> => {
    return request.post({
      url: `${URL}`,
      data: data.formInline
    });
  };

  /** 角色编辑 */
  static update = (
    data: SystemRoleType.RoleEditFormDTO
  ): HttpReturn<SystemRoleType.Role> => {
    return request.put({
      url: `${URL}`,
      data: data.formInline
    });
  };

  /**
   * 修改状态
   * @param data 数据
   * @returns 修改成功后的结果
   */
  static updateStatus = (
    data: SystemRoleType.RoleUpdateDTO
  ): HttpReturn<SystemRoleType.Role> => {
    return request.put({
      url: `${URL}`,
      data
    });
  };

  /** 角色删除 */
  static remove = (id: string) => {
    return request.delete<any>({
      url: `${URL}/${id}`
    });
  };

  /** 角色批量删除 */
  static batchRemove = (ids: string[]) => {
    return request.delete<any>({
      url: `${URL}/batch?${groupBatchIds(ids)}`
    });
  };
}
