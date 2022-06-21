import { ConnectConfig } from "../types";
import { SealVerifyInfo, SealQueryRsp, SealInReq, SealInQFReq } from "../types/SealType";
/**
 * 验证pdf中所有印章
 * @param fileId
 * @param options
 * @returns
 */
export declare const sealVerifyAll: (fileId: string, options?: ConnectConfig) => Promise<SealVerifyInfo[]>;
/**
 * 获取当前usbkey中的印章
 * @param password
 * @param options
 * @returns
 */
export declare const sealQuery: (password: string, options?: ConnectConfig) => Promise<SealQueryRsp>;
/**
 * 文件签章接口
 * @param params
 * @param options
 * @returns 签章后的新的文件id
 */
export declare const sealIn: (params: SealInReq, options?: ConnectConfig) => Promise<string>;
/**
 * 骑缝章接口
 * @param params
 * @param options
 */
export declare const sealInQF: (params: SealInQFReq, options?: ConnectConfig) => Promise<string>;
