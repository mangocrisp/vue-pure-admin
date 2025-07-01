import { defineStore } from "pinia";
import {
  type userType,
  store,
  router,
  resetRouter,
  routerArrays,
  storageLocal
} from "../utils";
import User, { type UserResult } from "@/api/user";
import { useMultiTagsStoreHook } from "./multiTags";
import { type DataInfo, setToken, removeToken, userKey } from "@/utils/auth";
import { useEncrypt } from "@/hooks";
import Auth from "@/api/auth";

let reLoginHandler!: Promise<any> | null;

export const useUserStore = defineStore("pure-user", {
  state: (): userType => ({
    // 头像
    avatar: storageLocal().getItem<DataInfo<number>>(userKey)?.avatar ?? "",
    // 用户名
    username: storageLocal().getItem<DataInfo<number>>(userKey)?.username ?? "",
    // 昵称
    nickname: storageLocal().getItem<DataInfo<number>>(userKey)?.nickname ?? "",
    // 页面级别权限
    roles: storageLocal().getItem<DataInfo<number>>(userKey)?.roles ?? [],
    // 按钮级别权限
    permissions:
      storageLocal().getItem<DataInfo<number>>(userKey)?.permissions ?? [],
    // 前端生成的验证码（按实际需求替换）
    verifyCode: "",
    // 判断登录页面显示哪个组件（0：登录（默认）、1：手机登录、2：二维码登录、3：注册、4：忘记密码）
    currentPage: 0,
    // 是否勾选了登录页的免登录
    isRemembered: false,
    // 登录页的免登录存储几天，默认7天
    loginDay: 7
  }),
  actions: {
    /** 存储头像 */
    SET_AVATAR(avatar: string) {
      this.avatar = avatar;
    },
    /** 存储用户名 */
    SET_USERNAME(username: string) {
      this.username = username;
    },
    /** 存储昵称 */
    SET_NICKNAME(nickname: string) {
      this.nickname = nickname;
    },
    /** 存储角色 */
    SET_ROLES(roles: Array<string>) {
      this.roles = roles;
    },
    /** 存储按钮级别权限 */
    SET_PERMS(permissions: Array<string>) {
      this.permissions = permissions;
    },
    /** 存储前端生成的验证码 */
    SET_VERIFYCODE(verifyCode: string) {
      this.verifyCode = verifyCode;
    },
    /** 存储登录页面显示哪个组件 */
    SET_CURRENTPAGE(value: number) {
      this.currentPage = value;
    },
    /** 存储是否勾选了登录页的免登录 */
    SET_ISREMEMBERED(bool: boolean) {
      this.isRemembered = bool;
    },
    /** 设置登录页的免登录存储几天 */
    SET_LOGINDAY(value: number) {
      this.loginDay = Number(value);
    },
    /** 登入 */
    async loginByUsername(params) {
      return new Promise<UserResult>(async (resolve, reject) => {
        Auth.login({
          ...params,
          password: await useEncrypt().encrypt(params.password),
          grant_type: "taybct",
          scope: "all"
        })
          .then(async res => {
            const { data: loginResult } = res;
            setToken({
              accessToken: loginResult.access_token,
              refreshToken: loginResult.refresh_token,
              expires: new Date(
                loginResult.expires_in * 1000 + new Date().getTime()
              )
            });
            const { data: myInfo } = await User.myInfo();
            setToken({
              accessToken: loginResult.access_token,
              refreshToken: loginResult.refresh_token,
              expires: new Date(
                loginResult.expires_in * 1000 + new Date().getTime()
              ),
              avatar: myInfo.avatar,
              username: myInfo.username,
              nickname: myInfo.nickname,
              roles: myInfo.roles,
              permissions: undefined
            });
            resolve({
              success: true,
              data: {
                avatar: myInfo.avatar,
                username: myInfo.username,
                nickname: myInfo.nickname,
                roles: myInfo.roles,
                permissions: undefined,
                accessToken: loginResult.access_token,
                refreshToken: loginResult.refresh_token,
                expires: new Date(
                  loginResult.expires_in * 1000 + new Date().getTime()
                )
              }
            });
          })
          .catch(error => {
            reject(error);
          });
      });
    },
    /** 前端登出（调用接口） */
    async logOut() {
      try {
        await Auth.logout();
        this.clearLoginStatus();
        return Promise.resolve();
      } catch (error) {
        console.error("LogOut error =>", error);
        return Promise.reject(error);
      }
    },
    /** 清理关于登录的所有信息 */
    clearLoginStatus() {
      this.username = "";
      this.roles = [];
      this.permissions = [];
      removeToken();
      useMultiTagsStoreHook().handleTags("equal", [...routerArrays]);
      resetRouter();
      // 清除缓存
      //storageLocal().clear();
      // redirect
      router.push("/login?redirect=" + router.currentRoute.value.fullPath);
    },
    /** 重新登录 */
    async reLogin(refreshToken: string) {
      if (reLoginHandler) return reLoginHandler;

      reLoginHandler = new Promise((resolve, reject) => {
        Auth.reLogin(refreshToken)
          .then(({ data }) => {
            setToken({
              accessToken: data.access_token,
              refreshToken: data.refresh_token,
              expires: new Date(data.expires_in * 1000 + new Date().getTime())
            });
            resolve({
              success: true,
              data: {
                accessToken: data.access_token,
                refreshToken: data.refresh_token,
                expires: new Date(data.expires_in * 1000 + new Date().getTime())
              }
            });
          })
          .catch(error => {
            console.error("error: ", error);
            reject(error);
          })
          .finally(() => (reLoginHandler = null));
      });

      return reLoginHandler;
    },
    /** 刷新`token` */
    async handRefreshToken(tokenData) {
      return this.reLogin(tokenData.refreshToken);
    }
  }
});

export function useUserStoreHook() {
  return useUserStore(store);
}
