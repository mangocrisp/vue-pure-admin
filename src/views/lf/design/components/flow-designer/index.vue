<script setup lang="ts">
import { ref, onMounted, provide, Ref, defineAsyncComponent, h } from "vue";
import LfDesignApi from "@/api/lf/lfDesign";
import {
  type RouteParamsGeneric,
  type LocationQuery,
  useRoute,
  useRouter
} from "vue-router";
import LoginFlow from "@/views/components/logic-flow/index.vue";
import Role from "@/api/system/role";
import { ElMessage, ElMessageBox } from "element-plus";
import { useRenderIcon } from "@/components/ReIcon/src/hooks";
import AntDesignLeftOutlined from "~icons/ant-design/left-outlined";
import { deviceDetection, storageSession } from "@pureadmin/utils";
import { useMultiTagsStoreHook } from "@/store/modules/multiTags";
import LfReleaseApi from "@/api/lf/lfRelease";
import SystemDeptApi from "@/api/system/dept";
import SystemUserApi from "@/api/system/user";
import LfFormApi from "@/api/lf/lfForm";
import { addDialog } from "@/components/ReDialog";
import { message } from "@/utils/message";
import { useLfCustomFrom } from "@/views/lf/form/components/form-designer/utils/custom";

defineOptions({
  name: "LogicFlowDesigner"
});

const { logicFlowFormPreview } = useLfCustomFrom();

export interface LogicFlowDesignerProps {
  showCloseButton?: boolean;
  autoloadFromRoute?: boolean;
}

const props = withDefaults(defineProps<LogicFlowDesignerProps>(), {
  showCloseButton: true,
  autoloadFromRoute: true
});

const showCloseButtonRef = ref<boolean>(props.showCloseButton);

const autoloadFromRouteRef = ref<boolean>(props.autoloadFromRoute);

const route = useRoute();

const router = useRouter();

const cachePathKey = "_flow_design_goback_route_";

const defaultPrevPath = ref<string>("/lf/design");

const routeParams = ref<RouteParamsGeneric>();

const routeQuery = ref<LocationQuery>();

const sourceDesignData = ref<LfDesignType.Domain>();

const sourceReleaseData = ref<LfReleaseType.Domain>();

const designData = ref<any>(null);

