import { useMultiTagsStoreHook } from "@/store/modules/multiTags";
import { storageSession } from "@pureadmin/utils";
import { defineAsyncComponent, nextTick, onMounted, ref } from "vue";
import {
  type LocationQuery,
  type RouteParamsGeneric,
  useRoute,
  useRouter
} from "vue-router";
import LfFormApi from "@/api/lf/lfForm";
import { ElMessage } from "element-plus";
import { useFormCostumComponents } from "./costumComponents";
import formCreate from "@form-create/element-ui";
import { logicFlowFormRuleEnhance } from "./custom";

export function useLogicFlowFormDesigner() {
  /**动态表单创建设计器 */
  const FormCreateDesigner = defineAsyncComponent(
    () => import("@/views/components/form-create/form-designer/index.vue")
  );

  const FormCreateDesignerRef = ref<InstanceType<
    typeof FormCreateDesigner
  > | null>(null);

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

  const config = ref({});

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
  const form = {
    id: "",
    data: "{}"
  };

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
    const ruleJSON = logicFlowFormRuleEnhance(rule);
    nextTick(() => {
      setTimeout(() => {
        FormCreateDesignerRef.value.loadData({ rule: ruleJSON, options });
        loading.value = false;
      }, 500);
    });
  };

  const handleSave = async ({ rule, options }) => {
    console.log(formCreate.parseJson(rule));
    console.log(formCreate.parseJson(rule));
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

  onMounted(() => {
    routeParams.value = route.params;
    routeQuery.value = route.query;
    loading.value = true;
    nextTick(() => {
      setTimeout(() => {
        loading.value = false;
        const { loadCostumComponents } = useFormCostumComponents(
          FormCreateDesignerRef
        );
        loadCostumComponents();
        loadData(route.params.source as string, route.params.id as string);
      }, 500);
    });
  });

  // onBeforeRouteUpdate(to => {
  //   loadData(to.params.source as string, to.params.id as string);
  // });
  return {
    goBack,
    loading,
    routeParams,
    routeQuery,
    sourceDesignData,
    sourceReleaseData,
    designData,
    title,
    config,
    FormCreateDesigner,
    FormCreateDesignerRef,
    handleSave
  };
}
