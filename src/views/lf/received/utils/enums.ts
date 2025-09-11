import type { optionsType } from "./types";

/** 状态（1、待办、0、已办） */
const Status: optionsType[] = [
  {
    label: "待办",
    value: "1"
  },
  {
    label: "已办",
    value: "0"
  }
];

const TodoStatusMap = {
  "1": "待处理",
  "2": "待阅",
  "3": "被退回",
  "4": "未读",
  "5": "反馈"
};

/** 待办状态（1、待处理 2、待阅 3、被退回  4、未读 5、反馈） */
const TodoStatus: optionsType[] = [
  {
    label: "待处理",
    value: "1"
  },
  {
    label: "待阅",
    value: "2"
  },
  {
    label: "被退回",
    value: "3"
  },
  {
    label: "未读",
    value: "4"
  },
  {
    label: "反馈",
    value: "5"
  }
];

const DoneStatusMap = {
  "1": "未归档",
  "2": "已归档",
  "3": "待回复",
  "4": "未读",
  "5": "反馈"
};

/** 已办状态（1、未归档 2、已归档 3、待回复 4、未读 5、反馈） */
const DoneStatus: optionsType[] = [
  {
    label: "未归档",
    value: "1"
  },
  {
    label: "已归档",
    value: "2"
  },
  {
    label: "待回复",
    value: "3"
  },
  {
    label: "未读",
    value: "4"
  },
  {
    label: "反馈",
    value: "5"
  }
];

/** 待办类型（1、任务待办 2、抄送待办 ...其他类型自定义） */
const TodoType: optionsType[] = [
  {
    label: "任务待办",
    value: "1"
  },
  {
    label: "抄送待办",
    value: "2"
  }
];

export {
  Status,
  TodoStatus,
  TodoStatusMap,
  DoneStatus,
  DoneStatusMap,
  TodoType
};
