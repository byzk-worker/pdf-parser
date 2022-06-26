import { PDFDocumentProxy, PDFPageProxy } from "pdfjs-dist";
import { PageComponentAttachInterface, PagesComponent } from "../Pages";
import styles from "./index.module.less";

import { sealVerifyAll } from "@byzk/pdf-locale-call";
import {
  SealDragResult,
  SealDrgaOption,
  SealInfo,
} from "@byzk/document-reader";
import { createSealSampleEle } from "./views/SealSample";

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
  [pageIndex: string]: { [fieldName: string]: PageSealInfo };
}

interface DragSealInfo {
  wrapperEle: HTMLElement;
  sealImgEle: HTMLImageElement;
  maskEle: HTMLElement;
  options: SealDrgaOption;
  sealInfo: SealInfo;
}

interface DragSealResultMap {
  [pageIndex: string]: { [id: string]: DragSealInfo };
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

interface SealDragThisInfo {
  _: SealComponent;
  pageIndex: number;
  sealDragMaskEle: HTMLElement;
}

export class SealComponent implements PageComponentAttachInterface {
  private _pageEventList: { onmouseenter: any; onmouseleave: any }[] = [];

  private _pageSealInfoMap: PageSealInfoMap = {};
  private _dragSealInfo: DragSealInfo | undefined;

  private _dragSealResultCacheMap: DragSealResultMap;
  private _dragSealResultCacheMapLen: number;

  private _dragMaskEle: HTMLElement[] = [];

  private _waitResult:
    | {
        resolve: (data: any) => void;
        reject: (err: Error) => void;
      }
    | undefined = undefined;

  private _drageStatus: "no" | "drag" | "confirm" = "no";

  public constructor(
    private _pageComponent: PagesComponent,
    private _scaleGet: () => number
  ) {}

  /**
   * 页面鼠标进入事件
   * @param this this指向
   * @param event 事件
   */
  private _pageOnMouseEnter(this: SealDragThisInfo, event: MouseEvent) {
    if (this._._drageStatus === "no") {
      this.sealDragMaskEle.style.zIndex = "0";
    } else {
      this.sealDragMaskEle.style.zIndex = "999999";
    }
  }

  /**
   * 页面鼠标离开事件
   * @param this this指向
   * @param event 事件
   */
  private _pageOnMouseLeave(this: SealDragThisInfo, event: MouseEvent) {
    // if (this._._drageStatus !== "confirm" && this._._dragSealResultCacheMap) {
    //   this.sealDragMaskEle.style.zIndex = "0";
    // }
  }

  /**
   * 可拖拽印章定位
   * @param eventPosition 事件定位
   * @param boundingRect 位置
   * @param ele 元素
   */
  private _dragSealElePosition(
    eventPosition: { x: number; y: number },
    boundingRect: { top: number; left: number },
    ele: HTMLElement
  ) {
    const height = ele.clientHeight;
    const width = ele.clientWidth;
    const targetX = eventPosition.x - boundingRect.left - width / 2;
    const targetY = eventPosition.y - boundingRect.top - height / 2;
    const styles = ele.style;
    styles.top = targetY + "px";
    styles.left = targetX + "px";
  }

  /**
   * 鼠标进入遮罩
   * @param this this指向
   * @param event 事件
   */
  private _maskMouseEnter(this: SealDragThisInfo, event: MouseEvent) {
    const self = this._;
    const dragSealInfo = self._dragSealInfo;

    const targetEle = event.target as HTMLElement;

    const scale = this._._scaleGet();

    const { sealInfo, wrapperEle } = dragSealInfo;

    const wrapperStyles = wrapperEle.style;
    wrapperStyles.display = "block";
    wrapperStyles.width = sealInfo.width + "px";
    wrapperStyles.height = sealInfo.height + "px";

    dragSealInfo.maskEle.style.lineHeight = sealInfo.height + "px";

    wrapperStyles.transform = `scale(${scale})`;

    if (wrapperEle.parentElement !== targetEle) {
      targetEle.appendChild(wrapperEle);
    }

    self._dragSealElePosition(
      event,
      targetEle.getBoundingClientRect(),
      wrapperEle
    );
  }

