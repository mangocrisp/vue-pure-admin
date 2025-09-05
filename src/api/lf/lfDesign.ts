import useAxios from "@/hooks/core/useAxios";
import { groupBatchIds } from "@/utils";

/**异步请求 */
const request = useAxios();

/**模块路径*/
const modulePath = "/lf";

/**请求对接的接口 */
const URL = `${modulePath}/v1/design`;

export default class LfDesignApi {
  /**
   * 参数管理列表(分页)
   * @param params 查询参数
   * @returns 分页
   */
  static page = (
    queryDto: LfDesignType.QueryDTO,
    pageParams: BaseApi.SqlPageParams
  ): HttpReturnPage<LfDesignType.Domain> => {
    return request.get({
      url: `${URL}/page`,
      params: {
        ...queryDto,
        ...pageParams,
        pageOrder: "update_time desc"
      }
    });
  };

  /**
   * 查询总数
   * @param params 查询参数
   * @returns 总数
   */
  static total = (queryBody: LfDesignType.QueryBody): HttpReturn<number> => {
    return request.post({
      url: `${URL}/total`,
      data: queryBody
    });
  };

  /**
   * 查询单个详情
   * @param id 查询主键
   * @returns 数据详情
   */
  static detail = (id: string): HttpReturn<LfDesignType.Domain> => {
    return request.get({
      url: `${URL}/${id}`
    });
  };

  /**
   * 新增
   * @param data 新增数据
   * @returns 新增后的数据
   */
  static add = (data: LfDesignType.AddDTO): HttpReturn<LfDesignType.Domain> => {
    return request.post({
      url: `${URL}`,
      data
    });
  };

  /**
   * 更新
   * @param data 更新的数据
   * @returns 更新后的数据
   */
  static update = (
    data: LfDesignType.UpdateDTO
  ): HttpReturn<LfDesignType.Domain> => {
    return request.put({
      url: `${URL}`,
      data
    });
  };

  /**
   * 删除单个
   * @param id 需要删除的数据的主键 id
   * @returns 删除的结果
   */
  static remove = (id: string): HttpReturn<any> => {
    return request.delete({
      url: `${URL}/${id}`
    });
  };

  /** 流程批量 */
  static batchRemove = (ids: string[]) => {
    return request.delete({
      url: `${URL}/batch?${groupBatchIds(ids)}`
    });
  };
}
