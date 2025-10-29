import type { PureHttpRequestConfig } from "./types.d";
import { Md5 } from "ts-md5";

/** 只能过滤简单的请求，如果请求参数为复杂对象，则要考虑过滤成本(key 会太长，序列化需要时间) */
function getReqKey(config: PureHttpRequestConfig) {
  // 请求方式、请求地址、请求参数生成的字符串来作为是否重复请求的依据
  const { method, url, params, data } = config;

  const requestKey = [
    method,
    url,
    JSON.stringify(params),
    typeof data === "string" ? data : JSON.stringify(data) // TODO: 请求拦截config的data为数组, 但在响应拦截config的data返回变成了字符串, 所以需要判断一下是否转换
  ].join("&");

  // return requestKey;
  return Md5.hashStr(requestKey);
}

class CancelRepeatRequest {
  // 储存正在等待响应的接口
  pendingRequestMap = new Map<string, AbortController>();

  set(config: PureHttpRequestConfig) {
    if (config.isCancelRepeat) return;
    const reqKey = getReqKey(config);
    console.log(reqKey);
    if (reqKey.length > 2000) {
      // 如果 key 太长了，就直接返回了，太长了，过滤不了
      return;
    }
    const controller = new AbortController();
    config.signal = controller.signal;
    // 当等待接口中 已存在 现接口, 则取消当前接口请求
    if (this.pendingRequestMap.has(reqKey)) {
      console.error("存在重复请求的接口, 请排查问题:", reqKey);
      this.pendingRequestMap.get(reqKey)?.abort();
    } else {
      this.pendingRequestMap.set(reqKey, controller);
    }
    setTimeout(() => {
      // 如果 60 秒后还没响应，就删除，避免内存泄漏
      this.pendingRequestMap.delete(reqKey);
    }, 60000);
  }

  del(config: PureHttpRequestConfig) {
    if (config.isCancelRepeat) return;
    const reqKey = getReqKey(config);
    console.log(reqKey);
    this.pendingRequestMap.delete(reqKey);
  }
}

export default new CancelRepeatRequest();
