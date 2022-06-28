import htmlStr from "./index.html";
import styles from "./index.module.less";
import { htmlTemplateParser, htmlTemplateConvertEle } from "../../../../utils";

const htmlParser = htmlTemplateParser(htmlStr);

export function createSealSampleEle(
  imgUrl: string
): {
  wrapperEle: HTMLElement;
  sealImgEle: HTMLImageElement;
  maskEle: HTMLElement;
} {
  return splitSealSampleEle(
    htmlTemplateConvertEle(htmlParser({ styles, imgUrl }))
  );
}

export function splitSealSampleEle(sealSampleEle: HTMLElement) {
  const sealImgEle = sealSampleEle.querySelector("img") as HTMLImageElement;
  const maskEle = sealSampleEle.querySelector(
    "." + styles.maskBgc
  ) as HTMLElement;
  return {
    wrapperEle: sealSampleEle,
    sealImgEle,
    maskEle,
  };
}
