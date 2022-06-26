import { sealVerifyAll, sealQuery, sealIn, sealInQF, sealInMany, sealInKeyword } from './func/seal';
import { fileOpen, fileUrl } from './func/file';
declare const configMgr: {
    connectGet: () => import("./types").ConnectConfig;
    connectSet: (opt: import("./types").ConnectConfig) => void;
};
declare const enums: {
    requestError: {
        timeout: string;
        networkError: string;
    };
};
export * from './types';
export { fileOpen, fileUrl, sealVerifyAll, sealQuery, sealIn, sealInQF, sealInMany, sealInKeyword, configMgr, enums };
