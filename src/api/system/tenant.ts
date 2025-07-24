import useAxios from "@/hooks/core/useAxios";
import { groupBatchIds } from "@/utils";

const request = useAxios();

const URL = "/system/v1/tenant";

export default class SystemTenantApi {
  /** 租户管理列表 */
  static page = (
    queryDTO: SystemTenantType.QueryDTO,
    page: BaseApi.SqlQueryParams
  ): HttpReturnPage<SystemTenantType.Domain> => {
    return request.get({
      url: `${URL}/page`,
      params: {
        ...queryDTO,
        ...page,
        pageOrder: "update_time desc"
      }
    });
  };

  /** 租户管理列表 */
  static list = (
    queryDTO: SystemTenantType.QueryDTO,
    page: BaseApi.SqlQueryParams
  ): HttpReturn<SystemTenantType.Domain> => {
    return request.get({
      url: `${URL}/list`,
      params: {
        ...queryDTO,
        ...page,
        pageOrder: "update_time desc"
      }
    });
  };

  /** 租户新增 */
  static add = (
    data: SystemTenantType.AddDTO
  ): HttpReturn<SystemTenantType.Domain> => {
    return request.post({
      url: `${URL}`,
      data
    });
  };

  /** 租户编辑 */
  static update = (
    data: SystemTenantType.UpdateDTO
  ): HttpReturn<SystemTenantType.Domain> => {
    return request.put({
      url: `${URL}`,
      data
    });
  };

  /** 租户删除 */
  static remove = (id: string) => {
    return request.delete({
      url: `${URL}/${id}`
    });
  };

  /** 租户批量删除 */
  static batchRemove = (ids: string[]) => {
    return request.delete({
      url: `${URL}/batch?${groupBatchIds(ids)}`
    });
  };

  /** 获取当前用户的租户 */
  static current = (): HttpReturn<SystemTenantType.Domain> => {
    return request.get({
      url: `${URL}/current`
    });
  };

  /** 获取当前登录用户拥有的租户 */
  static currentList = (): HttpReturn<SystemTenantType.Domain[]> => {
    return request.get({
      url: `${URL}/user`
    });
  };

  /** 登录用户切换当前租户 */
  static changeCurrent = (tenantId: string) => {
    return request.post({
      url: `${URL}/user/${tenantId}`
    });
  };

  /** 获取指定用户拥有的租户 */
  static loadUserHaveTenant = (
    userId: string
  ): HttpReturn<SystemTenantType.UserTenant[]> => {
    return request.get({
      url: `${URL}/user/${userId}`
    });
  };

  /** 为用户分配租户 */
  static loadUserSetTenant = (
    params: SystemTenantType.UserTenant[]
  ): HttpReturn<SystemTenantType.UserTenant[]> => {
    return request.post({
      url: `${URL}/user?primaryBy=1`,
      data: params
    });
  };
}
