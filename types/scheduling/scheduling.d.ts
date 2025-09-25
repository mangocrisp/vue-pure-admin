/**任务调度 */
declare namespace SchedulingType {
  /**任务调度配置 */
  export interface Domain {
    /*主键 */
    id?: number;
    /*创建人 */
    createUser?: number;
    /*创建时间 */
    createTime?: string;
    /*更新人 */
    updateUser?: number;
    /*更新时间 */
    updateTime?: string;
    /*扩展字段 */
    expansion?: string;
    /*是否已删除 */
    isDeleted?: string;
    /*唯一键 */
    uniqueKey?: number;
    /*任务键 */
    taskKey: string;
    /*任务描述 */
    description: string;
    /*cron 表达式 */
    cron: string;
    /*是否自动启动(1 是 0 否) */
    autoStart: string;
    /*排序 */
    sort: number;
    /*任务启动参数 */
    params?: string;
    /*租户 id 区分不同租户的日志 */
    tenantId?: string;
  }
  /**调度日志 */
  export interface Log {
    /**主键 */
    id?: string;
    /**任务键 */
    taskKey?: string;
    /**任务描述 */
    description?: string;
    /**任务启动参数 */
    params?: string;
    /**日志信息 */
    message?: string;
    /** 状态(1 正常 0 失败)	 */
    status?: string;
    /** 异常信息 */
    exceptionInfo?: string;
    /** 任务开始执行时间 */
    startTime?: string;
    /** 任务结束执行时间 */
    stopTime?: string;
    /** 更新时间 */
    updateTime?: string;
    /** 租户 id 区分不同租户的日志 */
    tenantId?: string;
  }
  /**调度日志查询参数 */
  export interface LogQueryDTO extends Log {
    /*租户 id 开始时间 */
    timeBegin?: string;
    /*结束时间 */
    timeEnd?: string;
  }
}
