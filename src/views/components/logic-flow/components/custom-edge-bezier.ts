// 贝塞尔曲线
import { BezierEdge, BezierEdgeModel } from "@logicflow/core";

class CustomBezierEdgeModel extends BezierEdgeModel {
  setAttributes() {
    const { properties } = this;
    if (properties.isActivated) {
      this.isAnimation = true;
    }
  }
  setHovered(isHovered) {
    super.setHovered(isHovered);
    const { properties } = this;
    if (!properties.isActivated) {
      this.isAnimation = isHovered;
    }
  }
  getTextStyle() {
    const style = super.getTextStyle();
    style.color = "#2b2b2b";
    if (style.background) {
      style.background.fill = "#fff";
    }
    return style;
  }
  getEdgeAnimationStyle() {
    const style = super.getEdgeAnimationStyle();
    style.strokeDasharray = "5 5";
    style.stroke = "green";
    return style;
  }
}
class CustomBezierEdge extends BezierEdge {}
export default {
  type: "custom-edge-bezier",
  view: CustomBezierEdge,
  model: CustomBezierEdgeModel
};
