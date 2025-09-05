import type { ConnectRule } from "@logicflow/core";
import { GroupNode } from "@logicflow/extension";

class CustomGroupModel extends GroupNode.model {
  initNodeData(data) {
    super.initNodeData(data);
    // 是否限制分组子节点拖出分组，默认 false
    this.isRestrict = false;
    // 分组是否支持手动调整大小，默认 false
    this.resizable = true;
    // 分组是否显示展开收起按钮，默认 false
    this.foldable = true;
    this.width = 500;
    this.height = 300;
    this.foldedWidth = 50;
    this.foldedHeight = 50;
  }

  getNodeStyle() {
    const style = super.getNodeStyle();
    style.stroke = "#13227a";
    return style;
  }
  getTextStyle() {
    const style = super.getTextStyle();
    style.color = "#13227a";
    style.fontSize = 16;
    return style;
  }
  /**
   * 校验是否允许传入节点添加到此分组中，默认所有的节点都可以。
   * @param nodeData 节点数据
   * @returns boolean
   */
  isAllowAppendIn(nodeData) {
    // 开始和分组 | 结尾节点不允许放入
    return ["custom-group"].indexOf(nodeData.type) < 0;
  }

  getConnectedTargetRules() {
    const rules = super.getConnectedTargetRules();
    const notAsTarget = {
      message: "分组不能连入！",
      validate: () => false
    };
    rules.push(notAsTarget);
    return rules;
  }

  getConnectedSourceRules(): ConnectRule[] {
    const rules = super.getConnectedSourceRules();
    const geteWayOnlyAsTarget = {
      message: "分组不能连出！",
      validate: () => false
    };
    rules.push(geteWayOnlyAsTarget);
    return rules;
  }
}
class CustomGroup extends GroupNode.view {}
export default {
  type: "custom-group",
  model: CustomGroupModel,
  view: CustomGroup
};
