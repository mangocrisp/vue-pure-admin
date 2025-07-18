declare namespace BaseApi {
  export interface UnknownObject {
    [x: string]: unknown;
  }

  export type UnknownArray = unknown[];

  export type AnyPromiseFunction = (...args: any) => Promise<any>;

  export type AwaitedReturnType<T extends AnyPromiseFunction> = Awaited<
    ReturnType<T>
  >;

  export type RequestType<
    T extends AnyPromiseFunction,
    K extends keyof AwaitedReturnType<T> = "data"
  > = AwaitedReturnType<T>[K];

  /** 普通 响应体 */
  export interface Res<T> {
    code: string;
    data: T;
    message: string;
    ok: boolean;
  }

  /** 分页 响应体 */
  export type ResPage<T> = Res<{
    current: number;
    optimizeCountSql: boolean;
    orders: any[];
    pages: number;
    records: T[];
    searchCount: boolean;
    size: number;
    total: number;
  }>;

  /** Promise封装普通响应体 */
  export type HttpReturn<T extends object | boolean | string = any> = Promise<
    Res<T>
  >;

  /** Promise封装分页响应体 */
  export type HttpReturnPage<T extends object | boolean | string = any> =
    Promise<ResPage<T>>;

  /** 默认返回参数: 一般响应的后端实体类都包含一下参数 */
  export interface DefaultParams {
    isDeleted: NumStatus;
    createTime: string;
    createUser: string;
    updateTime: string;
    updateUser: string;
  }

  /** 获取默认参数的字符串字面量类型 */
  export type DefaultParamsKey = keyof DefaultParams;

  /** 去除默认返回参数 */
  export type OmitDefaultParams<
    T extends DefaultParams,
    P extends keyof T = DefaultParamsKey
  > = Omit<T, DefaultParamsKey | P>;

  export type NumStatus = 1 | 0 | "";

  /** 把接口中可选多个属性转为非必填 */
  export type MultiplePartial<
    T extends { id: any },
    K extends keyof T = "id"
  > = Omit<T, K> & Partial<Pick<T, K>>;

  /**SQL 查询参数 */
  export interface SqlQueryParams {
    /**分页页码 */
    pageNum?: number;
    /**分页大小 */
    pageSize?: number;
    /**排序字段 */
    pageOrder?: string;
  }
  /**SQL 分页参数 */
  export interface SqlPageParams {
    /**分页页码 */
    pageNum?: number;
    /**分页大小 */
    pageSize?: number;
    /**是否查询总数 */
    countTotal?: boolean;
    /**排序字段 */
    pageOrder?: string;
    /**按哪些字段排序 asc（正序） 或者 desc（倒序），这个是个集合 */
    sort?: string[];
  }
}
