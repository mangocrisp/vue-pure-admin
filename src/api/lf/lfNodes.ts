import useAxios from "@/hooks/core/useAxios";

/**异步请求 */
const request = useAxios();

/**模块路径*/
const modulePath = "/lf";

/**请求对接的接口 */
const URL = `${modulePath}/v1/nodes`;

export default class LfNodesApi {
  /**
   * 流程节点详情
   * @param id 节点 id
   * @returns 节点详情
   */
  static detail = (id: string): HttpReturn<LfNodesType.Domain> => {
    return request.get({
      url: `${URL}/${id}`
    });
  };
}
