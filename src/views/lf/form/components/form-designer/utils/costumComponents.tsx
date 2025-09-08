import FcDesigner from "@form-create/designer";
import { useFormCostumComponentsTodoInfo } from "@/views/lf/form/custom-components/todoInfo/utils/rule";
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
        setTimeout(() => {
          FormCreateDesignerRef.value
            .getDesignerRef()
            .addComponent(componentMap.get(componentName).rule);
        }, 1000);
      }
    });
  };
  return { loadCostumComponents };
}
