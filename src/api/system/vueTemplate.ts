import useAxios from "@/hooks/core/useAxios";

/**异步请求 */
const request = useAxios();

/**模块路径*/
const modulePath = "/system";

/**请求对接的接口 */
const URL = `${modulePath}/v1/vueTemplate`;

export default class VueTemplateApi {
  /**
   * 参数管理列表(分页)
   * @param params 查询参数
   * @returns 分页
   */
  static page = (
    queryBody: VueTemplateType.QueryBody,
    pageParams: BaseApi.SqlPageParams
  ): HttpReturnPage<VueTemplateType.Domain> => {
    return request.post({
      url: `${URL}/page`,
      data: queryBody,
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
  static total = (queryBody: VueTemplateType.QueryBody): HttpReturn<number> => {
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
  static detail = (id: string): HttpReturn<VueTemplateType.Domain> => {
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
    data: VueTemplateType.AddDTO
  ): HttpReturn<VueTemplateType.Domain> => {
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
    data: VueTemplateType.UpdateDTO
  ): HttpReturn<VueTemplateType.Domain> => {
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

  /**
   * 导出数据（字段可选）
   * @param params 需要导出的数据查询条件
   * @returns
   */
  static exportExcelSelectedField = (params: any): any => {
    return request.post({
      url: `${URL}/exportSelectedField`,
      data: params,
      responseType: "blob"
    });
  };

  // 获取 excel 导出数据可选的字段
  static getExportSelectedField = (
    params: any
  ): HttpReturn<SelectionExportExcelType[]> => {
    return request.get({
      url: `${URL}/exportSelectedField`,
      params
    });
  };

  /**
   * 导出数据（全部字段）
   * @param params 需要导出的数据查询条件
   * @returns
   */
  static exportExcel = (
    queryBody: VueTemplateType.QueryBody,
    pageParams: BaseApi.SqlPageParams
  ): any => {
    return request.post({
      url: `${URL}/exp`,
      data: queryBody,
      params: {
        ...pageParams,
        pageOrder: "update_time desc"
      },
      responseType: "blob"
    });
  };

  /**
   * 获取导入数据的模板
   * @returns 模板(blob)
   */
  static getImportExcelTemplate = (): any => {
    return request.get({
      url: `${URL}/template`,
      responseType: "blob"
    });
  };

  /**
   * 导入数据
   * @param data 数据
   * @returns 是否导入成功
   */
  static importExcel = (data: any): HttpReturn<VueTemplateType.Domain[]> => {
    return request.post({
      url: `${URL}/imp`,
      data,
      headers: {
        "Content-Type": "multipart/form-data"
      }
    });
  };
}
