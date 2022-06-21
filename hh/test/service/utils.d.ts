import { ConnectConfig } from '../types';
export declare const connectInit: () => void;
interface httpReqParams {
    url: string;
    data?: FormData;
}
export declare const httpReq: (params: httpReqParams, options?: ConnectConfig) => Promise<any>;
interface socketReqParams {
    cmd: string;
    data?: any;
    onError?: (error: any) => void;
    finally?: () => void;
}
export declare const socketReq: (params: socketReqParams, options?: ConnectConfig) => Promise<any>;
export {};
