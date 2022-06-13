/**
 * 验证结果详情
 */
export interface SealVerifyInfo {
    /**
     * 签名域名称
     */
    signatureName: string;
    /**
     * 验证结果
     */
    verifyResult: boolean;
    /**
     * 错误信息
     */
    verifyMsg: string;
    /**
     * 签名时间
     */
    time: string;
    /**
     * 印章所在页码
     */
    page: number;
}
