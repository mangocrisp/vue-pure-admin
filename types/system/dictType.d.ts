/**字典管理-字典类型 */
declare namespace SystemDictTypeType {
  export interface DictType extends DefaultParams {
    id: string;
    title: string;
    dictCode: string;
    remark: string;
    status: 1 | 0;
  }

  export interface DictTypeAddDTO {
    title: string;
    dictCode: string;
    remark?: string;
  }

  export interface DictTypeUpdateDTO {
    id: string;
    title?: string;
    dictCode?: string;
    remark?: string;
    status?: 1 | 0;
  }
}
