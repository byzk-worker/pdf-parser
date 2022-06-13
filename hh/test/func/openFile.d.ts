import { OpenFileReq } from "../types";
/**
 * 上传文件接口
 */
declare const openFile: (req: OpenFileReq) => Promise<string>;
export default openFile;
