import { defineAsyncComponent } from "vue";

export function useFormCostumComponentsTodoInfo() {
  const LfFormTodoInfo = defineAsyncComponent(
    () => import("@/views/lf/form/custom-components/todoInfo/index.vue")
  );
  /** 待办信息拖拽规则 */
  const LfFormTodoInfoRule = {
    menu: "business",
    icon: "icon-descriptions",
    label: "流程信息",
    name: "LfFormTodoInfo",
    intput: false,
    //组件可以配置的事件
    event: ["click"],
    rule() {
      //组件的渲染规则
      return {
        //组件的名称, 与上一步是对应
        type: "LfFormTodoInfo",
        field: "flowInfo",
        title: "",
        info: "请不要修改字段 ID (flowInfo)，仅展示流程信息",
        props: {}
      };
    },
    props() {
      //组件右侧的配置项,与组件中的 props 对应
      return [];
    }
  };
  return {
    LfFormTodoInfo,
    LfFormTodoInfoRule
  };
}
