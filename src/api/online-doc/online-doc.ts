import useAxios from "@/hooks/core/useAxios";

/**异步请求 */
const request = useAxios();

/**模块路径*/
const modulePath = "/online-doc";

/**请求对接的接口 */
const URL = `${modulePath}/v1/onlineDoc`;

export default class OnlineDocApi {
  // 共享范围
  static deptList = params => {
    return request.get({
      url: `/system/v1/dept/list`,
      params
    });
  };

  /**
   * 参数管理列表(分页)
   * @param params 查询参数
   * @returns 分页
   */
  static page = (
    params: OnlineDocType.OnlineDocQueryBody & BaseApi.SqlPageParams
  ): HttpReturnPage<OnlineDocType.OnlineDoc> => {
    return request.post({
      url: `${URL}/page`,
      data: params,
      params: {
        pageNum: params?.pageNum || 1,
        pageSize: params?.pageSize || 10,
        countTotal: false,
        pageOrder: "update_time desc nulls last"
      }
    });
  };

  /**
   * 查询总数
   * @param params 查询参数
   * @returns 总数
   */
  static total = (
    params: OnlineDocType.OnlineDocQueryBody
  ): HttpReturn<string> => {
    return request.post({
      url: `${URL}/total`,
      data: params
    });
  };

  /**
   * 查询单个详情
   * @param id 查询主键
   * @returns 数据详情
   */
  static detail = (id: string): HttpReturn<OnlineDocType.OnlineDocVO> => {
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
    data: OnlineDocType.OnlineDocAddDTO,
    file: any
  ): HttpReturn<OnlineDocType.OnlineDoc> => {
    const formData = new FormData();
    formData.append("data", JSON.stringify(data));
    formData.append("file", file);
    return request.post({
      // url: `${URL}?${groupBatchIds(data.deptIdSet, 'deptId')}`,
      url: `${URL}`,
      data: formData,
      headers: {
        "Content-Type": "multipart/form-data"
      }
    });
  };

  /**
   * 刷新新增文档的缓存
   * @param id 文档 id
   * @returns  结果
   */
  static flushAddCache = (id: string) => {
    return request.put({
      url: `${URL}/flushAddCache/${id}`
    });
  };

  /**
   * 更新
   * @param data 更新的数据
   * @returns 更新后的数据
   */
  static update = (
    data: OnlineDocType.OnlineDocUpdateDTO
  ): HttpReturn<OnlineDocType.OnlineDoc> => {
    return request.put({
      url: `${URL}`,
      data
    });
  };

  /**
   * 更新
   * @param data 更新的数据
   * @returns 更新后的数据
   */
  static exp = params => {
    return request.post({
      url: `${URL}/exp`,
      data: params,
      responseType: "blob"
    });
  };

  /**
   * 删除单个
   * @param id 需要删除的数据的主键 id
   * @returns 删除的结果
   */
  static remove = (id: string) => {
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
      url: `${URL}/batch`,
      data: ids
    });
  };
}
