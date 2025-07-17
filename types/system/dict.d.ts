/**字典管理字典项 */
declare namespace SystemDictType {
  type statusClass = "" | "success" | "info" | "warning" | "danger";

  export interface Dict extends DefaultParams {
    id: string;
    dictCode: string;
    dictKey: string;
    dictVal: string;
    cssClass: string;
    statusClass: statusClass;
    sort: number;
    remark: string;
    status: NumStatus;
  }

  export interface DictAddDTO {
    dictCode: string;
    dictKey: string;
    dictVal: string;
    cssClass: string;
    statusClass: statusClass;
    sort: number;
    remark: string;
  }

  export interface DictUpdateDTO {
    id: string;
    dictCode?: string;
    dictKey?: string;
    dictVal?: string;
    cssClass?: string;
    statusClass?: statusClass;
    sort?: number;
    remark?: string;
    status: NumStatus;
  }

  export interface DictsType {
    [key: string]: Dict[];
  }
}
