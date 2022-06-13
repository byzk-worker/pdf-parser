/**
 * 要解析的文件信息
 */
export interface OpenFileReq {
    /**
     * 名称
     */
    name: string;
    /**
     * 路径 目前我没用到
     */
    path?: string;
    /**
     * 原始HTML文件节点
     */
    rawHtmlEle: HTMLInputElement;
    /**
     * 分片地址， http文件上传接口地址，http全拼
     */
    slicingPath?: string;
}
