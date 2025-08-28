import useAxios from "@/hooks/core/useAxios";

const request = useAxios();

const URL = "/system/v1/notice";

export default class SystemNoticeApi {
  /**
   * 用户通知分页
   * @param queryDTO 查询参数
   * @param apge 分页参数
   * @returns 分页数据
   */
  static userNoticesPage = (
    queryDTO: SystemNoticeType.QueryDTO,
    apge: BaseApi.SqlQueryParams
  ): HttpReturnPage<SystemNoticeType.Domain> => {
    return request.get({
      url: `${URL}/userNoticesPage`,
      params: {
        ...queryDTO,
        ...apge,
        pageOrder: "create_time desc"
      }
    });
  };
}
