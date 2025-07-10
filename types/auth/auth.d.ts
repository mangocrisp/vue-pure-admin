/** 鉴权管理 */
declare namespace AuthType {
  interface LoginParams {
    password: string;
    username: string;
    captcha_code: string;
    captcha_uuid: string;
    grant_type: "password" | "gx_cloud";
    scope: "all";
  }

  interface LoginReturn {
    access_token: string;
    authenticationMethod: string;
    expires_in: number;
    jti: string;
    refresh_token: string;
    scope: "all";
    token_type: "bearer";
    userId: number;
    username: string;
  }

  export interface Login {
    (params: LoginParams): HttpReturn<LoginReturn>;
  }
}
