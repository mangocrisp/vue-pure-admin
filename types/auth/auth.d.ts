/** 鉴权管理 */
declare namespace AuthType {
  export interface LoginParams {
    password: string;
    username: string;
    captcha_code: string;
    captcha_uuid: string;
    grant_type: "password" | "gx_cloud";
    scope: "all";
  }

  export interface LoginReturn {
    access_token: string;
    access_token_exp: number;
    atm: string;
    jti: string;
    refresh_token: string;
    refresh_token_exp: number;
    scope: string[];
    token_type: "bearer";
  }

  export interface Login {
    (params: LoginParams): HttpReturn<LoginReturn>;
  }
}
