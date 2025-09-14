// 支持缩放的节点
import { type BaseNodeModel, type ConnectRule, h } from "@logicflow/core";
import { EllipseResize } from "@logicflow/extension";
import { getSequenceShape } from "./custom-commmon";
import { NodesType } from "@/views/components/logic-flow/types/types";
class CustomNodeEndModel extends EllipseResize.model {
  initNodeData(data) {
    super.initNodeData(data);
    this.rx = 50;
    this.ry = 50;
  }

  getConnectedSourceRules(): ConnectRule[] {
    const rules = super.getConnectedSourceRules();
    const geteWayOnlyAsTarget = {
      message: "结束节点只能连入，不能连出！",
      validate: (
        source: BaseNodeModel,
        target: BaseNodeModel,
        sourceAnchor,
        targetAnchor
      ) => {
        console.debug("source", source);
        console.debug("target", target);
        console.debug("sourceAnchor", sourceAnchor);
        console.debug("targetAnchor", targetAnchor);
        let isValid = true;
        if (source) {
          isValid = false;
        }
        return isValid;
      }
    };
    rules.push(geteWayOnlyAsTarget);
    return rules;
  }

  getNodeStyle() {
    const style = super.getNodeStyle();
    const { properties } = this;
    if (properties.isActivated) {
      style.stroke = "green";
      style.strokeWidth = 5;
    } else {
      style.strokeWidth = 2;
    }
    if (properties.success) {
      style.fill = "green";
    } else {
      style.fill = "red";
    }
    return style;
  }
  getTextStyle() {
    const style = super.getTextStyle();
    style.color = "black";
    return style;
  }
}
class CustomNodeEnd extends EllipseResize.view {
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
  type: NodesType.end,
  model: CustomNodeEndModel,
  view: CustomNodeEnd
};
