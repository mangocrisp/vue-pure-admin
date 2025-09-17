<script setup lang="ts">
import { computed } from "vue";
import { isUrl } from "@pureadmin/utils";
import { menuType } from "@/layout/types";

const props = defineProps<{
  to: menuType;
}>();

const isExternalLink = computed(() => {
  if (props.to.meta?.menuType === 2) {
    // 如果是外部链接
    return isUrl(props.to.meta?.frameSrc);
  }
  return false;
});
const getLinkProps = (item: menuType) => {
  if (isExternalLink.value) {
    return {
      href: props.to.meta?.frameSrc,
      // target: "_blank",
      target: (item.isBlank ?? 1 === 1) ? "_blank" : "_self",
      rel: "noopener"
    };
  }
  return {
    to: item
  };
};
</script>

<template>
  <component
    :is="isExternalLink ? 'a' : 'router-link'"
    v-bind="getLinkProps(to)"
  >
    <slot />
  </component>
</template>
