import { reactive } from "vue";
import type { FormRules } from "element-plus";

/** 自定义表单规则校验 */
export const formRules = reactive(<FormRules>{
  tenantId: [{ required: true, message: "租户ID为必填项", trigger: "blur" }],
  tenantName: [
    { required: true, message: "租户名称为必填项", trigger: "blur" }
  ],
  tenantManager: [
    { required: true, message: "租户管理员为必填项", trigger: "blur" }
  ]
});
