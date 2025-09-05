<script setup lang="ts">
import { ref } from "vue";
import ReCol from "@/components/ReCol";
import { formRules } from "./utils/rule";
import { FormProps } from "./utils/types";
import { transformI18n } from "@/plugins/i18n";
import { IconSelect } from "@/components/ReIcon";
import Segmented from "@/components/ReSegmented";
import ReAnimateSelector from "@/components/ReAnimateSelector";
import {
  menuTypeOptions,
  showLinkOptions,
  fixedTagOptions,
  keepAliveOptions,
  hiddenTagOptions,
  showParentOptions,
  frameLoadingOptions,
  menuStatusOptions,
  outLinkOptionOptions
} from "./utils/enums";

const props = withDefaults(defineProps<FormProps>(), {
  formInline: () => ({
    higherMenuOptions: [],
    parentId: "0",
    menuType: 0,
    meta: {
      frameLoading: true,
      hiddenTag: false,
      fixedTag: false,
      transition: {}
    },
    menuData: {
      id: undefined,
      name: undefined,
      parentId: "0",
      alwaysShow: 1,
      props: undefined,
      sort: 0,
      routeName: undefined,
      routePath: undefined,
      component: undefined,
      redirect: undefined,
      isCache: 1,
      menuType: undefined,
      hidden: 0,
      status: 1,
      icon: undefined,
      isBlank: 1
    },
    permData: {
      id: undefined,
      menuId: undefined,
      name: undefined,
      urlPerm: undefined,
      btnPerm: undefined
    }
  })
});

const ruleFormRef = ref();
const newFormInline = ref(props.formInline);

function getRef() {
  return ruleFormRef.value;
}

defineExpose({ getRef });
</script>

