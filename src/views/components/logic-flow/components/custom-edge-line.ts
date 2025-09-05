// 直线
import { LineEdge, PolylineEdgeModel } from "@logicflow/core";

class CustomLineEdgeModel extends PolylineEdgeModel {
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

class CustomLineEdge extends LineEdge {}
export default {
  type: "custom-edge-line",
  view: CustomLineEdge,
  model: CustomLineEdgeModel
};
