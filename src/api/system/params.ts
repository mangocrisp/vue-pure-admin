import useAxios from "@/hooks/core/useAxios";
import { groupBatchIds } from "@/utils";

const request = useAxios();

const URL = "/system/v1/params";

export default class SystemParamsApi {
  /** 参数管理列表(分页) */
  static page = (params: any): HttpReturnPage<SystemParamsType.Params> => {
    return request.get({
      url: `${URL}/page`,
      params: {
        ...params,
        pageOrder: "create_time asc"
      }
    });
  };

  /** 参数新增 */
  static add = (
    data: SystemParamsType.ParamsAddDTO
  ): HttpReturn<SystemParamsType.Params> => {
    return request.post({
      url: `${URL}`,
      data
    });
  };

  /** 参数编辑 */
  static update = (
    data: SystemParamsType.ParamsUpdateDTO
  ): HttpReturn<SystemParamsType.Params> => {
    return request.put({
      url: `${URL}`,
      data
    });
  };

  /** 参数删除 */
  static remove = (id: string) => {
    return request.delete({
      url: `${URL}/${id}`
    });
  };

  /** 参数批量删除 */
  static batchRemove = (ids: string[]) => {
    return request.delete({
      url: `${URL}/batch?${groupBatchIds(ids)}`
    });
  };

  /**
   * @description: 获取系统参数(单)
   * @param paramsKey
   * @return
   */
  static get = (paramsKey: string): HttpReturn<SystemParamsType.Params> => {
    return request.get<Res<any>>({
      url: `${URL}/cache/${paramsKey}`
    });
  };

  /**
   * @description: 获取系统参数(多)
   * @param paramsKeys
   * @return
   */
  static batchGet = (paramsKeys: string[]) => {
    return request.post({
      url: `${URL}/cache`,
      data: paramsKeys
    });
  };
}
