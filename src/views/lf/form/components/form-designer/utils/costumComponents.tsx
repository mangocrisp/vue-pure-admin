import FcDesigner from "@form-create/designer";
import { useFormCostumComponentsTodoInfo } from "@/views/lf/form/custom-components/todoInfo/utils/rule";
import { useFormCostumComponentsDeptSelector } from "@/views/lf/form/custom-components/deptSelector/utils/rule";
export function useFormCostumComponents(FormCreateDesignerRef) {
  const componentMap = new Map<string, { component: any; rule: any }>();

  /**
   * 自定义组件 —— 流程待办信息
   */
  const { LfFormTodoInfo, LfFormTodoInfoRule } =
    useFormCostumComponentsTodoInfo();
  componentMap.set("LfFormTodoInfo", {
    component: LfFormTodoInfo,
    rule: LfFormTodoInfoRule
  });

  /**
   * 自定义组件 —— 部门选择器
   */
  const { LfFormDeptSelector, LfFormDeptSelectorRule } =
    useFormCostumComponentsDeptSelector();
  componentMap.set("LfFormDeptSelector", {
    component: LfFormDeptSelector,
    rule: LfFormDeptSelectorRule
  });

  /**
   * 加载自定义组件
   */
  const loadCostumComponents = async (
    componentNames: string[] = Array.from(componentMap.keys())
  ) => {
    componentNames.forEach(componentName => {
      FcDesigner.component(
        componentName,
        componentMap.get(componentName).component
      );
      if (FormCreateDesignerRef && FormCreateDesignerRef.value) {
        FormCreateDesignerRef.value
          .getDesignerRef()
          .addComponent(componentMap.get(componentName).rule);
      }
    });
  };
  return { loadCostumComponents };
}
