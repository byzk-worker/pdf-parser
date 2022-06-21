/**
 * 连接配置定义
 */
export interface ConnectConfig {
    /**
     * 是否重试，不传默认不重试
     */
    retry?: boolean;
    /**
     * 重试次数，需要开启重试起效
     */
    retryCount?: number;
    /**
     * 重试间隔，需要开启重试起效
     * 单位 毫秒
     */
    retryInterval?: number;
    /**
     * 发起的请求总的超时时间
     * 重试时间包含在总时间内
     * 不传和传0和0以下的数字，都视为不超时
     * 单位 毫秒
     */
    timeout?: number;
}
