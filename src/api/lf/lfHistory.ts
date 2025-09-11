import useAxios from "@/hooks/core/useAxios";

/**异步请求 */
const request = useAxios();

/**模块路径*/
const modulePath = "/lf";

/**请求对接的接口 */
const URL = `${modulePath}/v1/history`;

export default class LfHistoryApi {
  /**
   * 流程历史记录列表
   * @param queryDto 查询参数
   * @returns 流程历史记录列表
   */
  static historyList = (
    queryDto: LfHistoryType.HistoryListQueryDTO
  ): HttpReturn<LfHistoryType.HistoryListVO[]> => {
    return request.post({
      url: `${URL}/list`,
      data: queryDto
    });
  };
}
