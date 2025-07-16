import { message } from "@/utils/message";
import useAxios from "../../hooks/core/useAxios";

const request = useAxios();

const URL = "/admin-file/v1";

export default class AdminFileApi {
  static fileUpload = (data: FormData) =>
    request.post<Res<string[]>>({
      url: `${URL}/upload`,
      headers: {
        "Content-Type": "multipart/form-data"
      },
      data
    });

  static fileDownload = (path: string) =>
    request
      .get({
        url: `${URL}/download`,
        responseType: "blob",
        params: {
          path,
          d: true
        }
      })
      .then((res: Blob) => res)
      .catch(error => {
        message("下载文件失败!", { type: "error" });
        return Promise.reject(error);
      });
}
