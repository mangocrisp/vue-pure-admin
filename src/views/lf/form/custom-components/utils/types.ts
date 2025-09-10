interface LfFormCustomComponent {
  /** 自定义组件 */
  [key: string]: any;
  /** 状态 */
  status?: number | string;
  /** 图标 */
  icon?: any;
  /** 组件类型 */
  type?: string;
  /** 名称 */
  name?: string;
  /** 描述 */
  description?: string;
  /** 组件 */
  component?: any;
}

export type { LfFormCustomComponent };
