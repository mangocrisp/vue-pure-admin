import Axios, {
  type AxiosInstance,
  type AxiosRequestConfig
  // ,type CustomParamsSerializer
} from "axios";
import type {
  PureHttpError,
  RequestMethods,
  PureHttpResponse,
  PureHttpRequestConfig
} from "./types.d";
// import { stringify } from "qs";
import NProgress from "../progress";
import { getToken, formatToken } from "@/utils/auth";
import { useUserStoreHook } from "@/store/modules/user";
import { ElMessage, ElNotification } from "element-plus";

// 相关配置请参考：www.axios-js.com/zh-cn/docs/#axios-request-config-1
const defaultConfig: AxiosRequestConfig = {
  // 请求超时时间
  timeout: 60000
  // headers: {
  //   Accept: "application/json, text/plain, */*",
  //   "Content-Type": "application/json",
  //   "X-Requested-With": "XMLHttpRequest"
  // },
  // 数组格式参数序列化（https://github.com/axios/axios/issues/5142）
  // paramsSerializer: {
  //   serialize: stringify as unknown as CustomParamsSerializer
  // }
};

/** 服务响应正常code */
export const resultCode = "200";

/** 文件响应类型(一般情况下响应为数据流, 不存在响应码, 所以不进行拦截) */
export const fileResHeaders: string[] = ["application/octet-stream"];

export type ResponseBody = Res<any>;

/**
 * 用于响应拦截文件类型
 * @param fileType 文件类型
 * @param interceptType 拦截类型
 */
export const interceptFileType = (fileType: string, interceptType: string[]) =>
  interceptType.some(header => fileType?.indexOf(header) > -1);

class PureHttp {
  constructor() {
    this.httpInterceptorsRequest();
    this.httpInterceptorsResponse();
  }

  /** `token`过期后，暂存待执行的请求 */
  private static requests = [];

  /** 请求报错 401 后，暂存待执行的请求 */
  private static unauthorizedRequests = [];

  /** 防止重复刷新`token` */
  private static isRefreshing = false;

  /** 防止重复重新登录 */
  private static isReLogin = false;

  /** 初始化配置对象 */
  private static initConfig: PureHttpRequestConfig = {};

  /** 保存当前`Axios`实例对象 */
  private static axiosInstance: AxiosInstance = Axios.create(defaultConfig);

  /** 记录鉴权失败 401 的接口次数，超过3次，则跳转登录页面 */
  private static unauthorizedRequestMap: Map<string, number> = new Map();

  /** 重连原始请求 */
  private static retryOriginalRequest(config: PureHttpRequestConfig) {
    return new Promise(resolve => {
      PureHttp.requests.push((token: string) => {
        config.headers["Authorization"] = formatToken(token);
        resolve(config);
      });
    });
  }

  /** 重新请求报 401 的接口 */
  private static retryUnauthorizedRequest(config: PureHttpRequestConfig) {
    return new Promise(resolve => {
      PureHttp.unauthorizedRequests.push((token: string) => {
        config.headers["Authorization"] = formatToken(token);
        resolve(PureHttp.axiosInstance(config));
      });
    });
  }

  /** 请求拦截 */
  private httpInterceptorsRequest(): void {
    PureHttp.axiosInstance.interceptors.request.use(
      async (config: PureHttpRequestConfig): Promise<any> => {
        // 开启进度条动画
        NProgress.start();
        // 优先判断post/get等方法是否传入回调，否则执行初始化设置等回调
        if (typeof config.beforeRequestCallback === "function") {
          config.beforeRequestCallback(config);
          return config;
        }
        if (PureHttp.initConfig.beforeRequestCallback) {
          PureHttp.initConfig.beforeRequestCallback(config);
          return config;
        }
        // 查询参数为空串改为undefine, 达到不传递到后端的要求
        if (config.params) {
          Object.entries(config.params).reduce((acc, [key, value]) => {
            if (value === "") acc[key] = undefined;
            return acc;
          }, config.params);
        }

        /** 请求白名单，放置一些不需要`token`的接口（通过设置请求白名单，防止`token`过期后再请求造成的死循环问题） */
        const whiteList = [
          // 框架原有的刷新 token 接口
          "/refresh-token",
          // 登录接口
          "/login",
          // OAuth2 登录接口
          "/auth/oauth/login",
          // 查看是否需要验证码
          "/enableCaptcha",
          // 获取 sm2 公钥
          "/sm2/publicKey",
          // 获取 rsa 公钥
          "/rsa/publicKey"
        ];
        return whiteList.some(url => config.url.endsWith(url))
          ? config
          : new Promise(resolve => {
              const tokenCache = getToken();
              if (tokenCache) {
                const now = new Date().getTime();
                const expired = parseInt(tokenCache.expires) - now <= 0;
                if (expired) {
                  if (!PureHttp.isRefreshing) {
                    PureHttp.isRefreshing = true;
                    // token过期刷新
                    useUserStoreHook()
                      .handRefreshToken({
                        refreshToken: tokenCache.refreshToken
                      })
                      .then(res => {
                        const token = res.data.accessToken;
                        config.headers["Authorization"] = formatToken(token);
                        PureHttp.requests.forEach(cb => cb(token));
                        PureHttp.requests = [];
                      })
                      .catch(e => {
                        console.error(e);
                        if (e.response?.status === 401) {
                          useUserStoreHook().clearLoginStatus();
                        }
                      })
                      .finally(() => {
                        PureHttp.isRefreshing = false;
                      });
                  }
                  resolve(PureHttp.retryOriginalRequest(config));
                } else {
                  config.headers["Authorization"] = formatToken(
                    tokenCache.accessToken
                  );
                  resolve(config);
                }
              } else {
                resolve(config);
              }
            });
      },
      error => {
        return Promise.reject(error);
      }
    );
  }

