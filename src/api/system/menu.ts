import useAxios from "@/hooks/core/useAxios";

const request = useAxios();

const URL = "/system/v1/menu";

export default class SystemMenuApi {
  /** 菜单管理列表 */
  static list = (
    params: Partial<SystemMenuType.Menu> & { permCheckId?: string }
  ): HttpReturn<SystemMenuType.Menu[]> => {
    return request.get({
      url: `${URL}/list`,
      params: {
        ...params,
        pageOrder: "sort asc"
      }
    });
  };

  /** 菜单新增 */
  static add = (data: any) => {
    return request.post<any>({
      url: `${URL}`,
      data
    });
  };

  /** 菜单编辑 */
  static update = (data: any) => {
    return request.put<any>({
      url: `${URL}`,
      data
    });
  };

  /** 菜单删除 */
  static remove = (id: string) => {
    return request.delete<any>({
      url: `${URL}/${id}`
    });
  };

  /** 获取路由 */
  static loadRouter = (): HttpReturn<SystemMenuType.Router[]> => {
    return request.get({
      url: `${URL}/router`
    });
  };
}
