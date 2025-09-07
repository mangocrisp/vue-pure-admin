// 系统模块-鉴权管理
declare namespace LogicFlowTypes {
  /**
   * select 选项类型
   */
  type SelectOptionItem = {
    key: string;
    label: string;
    value: any;
  };
  /**
   * 拖拽面板 DndPanel
   */
  type PatternItem = {
    /**
     * 节点类型
     */
    type?: string;
    /**
     * 节点文字
     */
    text?: string;
    /**
     * 节点标题
     */
    label?: string;
    /**
     * 节点图标
     */
    icon?: string;
    /**
     * 节点类名
     */
    className?: string;
    /**
     * 业务属性
     */
    properties?: BusinessProperties;
    /**
     * 回调方法
     * @returns 回调钩子
     */
    callback?: () => void;
  };
  /**
   * 业务字段
   */
  type BusinessField = {
    /**
     * 字段唯一键
     */
    key: string;
    /**
     * 字段名
     */
    name: string;
    /**
     * 字段标题
     */
    title: string;
    /**
     * 字段类型
     * <br>
     * STRING: 字符串
     * NUMBER: 数字
     * BOOLEAN: 布尔 (0,1)
     * DATE_TIME: 时间
     * TEXT: 长文本
     * DICT: 字典
     * FILE: 文件
     */
    type:
      | "STRING"
      | "NUMBER"
      | "BOOLEAN"
      | "DATE_TIME"
      | "TEXT"
      | "DICT"
      | "FILE";
    /**
     * 字段值
     */
    value: string | number | undefined;
    /**
     * 字段排序
     */
    sort?: number;
    /**
     * 字段状态
     */
    status?: number | boolean;
    /**
     * 是否只读
     */
    readonly?: boolean;
    /**
     * 是否不可用
     */
    disabled?: boolean;
    /**
     * 是否隐藏
     */
    hidden?: boolean;
    /**
     * 是否非空
     */
    required?: boolean;
    /**
     * 如果类型是 FILE，这个需要指定需要上传哪些类型的文件
     */
    accept?: string;
    /**
     * 是否允许多选文件上传（上传多个文件）
     */
    multiple?: boolean;
    /**
     * 占位符
     */
    placeholder?: string;
    /**
     * 绑定组件
     */
    components?: string;
  };
  /**
   * 业务属性
   */
  type BusinessProperties = {
    /**
     * 如果节点是 custom-node-end(结束节点) 这里就会判断是否是正常结束的节点,例如,请假成功就是正常,请假被拒绝,就是不正常节点
     */
    success?: boolean;
    /**
     * 是否激活,也就是是否流程从当前的节点或者边通过
     */
    isActivated?: boolean;
    /**
     * 次序,一般是在点上的次序,而且一个点可能有多次进入
     */
    sequence?: number[];
    /**
     * 所有的业务字段表单
     */
    fields?: BusinessField[];
    /**
     * 流程中传递的一些属性,虽然可以直接是 properties.xxx 这样去直接往 properties 里面 put 属性,但是,不推荐这样做,这样,就不知道你是一个什么属性
     */
    props?: AnyObject;
    /**
     * 如果是用户节点是否会签
     */
    isCountersign?: boolean;
    /**
     * 如果是用户节点是否抄送
     */
    isCC?: boolean;
    /**
     * 角色列表,一般用于用户节点,用来分配当前节点的权限,有哪些角色可以处理
     */
    roles?: any[];
    /**
     * 用户 id 列表,一般用于用户节点,用来分配当前节点被哪些用户可以处理
     */
    userIdList?: any[];
    /**
     * 部门 id 列表,一般用于用户节点,用来分配当前节点被哪些部门可以处理
     */
    deptIdList?: any[];
    /**
     * 绑定表单
     */
    formBind?: any;
    /**
     * 是否自动处理,当节点是系统节点时,默认为 true,如果节点是用户节点,还希望自动处理逻辑,可以开启
     */
    autoExecute?: boolean;
    /**
     * 自动处理/判断的方式,这里提供 SpES 表达式和提供一个 topic 来让java程序处理
     */
    condition?: "SpEL" | "topic";
    /**
     * 表达式
     */
    expression?: string;
    /**
     * 自动处理的主题,当流程进行到当前节点时,所有订阅了这个主题的 spring boot bean,就会去处理
     */
    topic?: string;
    /**
     * 是否审核通过,这个一般和 isActivated 一起使用的
     */
    approved?: boolean;
    /**
     * 说明文档,可以加备注
     */
    documentation?: string;
  } & AnyObject;
  /**
   * 编辑的 节点/边 属性
   */
  type EditData = {
    /**
     * 节点或者边的 id,这个,可以自己定义生成规则
     */
    id: string;
    /**
     * 业务属性
     */
    properties: BusinessProperties;
    /**
     * 节点或者边上面的文字
     */
    text: string | null;
    /**
     * 节点或者边的类型
     */
    type: string;
    /**
     * 一般是节点的位置 x 坐标
     */
    x?: number | 0;
    /**
     * 一般是节点的位置 y 坐标
     */
    y?: number | 0;
    /**
     * 图层位置
     */
    zIndex?: number | 0;
    [key: string]: any;
    /**
     * 只读
     */
    readonly?: boolean;
  };
}
