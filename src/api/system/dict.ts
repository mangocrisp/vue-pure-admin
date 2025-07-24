import useAxios from "@/hooks/core/useAxios";
import { groupBatchIds } from "@/utils";

const request = useAxios();

const URL = "/system/v1/dict";

export default class SystemDictApi {
  /** 字典信息列表(分页) */
  static page = (params: any): HttpReturnPage<SystemDictType.Dict> => {
    return request.get({
      url: `${URL}/page`,
      params: {
        ...params,
        pageOrder: "sort asc"
      }
    });
  };

  /** 字典信息新增 */
  static add = (
    data: SystemDictType.DictAddDTO
  ): HttpReturn<SystemDictType.Dict> => {
    return request.post({
      url: `${URL}`,
      data
    });
  };

  /** 字典信息编辑 */
  static update = (
    data: SystemDictType.DictUpdateDTO
  ): HttpReturn<SystemDictType.Dict> => {
    return request.put({
      url: `${URL}`,
      data
    });
  };

  /** 字典信息删除 */
  static remove = (id: string) => {
    return request.delete({
      url: `${URL}/${id}`
    });
  };

  /** 字典信息批量删除 */
  static batchRemove = (ids: string[]) => {
    return request.delete({
      url: `${URL}/batch?${groupBatchIds(ids)}`
    });
  };

  /** 字典信息批量获取 */
  static caches = (dicts: string[]): HttpReturn<SystemDictType.DictsType> => {
    return request.post({
      url: `${URL}/cache`,
      data: dicts
    });
  };

  /** 字典信息获取 */
  static cache = (key: string): HttpReturn<SystemDictType.Dict[]> => {
    return request.get({
      url: `${URL}/cache/${key}`,
      params: {
        status: 1
      }
    });
  };
}
