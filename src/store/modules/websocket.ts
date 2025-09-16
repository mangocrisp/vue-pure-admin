import { defineStore } from "pinia";
import { store } from "../utils";
import { useUserStoreHook } from "@/store/modules/user";
import { getToken } from "@/utils/auth";

const useUserStore = useUserStoreHook();

// const websocketHost = import.meta.env.VITE_WEBSOCKET_HOST;

const websocketHost =
  (location.href.startsWith("https://") ? "wss://" : "ws://") +
  location.host +
  "/api";

export const useWebSocketStore = defineStore("system-websocket", {
  state: () => {
    return {
      webSocket: undefined as WebSocket | undefined,
      isConnected: false,
      isConnecting: false,
      error: undefined,
      wsUrl: websocketHost + "/websocket/{userId}?jti={jti}"
    };
  },
  getters: {
    getWebSocket: state => state.webSocket,
    getIsConnected: state => state.isConnected,
    getIsConnecting: state => state.isConnecting,
    getError: state => state.error,
    getWsUrl: state => state.wsUrl
  },
  actions: {
    /**
     * 创建WebSocket实例
     * @param toUserId 接收消息的用户ID
     * @returns  WebSocket实例
     */
    createNewWebSocket(toUserId?: string[]): Promise<WebSocket> {
      const tokenCache = getToken();
      this.wsUrl = this.wsUrl
        .replace("{userId}", useUserStore.id)
        .replace("{jti}", tokenCache.jti);
      // 如果有指定的用户ID，则添加到URL中，用于点对点通信
      if (toUserId && toUserId.length > 0) {
        this.wsUrl += `&toUserId=${toUserId.join(",")}`;
      }
      // 创建WebSocket实例
      return new Promise((resolve, reject) => {
        try {
          setTimeout(() => {
            const ws = new WebSocket(this.wsUrl);
            resolve(ws);
          }, 1000);
        } catch (err) {
          reject(err);
        }
      });
    },
    /** 建立WebSocket连接 */
    connect(): Promise<WebSocket> {
      if (this.isConnected || this.isConnecting) return;
      this.isConnecting = true;
      this.error = undefined;
      return new Promise(resolve => {
        // 创建WebSocket实例
        this.createNewWebSocket()
          .then(ws => {
            this.webSocket = ws;

            // 连接成功回调
            this.webSocket.onopen = () => {
              console.log("WebSocket 连接已建立");
              this.isConnected = true;
              this.isConnecting = false;
            };

            // 接收消息回调
            this.webSocket.onmessage = event => {
              console.log("收到消息:", event.data);
            };

            // 连接关闭回调
            this.webSocket.onclose = event => {
              console.log(`WebSocket 连接已关闭，代码: ${event.code}`);
              this.isConnected = false;
              this.isConnecting = false;
              // 如果断掉连接，则尝试重新连接
              if (event.code !== 1000) {
                console.log("尝试重新连接 WebSocket...");
                const reconnectId = setInterval(() => {
                  this.connect().then(() => clearInterval(reconnectId));
                }, 5000); // 5秒后重连
              }
            };

            // 错误处理回调
            this.webSocket.onerror = event => {
              console.error("WebSocket 错误:", event);
              this.error = "连接发生错误，请重试";
              this.isConnecting = false;
            };
            resolve(this.webSocket);
          })
          .catch(err => {
            console.error("建立WebSocket连接失败:", err);
            this.error = "建立连接失败，请重试";
            this.isConnecting = false;
          });
      });
    },
    /** 关闭WebSocket连接 */
    disconnect() {
      if (this.webSocket && this.isConnected) {
        this.webSocket.close(1000, "正常关闭");
        this.webSocket = undefined;
      }
    },
    /** 切换连接状态 */
    toggleConnection() {
      if (this.isConnected) {
        this.disconnect();
      } else {
        this.connect();
      }
    },
    /**
     * 发送消息
     * @param message 发送的消息内容
     * @param toUserId 可选的接收消息的用户ID列表
     * @returns void
     */
    sendMessage(message: string, toUserId?: string[]) {
      // 如果要发消息能指定用户，就需要重新开一个 websocket 连接指定用户，发送完消息之后就断掉不要影响主 websocket 连接
      const content = message.trim();
      this.createNewWebSocket(toUserId)
        .then(webSocket => {
          webSocket.onopen = () => {
            webSocket.send(content);
            webSocket.close(1000, "正常关闭");
          };
        })
        .catch(err => {
          console.error("发送消息失败:", err);
          this.error = "发送消息失败，请重试";
        });
    }
  }
});

export function useWebSocketStoreHook() {
  return useWebSocketStore(store);
}
