declare namespace ApiLogType {
  export interface Domain {
    /*主键 */
    id?: number;
    /*创建人 */
    createUser?: number;
    /*创建时间 */
    createTime?: string;
    /*更新人 */
    updateUser?: number;
    /*更新时间 */
    updateTime?: string;
    /*模块标题 */
    title: string;
    /*接口描述 */
    description?: string;
    /*操作人员 */
    username?: string;
    /*客户端类型 */
    client?: string;
    /*模块 */
    module?: string;
    /*主机地址 */
    ip?: string;
    /*业务类型 */
    type?: string;
    /*请求方式 */
    method?: string;
    /*请求URL */
    url?: string;
    /*请求参数 */
    params?: string;
    /*返回参数 */
    result?: string;
    /*状态码 */
    code?: string;
    /*租户 id 区分不同租户的日志 */
    tenantId?: string;
  }

  export interface QueryDTO {
    /*模块标题 */
    title: string;
    /*操作人员 */
    username?: string;
    /*客户端类型 */
    client?: string;
    /*模块 */
    module?: string;
    /*主机地址 */
    ip?: string;
    /*业务类型 */
    type?: string;
    /*请求方式 */
    method?: string;
    /*请求URL */
    url?: string;
    /*状态码 */
    code?: string;
    /*租户 id 区分不同租户的日志 */
    tenantId?: string;
    /*租户 id 开始时间 */
    startTime?: string;
    /*结束时间 */
    endTime?: string;
  }
}
