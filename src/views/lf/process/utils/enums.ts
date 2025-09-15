import type { OptionsType } from "./types";

/** 状态（1、流程进行中 0、流程已经完成 2、流程已归档 -1、流程中止） */
const ProcessStatusMap = {
  1: "进行中",
  0: "已完成",
  2: "已归档"
};

/** 状态（1、流程进行中 0、流程已经完成 2、流程已归档 -1、流程中止） */
const ProcessStatus: OptionsType<number>[] = [
  {
    label: "进行中",
    value: 1
  },
  {
    label: "已完成",
    value: 0
  },
  {
    label: "已归档",
    value: 2
  }
];

export { ProcessStatus, ProcessStatusMap };