<template>
  <el-form
    ref="ruleFormRef"
    :model="newFormInline"
    :rules="formRules"
    label-width="82px"
  >
    <el-row :gutter="30">
      <re-col>
        <el-form-item label="菜单类型">
          <Segmented
            v-model="newFormInline.menuType"
            :options="menuTypeOptions"
          />
        </el-form-item>
      </re-col>

      <re-col>
        <el-form-item label="上级菜单">
          <el-cascader
            v-model="newFormInline.parentId"
            class="w-full"
            :options="newFormInline.higherMenuOptions"
            :props="{
              value: 'id',
              label: 'title',
              emitPath: false,
              checkStrictly: true
            }"
            clearable
            filterable
            placeholder="请选择上级菜单"
          >
            <template #default="{ node, data }">
              <span>{{ transformI18n(data.title) }}</span>
              <span v-if="!node.isLeaf"> ({{ data.children.length }}) </span>
            </template>
          </el-cascader>
        </el-form-item>
      </re-col>

      <re-col
        v-if="[0, 1, 2].indexOf(newFormInline.menuType) >= 0"
        :value="12"
        :xs="24"
        :sm="24"
      >
        <el-form-item label="菜单名称" prop="menuData.name">
          <el-input
            v-model="newFormInline.menuData.name"
            clearable
            placeholder="请输入菜单名称"
          />
        </el-form-item>
      </re-col>
      <re-col v-if="newFormInline.menuType === 3" :value="12" :xs="24" :sm="24">
        <el-form-item label="权限名称" prop="permData.name">
          <el-input
            v-model="newFormInline.permData.name"
            clearable
            placeholder="请输入权限名称"
          />
        </el-form-item>
      </re-col>
      <re-col
        v-if="[0, 1].indexOf(newFormInline.menuType) >= 0"
        :value="12"
        :xs="24"
        :sm="24"
      >
        <el-form-item label="路由名称" prop="menuData.routeName">
          <el-input
            v-model="newFormInline.menuData.routeName"
            clearable
            placeholder="请输入路由名称"
          />
        </el-form-item>
      </re-col>

      <re-col v-if="newFormInline.menuType === 2" :value="12" :xs="24" :sm="24">
        <el-form-item
          label="链接地址"
          prop="menuData.routeName"
          :rules="[{ required: true, message: '链接地址不能为空' }]"
        >
          <el-input
            v-model="newFormInline.menuData.routeName"
            clearable
            placeholder="请输入链接地址"
            @change="newFormInline.menuData.component = ''"
          />
        </el-form-item>
      </re-col>

      <re-col
        v-if="[0, 1].indexOf(newFormInline.menuType) >= 0"
        :value="12"
        :xs="24"
        :sm="24"
      >
        <el-form-item label="路由路径" prop="menuData.routePath">
          <el-input
            v-model="newFormInline.menuData.routePath"
            clearable
            placeholder="请输入路由路径"
          />
        </el-form-item>
      </re-col>
      <re-col v-if="newFormInline.menuType === 0" :value="12" :xs="24" :sm="24">
        <el-form-item label="组件路径">
          <el-input
            v-model="newFormInline.menuData.component"
            clearable
            placeholder="请输入组件路径"
          />
        </el-form-item>
      </re-col>

      <re-col v-if="newFormInline.menuType === 1" :value="12" :xs="24" :sm="24">
        <!-- iframe -->
        <el-form-item label="链接地址" prop="menuData.component">
          <el-input
            v-model="newFormInline.menuData.component"
            clearable
            placeholder="请输入 iframe 链接地址（https://）"
          />
        </el-form-item>
      </re-col>

      <re-col v-if="newFormInline.menuType === 3" :value="12" :xs="24" :sm="24">
        <!-- 按钮级别权限设置 -->
        <el-form-item label="按钮权限" prop="permData.btnPerm">
          <el-input
            v-model="newFormInline.permData.btnPerm"
            clearable
            placeholder="请输入按钮权限"
          />
        </el-form-item>
      </re-col>
      <re-col v-if="newFormInline.menuType === 3" :value="12" :xs="24" :sm="24">
        <!-- 后端接口请求的权限，如果有和按钮绑定，比如修改你就应该是绑定 put 的接口的权限 -->
        <el-form-item label="url 权限" prop="permData.urlPerm">
          <el-input
            v-model="newFormInline.permData.urlPerm"
            clearable
            placeholder="url 权限"
          />
        </el-form-item>
      </re-col>

      <re-col
        v-if="[0, 1, 2].indexOf(newFormInline.menuType) >= 0"
        :value="12"
        :xs="24"
        :sm="24"
      >
        <el-form-item label="菜单图标">
          <IconSelect v-model="newFormInline.menuData.icon" class="w-full" />
        </el-form-item>
      </re-col>
      <re-col
        v-if="[0, 1, 2].indexOf(newFormInline.menuType) >= 0"
        :value="12"
        :xs="24"
        :sm="24"
      >
        <el-form-item label="右侧图标">
          <IconSelect v-model="newFormInline.meta.extraIcon" class="w-full" />
        </el-form-item>
      </re-col>

      <re-col
        v-if="[0, 1].indexOf(newFormInline.menuType) >= 0"
        :value="12"
        :xs="24"
        :sm="24"
      >
        <el-form-item label="进场动画">
          <ReAnimateSelector
            v-model="newFormInline.meta.transition.enterTransition"
            placeholder="请选择页面进场加载动画"
          />
        </el-form-item>
      </re-col>
      <re-col
        v-if="[0, 1].indexOf(newFormInline.menuType) >= 0"
        :value="12"
        :xs="24"
        :sm="24"
      >
        <el-form-item label="离场动画">
          <ReAnimateSelector
            v-model="newFormInline.meta.transition.leaveTransition"
            placeholder="请选择页面离场加载动画"
          />
        </el-form-item>
      </re-col>

      <re-col :value="12" :xs="24" :sm="24">
        <el-form-item label="菜单排序">
          <el-input-number
            v-model="newFormInline.menuData.sort"
            class="w-full!"
            :min="1"
            :max="9999"
            controls-position="right"
          />
        </el-form-item>
      </re-col>
      <re-col v-if="newFormInline.menuType === 0" :value="12" :xs="24" :sm="24">
        <el-form-item label="路由重定向">
          <el-input
            v-model="newFormInline.menuData.redirect"
            clearable
            placeholder="请输入默认跳转地址"
          />
        </el-form-item>
      </re-col>

      <re-col v-if="newFormInline.menuType === 0" :value="12" :xs="24" :sm="24">
        <el-form-item label="菜单激活">
          <el-input
            v-model="newFormInline.meta.activePath"
            clearable
            placeholder="请输入需要激活的菜单"
          />
        </el-form-item>
      </re-col>

      <el-divider
        v-if="[0, 1, 2].indexOf(newFormInline.menuType) >= 0"
        content-position="left"
        border-style="dashed"
        >状态设置</el-divider
      >

      <re-col v-if="newFormInline.menuType === 1" :value="12" :xs="24" :sm="24">
        <el-form-item label="加载动画">
          <Segmented
            :modelValue="newFormInline.meta.frameLoading ? 0 : 1"
            :options="frameLoadingOptions"
            @change="
              ({ option: { value } }) => {
                newFormInline.meta.frameLoading = value;
              }
            "
          />
        </el-form-item>
      </re-col>

      <re-col v-if="newFormInline.menuType !== 3" :value="12" :xs="24" :sm="24">
        <el-form-item label="菜单">
          <Segmented
            :modelValue="newFormInline.menuData.hidden ? 1 : 0"
            :options="showLinkOptions"
            @change="
              ({ option: { value } }) => {
                newFormInline.menuData.hidden = value ? 1 : 0;
              }
            "
          />
        </el-form-item>
      </re-col>
      <re-col v-if="newFormInline.menuType !== 3" :value="12" :xs="24" :sm="24">
        <el-form-item label="父级菜单">
          <Segmented
            :modelValue="newFormInline.menuData.alwaysShow ? 0 : 1"
            :options="showParentOptions"
            @change="
              ({ option: { value } }) => {
                newFormInline.menuData.alwaysShow = value ? 1 : 0;
              }
            "
          />
        </el-form-item>
      </re-col>

      <re-col v-if="newFormInline.menuType === 0" :value="12" :xs="24" :sm="24">
        <el-form-item label="缓存页面">
          <Segmented
            :modelValue="newFormInline.menuData.isCache ? 0 : 1"
            :options="keepAliveOptions"
            @change="
              ({ option: { value } }) => {
                newFormInline.menuData.isCache = value ? 1 : 0;
              }
            "
          />
        </el-form-item>
      </re-col>

      <re-col
        v-if="[0, 1].indexOf(newFormInline.menuType) >= 0"
        :value="12"
        :xs="24"
        :sm="24"
      >
        <el-form-item label="标签页">
          <Segmented
            :modelValue="newFormInline.meta.hiddenTag ? 1 : 0"
            :options="hiddenTagOptions"
            @change="
              ({ option: { value } }) => {
                newFormInline.meta.hiddenTag = value;
              }
            "
          />
        </el-form-item>
      </re-col>
      <re-col
        v-if="[0, 1].indexOf(newFormInline.menuType) >= 0"
        :value="12"
        :xs="24"
        :sm="24"
      >
        <el-form-item label="固定标签页">
          <Segmented
            :modelValue="newFormInline.meta.fixedTag ? 0 : 1"
            :options="fixedTagOptions"
            @change="
              ({ option: { value } }) => {
                newFormInline.meta.fixedTag = value;
              }
            "
          />
        </el-form-item>
      </re-col>
      <re-col v-if="newFormInline.menuType === 2" :value="12" :xs="24" :sm="24">
        <el-form-item label="新窗口">
          <Segmented
            :modelValue="newFormInline.menuData.isBlank ? 0 : 1"
            :options="outLinkOptionOptions"
            @change="
              ({ option: { value } }) => {
                newFormInline.menuData.isBlank = value ? 1 : 0;
              }
            "
          />
        </el-form-item>
      </re-col>
      <re-col
        v-if="[0, 1, 2].indexOf(newFormInline.menuType) >= 0"
        :value="12"
        :xs="24"
        :sm="24"
      >
        <el-form-item label="状态">
          <Segmented
            :modelValue="newFormInline.menuData.status ? 0 : 1"
            :options="menuStatusOptions"
            @change="
              ({ option: { value } }) => {
                newFormInline.menuData.status = value ? 1 : 0;
              }
            "
          />
        </el-form-item>
      </re-col>
      <re-col
        v-if="[0, 1, 2].indexOf(newFormInline.menuType) >= 0"
        :value="24"
        :xs="24"
        :sm="24"
      >
        <el-collapse>
          <el-collapse-item title="高级配置" name="1">
            <el-form-item label="路由参数" prop="menuData.props">
              <el-input
                v-model="newFormInline.menuData.props"
                clearable
                type="textarea"
                placeholder="自定义路由参数"
              />
            </el-form-item>
          </el-collapse-item>
        </el-collapse>
      </re-col>
    </el-row>
  </el-form>
</template>
