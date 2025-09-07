<script setup lang="ts">
import { useMultiTagsStoreHook } from "@/store/modules/multiTags";
import { storageSession } from "@pureadmin/utils";
import { useRenderIcon } from "@/components/ReIcon/src/hooks";
import AntDesignLeftOutlined from "~icons/ant-design/left-outlined";
import { defineAsyncComponent, nextTick, onMounted, ref } from "vue";
import {
  LocationQuery,
  onBeforeRouteUpdate,
  RouteParamsGeneric,
  useRoute,
  useRouter
} from "vue-router";
import LfFormApi from "@/api/lf/lfForm";
import { ElMessage } from "element-plus";
import FcDesigner from "@form-create/designer";

const route = useRoute();

const router = useRouter();

const loading = ref(false);

const cachePathKey = "_flow_form_design_goback_route_";

const defaultPrevPath = ref<string>("/lf/form/design");

const routeParams = ref<RouteParamsGeneric>();

const routeQuery = ref<LocationQuery>();

const sourceDesignData = ref<LfFormType.Domain>();

const sourceReleaseData = ref<LfFormReleaseType.Domain>();

const designData = ref<any>(null);

const title = ref<string>("表单设计");

const goBack = () => {
  switch (routeParams.value.source) {
    case "design":
      defaultPrevPath.value = "/lf/form/design";
      break;
    case "release":
      defaultPrevPath.value = "/lf/frl/" + sourceReleaseData.value.formId;
      break;
  }
  useMultiTagsStoreHook().handleTags("splice", "/lf/fd/:source/:id");
  const lastRoute = storageSession().getItem(cachePathKey);
  if (!lastRoute || lastRoute === router.currentRoute.value.fullPath) {
    // 没有历史记录，跳转到默认页面
    router.replace({ path: defaultPrevPath.value });
    storageSession().removeItem(cachePathKey);
    return;
  }
  storageSession().setItem(cachePathKey, router.currentRoute.value.fullPath);
  if (history.length > 1) {
    // 有历史记录，后退一步
    history.go(-1);
  } else {
    // 没有历史记录，跳转到默认页面
    router.replace({ path: defaultPrevPath.value });
  }
};

/**可选字段导出面板 */
const FormCreateDesigner = defineAsyncComponent(
  () => import("@/views/components/form-create/form-designer/index.vue")
);

const FormCreateDesignerRef = ref<InstanceType<
  typeof FormCreateDesigner
> | null>(null);

const form = {
  id: "",
  data: "{}"
};

const config = ref({});

const loadData = async (source: string, id: string) => {
  loading.value = true;
  switch (source) {
    case "design":
      sourceDesignData.value = (await LfFormApi.detail(id)).data;
      title.value = sourceDesignData.value.name;
      designData.value = sourceDesignData.value.data ?? "{}";
      break;
    case "release":
      sourceReleaseData.value = (await LfFormApi.publishDetail(id)).data;
      title.value = sourceReleaseData.value.name;
      designData.value = sourceReleaseData.value.data ?? "{}";
      break;
  }
  Object.assign(form, {
    id,
    data: designData.value
  });
  const { rule, options } = JSON.parse(form.data);
  nextTick(() => {
    setTimeout(() => {
      FormCreateDesignerRef.value.loadData({ rule, options });
      loading.value = false;
    }, 500);
  });
};

const handleSave = async ({ rule, options }) => {
  console.log(JSON.parse(rule));
  console.log(options);
  loading.value = true;
  try {
    form.data = JSON.stringify({ rule, options });
    const { message } = await LfFormApi.update(form);
    ElMessage.success(message);
  } catch (error) {
    console.error("handleSubmit => error", error);
  } finally {
    loading.value = false;
  }
};

/**待办信息 */
const LfFormTodoInfo = defineAsyncComponent(
  () => import("@/views/lf/form/components/todoInfo/index.vue")
);
/** 待办信息拖拽规则 */
const LfFormTodoInfoRule = {
  menu: "aide",
  icon: "icon-descriptions",
  label: "流程信息",
  name: "title",
  //组件可以配置的事件
  event: ["click"],
  rule() {
    //组件的渲染规则
    return {
      //组件的名称, 与上一步是对应
      type: "LfFormTodoInfo",
      props: {}
    };
  },
  props() {
    //组件右侧的配置项,与组件中的 props 对应
    return [];
  }
};

/**
 * 加载自定义组件
 */
const loadCostumComponents = async () => {
  FcDesigner.component("LfFormTodoInfo", LfFormTodoInfo);
  setTimeout(() => {
    FormCreateDesignerRef.value
      .getDesignerRef()
      .addComponent(LfFormTodoInfoRule);
  }, 1000);
};

onMounted(() => {
  routeParams.value = route.params;
  routeQuery.value = route.query;
  loadData(route.params.source as string, route.params.id as string);
  loadCostumComponents();
});

onBeforeRouteUpdate(to => {
  loadData(to.params.source as string, to.params.id as string);
});
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
