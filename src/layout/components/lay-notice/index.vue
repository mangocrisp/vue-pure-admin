<script setup lang="ts">
import { useI18n } from "vue-i18n";
import { ref, computed, onMounted, toRaw, reactive } from "vue";
import { getAvatar, NoticeType } from "./data";
import NoticeList from "./components/NoticeList.vue";
import { useWebSocketStoreHook } from "@/store/modules/websocket";
import { ElNotification } from "element-plus";

import BellIcon from "~icons/ep/bell";
import IcBaselineMessage from "~icons/ic/baseline-message";
import { useRenderIcon } from "@/components/ReIcon/src/hooks";
import SystemNoticeApi from "@/api/system/notice";
import { $t } from "@/plugins/i18n";

const { t } = useI18n();
const noticesNum = ref("0");
const noticesTopicNum = ref({
  SYS_NOTICE: 0,
  SYS_MESSAGE: 0,
  SYS_TODO: 0
});
const notices = ref([
  {
    key: "SYS_NOTICE",
    name: $t("status.pureNotify"),
    list: [],
    emptyText: $t("status.pureNoNotify")
  },
  {
    key: "SYS_MESSAGE",
    name: $t("status.pureMessage"),
    list: [],
    emptyText: $t("status.pureNoMessage")
  },
  {
    key: "SYS_TODO",
    name: $t("status.pureTodo"),
    list: [],
    emptyText: $t("status.pureNoTodo")
  }
]);
const activeKey = ref(notices.value[0]?.key);

const getLabel = computed(
  () => item =>
    t(item.name) +
    (noticesTopicNum.value[item.key] > 0
      ? `(${noticesTopicNum.value[item.key]})`
      : "")
);
/**
 * 分页大小
 */
const pageSize = 10;
/**
 * 通知总数
 */
const total = ref(0);
/**
 * 加载通知数据
 */
const loadNoticeData = () => {
  total.value = 0;
  notices.value.forEach(item => (item.list = []));
  NoticeType.forEach(async topic => {
    const { data } = await SystemNoticeApi.userNoticesPage(
      {
        topic
      },
      {
        pageNum: 1,
        pageSize: pageSize
      }
    );
    noticesNumCount(data.total);
    noticesTopicNum.value[topic] = data.total;
    const noticeItem = notices.value.find(n => n.key === topic);
    if (noticeItem) {
      data.records.forEach(item =>
        noticeItem.list.push(convertNoticeItem(item))
      );
    }
  });
};

/**
 * 通知总数计数
 * @param num 待计数的数字
 */
const noticesNumCount = (num = 0) => {
  total.value += num;
  noticesNum.value = total.value < 100 ? total.value + "" : "99+";
};

/**
 * 转换通知项数据格式
 * @param item 通知原始数据
 * @return 转换后的通知数据
 */
const convertNoticeItem = (item: SystemNoticeType.Domain) => {
  return {
    avatar: item.fromUserAvatar,
    title: item.title,
    datetime: item.createTime,
    type: item.topic,
    description: item.message,
    status: item.data?.status,
    extra: item.data?.extra
  };
};

/**
 * 获取通知数据
 */
const lastPageNum = ref({
  SYS_NOTICE: 1,
  SYS_MESSAGE: 1,
  SYS_TODO: 1
});
/**
 * 加载更多
 */
const loadMore = async description => {
  if (description !== "bottom") {
    return;
  }
  const noticeItem = notices.value.find(n => n.key === activeKey.value);
  const pageNum = Math.floor(noticeItem.list.length / pageSize) + 1;
  if (pageNum === lastPageNum.value[activeKey.value]) {
    return;
  }
  lastPageNum.value[activeKey.value] = pageNum;
  const { data } = await SystemNoticeApi.userNoticesPage(
    {
      topic: activeKey.value
    },
    {
      pageNum: lastPageNum.value[activeKey.value],
      pageSize: pageSize
    }
  );
  data.records.forEach(item => noticeItem.list.push(convertNoticeItem(item)));
};

const noticeDropdownRef = ref(null);

const useWebSocketStore = useWebSocketStoreHook();

