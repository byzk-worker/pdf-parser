import { PDFDocumentProxy, PDFPageProxy } from "pdfjs-dist";
import { PageComponentAttachInterface, PagesComponent } from "../Pages";
import styles from "./index.module.less";

import { sealVerifyAll } from "@byzk/pdf-locale-call";
import {
  AppInterface,
  SealDragResult,
  SealDragOption,
  SealInfo,
} from "@byzk/document-reader";
import { createSealSampleEle } from "./views/SealSample";
import { createMenu } from "../../views/Menu";
import { createId } from "../../utils";

const dragSealClickMenu = createMenu([]);
const dragSealContextmenu = createMenu([]);

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
  options: SealDragOption;
  sealInfo: SealInfo;
  pageIndex?: number;
  _cacheResult?: SealDragResultCache;
  _cachePageIndexStr?: string;
  _cacheId?: string;
}

interface SealDragResultCache extends SealDragResult {
  _: {
    id: string;
    top: number;
    left: number;
    wrapperEle: HTMLElement;
    sealImgEle: HTMLImageElement;
    maskEle: HTMLElement;
  };
}

interface DragSealResultMap {
  [pageIndex: string]: { [id: string]: SealDragResultCache };
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

interface SealResultThisInfo {
  sealResult: SealDragResultCache;
  _: SealComponent;
}

export class SealComponent implements PageComponentAttachInterface {
  private _cancel: boolean = false;

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
    private _scaleGet: () => number,
    private _appGet: () => AppInterface
  ) {
    this._menuOptionCancelClick = this._menuOptionCancelClick.bind(this);
    this._menuOptionContinueClick = this._menuOptionContinueClick.bind(this);

    dragSealClickMenu.appendMenuOption({
      title: "取消签章",
      click: this._menuOptionCancelClick,
    });
    dragSealClickMenu.appendMenuOption({
      title: "继续签章",
      click: this._menuOptionContinueClick,
    });
    dragSealClickMenu.appendMenuOption({
      title: "确认签章",
      click: (event) => {
        this._cancel = false;
        return this._menuOptionOkClick(event);
      },
    });
    dragSealClickMenu.setDefaultClickEvent(this._menuOptionCancelClick);

    dragSealContextmenu.appendMenuOption({
      title: "取消签章",
      click: (event) => {
        this._cancel = true;
        return this._menuOptionOkClick(event);
      },
    });
    dragSealContextmenu.setDefaultClickEvent(this._menuOptionCancelClick);
  }

  /**
   * 缩放改变
   * @param scale 缩放比率
   */
  private _reloadSealResultCache(scale: number, pageIndex: number) {
    if (this._drageStatus === "no" || !this._dragSealResultCacheMapLen) {
      return;
    }
    const pageIndexStr = pageIndex + "";
    const sealResultCacheMap = this._dragSealResultCacheMap[pageIndexStr];
    if (!sealResultCacheMap) {
      return;
    }
    for (let id in sealResultCacheMap) {
      const sealResultCache = sealResultCacheMap[id];
      const { wrapperEle, top, left } = sealResultCache._;
      wrapperEle.style.transform = `scale(${scale})`;
      wrapperEle.style.top = top * scale - wrapperEle.clientHeight / 2 + "px";
      wrapperEle.style.left = left * scale - wrapperEle.clientWidth / 2 + "px";
    }
  }

  /**
   * 取消菜单点击
   * @param event 事件
   */
  private _menuOptionCancelClick(this: SealComponent, event: MouseEvent) {
    debugger;
    const { _cacheId, _cachePageIndexStr } = this._dragSealInfo;
    const cacheMap = this._dragSealResultCacheMap[_cachePageIndexStr];
    if (cacheMap) {
      delete cacheMap[_cacheId];
    }

    delete this._dragSealInfo._cacheId;
    delete this._dragSealInfo._cachePageIndexStr;
    delete this._dragSealInfo._cacheResult;
    this._drageStatus = "drag";
    this._dragSealInfo.wrapperEle.parentElement?.dispatchEvent(
      new MouseEvent("mouseenter", event)
    );
  }

  /**
   * 继续菜单点击
   * @param event 事件
   */
  private _menuOptionContinueClick(event: MouseEvent) {
    const {
      _cacheResult: dragSealResult,
      wrapperEle,
      sealInfo,
      options,
    } = this._dragSealInfo;
    this._dragSealResultCacheMapLen += 1;
    const thisInfo: SealResultThisInfo = {
      sealResult: dragSealResult,
      _: this,
    };
    wrapperEle.style.zIndex = "999999";
    wrapperEle.onmouseenter = this._dragSealMouseEnter.bind(thisInfo);
    wrapperEle.onmouseleave = this._dragSealMouseLeave.bind(thisInfo);
    wrapperEle.onclick = this._dragSealMouseClick.bind(thisInfo);
    this._dragSealInfo = {
      ...createSealSampleEle(sealInfo.imgUrl),
      options,
      sealInfo,
    };
    this._menuOptionCancelClick(event);
  }

  /**
   * 确认签章单击事件
   * @param event 事件
   */
  private _menuOptionOkClick(this: SealComponent, event: MouseEvent) {
    if (this._drageStatus !== "confirm") {
      return;
    }
    this._drageStatus = "no";
    try {
      if (!this._waitResult) {
        return;
      }
      const result: SealDragResult[] = this._cancel ? (undefined as any) : [];
      const pageSealResultCacheMap = this._dragSealResultCacheMap;
      for (let pageIndexStr in pageSealResultCacheMap) {
        const sealResultMap = pageSealResultCacheMap[pageIndexStr];
        for (let id in sealResultMap) {
          const sealResult = sealResultMap[id];
          sealResult._.wrapperEle.remove();
          delete sealResult._;
          if (!this._cancel) {
            result.push(sealResult);
          }
        }
      }
      this._waitResult.resolve(result);
    } finally {
      this._waitResult = undefined;
      this._dragSealInfo.wrapperEle.remove();
      this._dragSealResultCacheMap = {};
      this._dragSealResultCacheMapLen = 0;
      this._dragSealInfo = undefined;
    }
  }

