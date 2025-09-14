// 支持缩放的节点
import { type BaseNodeModel, type ConnectRule, h } from "@logicflow/core";
import { DiamondResize } from "@logicflow/extension";
import { getSequenceShape } from "./custom-commmon";
import { NodesType } from "@/views/components/logic-flow/types/types";
class CustomNodeJudgmentModel extends DiamondResize.model {
  initNodeData(data) {
    super.initNodeData(data);
  }

  getConnectedSourceRules(): ConnectRule[] {
    const rules = super.getConnectedSourceRules();
    const geteWayOnlyAsTarget = {
      message: "不能往复连线",
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
        return (
          source?.graphModel?.edges?.filter(
            e =>
              (e.targetNodeId === source.id && e.sourceNodeId === target.id) ||
              (e.targetNodeId === target.id && e.sourceNodeId === source.id)
          ).length <= 0
        );
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
      style.stroke = "#f4ea2a";
      style.strokeWidth = 2;
    }
    return style;
  }
  getTextStyle() {
    const style = super.getTextStyle();
    style.color = "#111";
    return style;
  }
}
class CustomNodeJudgment extends DiamondResize.view {
  /**
   * 此方法替代自定义节点的getShape方法。
   */
  getResizeShape() {
    const { model } = this.props;
    const { r, points } = model;
    const pointStr = points
      .map(point => {
        return `${point[0]}, ${point[1]}`;
      })
      .join(" ");
    const style = model.getNodeStyle();
    return h("g", {}, [
      ...getSequenceShape(this.props),
      h("polygon", {
        ...style,
        r, // 半径保持不变
        points: pointStr //
      })
    ]);
  }
}
export default {
  type: NodesType.judgment,
  model: CustomNodeJudgmentModel,
  view: CustomNodeJudgment
};
