import { reactive } from "vue";
import type { FormRules } from "element-plus";

/** 自定义表单规则校验 */
export const formRules = reactive(<FormRules>{
  dictKey: [{ required: true, message: "字典键为必填项", trigger: "blur" }],
  dictVal: [{ required: true, message: "字典值为必填项", trigger: "blur" }]
});
