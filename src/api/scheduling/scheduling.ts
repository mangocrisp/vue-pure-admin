import useAxios from "@/hooks/core/useAxios";

const request = useAxios();

const URL = "/scheduling/v1/scheduling";

export default class SchedulingApi {
  /**
   * 日志分页查询
   * @param params 查询参数
   * @returns 分页
   */
  static logPage = (
    params: SchedulingType.LogQueryDTO & BaseApi.SqlPageParams
  ): HttpReturnPage<SystemRoleType.Role> => {
    return request.get({
      url: `${URL}/log/page`,
      params: {
        ...params,
        pageOrder: "start_time desc"
      }
    });
  };
  /**
   * 参数管理列表(分页)
   * @param params 查询参数
   * @returns 分页
   */
  static taskPage = (
    pageParams: SchedulingType.QueryDTO & BaseApi.SqlPageParams
  ): HttpReturnPage<SchedulingType.Domain> => {
    return request.get({
      url: `${URL}/task/page`,
      params: {
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
  static total = (queryBody: SchedulingType.QueryBody): HttpReturn<number> => {
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
  static detail = (id: string): HttpReturn<SchedulingType.Domain> => {
    return request.get({
      url: `${URL}/${id}`
    });
  };

  /**
   * 新增
   * @param data 新增数据
   * @returns 新增后的数据
   */
  static add = (
    data: SchedulingType.AddDTO
  ): HttpReturn<SchedulingType.Domain> => {
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
    data: SchedulingType.UpdateDTO
  ): HttpReturn<SchedulingType.Domain> => {
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
  static batchRemove = (ids: string[]): HttpReturn<any> => {
    return request.delete({
      url: `${URL}/batch`,
      data: ids
    });
  };
}
