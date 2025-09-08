import useAxios from "@/hooks/core/useAxios";

const request = useAxios();

const URL = "/system/v1/dept";

export default class SystemDeptApi {
  /**
   * 获取部门&用户树，用户部门 id 去查询所有这些部门的下级，然后汇聚后合成一份完整的有上下级关系的数据返回
   * @param deptIdSet 部门 id 集合，同时查询多个部门
   * @returns 部门和用户一起的树
   */
  static deptUserTreeByCondition = (
    keyWord: string,
    makeTree = true,
    includeUser = true
  ) => {
    return request.post({
      url: `${URL}/deptUserTreeByCondition?makeTree=${makeTree}&includeUser=${includeUser}`,
      data: { keyWord }
    });
  };

  /**
   * 获取部门&用户树，用户部门 id 去查询所有这些部门的下级，然后汇聚后合成一份完整的有上下级关系的数据返回
   * @param deptIdSet 部门 id 集合，同时查询多个部门
   * @returns 部门和用户一起的树
   */
  static deptUserTree = (
    deptIdSet: number[] | string[],
    makeTree = true,
    includeUser = true
  ) => {
    return request.post({
      url: `${URL}/deptUserTree?makeTree=${makeTree}&includeUser=${includeUser}`,
      data: deptIdSet
    });
  };
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
  /**获取用户部门 */
  static loadDeptUser = (userId: string) =>
    request.post<Res<{ deptId: string; userId: string }[]>>({
      url: `${URL}/user`,
      data: {
        userId
      }
    });

  /**保存用户部门 */
  static saveDeptUser = (data: { deptId: string; userId: string }[]) =>
    request.put<Res<string>>({
      url: `${URL}/user`,
      data
    });
}
