import { EncryptType } from "@/store/types";
import { useAppStore } from "@/store/modules/app";
import { useRsaCryptoStore } from "@/store/modules/rsa-crypto";
import { useSm2CryptoStore } from "@/store/modules/sm2-crypto";

export function useEncrypt() {
  const appStore = useAppStore();
  const sm2CryptoStore = useSm2CryptoStore();
  const rsaCryptoStore = useRsaCryptoStore();

  const encrypt = (str: string) => {
    return appStore.encryptType === EncryptType.RSA
      ? rsaCryptoStore.encrypt(str)
      : sm2CryptoStore.encrypt(str);
  };

  return {
    encrypt
  };
}
