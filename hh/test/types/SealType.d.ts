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
     * 错误信息 当 verifyResult 为 false 时 ，此值有内容
     */
    verifyMsg?: string;
    /**
     * 签名时间 时间戳
     */
    time: string;
    /**
     * 印章所在页码
     */
    page: number;
    /**
     * 签章人姓名
     */
    userName: string[];
}
/**
 * 印章响应对象
 */
export interface SealQueryInfo {
    /**
     * 印章id
     */
    id: string;
    /**
     * 印章类型
     */
    sealType: string;
    /**
     * 印章编码
     */
    sealCode: string;
    /**
     * 印章名
     */
    sealMsg: string;
    /**
     * 算法类型
     */
    algType: string;
    /**
     * 印章结构体
     */
    seal: string;
    /**
     * 有效期开始时间 时间戳
     */
    startTime: string;
    /**
     * 有效期结束时间 时间戳
     */
    endTime: string;
    /**
     * 印章宽
     */
    width: string;
    /**
     * 印章高
     */
    height: string;
    /**
     * 印章图片base64 不带前缀
     */
    sealImg: string;
}
/**
 * 印章查询接口返回结果
 */
export interface SealQueryRsp {
    sealInfoVo: SealQueryInfo[];
    total: number;
}
/**
 * 印章盖章请求参数
 */
export interface SealInReq {
    /**
     * 印章id
     */
    sealId: string;
    /**
     * 文件id
     */
    fileId: string;
    /**
     * 页码
     */
    page: number;
    /**
     * x坐标
     */
    positionX: number;
    /**
     * y坐标
     */
    positionY: number;
}
export interface SealInQFReq extends SealInReq {
    /**
     * 限制多少页一个章
     */
    size: number;
}
