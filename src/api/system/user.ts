import useAxios from "@/hooks/core/useAxios";
import { groupBatchIds } from "@/utils";

const request = useAxios();

const URL = "/system/v1/user";

export default class SystemUserApi {
  /**
   * 查询用户分页
   * @param params 查询参数
   * @returns 分页
   */
  static page = (params: any): HttpReturnPage<SystemUserType.User> => {
    return request.get({
      url: `${URL}/page`,
      params: {
        ...params,
        pageOrder: "update_time desc"
      }
    });
  };

  /**
   * 用户详情
   * @param id 用户 id
   * @returns 用户信息
   */
  static detail = (id: string): HttpReturn<SystemUserType.User> => {
    return request.get({
      url: `${URL}/${id}`
    });
  };

  /** 用户新增 */
  static add = (data: SystemUserType.UserAddDTO) => {
    return request.post({
      url: `${URL}`,
      data
    });
  };

  /** 用户编辑 */
  static update = (data: SystemUserType.UserUpdateDTO) => {
    return request.put({
      url: `${URL}`,
      data
    });
  };

  /** 用户编辑(不需要传递id, 安全) */
  static patchMyInfo = (
    data: SystemUserType.MyInfo
  ): HttpReturn<SystemUserType.User> => {
    return request.patch({
      url: `${URL}/myInfo`,
      data
    });
  };

  /** 用户编辑头像 */
  static updatePart = (
    data: SystemUserType.UserAvatarDTO
  ): HttpReturn<SystemUserType.User> => {
    return request.patch({
      url: `${URL}`,
      data
    });
  };

  /** 用户删除 */
  static remove = (id: string) => {
    return request.delete({
      url: `${URL}/${id}`
    });
  };

  /** 用户批量删除 */
  static batchRemove = (ids: string[]) => {
    return request.delete({
      url: `${URL}/batch?${groupBatchIds(ids)}`
    });
  };

  /** 用户修改密码 */
  static editPassword = (params: {
    now: string;
    old: string;
  }): HttpReturn<string> => {
    return request.patch({
      url: `${URL}/password`,
      params
    });
  };

  /** 重置用户密码 */
  static resetPassword = (userIds: string[]) => {
    return request.patch({
      url: `${URL}/passwd`,
      data: userIds
    });
  };
  /** 用户信息 */
  static myInfo = (): HttpReturn<SystemUserType.MyInfo> => {
    return request.get({
      url: `${URL}/myInfo`
    });
  };

  /** 更多用户信息 */
  static moreInfo = (
    id: string
  ): HttpReturn<SystemUserType.MoreInfo & DefaultParams> => {
    return request.get({
      url: `${URL}/${id}`
    });
  };

  /** 用户与角色的关联列表 */
  static userRoleList = (
    userId: string
  ): HttpReturn<SystemUserType.UserRole[]> => {
    return request.get({
      url: `${URL}Role/list`,
      params: {
        userId
      }
    });
  };

  /** 保存用户与角色的关联 */
  static userRoleBatch = (
    userRoles: SystemUserType.UserRole[]
  ): HttpReturn<string> => {
    return request.post({
      url: `${URL}Role/batch`,
      data: userRoles
    });
  };

  /** 在线用户列表 */
  static online = (params: any): HttpReturnPage<SystemUserType.OnlineUser> => {
    return request.get({
      url: `${URL}/online/page`,
      params
    });
  };

  /** 强制下线用户 */
  static forceBatch = (data: string[]): HttpReturn<string> => {
    return request.put({
      url: `${URL}/forceAll`,
      data
    });
  };
}
