import { defineStore } from "pinia";
import { useStateRef } from "@/hooks/tool/useStateRef";
import { SM2 } from "gm-crypto";
import Auth from "@/api/auth/index";

let handleFn: Promise<string> | null;

export const useSm2CryptoStore = defineStore("sm2-crypto", () => {
  const [publicKey, setPublicKey] = useStateRef<string>("");

  const encrypt = async (str: string) => {
    // 存在publicKey, 直接加密返回
    if (publicKey.value) {
      return Promise.resolve(encryptBySM2(str));
    }
    // 没有publicKey, 等待请求响应后再加密返回
    else {
      if (!handleFn) {
        handleFn = Auth.publicKeyBySm2()
          .then(({ data }) => {
            setPublicKey(data);
            return encryptBySM2(str);
          })
          .catch(err => {
            console.error("encryptSM2 error =>", err);
            return "";
          })
          .finally(() => {
            handleFn = null;
          });
      }
      return handleFn;
    }
  };

  const encryptBySM2 = (str: string) => {
    return `04${SM2.encrypt(str, publicKey.value, {
      inputEncoding: "utf8",
      outputEncoding: "hex"
    })}`;
  };

  return { publicKey, encrypt };
});
