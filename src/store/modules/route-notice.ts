import { defineStore } from "pinia";
import { type RouteNoticeType, store } from "../utils";
import { computed, type ComputedRef } from "vue";

export const useRouteNoticeStore = defineStore("route-notice-badge", {
  state: (): RouteNoticeType => ({}),
  getters: {
    GET_NOTICE: state => (name: string) => state[name] || 0
  },
  actions: {
    SET_NOTICE(name: string, value: number) {
      this[name] = value;
    },
    /**
     * @description: 获取路由对应的通知数量
     * @param name 路由名称
     * @returns ComputedRef<number>
     */
    notice(name: string): ComputedRef<number> {
      return computed(() => {
        return this[name] || 0;
      });
    }
  }
});

export function useRouteNoticeStoreHook() {
  return useRouteNoticeStore(store);
}
