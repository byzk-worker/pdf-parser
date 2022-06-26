import { ConnectConfig, OpenFileReq } from "../types";
/**
 * 上传文件接口
 */
export declare const fileOpen: (req: OpenFileReq, options?: ConnectConfig) => Promise<string>;
export declare const fileUrl: (fileId: string) => string;
