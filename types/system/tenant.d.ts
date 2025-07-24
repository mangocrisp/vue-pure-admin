declare namespace SystemTenantType {
  export interface Domain extends DefaultParams {
    /** 主键 */
    id: string;
    /** 图标 */
    icon: string;
    /** 租户 id */
    tenantId: string;
    /** 租户管理员 */
    tenantManager: string;
    /** 租户名 */
    tenantName: string;
    /** 备注 */
    remark: string;
    /** 状态 */
    status: 1 | 0;
  }

  /**新增 DTO */
  export interface AddDTO {
    /** 图标 */
    icon: string;
    /** 租户 id */
    tenantId: string;
    /** 租户管理员 */
    tenantManager: string;
    /** 租户名 */
    tenantName: string;
    /** 备注 */
    remark: string;
  }

  /**修改 DTO */
  export interface UpdateDTO {
    /** 主键 */
    id: string;
    /** 图标 */
    icon?: string;
    /** 租户 id */
    tenantId?: string;
    /** 租户管理员 */
    tenantManager?: string;
    /** 租户名 */
    tenantName?: string;
    /** 备注 */
    remark?: string;
    /** 状态 */
    status?: 1 | 0;
  }

  /**查询 DTO */
  export interface QueryDTO {
    /** 租户 id */
    tenantId?: string;
    /** 租户管理员 */
    tenantManager?: string;
    /** 租户名 */
    tenantName?: string;
    /** 状态 */
    status?: 1 | 0;
  }

  /**查询实体 */
  export interface QueryBody {
    queryDto: QueryDTO;
  }

  /**
   * 用户租户关联
   */
  export interface UserTenant {
    /**
     * 租户 id
     */
    tenantId: string;
    /**
     * 用户 id
     */
    userId: string;
  }
}
