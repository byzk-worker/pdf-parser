import { PDFDocumentProxy, PDFPageProxy } from "pdfjs-dist";
import { PageComponentAttachInterface, PagesComponent } from "../Pages";
import styles from "./index.module.less";

import { sealVerifyAll } from "@byzk/pdf-locale-call";

interface PageSealInfo {
  rect: [number, number, number, number];
  width: number;
  height: number;
  name: string;
  img: string;
  sealWrapperEle: HTMLDivElement;
  scaleGet(): number;
  render();
}

interface PageSealInfoMap {
  [key: string]: { [key: string]: PageSealInfo };
}

function sealInfoRender(this: PageSealInfo) {
  const scale = this.scaleGet();
  const x = this.rect[0] * scale;
  const y =
    this.sealWrapperEle.parentElement.clientHeight - this.rect[3] * scale;
  this.sealWrapperEle.style.top = y + "px";
  this.sealWrapperEle.style.left = x + "px";
  this.sealWrapperEle.style.width = this.width * scale + "px";
  this.sealWrapperEle.style.height = this.height * scale + "px";
  this.sealWrapperEle.className = styles.sealWrapper;
}

export class SealComponent implements PageComponentAttachInterface {
  private _pageSealInfo: PageSealInfoMap = {};
  public constructor(
    private _pageComponent: PagesComponent,
    private _scaleGet: () => number
  ) {}

  attachRunInit(): boolean {
    return false;
  }

  async attach(
    doc: PDFDocumentProxy,
    page: PDFPageProxy,
    pageWrapperEle: HTMLDivElement,
    pageCanvas: HTMLCanvasElement,
    pageIndex: number
  ): Promise<void> {
    const annotations = await page.getAnnotations({ intent: "any" });
    const pageName = pageIndex + "";
    let sealInfoMap = this._pageSealInfo[pageName];
    if (!sealInfoMap) {
      sealInfoMap = {};
      this._pageSealInfo[pageName] = sealInfoMap;
    }
    const keys = Object.keys(sealInfoMap);
    annotations.forEach((annotation) => {
      if (annotation.fieldType !== "Sig") {
        return;
      }
      const fieldName = annotation.fieldName;
      let sealInfo = sealInfoMap[fieldName];
      const index = keys.indexOf(fieldName);
      if (index !== -1) {
        keys.splice(index, 1);
      }

      if (sealInfo) {
        sealInfo.render();
        return;
      }

      const rect = annotation.rect;
      const width = rect[2] - rect[0];
      const height = rect[3] - rect[1];
      //   const x = rect[0];
      //   const y = pageWrapperEle.clientHeight - rect[3] * scale;
      const sealWrapperEle = document.createElement("div");
      pageWrapperEle.appendChild(sealWrapperEle);
      sealInfo = {
        rect,
        width,
        height,
        scaleGet: this._scaleGet,
        name: fieldName,
        img: "",
        sealWrapperEle,
      } as any;
      sealInfo.render = sealInfoRender.bind(sealInfo);
      sealInfoMap[fieldName] = sealInfo;
      sealInfo.render();
      //   sealWrapperEle.style.top = y + "px";
      //   sealWrapperEle.style.left = x + "px";
      //   sealWrapperEle.style.width = width + "px";
      //   sealWrapperEle.style.height = height + "px";
      //   sealWrapperEle.className = styles.sealWrapper;
    });
    for (let i = 0; i < keys.length; i++) {
      const key = keys[i];
      const sealInfo = sealInfoMap[key];
      sealInfo?.sealWrapperEle?.remove();
      delete sealInfoMap[key];
    }
  }
}
