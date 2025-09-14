// 支持缩放的节点
import { h } from "@logicflow/core";
import { EllipseResize } from "@logicflow/extension";
import { getSequenceShape } from "./custom-commmon";
import { NodesType } from "@/views/components/logic-flow/types/types";
class CustomNodeStartModel extends EllipseResize.model {
  initNodeData(data) {
    super.initNodeData(data);
    this.rx = 50;
    this.ry = 50;
  }
  getConnectedTargetRules() {
    const rules = super.getConnectedTargetRules();
    const notAsTarget = {
      message: "起始节点不能作为边的终点",
      validate: () => false
    };
    rules.push(notAsTarget);
    return rules;
  }

  getNodeStyle() {
    const style = super.getNodeStyle();
    const { properties } = this;
    style.stroke = "green";
    if (properties.isActivated) {
      style.strokeWidth = 5;
    } else {
      style.strokeWidth = 2;
    }
    return style;
  }
  getTextStyle() {
    const style = super.getTextStyle();
    style.color = "green";
    return style;
  }
}
class CustomNodeStart extends EllipseResize.view {
  /**
   * 此方法替代自定义节点的getShape方法。
   */
  getResizeShape() {
    const { model } = this.props;
    const { x, y, rx, ry } = model;
    const style = model.getNodeStyle();
    return h("g", {}, [
      ...getSequenceShape(this.props),
      h("ellipse", {
        ...style,
        cx: x,
        cy: y,
        rx,
        ry
      })
    ]);
  }
}
export default {
  type: NodesType.start,
  model: CustomNodeStartModel,
  view: CustomNodeStart
};