const scrollbarRefs = ref({});
function openWebSocket() {
  useWebSocketStore.connect().then(webSocket => {
    webSocket.onmessage = event => {
      if (event.data) {
        const data = JSON.parse(event.data);
        let title = data.title || "消息通知";
        if (data.code !== "200") {
          ElNotification({
            title: title,
            message: data.message,
            type: "error",
            position: "bottom-right"
          });
        } else {
          if (data.topic == "simple") {
            if (data.fromUser) {
              if (data.name) {
                title = "来自用户[" + data.name + "]的消息";
              } else {
                title = "简单消息";
              }
            }
            if (data.avatar) {
              getAvatar(
                data.avatar,
                base64Data => {
                  ElNotification({
                    title: title,
                    dangerouslyUseHTMLString: true,
                    message: `<img style="width: 30px;height: 30px;vertical-align: bottom;border-radius: 50%;position: absolute;left: 10px" src="${base64Data}"/> <span>${data.message}</span>`,
                    icon: useRenderIcon(IcBaselineMessage, {
                      color: "#67c23a"
                    }),
                    position: "bottom-right"
                  });
                },
                error => {
                  ElNotification({
                    title: title,
                    message: data.message,
                    icon: useRenderIcon(IcBaselineMessage, {
                      color: "#67c23a"
                    }),
                    position: "bottom-right"
                  });
                }
              );
            } else {
              ElNotification({
                title: title,
                message: data.message,
                icon: useRenderIcon(IcBaselineMessage, { color: "#67c23a" }),
                position: "bottom-right"
              });
            }
          } else if (NoticeType.indexOf(data.topic) !== -1) {
            noticesTopicNum.value[data.topic] += 1;
            noticesNumCount(1);
            const noticeItem = notices.value.find(n => n.key === data.topic);
            if (noticeItem) {
              noticeItem.list.unshift(convertNoticeItem(data.data));
              scrollbarRefs.value[data.topic]?.scrollTo({
                top: 0,
                behavior: "smooth"
              });
            }
            getAvatar(
              data.avatar,
              base64Data => {
                ElNotification({
                  title: title,
                  dangerouslyUseHTMLString: true,
                  message: `<img style="width: 30px;height: 30px;vertical-align: bottom;border-radius: 50%;position: absolute;left: 10px" src="${base64Data}"/> <span>${data.message}</span>`,
                  icon: useRenderIcon(BellIcon, { color: "#409EFF" }),
                  position: "bottom-right",
                  onClick: () => {
                    activeKey.value = data.topic;
                    // 打开下拉菜单
                    if (noticeDropdownRef.value) {
                      (noticeDropdownRef.value as any).handleOpen();
                      setTimeout(() => {
                        scrollbarRefs.value[data.topic]?.scrollTo({
                          top: 0,
                          behavior: "smooth"
                        });
                      }, 200);
                    }
                  }
                });
              },
              error => {
                ElNotification({
                  title: title,
                  message: data.message,
                  icon: useRenderIcon(BellIcon, { color: "#409EFF" }),
                  // type: "primary",
                  position: "bottom-right",
                  onClick: () => {
                    activeKey.value = data.topic;
                    // 打开下拉菜单
                    if (noticeDropdownRef.value) {
                      (noticeDropdownRef.value as any).handleOpen();
                      setTimeout(() => {
                        scrollbarRefs.value[data.topic]?.scrollTo({
                          top: 0,
                          behavior: "smooth"
                        });
                      }, 200);
                    }
                  }
                });
              }
            );
          } else {
            ElNotification({
              title: title,
              message: data.message,
              type: "info",
              position: "bottom-right"
            });
          }
        }
      }
    };
  });
}

onMounted(() => {
  loadNoticeData();
  useWebSocketStore.disconnect();
  // 这里需要设置一个延时，否则有可能会出现 Token 还没有存储就连接 WebSocket 的情况
  setTimeout(() => {
    openWebSocket();
  }, 2000);
});
</script>

<template>
  <el-dropdown ref="noticeDropdownRef" trigger="click" placement="bottom-end">
    <span
      :class="[
        'dropdown-badge',
        'navbar-bg-hover',
        'select-none',
        Number(noticesNum) !== 0 && 'mr-[10px]'
      ]"
    >
      <el-badge :value="Number(noticesNum) === 0 ? '' : noticesNum" :max="99">
        <span class="header-notice-icon">
          <IconifyIconOffline :icon="BellIcon" />
        </span>
      </el-badge>
    </span>
    <template #dropdown>
      <el-dropdown-menu>
        <el-tabs
          v-model="activeKey"
          :stretch="true"
          class="dropdown-tabs"
          :style="{ width: notices.length === 0 ? '200px' : '330px' }"
        >
          <el-empty
            v-if="notices.length === 0"
            :description="t('status.pureNoMessage')"
            :image-size="60"
          />
          <span v-else>
            <template v-for="item in notices" :key="item.key">
              <el-tab-pane :label="getLabel(item)" :name="`${item.key}`">
                <el-scrollbar
                  :ref="el => (scrollbarRefs[item.key] = el)"
                  max-height="330px"
                  @end-reached="loadMore"
                >
                  <div class="noticeList-container">
                    <NoticeList :list="item.list" :emptyText="item.emptyText" />
                  </div>
                </el-scrollbar>
              </el-tab-pane>
            </template>
          </span>
        </el-tabs>
      </el-dropdown-menu>
    </template>
  </el-dropdown>
</template>

<style lang="scss" scoped>
.dropdown-badge {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 40px;
  height: 48px;
  cursor: pointer;

  .header-notice-icon {
    font-size: 18px;
  }
}

.dropdown-tabs {
  .noticeList-container {
    padding: 15px 24px 0;
  }

  :deep(.el-tabs__header) {
    margin: 0;
  }

  :deep(.el-tabs__nav-wrap)::after {
    height: 1px;
  }

  :deep(.el-tabs__nav-wrap) {
    padding: 0 36px;
  }
}
</style>
