/**
 * 系统通知模型
 */
declare namespace SystemNoticeType {
  /**
   * 通知模型接口
   * 用于定义系统通知的基本结构和属性
   */
  export interface Domain extends DefaultParams {
    /** 通知唯一标识 */
    id: string;
    /** 通知标题 */
    title: string;
    /** 通知消息内容 */
    message: string;
    /** 通知级别 */
    level: string;
    /** 是否指定通知 1:是 0:否 */
    positive: 1 | 0;
    /** 通知附加数据 */
    data: any;
    /** 通知主题 */
    topic: string;
    /** 通知子类型 */
    subType: string;
    /** 发送通知的用户ID */
    fromUser: string;
    /** 发送通知的用户名称 */
    fromUserName: string;
    /** 发送通知的用户头像 */
    fromUserAvatar: string;
  }

  /**查询 DTO */
  export interface QueryDTO {
    /** 通知唯一标识 */
    id?: string;
    /** 通知标题 */
    title?: string;
    /** 通知消息内容 */
    message?: string;
    /** 通知级别 */
    level?: string;
    /** 是否指定通知 1:是 0:否 */
    positive?: 1 | 0;
    /** 通知主题 */
    topic?: string;
    /** 通知子类型 */
    subType?: string;
    /** 发送通知的用户ID */
    fromUser?: string;
    /** 发送通知的用户名称 */
    fromUserName?: string;
  }

  /**查询实体 */
  export interface QueryBody {
    queryDto: QueryDTO;
  }
}