  /** 响应拦截 */
  private httpInterceptorsResponse(): void {
    const instance = PureHttp.axiosInstance;
    instance.interceptors.response.use(
      (response: PureHttpResponse, option = { fileResHeaders }) => {
        const $config = response.config;
        const { data, headers } = response || {};
        const { code = "", message = "", success = undefined } = data || {};
        // 关闭进度条动画
        NProgress.done();
        // 优先判断post/get等方法是否传入回调，否则执行初始化设置等回调
        if (typeof $config.beforeResponseCallback === "function") {
          $config.beforeResponseCallback(response);
          return response.data;
        }
        if (PureHttp.initConfig.beforeResponseCallback) {
          PureHttp.initConfig.beforeResponseCallback(response);
          return response.data;
        }
        // 这个是 mock 才会返回的结果，这里直接按原来框架的结果返回
        if (success !== undefined) {
          return response.data;
        }
        /** 特殊响应类型拦截 */
        if (interceptFileType(headers?.["content-type"], option.fileResHeaders))
          return response;
        if (code === resultCode) {
          return response;
        } else {
          ElNotification({
            title: code ? `业务状态码: ${String(code)}` : "未知业务状态码",
            message: message || "接口异常",
            type: "error"
          });
          return Promise.reject(response);
        }
      },
      async (error: PureHttpError<ResponseBody>) => {
        const $error = error;
        if ($error.code === "ERR_CANCELED") {
          ElNotification({
            title: "重复查询",
            message: "请等待查询响应后, 再重试!",
            type: "error"
          });
          return Promise.reject($error);
        }
        if ($error.code === "ECONNABORTED") {
          ElNotification({
            title: "请求超时",
            message: "请稍后重试!",
            type: "error"
          });
        } else if ($error.response?.status === 400) {
          ElNotification({
            title: "参数错误",
            message: $error.response?.data?.message ?? "请求出错",
            type: "error"
          });
        } else if ($error.response?.status === 401) {
          const unauthorizedCount =
            PureHttp.unauthorizedRequestMap.get($error.config.url) || 0;
          if (unauthorizedCount > 2) {
            PureHttp.unauthorizedRequestMap.delete($error.config.url);
            useUserStoreHook().clearLoginStatus(false);
            return Promise.reject($error);
          }
          PureHttp.unauthorizedRequestMap.set(
            $error.config.url,
            unauthorizedCount + 1
          );

          if ($error.config?.url === "/auth/oauth/login") {
            return Promise.reject($error);
          }
          const tokenCache = getToken();
          if (!PureHttp.isReLogin) {
            PureHttp.isReLogin = true;
            try {
              const res = await useUserStoreHook().reLogin(
                tokenCache.refreshToken
              );
              const { data } = res;
              const token = data.accessToken;
              $error.config.headers["Authorization"] = formatToken(token);
              PureHttp.unauthorizedRequests.forEach(cb => cb(token));
              return PureHttp.axiosInstance($error.config);
            } catch (e) {
              console.error(e);
              if (e.response?.status === 401) {
                useUserStoreHook().clearLoginStatus();
              }
              // 所有的响应异常 区分来源为取消请求/非取消请求
              return Promise.reject($error);
            } finally {
              PureHttp.isReLogin = false;
              PureHttp.unauthorizedRequests = [];
            }
          } else {
            return PureHttp.retryUnauthorizedRequest($error.config).catch(e => {
              console.error(e);
              if (e.response?.status === 401) {
                useUserStoreHook().clearLoginStatus();
              }
              return Promise.reject($error);
            });
          }
        } else if ($error.response?.status === 500) {
          ElNotification({
            title: "服务出错",
            message: $error.response?.data?.message ?? "请稍后重试!",
            type: "error"
          });
        } else if ($error.response?.status === 503) {
          ElNotification({
            title: "服务离线",
            message: $error.response?.data?.message ?? "请稍后重试!",
            type: "error"
          });
        } else {
          ElMessage.error($error.response?.data?.message ?? "请求出错");
        }
        $error.isCancelRequest = Axios.isCancel($error);
        // 关闭进度条动画
        NProgress.done();
        // 所有的响应异常 区分来源为取消请求/非取消请求
        return Promise.reject($error);
      }
    );
  }

  /**
   * 获取到当前`Axios`实例对象
   * @returns 当前`Axios`实例对象
   */
  public service() {
    return PureHttp.axiosInstance;
  }

  /** 通用请求工具函数 */
  public request<T>(
    method: RequestMethods,
    url: string,
    param?: AxiosRequestConfig,
    axiosConfig?: PureHttpRequestConfig
  ): Promise<T> {
    const config = {
      method,
      url,
      ...param,
      ...axiosConfig
    } as PureHttpRequestConfig;

    // 单独处理自定义请求/响应回调
    return new Promise((resolve, reject) => {
      PureHttp.axiosInstance
        .request(config)
        .then((response: undefined) => {
          resolve(response);
        })
        .catch(error => {
          reject(error);
        });
    });
  }

  /** 单独抽离的`post`工具函数 */
  public post<T, P>(
    url: string,
    params?: AxiosRequestConfig<P>,
    config?: PureHttpRequestConfig
  ): Promise<T> {
    return this.request<T>("post", url, params, config);
  }

  /** 单独抽离的`get`工具函数 */
  public get<T, P>(
    url: string,
    params?: AxiosRequestConfig<P>,
    config?: PureHttpRequestConfig
  ): Promise<T> {
    return this.request<T>("get", url, params, config);
  }
}

export const http = new PureHttp();
