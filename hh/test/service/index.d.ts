import { ConnectConfig, SealInKeywordReq, SealInManyReq, SealInQFReq, SealInReq } from "../types";
interface BeginUploadParam {
    name: string;
    id: string;
    md5: string;
    sliceNumber: string;
    size: string;
}
export declare const beginUpload: (payload: BeginUploadParam, options?: ConnectConfig) => Promise<any>;
interface SliceUploadParam {
    url?: string;
    fileId: string;
    index: string;
    sliceId: string;
    buffer: ArrayBuffer;
}
export declare const sliceUpload: (payload: SliceUploadParam, options?: ConnectConfig) => Promise<any>;
export declare const endUpload: (id: string, options?: ConnectConfig) => Promise<any>;
export declare const verifySeal: (id: string, options?: ConnectConfig) => Promise<any>;
export declare const getSealList: (password: string, options?: ConnectConfig) => Promise<any>;
export declare const signature: (req: SealInReq, options?: ConnectConfig) => Promise<any>;
export declare const signQF: (req: SealInQFReq, options?: ConnectConfig) => Promise<any>;
export declare const signMany: (req: SealInManyReq, options?: ConnectConfig) => Promise<any>;
export declare const signKeyword: (req: SealInKeywordReq, options?: ConnectConfig) => Promise<any>;
export {};
