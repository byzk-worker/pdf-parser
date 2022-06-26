import { template as templateParser } from "lodash";

/**
 * 全屏
 * @param ele 要全屏的元素
 */
export function full(ele: any) {
  if (ele.requestFullscreen) {
    ele.requestFullscreen();
  } else if (ele.mozRequestFullScreen) {
    ele.mozRequestFullScreen();
  } else if (ele.webkitRequestFullscreen) {
    ele.webkitRequestFullscreen();
  } else if (ele.msRequestFullscreen) {
    ele.msRequestFullscreen();
  }
}

function _getFnWithTimeout<T>(getFn: () => T): Promise<T> {
  return new Promise((resovle) => {
    setTimeout(() => {
      resovle(getFn());
    }, 10);
  });
}

export async function waitBreakUndefined<T>(getFn: () => T): Promise<T> {
  for (;;) {
    const res = await _getFnWithTimeout(getFn);
    if (typeof res !== "undefined") {
      return res;
    }
  }
}

export function base64ToBlob(base64Data: string): Blob {
  let arr = base64Data.split(","),
    fileType = arr[0].match(/:(.*?);/)[1],
    bstr = atob(arr[1]),
    l = bstr.length,
    u8Arr = new Uint8Array(l);

  while (l--) {
    u8Arr[l] = bstr.charCodeAt(l);
  }
  return new Blob([u8Arr], {
    type: fileType,
  });
}

export function dateFormat(date: Date, fmt: string) {
  var o = {
    "M+": date.getMonth() + 1, //月份
    "d+": date.getDate(), //日
    "h+": date.getHours(), //小时
    "m+": date.getMinutes(), //分
    "s+": date.getSeconds(), //秒
    "q+": Math.floor((date.getMonth() + 3) / 3), //季度
    S: date.getMilliseconds(), //毫秒
  };
  if (/(y+)/.test(fmt)) {
    fmt = fmt.replace(
      RegExp.$1,
      (date.getFullYear() + "").substr(4 - RegExp.$1.length)
    );
  }
  for (var k in o) {
    if (new RegExp("(" + k + ")").test(fmt)) {
      fmt = fmt.replace(
        RegExp.$1,
        RegExp.$1.length == 1 ? o[k] : ("00" + o[k]).substr(("" + o[k]).length)
      );
    }
  }
  return fmt;
}

export function htmlTemplateParser(htmlStrGet: () => string) {
  return templateParser(
    htmlStrGet().split('="" %="">').join("").split("</%=>").join(" %>")
  );
}

export function htmlTemplateConvertEle(htmlEleStr: string): HTMLElement {
  const template = document.createElement("template");
  template.innerHTML = htmlEleStr;

  return template.content.children[0] as any;
}

/**
 * 获取DPI
 * @returns {Array}
 */
function conversionGetDPI() {
  var arrDPI = new Array();
  const screen = window.screen as any;
  if (screen.deviceXDPI) {
    arrDPI[0] = screen.deviceXDPI;
    arrDPI[1] = screen.deviceYDPI;
  } else {
    let tmpNode = document.createElement("div") as any;
    tmpNode.style.cssText =
      "width:1in;height:1in;position:absolute;left:0px;top:0px;z-index:99;visibility:hidden";
    document.body.appendChild(tmpNode);
    arrDPI[0] = parseInt(tmpNode.offsetWidth);
    arrDPI[1] = parseInt(tmpNode.offsetHeight);
    tmpNode.parentNode.removeChild(tmpNode);
  }
  return arrDPI;
}

/**
 * px转换为mm
 * @param value
 * @returns {number}
 */
export function pxConversionMm(value: number) {
  var inch = value / conversionGetDPI()[0];
  var c_value = inch * 33.8;
  //      console.log(c_value);
  return c_value;
}
/**
 * mm转换为px
 * @param value
 * @returns {number}
 */
export function mmConversionPx(value: number) {
  var inch = value / 26.4;
  var c_value = inch * conversionGetDPI()[0];
  //      console.log(c_value);
  return c_value;
}
