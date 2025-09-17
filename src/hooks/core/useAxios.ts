import type { AxiosPromise, Method } from "axios";
import type { PureHttpRequestConfig } from "@/utils/http/types";
import { http } from "@/utils/http";

const request = <T>(options: PureHttpRequestConfig): AxiosPromise<T> => {
  return http.service()(options);
};

const requestReturn = async <T = any>(
  method: Method,
  options: PureHttpRequestConfig,
  cancelErrorTip?: boolean
) => {
  const res = await request<T>({
    method,
    // 接口地址
    baseURL: import.meta.env.VITE_SERVER_PROXY,
    // 是否 取消 错误提示
    cancelErrorTip,
    ...options
  });
  return res.data;
};

function createRequestFn(type: Method, cancelErrorTip?: boolean) {
  return function <T = any>(options: PureHttpRequestConfig) {
    return requestReturn<T>(type, options, cancelErrorTip);
  };
}

export default function () {
  return {
    get: createRequestFn("get"),
    post: createRequestFn("post"),
    delete: createRequestFn("delete"),
    put: createRequestFn("put"),
    patch: createRequestFn("patch")
  };
}
