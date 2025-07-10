import { groupBatchIds } from "@/utils";
import useAxios from "@/hooks/core/useAxios";

const request = useAxios();

const URL = "/system/v1/permission";

export default class SystemPermissionApi {
  /** 权限管理列表(分页) */
  static page: SystemPermissionType.PermissionPageReturn = params => {
    return request.get({
      url: `${URL}/pageWithMenu`,
      params
    });
  };

  /** 权限管理列表 */
  static list: SystemPermissionType.PermissionListReturn = params => {
    return request.get({
      url: `${URL}/list`,
      params
    });
  };

  /** 按关联菜单进行分组的权限列表 */
  static listGroupWithMenu: SystemPermissionType.PermissionListGroupWithMenuReturn =
    () => {
      return request.get({
        url: `${URL}/listGroupWithMenu`
      });
    };

  /** 添加与菜单关联字段的权限列表 */
  static listWithMenu: SystemPermissionType.PermissionListReturn = params => {
    return request.get({
      url: `${URL}/listWithMenu`,
      params
    });
  };

  /** 权限新增 */
  static add = (data: any) => {
    return request.post<any>({
      url: `${URL}`,
      data
    });
  };

  /** 保存菜单与权限关联 */
  static batchSave: SystemPermissionType.BatchSave = data => {
    return request.post<any>({
      url: `${URL}/batch`,
      data
    });
  };

  /** 权限编辑 */
  static update = (data: any) => {
    return request.put<any>({
      url: `${URL}`,
      data
    });
  };

  /** 权限删除 */
  static remove = (id: string) => {
    return request.delete<any>({
      url: `${URL}/${id}`
    });
  };

  /** 权限批量删除 */
  static batchRemove = (ids: string[]) => {
    return request.delete<any>({
      url: `${URL}/batch?${groupBatchIds(ids)}`
    });
  };
}
