interface BeginUploadParam {
    name: string;
    id: string;
    md5: string;
    sliceNumber: string;
    size: string;
}
export declare const beginUpload: (payload: BeginUploadParam) => Promise<any>;
interface SliceUploadParam {
    url?: string;
    fileId: string;
    index: string;
    sliceId: string;
    buffer: ArrayBuffer;
}
export declare const sliceUpload: (payload: SliceUploadParam) => Promise<any>;
export declare const endUpload: (id: string) => Promise<any>;
export declare const verifySeal: (id: string) => Promise<any>;
export {};
