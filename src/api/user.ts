import { http } from "@/utils/http";
import { groupBatchIds } from "@/utils";
import useAxios from "@/hooks/core/useAxios";

const request = useAxios();

const URL = "/system/v1/user";

export default class User {
  /** 用户信息 */
  static myInfo: SystemUserType.MyInfo = () => {
    return request.get({
      url: `${URL}/myInfo`
    });
  };

  /** 更多用户信息 */
  static moreInfo: SystemUserType.MoreInfo = id => {
    return request.get({
      url: `${URL}/${id}`
    });
  };

  /** 用户管理列表 */
  static page: SystemUserType.UserListReturn = params => {
    return request.get({
      url: `${URL}/page`,
      params: {
        ...params,
        pageOrder: "update_time desc"
      }
    });
  };

  /** 用户新增 */
  static add: SystemUserType.Add = data => {
    return request.post({
      url: `${URL}`,
      data
    });
  };

  /** 用户编辑 */
  static update: SystemUserType.Update = data => {
    return request.put({
      url: `${URL}`,
      data
    });
  };

  /** 用户编辑(不需要传递id, 安全) */
  static patchMyInfo: SystemUserType.PatchMyInfo = data => {
    return request.patch({
      url: `${URL}/myInfo`,
      data
    });
  };

  /** 用户编辑头像 */
  static updatePart: SystemUserType.UpdatePart = data => {
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
  static editPassword: SystemUserType.EditPassword = params => {
    return request.patch({
      url: `${URL}/password`,
      params
    });
  };

  /** 用户与角色的关联列表 */
  static userRoleList: SystemUserType.UserRoleReturn = userId => {
    return request.get({
      url: `${URL}Role/list`,
      params: {
        userId
      }
    });
  };

  /** 保存用户与角色的关联 */
  static userRoleBatch: SystemUserType.UserRoleBatch = userRoles => {
    return request.post({
      url: `${URL}Role/batch`,
      data: userRoles
    });
  };

  /** 重置用户密码 */
  static resetPassword = (userIds: string[]) => {
    return request.patch({
      url: `${URL}/passwd`,
      data: userIds
    });
  };

  /** 在线用户列表 */
  static online: SystemUserType.UserOnlineReturn = params => {
    return request.get({
      url: `${URL}/online/page`,
      params
    });
  };

  /** 强制下线用户 */
  static forceBatch: SystemUserType.forceBatch = data => {
    return request.put({
      url: `${URL}/forceAll`,
      data
    });
  };
}

export type UserResult = {
  success: boolean;
  data: {
    /** 头像 */
    avatar: string;
    /** 用户名 */
    username: string;
    /** 昵称 */
    nickname: string;
    /** 当前登录用户的角色 */
    roles: Array<string>;
    /** 按钮级别权限 */
    permissions: Array<string>;
    /** `token` */
    accessToken: string;
    /** 用于调用刷新`accessToken`的接口时所需的`token` */
    refreshToken: string;
    /** `accessToken`的过期时间（格式'xxxx/xx/xx xx:xx:xx'） */
    expires: Date;
  };
};

export type RefreshTokenResult = {
  success: boolean;
  data: {
    /** `token` */
    accessToken: string;
    /** 用于调用刷新`accessToken`的接口时所需的`token` */
    refreshToken: string;
    /** `accessToken`的过期时间（格式'xxxx/xx/xx xx:xx:xx'） */
    expires: Date;
  };
};

export type UserInfo = {
  /** 头像 */
  avatar: string;
  /** 用户名 */
  username: string;
  /** 昵称 */
  nickname: string;
  /** 邮箱 */
  email: string;
  /** 联系电话 */
  phone: string;
  /** 简介 */
  description: string;
};

export type UserInfoResult = {
  success: boolean;
  data: UserInfo;
};

type ResultTable = {
  success: boolean;
  data?: {
    /** 列表数据 */
    list: Array<any>;
    /** 总条目数 */
    total?: number;
    /** 每页显示条目个数 */
    pageSize?: number;
    /** 当前页数 */
    currentPage?: number;
  };
};

/** 登录 */
export const getLogin = (data?: object) => {
  return http.request<UserResult>("post", "/login", { data });
};

/** 刷新`token` */
export const refreshTokenApi = (data?: object) => {
  return http.request<RefreshTokenResult>("post", "/refresh-token", { data });
};

/** 账户设置-个人信息 */
export const getMine = (data?: object) => {
  return http.request<UserInfoResult>("get", "/mine", { data });
};

/** 账户设置-个人安全日志 */
export const getMineLogs = (data?: object) => {
  return http.request<ResultTable>("get", "/mine-logs", { data });
};
