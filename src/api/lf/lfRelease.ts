import useAxios from "@/hooks/core/useAxios";
import { groupBatchIds } from "@/utils";

/**异步请求 */
const request = useAxios();

/**模块路径*/
const modulePath = "/lf";

/**请求对接的接口 */
const URL = `${modulePath}/v1/release`;

export default class LfReleaseApi {
  /**
   * 发布流程
   * @param data 新增数据
   * @returns 新增后的数据
   */
  static publish = (
    data: LfReleaseType.AddDTO
  ): HttpReturn<LfReleaseType.Domain> => {
    return request.post({
      url: `${URL}`,
      data
    });
  };

  /**
   * 查看发布流程列表(分页)
   * @param params 查询参数
   * @returns 分页
   */
  static publishList = (
    queryDto: LfReleaseType.QueryDTO,
    pageParams: BaseApi.SqlPageParams
  ): HttpReturnPage<LfReleaseType.Domain> => {
    return request.post({
      url: `${URL}/publishList`,
      data: queryDto,
      params: {
        ...pageParams,
        pageOrder: "lf_release.update_time desc"
      }
    });
  };

  /**
   * 查询单个详情
   * @param id 查询主键
   * @returns 数据详情
   */
  static detail = (id: string): HttpReturn<LfReleaseType.Domain> => {
    return request.get({
      url: `${URL}/${id}`
    });
  };

  /**
   * 更新
   * @param data 更新的数据
   * @returns 更新后的数据
   */
  static update = (
    data: LfReleaseType.UpdateDTO
  ): HttpReturn<LfReleaseType.Domain> => {
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

  /**
   * 批量删除
   * @param ids 批量删除的 id 集合
   * @returns 批量删除的结果
   */
  static batchRemove = (ids: string[]) => {
    return request.delete({
      url: `${URL}/batch?${groupBatchIds(ids)}`
    });
  };
}
