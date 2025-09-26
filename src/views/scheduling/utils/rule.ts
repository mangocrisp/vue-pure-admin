import { reactive } from "vue";
import type { FormRules } from "element-plus";

/** 自定义表单规则校验 */
export const formRules = reactive(<FormRules>{
  taskKey: [{ required: true, message: "请输入任务键", trigger: "blur" }],
  description: [{ required: true, message: "请输入任务描述", trigger: "blur" }],
  cron: [{ required: true, message: "请输入cron 表达式", trigger: "blur" }],
  autoStart: [
    {
      required: true,
      message: "请输入是否自动启动(1 是 0 否)",
      trigger: "blur"
    }
  ],
  sort: [{ required: true, message: "请输入排序", trigger: "blur" }]
});
