import { ConnectConfig, OpenFileReq } from "../types";
/**
 * 上传文件接口
 */
declare const openFile: (req: OpenFileReq, options?: ConnectConfig) => Promise<string>;
export default openFile;
