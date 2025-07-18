import { reactive } from "vue";
import type { FormRules } from "element-plus";

/** 自定义表单规则校验 */
export const formRules = reactive(<FormRules>{
  title: [{ required: true, message: "参数名为必填项", trigger: "blur" }],
  paramsKey: [{ required: true, message: "参数键为必填项", trigger: "blur" }],
  paramsVal: [{ required: true, message: "参数值为必填项", trigger: "blur" }]
});
