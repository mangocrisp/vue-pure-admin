import useAxios from "@/hooks/core/useAxios";

const request = useAxios();

const URL = "/admin-log/v1/apiLog";

export default class ApiLogApi {
  static page = (
    params: ApiLogType.QueryDTO & BaseApi.SqlPageParams
  ): HttpReturnPage<SystemRoleType.Role> => {
    return request.get({
      url: `${URL}/page`,
      params: {
        ...params,
        pageOrder: "create_time desc"
      }
    });
  };
}
