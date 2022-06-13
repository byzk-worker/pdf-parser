/**
 * 检测对象是否为空
 * @param {*} e 入参
 * @returns 如果对象为空，返回true
 */
export declare const isNull: (e: any) => boolean;
/**
 * 要检测的数组对象
 * @param e 入参
 * @returns 如果数组为空或者长度小于等于0，返回true
 */
export declare const arrayIsNull: (e: any[]) => boolean;
/**
 * 生成GUID
 */
export declare const newGuid: () => string;
/**
 * 是否是对象
 */
export declare const isObject: (e: any) => boolean;
