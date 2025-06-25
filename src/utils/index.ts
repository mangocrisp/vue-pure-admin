export * from "./is";

/**
 * 通过传入字符串数组, 转换为参数
 * @param ids 需拼接的参数
 * @param key 拼接的参数key
 * @example
 * groupBatchIds(['1', '2']) => 'id=1&id=2'
 * @example
 * groupBatchIds(['1', '2'], 'key') => 'key=1&key=2'
 */
export const groupBatchIds = (ids: string[], key = "id") => {
  if (!ids.length) return "";
  return [...new Set(ids)].map(item => `${key}=${item}`).join("&");
};
