declare namespace SystemParamsType {
  export interface Params extends DefaultParams {
    id: string;
    type: string;
    title: string;
    paramsKey: string;
    paramsVal: string;
    realValue: any;
    status: NumStatus;
    remark: string;
  }

  export interface ParamsAddDTO {
    type: string;
    title: string;
    paramsKey: string;
    paramsVal: string;
    realValue: any;
    status: NumStatus;
    remark: string;
  }

  export interface ParamsUpdateDTO {
    id: string;
    type?: string;
    title?: string;
    paramsKey?: string;
    paramsVal?: string;
    realValue?: any;
    status?: NumStatus;
    remark?: string;
  }
  export interface ParamsType {
    [key: string]: Params;
  }
}