const goBack = () => {
  switch (routeParams.value.source) {
    case "design":
      defaultPrevPath.value = "/lf/design";
      break;
    case "release":
      defaultPrevPath.value = "/lf/rl/" + sourceReleaseData.value.designId;
      break;
    case "processInitiate":
      defaultPrevPath.value = "/lf/process/initiate";
      break;
  }
  useMultiTagsStoreHook().handleTags("splice", "/lf/d/:source/:id");
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

const loginFlowRef = ref<InstanceType<typeof LoginFlow> | null>(null);
const form = {
  id: "",
  data: "{}"
};

/**
 * 重新加载数据
 */
const reloadData = async (source: string, id: string) => {
  if (!source || !id) {
    return;
  }
  loading.value = true;
  switch (source) {
    case "design":
      // 设计阶段
      sourceDesignData.value = (await LfDesignApi.detail(id)).data;
      designData.value = sourceDesignData.value.data ?? "{}";
      break;
    case "release":
    case "processInitiate":
      // 发布预览阶段
      sourceReleaseData.value = (await LfReleaseApi.detail(id)).data;
      designData.value = sourceReleaseData.value.data ?? "{}";
      break;
    case "process":
      // 流程进行中
      break;
  }
  Object.assign(form, {
    id,
    data: designData.value
  });
  loginFlowRef.value?.iniLogicFlow(false, JSON.parse(designData.value));
  loading.value = false;
  if (
    source === "release" ||
    source === "processInitiate" ||
    source === "process"
  ) {
    // 如果只读
    loginFlowRef.value?.setReadonly(true);
  } else {
    loginFlowRef.value?.setReadonly(false);
  }
};

/**
 * 获取系统角色列表, 用于下拉框选择
 */
const getRoleList = async () => {
  try {
    const { data } = await Role.listFilterRole();
    roleChoseListRef.value = data.map(d =>
      Object.assign({
        key: d.id,
        value: { id: d.id, name: d.name },
        label: d.name
      })
    );
  } catch (error) {
    console.error("error =>", error);
  }
};

/**
 * 获取部门列表, 用于下拉框选择
 * @param keyword 搜索关键字
 */
const getDeptPage = async (keyword: string) => {
  try {
    const { data } = await SystemDeptApi.loadDeptList({
      page: 1,
      size: 50,
      name: keyword
    });
    deptChoseListRef.value = data.map(d =>
      Object.assign({
        key: d.id,
        value: { id: d.id, name: d.name },
        label: d.name
      })
    );
  } catch (error) {
    console.error("error =>", error);
  }
};
/**
 * 获取用户分页列表
 * @param keyword 搜索关键字
 */
const getUserPage = async (keyword: string) => {
  try {
    const { data } = await SystemUserApi.page({
      page: 1,
      size: 50,
      nickname: keyword
    });
    userChoseListRef.value = data.records.map(d =>
      Object.assign({
        key: d.id,
        value: { id: d.id, name: d.nickname },
        label: d.nickname
      })
    );
  } catch (error) {
    console.error("error =>", error);
  }
};

/**
 * 获取组件列表
 */
const getComponentsList = () => {
  componentsChoseListRef.value = [
    {
      key: "components1",
      value: "components1",
      label: "组件1"
    }
  ];
};

/**
 * 获取表单列表
 */
const getformBindChoseList = async (keyword: string) => {
  try {
    const { data } = await LfFormApi.publishList(
      {
        name: keyword,
        type: "form",
        showNewVersion: true
      },
      {
        pageNum: 1,
        pageSize: 50
      }
    );
    formBindChoseListRef.value = data.records.map(d =>
      Object.assign({
        key: d.id,
        value: { id: d.id, name: d.name },
        label: d.name
      })
    );
  } catch (error) {
    console.error("error =>", error);
  }
};

/**
 * 可供选择的角色列表
 */
const roleChoseListRef = ref<LogicFlowTypes.SelectOptionItem[]>([]);
/**
 * 可供选择的组件列表
 */
const componentsChoseListRef = ref<LogicFlowTypes.SelectOptionItem[]>([]);
/**
 * 可供选择的表单列表
 */
const formBindChoseListRef = ref<LogicFlowTypes.SelectOptionItem[]>([]);
/**
 * 可供选择的部门列表
 */
const deptChoseListRef = ref<LogicFlowTypes.SelectOptionItem[]>([]);
/**
 * 可供选择的用户列表
 */
const userChoseListRef = ref<LogicFlowTypes.SelectOptionItem[]>([]);

const loading = ref(false);

/**
 * 提供可选择的角色列表
 */
provide<Ref<LogicFlowTypes.SelectOptionItem[]>>(
  "roleChoseList",
  roleChoseListRef
);
/**
 * 提供可选择的组件列表
 */
provide<Ref<LogicFlowTypes.SelectOptionItem[]>>(
  "componentsChoseList",
  componentsChoseListRef
);
/**
 * 提供可选择的表单列表
 */
provide<Ref<LogicFlowTypes.SelectOptionItem[]>>(
  "formBindChoseList",
  formBindChoseListRef
);
/**
 * 提供可选择的部门列表
 */
provide<Ref<LogicFlowTypes.SelectOptionItem[]>>(
  "deptChoseList",
  deptChoseListRef
);
/**
 * 提供可选择的用户列表
 */
provide<Ref<LogicFlowTypes.SelectOptionItem[]>>(
  "userChoseList",
  userChoseListRef
);

/**
 * 远程方法调用
 * @param forWhat 什么方法
 * @param value 数据
 */
const remoteMethod = ({ forWhat, value }) => {
  switch (forWhat) {
    case "role":
      // 处理角色远程方法
      break;
    case "dept":
      // 处理部门远程方法
      if (value) {
        getDeptPage(value);
      }
      break;
    case "user":
      // 处理用户远程方法
      if (value) {
        getUserPage(value);
      }
      break;
    case "form":
      // 处理表单远程方法
      if (value) {
        getformBindChoseList(value);
      }
      break;
    case "formPreview":
      formPreview(value);
      break;
    case "formDesign":
      formDesign();
      break;
  }
};

const formDesign = () => {
  // router.push({
  //   name: "FlowDesign"
  // });
  // useMultiTagsStoreHook().handleTags("push", {
  //   path: `/lf/form/design`,
  //   name: "FlowFormDesign",
  //   meta: {
  //     title: {
  //       zh: `动态表单设计`,
  //       en: `Flow Form Design`
  //     }
  //   }
  // });
  // router.push({ name: "FlowFormDesign" });

  window.open(
    location.href.replace(route.fullPath, "/lf/form/design"),
    "_blank"
  );
};

/**
 * 动态表单预览
 * @param row 表单
 */
const formPreview = async (id: string) => {
  const { data: lfForm } = await LfFormApi.publishDetail(id);
  const { rule, options } = JSON.parse(lfForm.data);
  logicFlowFormPreview(rule, options);
};

onMounted(() => {
  // 如果只读
  loginFlowRef.value?.setReadonly(true);
  routeParams.value = route.params;
  routeQuery.value = route.query;
  if (autoloadFromRouteRef.value && route.name === "FlowDesignD") {
    reloadData(route.params.source as string, route.params.id as string);
  }
  getRoleList();
  getComponentsList();
  userChoseListRef.value = [];
});

// onBeforeRouteUpdate(to => {
//   if (to.name === "FlowDesignD") {
//     reloadData(to.params.source as string, to.params.id as string);
//   }
// });

const saveData = async data => {
  loading.value = true;
  try {
    form.data = data;
    const { message } = await LfDesignApi.update(form);
    ElMessage.success(message);
  } catch (error) {
    console.error("handleSubmit => error", error);
  } finally {
    loading.value = false;
  }
};

defineExpose({ reloadData });
</script>
<template>
  <div v-loading="loading" class="flow-container">
    <el-button
      v-show="showCloseButtonRef"
      type="primary"
      :icon="useRenderIcon(AntDesignLeftOutlined)"
      class="go-back-btn"
      @click="goBack"
    >
      关闭
    </el-button>
    <LoginFlow
      ref="loginFlowRef"
      :hideDemo="true"
      @save="saveData"
      @remoteMethod="remoteMethod"
    />
  </div>
</template>
<style scoped>
.flow-container {
  height: calc(100vh - 190px);
}

.go-back-btn {
  margin-bottom: 10px;
}
</style>
