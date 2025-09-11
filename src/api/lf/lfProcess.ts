import useAxios from "@/hooks/core/useAxios";

/**异步请求 */
const request = useAxios();

/**模块路径*/
const modulePath = "/lf";

/**请求对接的接口 */
const URL = `${modulePath}/v1/process`;

export default class LfProcessApi {
  /**
   * 新建一个流程
   * @param data 流程新增数据
   * @returns 新增结果
   */
  static newProcess = (data: LfProcessType.AddDTO): HttpReturn<boolean> => {
    return request.post({
      url: `${URL}/new`,
      data
    });
  };

  /**
   * 待办/已办统计
   * @param status 状态（1、待办、0、已办）
   * @returns 数量
   */
  static todoListCount = (
    status: "0" | "1"
  ): HttpReturn<LfProcessType.TodoListCountVO> => {
    return request.get({
      url: `${URL}/todoListCount/${status}`
    });
  };

  /**
   * 我的待办/已办
   * @param queryDto 查询参数
   * @returns 待办/已办列表
   */
  static todoList = (
    queryDto: LfProcessType.TodoListQueryDTO
  ): HttpReturn<LfProcessType.ProcessListVO[]> => {
    return request.post({
      url: `${URL}/todoList`,
      data: queryDto
    });
  };

  /**
   * 查询未操作者(流程的未操作者)
   * @param queryDto 查询参数
   * @returns  未操作者
   */
  static queryUnOperators = (
    processIdSet: string[]
  ): HttpReturn<LfProcessType.UnOperator[]> => {
    return request.post({
      url: `${URL}/unOperators`,
      data: processIdSet
    });
  };

  /**
   * 我的请求
   * @param queryDto 查询参数
   * @returns 流程列表
   */
  static userRequestList = (
    queryDto: LfProcessType.UserRequestListQueryDTO
  ): HttpReturn<LfProcessType.ProcessListVO[]> => {
    return request.post({
      url: `${URL}/userRequestList`,
      data: queryDto
    });
  };

  /**
   * 用户提交
   * @param data 提交数据
   * @returns 提交结果
   */
  static userSubmit = (
    data: LfNodesType.NodesSubmitDTO
  ): HttpReturn<boolean> => {
    return request.post({
      url: `${URL}/userSubmit`,
      data
    });
  };

  /**
   * 获取流程详情
   * @param id 流程id
   * @returns 流程详情
   */
  static detail = (id: string): HttpReturn<LfProcessType.Domain> => {
    return request.get({
      url: `${URL}/${id}`
    });
  };
}
