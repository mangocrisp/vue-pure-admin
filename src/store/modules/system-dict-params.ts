import { defineStore } from "pinia";
import { type SystemDictConfigType, store } from "../utils";
import SystemDictApi from "@/api/system/dict";
import SystemParamsApi from "@/api/system/params";
import { computed } from "vue";

/** 存储正在执行的字典请求 */
const dictRequestList: { key: string; response: Promise<any> }[] = [];
/** 存储正在执行的参数请求 */
const paramsRequestList: { key: string; response: Promise<any> }[] = [];

/**
 * 字典参数缓存加载器
 */
export const useSystemDictParamsStore = defineStore("system-dict-params", {
  state: (): SystemDictConfigType => ({
    dict: {},
    params: {}
  }),
  getters: {
    getDict: state => (dictCode: string) => state[dictCode],
    getParams: state => (paramsKey: string) => state[paramsKey]
  },
  actions: {
    /** 设置字典 */
    SET_DICT(v: SystemDictType.DictsType) {
      this.dict = v;
    },
    /** 设置字典值 */
    SET_DICT_VALUE(k: string, v: SystemDictType.Dict[]) {
      this.dict[k] = v;
    },
    /** 设置参数 */
    SET_PARAMS(v: SystemParamsType.ParamsType) {
      this.params = v;
    },
    /** 设置参数值 */
    SET_PARAMS_VALUE(k: string, v: SystemParamsType.Params) {
      this.params[k] = v;
    },
    /**
     * @description: 请求单个字典
     * @param {DictCodeType} key
     * @return
     */
    async loadDict(key: string) {
      // 当字典长度大于0, 判断为已经获取, 直接返回
      const dict = this.dict[key] || [];
      if (dict.length > 0) return dict;

      // 当前请求的字典已经在请求列表中时, 返回队列中请求响应
      const index = dictRequestList.map(item => item.key).indexOf(key);
      if (index > -1) return dictRequestList[index].response;

      const response = new Promise((resolve, reject) => {
        SystemDictApi.cache(key)
          .then(({ data }) => {
            this.SET_DICT_VALUE(key, data);
            resolve(data);
          })
          .catch(error => reject(error))
          .finally(() => {
            dictRequestList.splice(
              dictRequestList.map(item => item.key).indexOf(key),
              1
            );
          });
      });
      dictRequestList.push({
        key,
        response
      });
      return response;
    },
    /**
     * @description: 请求单个字典
     * @param {DictCodeType} key
     * @return
     */
    async loadParams(key: string) {
      // 如果能找到参数, 判断为已经获取, 直接返回
      const params = this.params[key];
      if (params) return params;

      // 当前请求的参数已经在请求列表中时, 返回队列中请求响应
      const index = paramsRequestList.map(item => item.key).indexOf(key);
      if (index > -1) return paramsRequestList[index].response;

      const response = new Promise((resolve, reject) => {
        SystemParamsApi.get(key)
          .then(({ data }) => {
            this.SET_PARAMS_VALUE(key, data);
            resolve(data);
          })
          .catch(error => reject(error))
          .finally(() => {
            paramsRequestList.splice(
              paramsRequestList.map(item => item.key).indexOf(key),
              1
            );
          });
      });
      paramsRequestList.push({
        key,
        response
      });
      return response;
    },

    /**
     * 字典选项
     */
    dictOptions(key: string) {
      this.loadDict(key);
      return computed(() => {
        return this.dict[key]?.map(item => {
          return {
            label: item.dictVal,
            value: item.dictKey
          };
        });
      });
    },
    /**
     * 字典翻译(键翻译值，只能有一个值)
     * @param dictCode 字典编码
     * @param dictKey 字典键
     * @returns 翻译后的值
     */
    dictK2V(dictCode: string, dictKey: string) {
      return computed(() => {
        const v = this.dict[dictCode]
          ?.filter(item => item.dictKey === dictKey)
          .map(item => item.dictVal);
        return v && v.length === 0 ? v[0] : "";
      });
    },
    /**
     * 字典翻译(值翻译键，可能有多个键)
     * @param dictCode 字典编码
     * @param dictVal 字典值
     * @returns 翻译后的值
     */
    dictV2K(dictCode: string, dictVal: string) {
      return computed(() => {
        const v = this.dict[dictCode]
          ?.filter(item => item.dictVal === dictVal)
          .map(item => item.dictKey);
        return v;
      });
    },
    /**
     * 参数翻译(键翻译值，只能有一个值)
     * @param paramsKey 参数键
     * @returns 翻译后的值
     */
    paramsK2V(paramsKey: string) {
      return computed(() => {
        return this.params[paramsKey]?.realValue ?? "";
      });
    }
  }
});

export function useSystemDictParamsStoreHook() {
  return useSystemDictParamsStore(store);
}
