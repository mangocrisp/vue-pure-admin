// 格式化相关的功能
import type { BaseNodeModel } from "@logicflow/core";
import type LogicFlow from "@logicflow/core";
import { ref } from "vue";

/**
 * 节点对齐方式
 */
export enum nodeAling {
  // HT（水平上）
  HT,
  // HC（水平中）
  HC,
  // HB（水平下）
  HB,
  // HA（水平等距）
  HA,
  // VL（垂直左）
  VL,
  // VC（垂直中）
  VC,
  // VR（垂直右）
  VR,
  // VA（垂直等距）
  VA
}
/**
 * 对齐
 * @param align 对齐方式
 * @param data 选择的数据，这里包含了节点和线
 * @param lf LogicFlow 对象
 */
export const alignment = (align: nodeAling, data: any, lf: LogicFlow) => {
  const { nodes } = data;
  if (!nodes || nodes.length === 0) {
    return;
  }
  switch (align) {
    case nodeAling.HT:
      // 水平顶部对齐
      nodes.forEach(node =>
        setHorizontal(node, lf, Math.min(...nodes.map(node => node.y)))
      );
      break;
    case nodeAling.HC:
      // 水平居中对齐
      nodes.forEach(node =>
        setHorizontal(node, lf, sum(nodes.map(node => node.y)) / nodes.length)
      );
      break;
    case nodeAling.HB:
      // 水平底部对齐
      nodes.forEach(node =>
        setHorizontal(node, lf, Math.max(...nodes.map(node => node.y)))
      );
      break;
    case nodeAling.HA:
      // 水平等距对齐
      // 最小的 x
      const minX = Math.min(...nodes.map(node => node.x));
      // 平均距离 = (最大-最小)/(总数-1) 这里要-1是因为是两个之间，不是所有
      const avgDistanceX =
        (Math.max(...nodes.map(node => node.x)) - minX) / (nodes.length - 1);
      nodes
        .sort((a, b) => a.x - b.x)
        .forEach((node, index) =>
          setVertical(node, lf, minX + index * avgDistanceX)
        );
      break;
    case nodeAling.VL:
      // 垂直左对齐
      nodes.forEach(node =>
        setVertical(node, lf, Math.min(...nodes.map(node => node.x)))
      );
      break;
    case nodeAling.VC:
      // 垂直居中对齐
      nodes.forEach(node =>
        setVertical(node, lf, sum(nodes.map(node => node.x)) / nodes.length)
      );
      break;
    case nodeAling.VR:
      // 垂直右对齐
      nodes.forEach(node =>
        setVertical(node, lf, Math.max(...nodes.map(node => node.x)))
      );
      break;
    case nodeAling.VA:
      // 水平等距对齐
      // 最小的 y
      const minY = Math.min(...nodes.map(node => node.y));
      // 平均距离 = (最大-最小)/(总数-1) 这里要-1是因为是两个之间，不是所有
      const avgDistanceY =
        (Math.max(...nodes.map(node => node.y)) - minY) / (nodes.length - 1);
      nodes
        .sort((a, b) => a.y - b.y)
        .forEach((node, index) =>
          setHorizontal(node, lf, minY + index * avgDistanceY)
        );
      break;
    default:
  }
};
/**
 * 设置水平节点
 * @param node 节点
 * @param lf LogicFlow 对象
 * @param calcY 计算 y 轴值
 */
const setHorizontal = (node: any, lf: LogicFlow, calcY: number) => {
  // 差值
  const differ = calcY - node.y;
  lf.getNodeModelById(node.id).y = calcY;
  lf.getNodeModelById(node.id).text.y = calcY;
  lf.getEdgeModels({
    sourceNodeId: node.id
  }).forEach(edge => {
    edge.startPoint.y = edge.startPoint.y + differ;
    edge.text.x = (edge.startPoint.x + edge.endPoint.x) / 2;
    edge.text.y = (edge.startPoint.y + edge.endPoint.y) / 2;
  });
  lf.getEdgeModels({
    targetNodeId: node.id
  }).forEach(edge => {
    edge.endPoint.y = edge.endPoint.y + differ;
    edge.text.x = (edge.startPoint.x + edge.endPoint.x) / 2;
    edge.text.y = (edge.startPoint.y + edge.endPoint.y) / 2;
  });
};
/**
 * 设置垂直节点
 * @param node 节点
 * @param lf LogicFlow 对象
 * @param calcX 计算 x 轴值
 */