  /**
   * 鼠标在遮罩层移动
   * @param this this指向
   * @param event 事件
   */
  private _maskMouseMove(this: SealDragThisInfo, event: MouseEvent) {
    if (this._._drageStatus === "no") {
      return;
    }

    this._._dragSealElePosition(
      event,
      this.sealDragMaskEle.getBoundingClientRect(),
      this._._dragSealInfo.wrapperEle
    );
  }

  /**
   * 鼠标离开遮罩层
   * @param this this指向
   * @param event 事件
   */
  private _maskMouseLeave(this: SealDragThisInfo, event: MouseEvent) {
    this._._dragSealInfo.wrapperEle.style.display = "none";
  }

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
    const srcPageEvent = this._pageEventList[pageIndex - 1];
    if (srcPageEvent) {
      pageWrapperEle.removeEventListener(
        "mouseenter",
        srcPageEvent.onmouseenter
      );
      pageWrapperEle.removeEventListener(
        "mouseleave",
        srcPageEvent.onmouseleave
      );
    }

    const maskWrapperEle = document.createElement("div");

    const dragEventThis: SealDragThisInfo = {
      pageIndex,
      sealDragMaskEle: maskWrapperEle,
      _: this,
    };

    maskWrapperEle.className = styles.dragMask;
    maskWrapperEle.style.zIndex = "0";
    this._dragMaskEle[pageIndex - 1] = maskWrapperEle;

    maskWrapperEle.onmouseenter = this._maskMouseEnter.bind(dragEventThis);
    maskWrapperEle.onmousemove = this._maskMouseMove.bind(dragEventThis);
    maskWrapperEle.onmouseleave = this._maskMouseLeave.bind(dragEventThis);

    const pageMouseEnterEvent = this._pageOnMouseEnter.bind(dragEventThis);
    const pageMouseLeaveEvent = this._pageOnMouseLeave.bind(dragEventThis);

    this._pageEventList[pageIndex - 1] = {
      onmouseenter: pageMouseEnterEvent,
      onmouseleave: pageMouseLeaveEvent,
    };
    pageWrapperEle.addEventListener("mouseenter", pageMouseEnterEvent);
    pageWrapperEle.addEventListener("mouseleave", pageMouseLeaveEvent);

    pageWrapperEle.appendChild(maskWrapperEle);

    const annotations = await page.getAnnotations({ intent: "any" });
    const pageName = pageIndex + "";
    let sealInfoMap = this._pageSealInfoMap[pageName];
    if (!sealInfoMap) {
      sealInfoMap = {};
      this._pageSealInfoMap[pageName] = sealInfoMap;
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

  public async sealDrag(
    sealInfo: SealInfo,
    options?: SealDrgaOption
  ): Promise<SealDragResult[]> {
    options = options || {};
    if (typeof options.minPageNo !== "number") {
      options.minPageNo = 0;
    }

    if (typeof options.maxPageNo === "number") {
      options.maxPageNo = this._pageComponent.docNumPages();
    }

    if (options.maxPageNo < options.minPageNo) {
      throw new Error("参数无效");
    }
    if (this._waitResult) {
      throw new Error("拖拽进程被锁定");
    }
    const res = new Promise<any>((resolve, reject) => {
      this._waitResult = { resolve, reject };
    });

    if (!(options.pageNo instanceof Array)) {
      options.pageNo = [];
      for (let i = options.minPageNo; i <= options.maxPageNo; i++) {
        options.pageNo.push(i);
      }
    }

    const { wrapperEle, sealImgEle, maskEle } = createSealSampleEle(
      sealInfo.imgUrl
    );
    wrapperEle.style.width = sealInfo.width + "px";
    wrapperEle.style.height = sealInfo.height + "px";
    this._dragSealInfo = {
      wrapperEle,
      sealImgEle,
      options,
      sealInfo,
      maskEle,
    };
    this._drageStatus = "drag";
    this._dragSealResultCacheMapLen = 0;
    this._dragSealResultCacheMap = {};
    return await res;
  }
}
