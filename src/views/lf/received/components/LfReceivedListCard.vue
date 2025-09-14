<script lang="ts">
import { defineComponent } from "vue";
import {
  directive,
  Contextmenu,
  ContextmenuItem,
  ContextmenuDivider,
  ContextmenuSubmenu,
  ContextmenuGroup
} from "v-contextmenu";
import { TodoStatusMap } from "../utils/enums";
export default defineComponent({
  name: "LfProcessInitiateCard",
  components: {
    [Contextmenu.name]: Contextmenu,
    [ContextmenuItem.name]: ContextmenuItem,
    [ContextmenuDivider.name]: ContextmenuDivider,
    [ContextmenuSubmenu.name]: ContextmenuSubmenu,
    [ContextmenuGroup.name]: ContextmenuGroup
  },
  directives: {
    contextmenu: directive
  }
});
</script>
<script setup lang="ts">
import { computed, PropType } from "vue";
import { useSystemDictParamsStoreHook } from "@/store/modules/system-dict-params";

const useSystemDictParamsStore = useSystemDictParamsStoreHook();

const props = defineProps({
  data: {
    type: Object as PropType<LfProcessType.ProcessListVO>
  }
});

const cardClass = computed(() => [
  "list-card-item",
  { "list-card-item__disabled": !(props.data?.status === 1) }
]);

const cardLogoClass = computed(() => [
  "list-card-item_detail--logo",
  { "list-card-item_detail--logo__disabled": !(props.data?.status === 1) }
]);

const emit = defineEmits<{
  (e: "handleTodo", data: LfProcessType.ProcessListVO): void;
}>();

/**
 * 处理待办
 * @param data 待办信息
 */
const handleTodo = (data: LfProcessType.ProcessListVO) => {
  emit("handleTodo", data);
};
</script>

<template>
  <div :class="cardClass">
    <!-- 添加右键菜单 v-contextmenu:contextmenu -->
    <div class="list-card-item_detail bg-bg_color">
      <el-row justify="space-between">
        <div :class="cardLogoClass">
          <IconifyIconOnline :icon="data?.icon" width="60px" height="60px" />
        </div>
        <div class="list-card-item_detail--operation">
          <el-tag
            :color="data?.status === 1 ? '#00a870' : '#eee'"
            effect="dark"
            size="small"
            class="mx-1 list-card-item_detail--operation--tag"
          >
            {{ data?.status === 1 ? "待办" : "已办" }}
          </el-tag>
          <el-tag
            v-if="data?.todoStatus"
            type="primary"
            class="mt-[10px]"
            size="small"
          >
            {{ TodoStatusMap[data?.todoStatus] }}
          </el-tag>
          <el-tag type="info" class="mt-[10px]" size="small">
            {{
              useSystemDictParamsStore.dictK2V("lf_process_type", data?.type)
                .value
            }}
          </el-tag>
        </div>
      </el-row>
      <h1 class="list-card-item_detail--name text-text_color_primary">
        <strong>{{ data?.designName }}</strong>
      </h1>
      <p class="list-card-item_detail--desc text-text_color_regular">
        {{ data?.nodeText }}
      </p>
      <p class="list-card-item_detail--time text-text_color_regular">
        {{ data?.createTime }}
      </p>
      <p class="list-card-item_detail--username text-text_color_regular">
        发起人：{{ data?.createUserName }}
      </p>
    </div>
    <v-contextmenu v-if="data?.status === 1" ref="contextmenu">
      <v-contextmenu-item @click="handleTodo(data)"
        >处理待办</v-contextmenu-item
      >
      <v-contextmenu-divider />
      <v-contextmenu-item disabled>相关申请</v-contextmenu-item>
    </v-contextmenu>
  </div>
</template>

<style lang="scss" scoped>
.list-card-item {
  display: flex;
  flex-direction: column;
  margin-bottom: 12px;
  overflow: hidden;
  cursor: pointer;
  border-radius: 3px;

  &_detail {
    flex: 1;
    min-height: 140px;
    padding: 24px 32px;

    &--logo {
      display: flex;
      align-items: center;
      justify-content: center;
      width: 60px;
      height: 60px;
      font-size: 26px;
      background: #e0ebff;
      border-radius: 50%;

      &__disabled {
        color: #a1c4ff;
      }
    }

    &--operation {
      display: flex;
      flex-flow: column wrap;
      place-content: center flex-end;
      align-items: center;
      height: 100%;

      &--tag {
        border: 0;
      }
    }

    &--name {
      margin: 24px 0 8px;
      font-size: 16px;
      font-weight: 400;
    }

    &--desc {
      display: -webkit-box;
      height: 40px;
      margin-bottom: 24px;
      overflow: hidden;
      text-overflow: ellipsis;
      -webkit-line-clamp: 2;
      font-size: 12px;
      line-height: 20px;
      -webkit-box-orient: vertical;
    }

    &--time {
      color: #999;
      text-align: right;
    }

    &--username {
      color: #999;
      text-align: right;
    }
  }

  &__disabled {
    .list-card-item_detail--name,
    .list-card-item_detail--desc {
      color: var(--el-text-color-disabled);
    }

    .list-card-item_detail--operation--tag {
      color: #bababa;
    }
  }
}
</style>
