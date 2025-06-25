import type { PureHttpRequestConfig } from "./types.d";

function getReqKey(config: PureHttpRequestConfig) {
  // 请求方式、请求地址、请求参数生成的字符串来作为是否重复请求的依据
  const { method, url, params, data } = config;

  const requestKey = [
    method,
    url,
    JSON.stringify(params),
    typeof data === "string" ? data : JSON.stringify(data) // TODO: 请求拦截config的data为数组, 但在响应拦截config的data返回变成了字符串, 所以需要判断一下是否转换
  ].join("&");

  return requestKey;
}

class CancelRepeatRequest {
  // 储存正在等待响应的接口
  pendingRequestMap = new Map<string, AbortController>();

  set(config: PureHttpRequestConfig) {
    if (config.isCancelRepeat) return;
    const controller = new AbortController();
    config.signal = controller.signal;
    const reqKey = getReqKey(config);
    // 当等待接口中 已存在 现接口, 则取消当前接口请求
    if (this.pendingRequestMap.has(reqKey)) {
      console.error("存在重复请求的接口, 请排查问题:", reqKey);
      this.pendingRequestMap.get(reqKey)?.abort();
    } else {
      this.pendingRequestMap.set(reqKey, controller);
    }
  }

  del(config: PureHttpRequestConfig) {
    if (config.isCancelRepeat) return;
    const reqKey = getReqKey(config);
    this.pendingRequestMap.delete(reqKey);
  }
}

export default new CancelRepeatRequest();
