/**任务调度 */
declare namespace SchedulingType {
  /**任务调度配置 */
  export interface Domain {
    /*主键 */
    id?: string;
    /*创建人 */
    createUser?: string;
    /*创建时间 */
    createTime?: string;
    /*更新人 */
    updateUser?: string;
    /*更新时间 */
    updateTime?: string;
    /*扩展字段 */
    expansion?: string;
    /*是否已删除 */
    isDeleted?: string;
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
  }
  /**调度日志查询参数 */
  export interface LogQueryDTO extends Log {
    /*租户 id 开始时间 */
    timeBegin?: string;
    /*结束时间 */
    timeEnd?: string;
  }

  /** 调度任务 新增数据结构 */
  export interface AddDTO {
    /** 任务键 */
    taskKey?: string;
    /** 任务描述 */
    description?: string;
    /** cron 表达式 */
    cron?: string;
    /** 是否自动启动(1 是 0 否) */
    autoStart?: string;
    /** 排序 */
    sort?: string;
    /** 任务启动参数 */
    params?: string;
  }
  /** 调度任务 修改数据结构 */
  export interface UpdateDTO {
    /** 主键 */
    id: string;
    /** 任务键 */
    taskKey?: string;
    /** 任务描述 */
    description?: string;
    /** cron 表达式 */
    cron?: string;
    /** 是否自动启动(1 是 0 否) */
    autoStart?: string;
    /** 排序 */
    sort?: string;
    /** 任务启动参数 */
    params?: string;
  }

  /** 调度任务 查询条件 */
  export interface QueryDTO {
    /** 主键 */
    id?: string;
    /** 主键 */
    idSelection?: Array<string>;
    /** 任务键 */
    taskKey?: string;
    /** 任务描述 */
    description?: string;
    /** 是否自动启动(1 是 0 否) */
    autoStart?: string;
  }

  /** 调度任务 查询体 */
  export interface QueryBody {
    queryDTO: QueryDTO;
    /** 可以继续添加关联表的查询条件 */
  }
}
