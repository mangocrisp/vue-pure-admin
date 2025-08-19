declare namespace VueTemplateType {
  /** 接口数据结构 */
  export interface Domain extends DefaultParams {
    /** 主键 */
    id: string;
    /** 创建人 */
    createUser?: string;
    /** 创建时间 */
    createTime?: string;
    /** 修改人 */
    updateUser?: string;
    /** 修改时间 */
    updateTime?: string;
    /** 是否已删除 */
    isDeleted?: string;
    /** 字符串类型 */
    string?: string;
    /** 整数类型 */
    numberInt?: string;
    /** 长整数类型 */
    numberLong?: string;
    /** 日期类型 */
    date?: string;
    /** 日期时间类型 */
    dateTime?: string;
    /** 字节类型 */
    numberByte?: string;
    /** 布尔类型 */
    boolType?: boolean;
    /** 长文本类型 */
    textType?: string;
    /** JSON 类型 */
    jsonType?: string;
    /** 单精度浮点类型 */
    floatType?: string;
    /** 双精度浮点类型 */
    doubleType?: string;
  }
  /**新增数据结构 */
  export interface AddDTO {
    /** 字符串类型 */
    string?: string;
    /** 整数类型 */
    numberInt?: string;
    /** 长整数类型 */
    numberLong?: string;
    /** 日期类型 */
    date?: string;
    /** 日期时间类型 */
    dateTime?: string;
    /** 字节类型 */
    numberByte?: string;
    /** 布尔类型 */
    boolType?: string;
    /** 长文本类型 */
    textType?: string;
    /** JSON 类型 */
    jsonType?: string;
    /** 单精度浮点类型 */
    floatType?: string;
    /** 双精度浮点类型 */
    doubleType?: string;
  }
  /** 修改数据结构 */
  export interface UpdateDTO {
    /** 主键 */
    id: string;
    /** 是否已删除 */
    isDeleted?: string;
    /** 字符串类型 */
    string?: string;
    /** 整数类型 */
    numberInt?: string;
    /** 长整数类型 */
    numberLong?: string;
    /** 日期类型 */
    date?: string;
    /** 日期时间类型 */
    dateTime?: string;
    /** 字节类型 */
    numberByte?: string;
    /** 布尔类型 */
    boolType?: boolean;
    /** 长文本类型 */
    textType?: string;
    /** JSON 类型 */
    jsonType?: string;
    /** 单精度浮点类型 */
    floatType?: string;
    /** 双精度浮点类型 */
    doubleType?: string;
  }

  /**查询 DTO */
  export interface QueryDTO {
    /** 主键 */
    id?: string;
    /** 主键 */
    idSelection?: Array<string>;
    /** 创建人 */
    createUser?: string;
    /** 创建时间 */
    createTime_ge?: string;
    /** 创建时间 */
    createTime_le?: string;
    /** 修改人 */
    updateUser?: string;
    /** 修改时间 */
    updateTime_ge?: string;
    /** 修改时间 */
    updateTime_le?: string;
    /** 是否已删除 */
    isDeleted?: string;
    /** 字符串类型 */
    string?: string;
    /** 整数类型 */
    numberInt?: string;
    /** 长整数类型 */
    numberLong?: string;
    /** 日期类型 */
    date?: string;
    /** 日期类型 */
    date_ge?: string;
    /** 日期类型 */
    date_le?: string;
    /** 日期时间类型 */
    dateTime?: string;
    /** 日期时间类型 */
    dateTime_ge?: string;
    /** 日期时间类型 */
    dateTime_le?: string;
    /** 字节类型 */
    numberByte?: string;
    /** 布尔类型 */
    boolType?: boolean;
    /** 长文本类型 */
    textType?: string;
    /** JSON 类型 */
    jsonType?: string;
    /** 单精度浮点类型 */
    floatType?: string;
    /** 双精度浮点类型 */
    doubleType?: string;
  }

  /**查询实体 */
  export interface QueryBody {
    vueTemplateQueryDTO: QueryDTO;
  }
}
