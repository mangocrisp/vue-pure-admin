// 折线
import { PolylineEdge, PolylineEdgeModel } from "@logicflow/core";

class CustomPolylineEdgeModel extends PolylineEdgeModel {
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
class CustomPolylineEdge extends PolylineEdge {}
export default {
  type: "custom-edge-polyline",
  view: CustomPolylineEdge,
  model: CustomPolylineEdgeModel
};
