import type { ProxyOptions } from "vite";

type Recordable<T = any> = Record<string, T>;

const proxyServer = (
  env: Recordable
): Record<string, string | ProxyOptions> => {
  return {
    "/api": {
      target: env.VITE_SERVER_HOST,
      changeOrigin: true,
      rewrite: path => path.replace(new RegExp(`^${env.VITE_SERVER_PROXY}`), "")
    }
  };
};

export { proxyServer };
