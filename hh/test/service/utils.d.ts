interface apiPostFormDataReqParam {
    url: string;
    data?: FormData;
}
export declare const apiReq: {
    post: {
        formData: (req: apiPostFormDataReqParam) => Promise<any>;
    };
};
interface socketReqParams {
    cmd: string;
    data?: any;
    onError?: (error: any) => void;
    finally?: () => void;
}
export declare const socketReq: (params: socketReqParams) => Promise<any>;
export {};
