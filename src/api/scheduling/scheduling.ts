import useAxios from "@/hooks/core/useAxios";

const request = useAxios();

const URL = "/scheduling/v1/scheduling";

export default class SchedulingApi {
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
}
