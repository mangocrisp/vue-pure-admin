<script setup lang="ts">
import { ref } from "vue";
import Zh from "@form-create/designer/locale/zh-cn.js";
import En from "@form-create/designer/locale/en.js";
import { Config } from "@form-create/designer";
import Check from "~icons/ep/check";
import SolarTextBold from "~icons/solar/text-bold";

defineOptions({
  name: "FormCreateDesigner"
});

export interface FormCreateDesignerProps {
  height?: string;
  locale?: any;
  mask?: boolean;
  config?: Config;
}

const props = withDefaults(defineProps<FormCreateDesignerProps>(), {
  height: "100%",
  mask: true,
  locale: Zh
});

/**
 * 定义钩子
 */
const emit = defineEmits<{
  /**保存数据 */
  (
    e: "save",
    value: {
      rule: any;
      options: any;
    }
  ): void;
}>();

// 可以在此处获取设计器实例或进行其他操作
const designerRef = ref(null);
const heightRef = ref(props.height);
const localeRef = ref(props.locale);
const localeS = ref("zh");
const maskRef = ref(props.mask);
const configRef = ref<Config>(
  Object.assign(
    {
      /** 显示保存按钮 */
      showSaveBtn: true,
      /** 控制字段ID输入框能否输入 */
      fieldReadonly: false,
      /** 在表单配置菜单中追加自定义配置项 */
      appendConfigData: ["formCreateMark"],
      formRule: {
        prepend: true,
        // append: true, // 添加到底部
        rule() {
          return [
            {
              type: "textarea",
              style: "width: 100%;",
              //配置名称, 修改 options.mark
              field: "formCreateMark",
              title: "表单备注"
            }
          ];
        }
      }, //给所有表单组件增加
      baseRule: {
        prepend: true,
        // append: true, // 添加到底部
        rule() {
          return [
            {
              type: "textarea",
              style: "width: 100%;",
              //配置名称, 修改 rule.mark
              field: "formCreateMark",
              title: "组件备注"
            }
          ];
        }
      },
      //提交按钮配置
      submitBtn: {
        //是否显示提交按钮
        show: false
      },
      //重置按钮配置
      resetBtn: {
        //是否显示重置按钮
        show: false
      },
      localeOptions: [
        { value: "zh-cn", label: "简体中文" },
        { value: "en", label: "English" }
      ]
    },
    props.config
  )
);

/**
 * 获取设计器实例
 */
const getDesignerRef = () => designerRef.value;

/**
 * 保存数据
 */
const handleSave = ({ rule, options }) => emit("save", { rule, options });

/**
 * 加载数据
 * @param rule 规则
 * @param options 选项
 */
const loadData = ({ rule, options }) => {
  designerRef.value.setOptions(options);
  designerRef.value.setRule(rule);
};

/**
 * 翻译
 * @param locale 语言
 */
const translation = (locale: string) => {
  localeS.value = locale;
  if (locale === "zh-cn") {
    localeRef.value = Zh;
  } else if (locale === "en") {
    localeRef.value = En;
  } else {
    localeRef.value = Zh;
  }
};

defineExpose({ getDesignerRef, loadData });
</script>

<template>
  <div class="fc-designer-container">
    <fc-designer
      ref="designerRef"
      :locale="localeRef"
      :height="heightRef"
      :mask="maskRef"
      :config="configRef"
      @save="handleSave"
      ><template #handle>
        <!-- 国际化 -->
        <el-dropdown id="header-translation" trigger="click" class="mr-[10px]">
          <el-button size="small" color="#626aef" plain>
            <IconifyIconOffline :icon="SolarTextBold" />{{
              localeS === "zh" ? "语言" : "Language"
            }}
          </el-button>
          <template #dropdown>
            <el-dropdown-menu class="translation">
              <el-dropdown-item @click="translation('zh-cn')">
                <IconifyIconOffline
                  v-show="localeS === 'zh'"
                  class="check-zh"
                  :icon="Check"
                />
                简体中文
              </el-dropdown-item>
              <el-dropdown-item @click="translation('en')">
                <span v-show="localeS === 'en'" class="check-en">
                  <IconifyIconOffline :icon="Check" />
                </span>
                English
              </el-dropdown-item>
            </el-dropdown-menu>
          </template>
        </el-dropdown>
      </template>
    </fc-designer>
  </div>
</template>
<style scped lang="scss">
.fc-designer-container {
  height: 100%;
}
</style>
