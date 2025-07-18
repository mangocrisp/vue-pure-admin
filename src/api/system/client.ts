import useAxios from "@/hooks/core/useAxios";
import { groupBatchIds } from "@/utils";

const request = useAxios();

const URL = "/system/v1/oauth2Client";

export default class SystemClientApi {
  /** 客户端管理列表(分页) */
  static page = (
    queryDTO: SystemClientType.QueryDTO,
    page: BaseApi.SqlQueryParams
  ): HttpReturnPage<SystemClientType.Domain> => {
    return request.get({
      url: `${URL}/page`,
      params: {
        ...queryDTO,
        ...page,
        pageOrder: "update_time desc"
      }
    });
  };

  /** 客户端新增 */
  static add = (
    data: SystemClientType.AddDTO
  ): HttpReturn<SystemClientType.Domain> => {
    return request.post({
      url: `${URL}`,
      data
    });
  };

  /** 客户端编辑 */
  static update = (
    data: SystemClientType.UpdateDTO
  ): HttpReturn<SystemClientType.Domain> => {
    return request.put({
      url: `${URL}`,
      data
    });
  };

  /** 客户端设置密钥 */
  static updatePart = (
    data: SystemClientType.UpdateDTO
  ): HttpReturn<SystemClientType.Domain> => {
    return request.patch({
      url: `${URL}`,
      data
    });
  };

  /** 客户端删除 */
  static remove = (id: string) => {
    return request.delete({
      url: `${URL}/${id}`
    });
  };

  /** 客户端批量删除 */
  static batchRemove = (ids: string[]) => {
    return request.delete({
      url: `${URL}/batch?${groupBatchIds(ids)}`
    });
  };
}
