// 此文件跟同级目录的 global.d.ts 文件一样也是全局类型声明，只不过这里存放一些零散的全局类型，无需引入直接在 .vue 、.ts 、.tsx 文件使用即可获得类型提示

type RefType<T> = T | null;

type EmitType = (event: string, ...args: any[]) => void;

type TargetContext = "_self" | "_blank";

type ComponentRef<T extends HTMLElement = HTMLDivElement> =
  ComponentElRef<T> | null;

type ElRef<T extends HTMLElement = HTMLDivElement> = Nullable<T>;

type ForDataType<T> = {
  [P in T]?: ForDataType<T[P]>;
};

type AnyFunction<T> = (...args: any[]) => T;

type PropType<T> = VuePropType<T>;

type Writable<T> = {
  -readonly [P in keyof T]: T[P];
};

type Nullable<T> = T | null;

type NonNullable<T> = T extends null | undefined ? never : T;

type Recordable<T = any> = Record<string, T>;

type ReadonlyRecordable<T = any> = {
  readonly [key: string]: T;
};

type Indexable<T = any> = {
  [key: string]: T;
};

type DeepPartial<T> = {
  [P in keyof T]?: DeepPartial<T[P]>;
};

type Without<T, U> = { [P in Exclude<keyof T, keyof U>]?: never };

type Exclusive<T, U> = (Without<T, U> & U) | (Without<U, T> & T);

type TimeoutHandle = ReturnType<typeof setTimeout>;

type IntervalHandle = ReturnType<typeof setInterval>;

type Effect = "light" | "dark";

interface ChangeEvent extends Event {
  target: HTMLInputElement;
}

interface WheelEvent {
  path?: EventTarget[];
}

interface ImportMetaEnv extends ViteEnv {
  __: unknown;
}

interface Fn<T = any, R = T> {
  (...arg: T[]): R;
}

interface PromiseFn<T = any, R = T> {
  (...arg: T[]): Promise<R>;
}

interface ComponentElRef<T extends HTMLElement = HTMLDivElement> {
  $el: T;
}

function parseInt(s: string | number, radix?: number): number;

function parseFloat(string: string | number): number;

interface UnknownObject {
  [x: string]: unknown;
}

type UnknownArray = unknown[];

type AnyPromiseFunction = (...args: any) => Promise<any>;

type AwaitedReturnType<T extends AnyPromiseFunction> = Awaited<ReturnType<T>>;

type RequestType<
  T extends AnyPromiseFunction,
  K extends keyof AwaitedReturnType<T> = "data"
> = AwaitedReturnType<T>[K];

/** 普通 响应体 */
interface Res<T> {
  code: string;
  data: T;
  message: string;
  ok: boolean;
}

/** 分页 响应体 */
type ResPage<T> = Res<{
  current: number;
  optimizeCountSql: boolean;
  orders: any[];
  pages: number;
  records: T[];
  searchCount: boolean;
  size: number;
  total: number;
}>;

/** Promise封装普通响应体 */
type HttpReturn<T extends object | boolean | string = any> = Promise<Res<T>>;
/** Promise封装分页响应体 */
type HttpReturnPage<T extends object | boolean | string = any> = Promise<
  ResPage<T>
>;

/** 默认返回参数: 一般响应的后端实体类都包含一下参数 */
interface DefaultParams {
  isDeleted: NumStatus;
  createTime: string;
  createUser: string;
  updateTime: string;
  updateUser: string;
}

/** 获取默认参数的字符串字面量类型 */
type DefaultParamsKey = keyof DefaultParams;

/** 去除默认返回参数 */
type OmitDefaultParams<
  T extends DefaultParams,
  P extends keyof T = DefaultParamsKey
> = Omit<T, DefaultParamsKey | P>;

type NumStatus = 1 | 0 | "";

/** 把接口中可选多个属性转为非必填 */
type MultiplePartial<T extends { id: any }, K extends keyof T = "id"> = Omit<
  T,
  K
> &
  Partial<Pick<T, K>>;
