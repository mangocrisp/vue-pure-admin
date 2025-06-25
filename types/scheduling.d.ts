/** 任务调度模块 */
declare namespace SchedulingType {
  interface TaskPageForm {
    autoStart: NumStatus;
    cron: string;
    description: string;
    id: string;
    params: string;
    sort: number;
    startFlag: NumStatus;
    taskKey: string;
  }

  type TaskPageFormSearch = Pick<
    TaskPageForm,
    "description" | "startFlag" | "taskKey" | "autoStart"
  >;

  interface TaskPage extends TaskPageForm {
    uniqueKey: number;
    tenantId: string;
  }

  export interface TaskPageReTurn {
    (params: TaskPageFormSearch): HttpReturnPage<TaskPage & DefaultParams>;
  }

  export interface Add {
    (params: MultiplePartial<TaskPageForm>): HttpReturn<string>;
  }

  export interface Update {
    (params: TaskPageForm): HttpReturn<string>;
  }

  export interface LogPageRes {
    id: number;
    taskKey: string;
    description: string;
    params: string;
    message: string;
    status: NumStatus;
    exceptionInfo: string;
    startTime: string;
    stopTime: string;
    updateTime: string;
    tenantId: string;
  }

  export type LogPageParams = Pick<
    LogPageRes,
    "description" | "taskKey" | "status"
  > & {
    timeEnd: string;
    timeBegin: string;
  };

  export interface LogPage {
    (params: LogPageParams): HttpReturnPage<LogPageRes>;
  }
}
