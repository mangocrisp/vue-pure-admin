import useAxios from "@/hooks/core/useAxios";
import { groupBatchIds } from "@/utils";

const request = useAxios();

const URL = "/system/v1/dictType";

export default class SystemDictTypeApi {
  /** 字典类型列表(分页) */
  static page = (params: any): HttpReturnPage<SystemDictTypeType.DictType> => {
    return request.get({
      url: `${URL}/page`,
      params: {
        ...params,
        pageOrder: "create_time asc"
      }
    });
  };

  /** 字典类型新增 */
  static add = (
    data: SystemDictTypeType.DictTypeAddDTO
  ): HttpReturn<SystemDictTypeType.DictType> => {
    return request.post({
      url: `${URL}`,
      data
    });
  };

  /** 字典类型编辑 */
  static update = (
    data: SystemDictTypeType.DictTypeUpdateDTO
  ): HttpReturn<SystemDictTypeType.DictType> => {
    return request.put({
      url: `${URL}`,
      data
    });
  };

  /** 字典类型删除 */
  static remove = (id: string) => {
    return request.delete({
      url: `${URL}/${id}`
    });
  };

  /** 字典类型批量删除 */
  static batchRemove = (ids: string[]) => {
    return request.delete({
      url: `${URL}/batch?${groupBatchIds(ids)}`
    });
  };
}
