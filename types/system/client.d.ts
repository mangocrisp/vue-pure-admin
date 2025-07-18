/**
 * 客户端管理
 */
declare namespace SystemClientType {
  /** 基础实体类 */
  export interface Domain extends DefaultParams {
    /** 主键id */
    id: string;
    /** 客户端id */
    clientId: string;
    /** 客户端密钥 */
    clientSecret?: string;
    /** 域 */
    scope: string;
    /** 授权方式 */
    authorizedGrantTypes: string;
    /** 认证回调地址 */
    webServerRedirectUri: string;
    /** token 超时秒 */
    accessTokenValidity: number;
    /** refresh token 超时秒 */
    refreshTokenValidity: number;
    /** 是否自动授权 */
    autoApprove: "true" | "false";
    /** 客户端名称 */
    clientName: string;
  }

  /**新增 DTO */
  export interface AddDTO {
    /** 客户端id */
    clientId: string;
    /** 客户端密钥 */
    clientSecret?: string;
    /** 域 */
    scope: string;
    /** 授权方式 */
    authorizedGrantTypes: string;
    /** 认证回调地址 */
    webServerRedirectUri: string;
    /** token 超时秒 */
    accessTokenValidity: number;
    /** refresh token 超时秒 */
    refreshTokenValidity: number;
    /** 是否自动授权 */
    autoApprove: "true" | "false";
    /** 客户端名称 */
    clientName?: string;
  }

  /**修改 DTO */
  export interface UpdateDTO {
    /** 主键id */
    id: string;
    /** 客户端id */
    clientId?: string;
    /** 客户端密钥 */
    clientSecret?: string;
    /** 域 */
    scope?: string;
    /** 授权方式 */
    authorizedGrantTypes?: string;
    /** 认证回调地址 */
    webServerRedirectUri?: string;
    /** token 超时秒 */
    accessTokenValidity?: number;
    /** refresh token 超时秒 */
    refreshTokenValidity?: number;
    /** 是否自动授权 */
    autoApprove?: "true" | "false";
    /** 客户端名称 */
    clientName?: string;
  }

  /**查询 DTO */
  export interface QueryDTO {
    /** 客户端id */
    clientId?: string;
    /** 客户端名称 */
    clientName?: string;
  }

  /**查询实体 */
  export interface QueryBody {
    queryDto: QueryDTO;
  }
}
