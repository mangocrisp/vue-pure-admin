/**
 * 基础信息项
 */
interface LfFormTodoInfoBasicItem {
  /** 标签文本 */
  label?: string;
  /** 值 */
  value?: string | number | boolean;
  /** 列的数量 */
  span?: number;
  /** 单元格应该跨越的行数 */
  rowspan?: number;
  /** 列的宽度，不同行相同列的宽度按最大值设定（如无 border ，宽度包含标签与内容） */
  width?: string | number;
  /** 列的最小宽度，与 width 的区别是 width 是固定的，min-width 会把剩余宽度按比例分配给设置了 min-width 的列（如无 border，宽度包含标签与内容） */
  minWidth?: string | number;
  /** 列标签宽，如果未设置，它将与列宽度相同。 比 Descriptions 的 label-width 优先级高 */
  labelWidth?: number | string;
  /** 列的内容对齐方式（如无 border，对标签和内容均生效） */
  align?: "left" | "center" | "right";
  /** 列的标签对齐方式，若不设置该项，则使用内容的对齐方式（如无 border，请使用 align 参数） */
  labelAlign?: "left" | "center" | "right";
  /** 列的内容自定义类名 */
  className?: string;
  /** 列的标签自定义类名 */
  labelClassName?: string;
}

/**
 * 基础信息
 */
interface LfFormTodoInfoBasic {
  /** 是否带有边框 */
  border?: boolean;
  /** 一行 Descriptions Item 的数量 */
  column?: number;
  /** 排列的方向 */
  direction?: "vertical" | "horizontal";
  /** 列表的尺寸 */
  size?: "large" | "default" | "small";
  /** 标题文本，显示在左上方 */
  title?: string;
  /** 操作区文本，显示在右上方 */
  extra?: string;
  /** 每一列的标签宽度 */
  labelWidth?: number | string;
  /** 项 */
  children?: LfFormTodoInfoBasicItem[];
}
/**
 * 流转记录项
 */
interface LfFormTodoInfoRecordDetail {
  /** 面板标题 */
  title?: string;
  /** 唯一标志符 */
  name: string;
  /** 项 */
  basic?: LfFormTodoInfoBasic;
}
/**
 * 流转记录
 */
interface LfFormTodoInfoRecord {
  /** 时间戳 */
  timestamp?: string;
  /** 是否隐藏时间戳 */
  hideTimestamp?: boolean;
  /** 是否垂直居中 */
  center?: boolean;
  /** 时间戳位置 */
  placement?: "top" | "bottom";
  /** 节点类型 */
  type?: "primary" | "success" | "warning" | "danger" | "info";
  /** 节点颜色 */
  color?: string;
  /** 节点尺寸 */
  size?: "normal" | "large";
  /** 自定义图标 */
  icon?: string;
  /** 是否空心点 */
  hollow?: boolean;
  /** 流转节点标签 */
  title?: string;
  /** 流转节点备注描述信息 */
  description?: string;
  /** 操作者 */
  operator?: string;
  /** 节点详情 */
  detail?: LfFormTodoInfoRecordDetail;
}

/**
 * 待办信息
 */
interface LfFormTodoInfo {
  releaseId?: string;
  processId?: string;
  /** 基础信息 */
  basic?: LfFormTodoInfoBasic;
  records?: LfFormTodoInfoRecord[];
  infoMap?: Map<string, LfFormTodoInfoRecordDetail>;
}

export type {
  LfFormTodoInfo,
  LfFormTodoInfoBasicItem,
  LfFormTodoInfoBasic,
  LfFormTodoInfoRecord,
  LfFormTodoInfoRecordDetail
};
