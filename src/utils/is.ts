/** is ts类型守卫 */

const toString = Object.prototype.toString;

/**
 * 断言 变量是否该类型
 * @param val 变量
 * @param type 类型
 */
const is = (val: unknown, type: string) => {
  return toString.call(val) === `[object ${type}]`;
};

/**
 * 类型守卫 undefined
 */
export const isDef = <T = unknown>(val?: T): val is undefined => {
  return typeof val === "undefined";
};

/**
 * 类型守卫 非 undefined
 */
export const isUnDef = <T = unknown>(val?: T): val is T => {
  return !isDef(val);
};

/**
 * 类型守卫 null
 */
export const isNull = (val: unknown): val is null => {
  return val === null;
};

/**
 * 类型守卫 null 或 undefined
 */
export const isNullOrUnDef = (val: unknown): val is null | undefined => {
  return isUnDef(val) || isNull(val);
};

/**
 * 类型守卫 object
 */
export const isObject = (val: any): val is Record<any, any> => {
  return val !== null && is(val, "Object");
};

/**
 * 类型守卫 number
 */
export const isNumber = (val: unknown): val is number => {
  return is(val, "Number");
};

/**
 * 类型守卫 date
 */
export const isDate = (val: unknown): val is Date => {
  return is(val, "Date");
};

/**
 * 类型守卫 promise
 */
export const isPromise = <T = any>(val: any): val is Promise<T> => {
  return is(val, "Promise") && isFunction(val.then) && isFunction(val.catch);
};

/**
 * 类型守卫 string
 */
export const isString = (val: unknown): val is string => {
  return is(val, "String");
};

/**
 * 类型守卫 function
 */
export const isFunction = (val: unknown): val is Function => {
  return typeof val === "function";
};

/**
 * 类型守卫 boolean
 */
export const isBoolean = (val: unknown): val is boolean => {
  return is(val, "Boolean");
};

/**
 * 类型守卫 RegExp
 */
export const isRegExp = (val: unknown): val is RegExp => {
  return is(val, "RegExp");
};

/**
 * 类型守卫 array
 */
export const isArray = (val: any): val is Array<any> => {
  return val && Array.isArray(val);
};

/**
 * 类型守卫 Window
 */
export const isWindow = (val: any): val is Window => {
  return typeof window !== "undefined" && is(val, "Window");
};

/**
 * 类型守卫 Element
 */
export const isElement = (val: unknown): val is Element => {
  return isObject(val) && !!val.tagName;
};

/**
 * 类型守卫 Map
 */
export const isMap = (val: unknown): val is Map<any, any> => {
  return is(val, "Map");
};

/**
 * 类型守卫 空值
 */
export const isEmpty = <T = unknown>(val: T): val is T => {
  if (isArray(val) || isString(val)) return val.length === 0;

  if (val instanceof Map || val instanceof Set) return val.size === 0;

  if (isObject(val)) return Object.keys(val).length === 0;

  return false;
};
