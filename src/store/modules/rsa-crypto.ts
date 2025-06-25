import { defineStore } from "pinia";
import { useStateRef } from "@/hooks/tool/useStateRef";
import JSEncrypt from "jsencrypt";
import Auth from "@/api/auth/index";

let handleFn: Promise<string> | null;

export const useRsaCryptoStore = defineStore("rsa-crypto", () => {
  const [publicKey, setPublicKey] = useStateRef<string>("");

  const encrypt = async (str: string) => {
    // 存在publicKey, 直接加密返回
    if (publicKey.value) {
      return Promise.resolve(encryptByRas(str));
    }
    // 没有publicKey, 等待请求响应后再加密返回
    else {
      if (!handleFn) {
        handleFn = Auth.publicKey()
          .then(({ data }) => {
            setPublicKey(data);
            return encryptByRas(str);
          })
          .catch(err => {
            console.error("encrypt error =>", err);
            return "";
          })
          .finally(() => {
            handleFn = null;
          });
      }
      return handleFn;
    }
  };

  const encryptByRas = (str: string) => {
    const encrypt = new JSEncrypt();
    encrypt.setPublicKey(publicKey.value);
    return encrypt.encrypt(str).toString();
  };

  return { publicKey, encrypt };
});
