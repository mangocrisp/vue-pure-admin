import type {
  Method,
  AxiosError,
  AxiosResponse,
  AxiosRequestConfig
} from "axios";

export type resultType = {
  accessToken?: string;
};

export type RequestMethods = Extract<
  Method,
  "get" | "post" | "put" | "delete" | "patch" | "option" | "head"
>;

export interface PureHttpError<T = unknown, D = any> extends AxiosError<T, D> {
  isCancelRequest?: boolean;
}

export interface PureHttpResponse<T = any, D = any>
  extends AxiosResponse<T, D> {
  config: PureHttpRequestConfig;
}

export interface PureHttpRequestConfig extends AxiosRequestConfig {
  beforeRequestCallback?: (request: PureHttpRequestConfig) => void;
  beforeResponseCallback?: (response: PureHttpResponse) => void;
  /**
   * 是否 取消 重复拦截
   * @type true 拦截取消
   * @type false 拦截启动(默认)
   */
  isCancelRepeat?: boolean;
  /**
   * 是否 取消 错误提示
   * @type true 取消提示
   * @type false 开启提示(默认)
   */
  cancelErrorTip?: boolean;
}

export default class PureHttp {
  request<T>(
    method: RequestMethods,
    url: string,
    param?: AxiosRequestConfig,
    axiosConfig?: PureHttpRequestConfig
  ): Promise<T>;
  post<T, P>(
    url: string,
    params?: P,
    config?: PureHttpRequestConfig
  ): Promise<T>;
  get<T, P>(
    url: string,
    params?: P,
    config?: PureHttpRequestConfig
  ): Promise<T>;
}
