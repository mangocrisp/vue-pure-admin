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
import { LfFormCustomComponent } from "./utils/types";
export default defineComponent({
  name: "LfFormCustomComponentsCard",
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
    type: Object as PropType<LfFormCustomComponent>
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
  (e: "show-component", value: LfFormCustomComponent): void;
}>();

const showComponent = (data: LfFormCustomComponent) => {
  emit("show-component", data);
};
</script>

<template>
  <div :class="cardClass">
    <div v-contextmenu:contextmenu class="list-card-item_detail bg-bg_color">
      <el-row justify="space-between">
        <div :class="cardLogoClass">
          <IconifyIconOffline :icon="data?.icon" width="60px" height="60px" />
        </div>
        <div class="list-card-item_detail--operation">
          <el-tag type="info" class="mt-[10px]">
            {{
              useSystemDictParamsStore.dictK2V("lf_form_type", data?.type).value
            }}
          </el-tag>
        </div>
      </el-row>
      <p class="list-card-item_detail--name text-text_color_primary">
        {{ data?.name }}
      </p>
      <p class="list-card-item_detail--desc text-text_color_regular">
        {{ data?.description }}
      </p>
    </div>
    <v-contextmenu ref="contextmenu">
      <v-contextmenu-item @click="showComponent(data)"
        >查看组件</v-contextmenu-item
      >
      <v-contextmenu-divider />
      <v-contextmenu-item disabled>其他操作</v-contextmenu-item>
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

  /* 初始阴影 */
  box-shadow: 0 4px 6px rgb(0 0 0 / 10%);

  /* 过渡动画：所有属性变化在0.3秒内完成，缓动效果 */
  transition: all 0.3s ease;

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

/* 悬停效果：组合多种变化 */
.list-card-item:hover {
  /* 阴影加深，增强悬浮感 */
  box-shadow: 0 10px 20px rgb(0 0 0 / 15%);

  /* 向上移动5px */
  transform: translateY(-5px);
}

.list-card-item:hover .list-card-item_detail--name,
.list-card-item:hover .list-card-item_detail--desc {
  color: var(--el-color-primary);
}
</style>
