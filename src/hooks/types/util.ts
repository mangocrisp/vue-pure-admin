/** 字典Code与中文的对应Map */
export interface DictCode {
  "dict-type": "类型";
}

/** 字典Code的Key(字典标识) */
export type DictCodeKey = keyof DictCode;

/** 字典Code的Value(字典标识中文说明) */
export type DictCodeValue = DictCode[DictCodeKey];

/** 任意对象类型(会包含数组) */
export type AnyObject<T = any> = Record<string, T>;

/** 任意方法 */
export type AnyFn<T = any> = (...args: any) => T;

/** 任意方法, 返回值为Promise */
export type PromiseFn<T = any> = AnyFn<Promise<T>>;

/** 任意数组 */
export type AnyArray<T = any> = T[];

/** 未知对象 */
export type UnknownObject = AnyObject<unknown>;

/** 未知数组 */
export type UnknownArray = AnyArray<unknown>;

/** 未知响应方法 */
export type UnknownFn = AnyFn<unknown>;

/** 任意Class */
export type AnyClass<T = any> = new (...args: any) => T;

export type Arrayable<T> = T | T[];
