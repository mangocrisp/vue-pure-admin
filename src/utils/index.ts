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

/**
 * 流数据转文件
 * @param blob blob 文件流数据
 * @returns 文件
 */
export function blobToDataURI(blob: Blob) {
  return new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(blob);
    reader.onload = function (e) {
      if (e.target) return resolve(e.target.result as string);
      else return reject(new Error("blobToDataURI: e.target is null"));
    };
  });
}
