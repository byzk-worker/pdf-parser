import { sealVerifyAll, sealQuery, sealIn, sealInQF } from './func/seal';
import openFile from './func/openFile';
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
export { openFile, sealVerifyAll, sealQuery, sealIn, sealInQF, configMgr, enums };