const setVertical = (node: any, lf: LogicFlow, calcX: number) => {
  // 差值
  const differ = calcX - node.x;
  lf.getNodeModelById(node.id).x = calcX;
  lf.getNodeModelById(node.id).text.x = calcX;
  lf.getEdgeModels({
    sourceNodeId: node.id
  }).forEach(edge => {
    edge.startPoint.x = edge.startPoint.x + differ;
    edge.text.x = (edge.startPoint.x + edge.endPoint.x) / 2;
    edge.text.y = (edge.startPoint.y + edge.endPoint.y) / 2;
  });
  lf.getEdgeModels({
    targetNodeId: node.id
  }).forEach(edge => {
    edge.endPoint.x = edge.endPoint.x + differ;
    edge.text.x = (edge.startPoint.x + edge.endPoint.x) / 2;
    edge.text.y = (edge.startPoint.y + edge.endPoint.y) / 2;
  });
};

/**
 * 数组求和
 * @param arr 数组
 * @returns 和
 */
const sum = (arr: Array<number>): number => {
  return eval(arr.join("+"));
};

/**
 * 这里定义最终节点之间的隔离是 20
 */
const finalNodeHorizontalInterval = 20;
/**
 * 所有节点之间垂直距离是 250
 */
const VerticalInterval = 250;
/**
 * 最终节点的宽度是 100
 */
const finalNodeWidth = 250;

/**
 * 一键美化
 * @param lf LogicFlow 对象
 */
export const beautify = (lf: LogicFlow) => {
  const { nodes, edges } = lf.getGraphData();
  if (!nodes || nodes.length == 0) {
    return;
  }
  // TODO
  // 1先找到所有的线的所有的起点和终点，拿所有的点减去起点，得到的终点就再也没有连到别处去的点
  // 2计算这些终点到起点最长的是哪些终点，按一个值(VerticalInterval)来计算最远终点距离点起有多远
  // 3把这些点水平再等距
  const sourceNodeIdCollection = edges.map(edge => edge.sourceNodeId);
  const targetNodeIdCollection = edges.map(edge => edge.targetNodeId);
  // 起始节点 id
  const startNodeId = sourceNodeIdCollection.find(
    id => targetNodeIdCollection.indexOf(id) < 0
  );
  const finalNodeIdCollection = new Set(
    targetNodeIdCollection.filter(id => sourceNodeIdCollection.indexOf(id) < 0)
  );
  // 起始节点
  const startNode = lf.getNodeModelById(startNodeId);
  // 所有的最终节点的 x = (总数 * 宽度 + (总数-1) * 最终节点之间的隔离)
  const totalFinalNodeX =
    finalNodeIdCollection.size * finalNodeWidth +
    (finalNodeIdCollection.size - 1) * finalNodeHorizontalInterval;
  // 那最小的 x 轴坐标就是 起点x - totalFinalNodeX / 2
  const minX = startNode.x - totalFinalNodeX / 2;
  beautifyNodes(startNode, minX, lf);
};

/**
 * 美化节点
 * @param parentNode 父节点
 * @param startX 起点 x
 * @param lf LogicFlow 对象
 * @returns x 轴坐标最终到了哪里
 */
const beautifyNodes = (
  parentNode: BaseNodeModel,
  startX: number,
  lf: LogicFlow
) => {
  const endX = ref<number>(startX);
  // 获取所有的子节点
  const childrenNodes = lf.getNodeOutgoingNode(parentNode.id);
  if (!childrenNodes || childrenNodes.length === 0) {
    // 如果已经没有下级了，那最终的 x 就是传进来的 x
    return endX.value;
  }
  childrenNodes
    .sort((a, b) => a.x - b.x)
    .forEach((node, index) => {
      setHorizontal(node, lf, parentNode.y + VerticalInterval);
      // 当前的 X
      const currentX =
        index === 0
          ? endX.value
          : endX.value + (finalNodeWidth + finalNodeHorizontalInterval);
      // 如果有子集就会去找子集的最大的，然后到最后返回也就是当前级最大的，也就是父级的子集的最大的 x
      const childEndX = beautifyNodes(node, currentX, lf);
      setVertical(node, lf, (currentX + childEndX) / 2);
      endX.value = childEndX;
    });
  return endX.value;
};
