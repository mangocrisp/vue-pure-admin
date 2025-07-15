import { reactive } from "vue";
import type { FormRules } from "element-plus";

/** 自定义表单规则校验 */
export const formRules = reactive(<FormRules>{
  "menuData.name": [
    { required: true, message: "菜单名称为必填项", trigger: "blur" }
  ],
  "permData.name": [
    {
      required: true,
      message: "权限名称为必填项",
      trigger: "blur"
    }
  ],
  "menuData.routeName": [
    { required: true, message: "路由名称为必填项", trigger: "blur" }
  ],
  "menuData.routePath": [
    { required: true, message: "路由路径为必填项", trigger: "blur" }
  ],
  "menuData.component": [
    { required: true, message: "路径为必填项", trigger: "blur" }
  ],
  "permData.btnPerm": [
    { required: true, message: "按钮权限为必填项", trigger: "blur" }
  ],
  "permData.urlPerm": [
    { required: true, message: "url 权限为必填项", trigger: "blur" }
  ]
});
