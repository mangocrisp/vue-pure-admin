import { reactive } from "vue";
import type { FormRules } from "element-plus";

/** 自定义表单规则校验 */
export const formRules = reactive(<FormRules>{
  title: [{ required: true, message: "字典为必填项", trigger: "blur" }],
  dictCode: [{ required: true, message: "字典编码为必填项", trigger: "blur" }]
});
