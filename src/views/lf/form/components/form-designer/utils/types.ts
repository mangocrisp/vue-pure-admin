import type {
  LfFormTodoInfoModelValue,
  LfFormTodoInfoRecordDetail
} from "@/views/lf/form/custom-components/todoInfo/utils/types";

interface logicFlowFormEditType {
  rule: string;
  options: string;
  /** 表单数据 */
  formData?: any;
  /** 弹窗标题 */
  title?: string;
  /** 是否是新增表单反之是编辑表单 */
  isAddForm?: boolean;
  /** 是否只读（只用于查看详情） */
  readonly?: boolean;
  /** 流程信息数据，可以是流程发起，也可以是流程运行中的数据 */
  flowInfoData?: flowInfoDataType;
  /**
   * 生成流程信息，默认按传入的数据生成
   * @param source 来源 processInitiate:流程发起 process:流程运行中的数据
   * @param data 数据
   * @param infoMap 流程信息数据
   */
  generateFlowInfo?: (
    flowInfoData?: flowInfoDataType
  ) => LfFormTodoInfoModelValue;
  /** 提交表单 */
  onSubmit?: (data: any) => Promise<boolean>;
}

/**
 * 流程信息源
 */
enum flowInfoDataSource {
  /** 流程开始的操作 */
  processInitiate = "processInitiate",
  /** 流程进行中 */
  process = "process"
}

interface flowInfoDataType {
  /** 流程信息源 */
  source: flowInfoDataSource;
  /** 流程数据或者是流程实例数据 */
  data: LfReleaseType.Domain | LfProcessType.ProcessListVO;
  /** 流程图的数据 */
  flowData: any;
  /** 历史操作记录 */
  historyData?: LfHistoryType.HistoryListVO[];
  /** 节点数据 */
  infoMap?: Map<string, LfFormTodoInfoRecordDetail>;
}

export type { logicFlowFormEditType, flowInfoDataType };

export { flowInfoDataSource };
