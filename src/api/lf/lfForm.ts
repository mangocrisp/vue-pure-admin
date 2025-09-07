import useAxios from "@/hooks/core/useAxios";
import { groupBatchIds } from "@/utils";

/**异步请求 */
const request = useAxios();

/**模块路径*/
const modulePath = "/lf";

/**请求对接的接口 */
const URL = `${modulePath}/v1/form`;

export default class LfFormApi {
  /**
   * 发布表单
   * @param data 新增数据
   * @returns 新增后的数据
   */
  static publish = (
    data: LfFormReleaseType.AddDTO
  ): HttpReturn<LfFormReleaseType.Domain> => {
    return request.post({
      url: `${URL}/release`,
      data
    });
  };

  /**
   * 查看发布表单列表(分页)
   * @param params 查询参数
   * @returns 分页
   */
  static publishList = (
    queryDto: LfFormReleaseType.QueryDTO,
    pageParams: BaseApi.SqlPageParams
  ): HttpReturnPage<LfFormReleaseType.Domain> => {
    return request.post({
      url: `${URL}/release/publishList`,
      data: queryDto,
      params: {
        ...pageParams,
        pageOrder: "update_time desc"
      }
    });
  };

  /**
   * 发布表单详情
   * @param id 查询主键
   * @returns 数据详情
   */
  static publishDetail = (id: string): HttpReturn<LfFormReleaseType.Domain> => {
    return request.get({
      url: `${URL}/release/${id}`
    });
  };

  /**
   * 参数管理列表(分页)
   * @param params 查询参数
   * @returns 分页
   */
  static page = (
    queryDto: LfFormType.QueryDTO,
    pageParams: BaseApi.SqlPageParams
  ): HttpReturnPage<LfFormType.Domain> => {
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
  static total = (queryBody: LfFormType.QueryBody): HttpReturn<number> => {
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
  static detail = (id: string): HttpReturn<LfFormType.Domain> => {
    return request.get({
      url: `${URL}/${id}`
    });
  };

  /**
   * 新增
   * @param data 新增数据
   * @returns 新增后的数据
   */
  static add = (data: LfFormType.AddDTO): HttpReturn<LfFormType.Domain> => {
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
    data: LfFormType.UpdateDTO
  ): HttpReturn<LfFormType.Domain> => {
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
