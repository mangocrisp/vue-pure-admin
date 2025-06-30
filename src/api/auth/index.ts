import Qs from "qs";
import useAxios from "@/hooks/core/useAxios";

const request = useAxios();

export default class Auth {
  /** 获取登录验证码 */
  static captcha() {
    return request.get({
      url: "/captcha"
    });
  }

  /** 判断登录是否需要验证码 */
  static enableCaptcha() {
    return request.get({
      url: "/enableCaptcha"
    });
  }

  /** 获取到 public key */
  static publicKey = () => {
    return request.get({
      url: "/rsa/publicKey"
    });
  };

  /** 获取到 public key */
  static publicKeyBySm2 = () => {
    return request.get<Res<string>>({
      url: "/sm2/publicKey"
    });
  };

  /** 登录 */
  static login: AuthType.Login = data => {
    return request.post({
      url: "/auth/oauth/login",
      data,
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
        Authorization: import.meta.env.VITE_APP_CLIENT
      },
      transformRequest: [
        function (data) {
          return Qs.stringify(data);
        }
      ]
    });
  };

  /** 重新登录 */
  static reLogin = (refreshToken: string) => {
    return request.post({
      url: "/auth/oauth/login",
      data: {
        grant_type: "taybct_refresh",
        refresh_token: refreshToken
      },
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
        Authorization: import.meta.env.VITE_APP_CLIENT
      },
      transformRequest: [
        function (data) {
          return Qs.stringify(data);
        }
      ],
      isCancelRepeat: true
    });
  };

  /** 注销 */
  static logout = () => {
    return request.post({
      url: "/auth/oauth/logout"
    });
  };
}
