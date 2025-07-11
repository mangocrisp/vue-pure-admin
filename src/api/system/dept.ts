import useAxios from "@/hooks/core/useAxios";

const request = useAxios();

const URL = "/system/v1/dept";

export default class SystemDeptApi {
  /** 查询部门列表 */
  static loadDeptList = (params): HttpReturn<SystemDeptType.Dept[]> => {
    return request.get({
      url: `${URL}/list`,
      params
    });
  };
  /** 新增部门 */
  static add = (
    data: SystemDeptType.DeptAddDTO
  ): HttpReturn<SystemDeptType.Dept> => {
    return request.post({
      url: `${URL}`,
      data
    });
  };
  /**修改部门 */
  static update = (
    data: SystemDeptType.DeptUpdateDTO
  ): HttpReturn<SystemDeptType.Dept> => {
    return request.put({
      url: `${URL}`,
      data
    });
  };
  /** 删除部门 */
  static delete = (id: string): HttpReturn<SystemDeptType.Dept> => {
    return request.delete({
      url: `${URL}/${id}`
    });
  };
}
