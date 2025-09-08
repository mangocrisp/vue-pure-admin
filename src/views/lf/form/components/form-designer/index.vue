<script setup lang="ts">
import { useRenderIcon } from "@/components/ReIcon/src/hooks";
import AntDesignLeftOutlined from "~icons/ant-design/left-outlined";
import { useLogicFlowFormDesigner } from "./utils/hook";

defineOptions({
  name: "LfFormDesigner"
});

const {
  goBack,
  loading,
  title,
  config,
  FormCreateDesigner,
  FormCreateDesignerRef,
  handleSave
} = useLogicFlowFormDesigner();
</script>
<template>
  <div v-loading="loading" class="designer-container">
    <el-button
      type="primary"
      :icon="useRenderIcon(AntDesignLeftOutlined)"
      class="go-back-btn"
      @click="goBack"
    >
      关闭
    </el-button>
    <span class="float-right"
      ><h1>{{ title }}</h1></span
    >
    <FormCreateDesigner
      ref="FormCreateDesignerRef"
      :config="config"
      :mask="false"
      @save="handleSave"
    />
  </div>
</template>
<style scoped>
.designer-container {
  height: calc(100% - 190px);
}

.go-back-btn {
  margin-bottom: 10px;
}
</style>