  /**
   * 页面鼠标进入事件
   * @param this this指向
   * @param event 事件
   */
  private _pageOnMouseEnter(this: SealDragThisInfo, event: MouseEvent) {
    if (this._._drageStatus === "no") {
      this.sealDragMaskEle.style.zIndex = "0";
    } else {
      this._._dragSealInfo.pageIndex = this.pageIndex;
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
    if (self._drageStatus !== "drag") {
      return;
    }
    const dragSealInfo = self._dragSealInfo;

    const targetEle = event.target as HTMLElement;

    const scale = this._._scaleGet();

    const { sealInfo, wrapperEle } = dragSealInfo;

    wrapperEle.onclick = this._._dragSealClick.bind(this);
    wrapperEle.oncontextmenu = this._._dragSealClick.bind(
      Object.assign({}, this, { isRight: true })
    );

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
    if (this._._drageStatus !== "drag") {
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
    if (this._._drageStatus !== "confirm" && this._._dragSealInfo) {
      this._._dragSealInfo.wrapperEle.style.display = "none";
    }
  }

  /**
   * 拖拽印章鼠标单击事件
   * @param this this指向
   * @param event 事件
   */
  private _dragSealClick(
    this: SealDragThisInfo & { isRight: boolean },
    event: MouseEvent
  ) {
    this._._drageStatus = "confirm";

    const dragSealInfo = this._._dragSealInfo;
    const {
      pageIndex,
      sealInfo,
      options,
      wrapperEle,
      sealImgEle,
      maskEle,
    } = dragSealInfo;
    const pageIndexStr = pageIndex + "";
    let cacheMap = this._._dragSealResultCacheMap[pageIndexStr];
    if (!cacheMap) {
      cacheMap = {};
      this._._dragSealResultCacheMap[pageIndexStr] = cacheMap;
    }

    const scale = this._._scaleGet();

    let top = parseInt(wrapperEle.style.top || "0");
    let left = parseInt(wrapperEle.style.left || "0");

    let x = left;
    let y = wrapperEle.parentElement.clientHeight - top;

    if (options.cernterPositionMode === "center") {
      x += sealImgEle.width / 2;
      y -= sealImgEle.height / 2;
    }

    // if (options.cernterPositionMode === "center") {
    //   x += sealImgEle.width / 2;
    //   y -= sealImgEle.width / 2;
    // }

    // if (options.cernterPositionMode === "leftBottom") {
    //   x -= wrapperEle.clientWidth / 2;
    //   y -= wrapperEle.clientHeight / 2;
    // }

    x /= scale;
    y /= scale;
    top += wrapperEle.clientHeight / 2;
    left += wrapperEle.clientWidth / 2;
    top /= scale;
    left /= scale;

    const id = createId();
    const dragSealResult: SealDragResultCache = {
      _: {
        id,
        top,
        left,
        wrapperEle,
        sealImgEle,
        maskEle,
      },
      pageNo: pageIndex || 1,
      sealInfo,
      x,
      y,
      cernterPositionMode: options.cernterPositionMode,
    };

    cacheMap[id] = dragSealResult;
    this._._dragSealResultCacheMapLen += 1;
    dragSealInfo._cacheResult = dragSealResult;
    dragSealInfo._cachePageIndexStr = pageIndexStr;
    dragSealInfo._cacheId = id;

    const rootEle = this._._appGet().getRootEle() || document.body;
    const { top: _top, left: _left } = rootEle.getBoundingClientRect();
    let dragMenu = dragSealClickMenu;
    if (this.isRight) {
      dragMenu = dragSealContextmenu;
    }
    dragMenu.show(event.x - _left, event.y - _top, rootEle);
  }

  private _dragSealMouseEnter(this: SealResultThisInfo, event: MouseEvent) {
    this._._dragSealInfo.wrapperEle.style.display = "none";
  }

  private _dragSealMouseLeave(this: SealResultThisInfo, event: MouseEvent) {
    this._._dragSealInfo.wrapperEle.style.display = "block";
  }

  private _dragSealMouseClick(this: SealDragThisInfo, event: MouseEvent) {
    event.stopImmediatePropagation && event.stopImmediatePropagation();
    event.stopPropagation && event.stopPropagation();
  }

  private _dragSealContextmenu(this: SealDragThisInfo, event: MouseEvent) {
    const rootEle = this._._appGet().getRootEle() || document.body;
    const { top: _top, left: _left } = rootEle.getBoundingClientRect();
    dragSealContextmenu.show(event.x - _left, event.y - _top, rootEle);
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
    this._reloadSealResultCache(this._scaleGet(), pageIndex);
    if (!pageWrapperEle.querySelector("." + styles.dragMask)) {
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
    }

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
    options?: SealDragOption
  ): Promise<SealDragResult[]> {
    options = options || {};
    options.cernterPositionMode = options.cernterPositionMode || "center";
    if (
      options.mode != "default" &&
      options.mode !== "multipage" &&
      options.mode !== "qiFeng"
    ) {
      options.mode = "default";
    }

    if (typeof options.allowManualPosition !== "boolean") {
      options.allowManualPosition = true;
    }

    if (typeof options.minPageNo !== "number") {
      options.minPageNo = 0;
    }

    if (typeof options.maxPageNo !== "number") {
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
