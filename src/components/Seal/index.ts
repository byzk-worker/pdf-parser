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
import { createSealSampleEle, splitSealSampleEle } from "./views/SealSample";
import { createMenu, MenuOption } from "../../views/Menu";
import { createId } from "../../utils";

// const dragSealClickMenu = createMenu([]);
// const dragSealContextmenu = createMenu([]);
// const multipageClickMenu = createMenu([]);

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

interface ManualPositionInfo {
  /**
   * 页码
   */
  pageNo: number;
  /**
   * 签章拖拽结果
   */
  sealDragResultCache: SealDragResultCache;
  /**
   * 状态
   */
  status: "no" | "drag" | "ok";
  globalOptions?: SealDragOption;
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
  sealDragResultCache?: SealDragResultCache;
  resultId?: string;
}

interface SealResultThisInfo {
  sealResult: SealDragResultCache;
  _: SealComponent;
}

interface SealVerifyInfo {
  error: boolean;
  msg?: string;
  signatureName: string;
  time?: string;
  page: number;
  userName?: string[];
}

interface SealVerifyPageMap {
  [pageNo: string]: SealVerifyInfo[];
}

export class SealComponent implements PageComponentAttachInterface {
  private _multipageClickMenu = createMenu([]);
  private _dragSealClickMenu = createMenu([]);
  private _dragSealContextmenu = createMenu([]);
  private _qiFenSealClickMenu = createMenu([]);

  private _manualPositionInfo: ManualPositionInfo | undefined;
  private _manualMenuOptionId = createId();

  private _cancel: boolean = false;
  private _isRight: boolean = false;

  private _pageEventList: { onmouseenter: any; onmouseleave: any }[] = [];

  private _pageSealInfoMap: PageSealInfoMap = {};
  private _dragSealInfo: DragSealInfo | undefined;

  private _dragSealResultCacheMap: DragSealResultMap;
  private _dragSealResultCacheMapLen: number;

  private _dragMaskEle: HTMLElement[] = [];

  private _sealVerifyMap: SealVerifyPageMap;
  private _sealNavEle = document.createElement("div");

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
    this._sealNavEle.className = styles.sealNav;
    this._menuOptionCancelClick = this._menuOptionCancelClick.bind(this);
    this._menuOptionContinueClick = this._menuOptionContinueClick.bind(this);

    const realCancel: MenuOption = {
      title: "取消签章",
      click: (event) => {
        this._cancel = true;
        this._drageStatus = "confirm";
        return this._menuOptionOkClick(event);
      },
    };

    this._qiFenSealClickMenu.appendMenuOption(realCancel);
    // this._qiFenSealClickMenu.appendMenuOption({
    //   title: "调整签章",
    //   click() {},
    // });
    this._qiFenSealClickMenu.appendMenuOption({
      title: "确认签章",
      click: (event) => {
        this._cancel = false;
        this._drageStatus = "confirm";
        return this._menuOptionOkClick(event);
      },
    });

    this._multipageClickMenu.appendMenuOption(realCancel);
    this._multipageClickMenu.appendMenuOption({
      id: this._manualMenuOptionId,
      title: "继续调整",
      click: this._menuOptionManualPositionClick.bind(this),
    });
    this._multipageClickMenu.appendMenuOption({
      title: "确认签章",
      click: (event) => {
        this._cancel = false;
        return this._menuOptionOkClick(event);
      },
    });

    this._multipageClickMenu.hideOption(this._manualMenuOptionId);

    this._dragSealClickMenu.appendMenuOption({
      title: "取消签章",
      click: (event) => {
        this._cancel = false;
        return this._menuOptionCancelClick(event);
      },
    });
    this._dragSealClickMenu.appendMenuOption({
      title: "继续签章",
      click: this._menuOptionContinueClick,
    });
    this._dragSealClickMenu.appendMenuOption({
      title: "确认签章",
      click: (event) => {
        this._cancel = false;
        return this._menuOptionOkClick(event);
      },
    });
    this._dragSealClickMenu.setDefaultClickEvent(this._menuOptionCancelClick);

    this._dragSealContextmenu.appendMenuOption(realCancel);
    this._dragSealContextmenu.setDefaultClickEvent(this._menuOptionCancelClick);
  }

  private _qiFenLoad() {
    const {
      mode,
      qiFenConfig,
      pageNo,
      cernterPositionMode,
    } = this._dragSealInfo.options;
    if (mode !== "qiFeng") {
      return;
    }

    const scale = this._scaleGet();
    const { sealInfo } = this._dragSealInfo;
    const splitPageNum = qiFenConfig.splitPageNum;
    const splitWidth = sealInfo.width / splitPageNum;

    let num = 0;
    for (let i = 0; i < pageNo.length; i++) {
      try {
        const pageIndex = pageNo[i];
        const pageIndexStr = pageIndex + "";
        const cacheMap = this._dragSealResultCacheMap[pageIndexStr];
        if (!cacheMap) {
          continue;
        }

        const dragMaskEle = this._dragMaskEle[pageIndex - 1];
        if (!dragMaskEle) {
          continue;
        }

        const cacheMapKeys = Object.keys(cacheMap);
        if (cacheMapKeys.length !== 1) {
          continue;
        }

        const qiFenMask = dragMaskEle.querySelector(
          "." + styles.qiFenMask
        ) as HTMLElement;
        if (!qiFenMask) {
          continue;
        }
        qiFenMask.style.display = "block";
        qiFenMask.style.width = splitWidth * scale + "px";

        const sealResult = cacheMap[cacheMapKeys[0]];

        debugger;
        const currentBlock = num % splitPageNum;
        sealResult.x = dragMaskEle.clientWidth / scale - splitWidth / 2;
        if (cernterPositionMode === "center") {
          sealResult.y = sealResult.y - sealInfo.height / 2;
        }
        const { wrapperEle } = sealResult._;
        wrapperEle.style.transform = `scale(${scale})`;

        wrapperEle.style.left =
          currentBlock * -splitWidth * scale +
          (wrapperEle.clientWidth * scale - wrapperEle.clientWidth) / 2 +
          "px";

        wrapperEle.style.top =
          sealResult._.top +
          (wrapperEle.clientHeight * scale - wrapperEle.clientHeight) / 2 +
          "px";
      } finally {
        num += 1;
      }
    }
  }

  /**
   * 缩放改变
   * @param scale 缩放比率
   */
  private _reloadSealResultCache(scale: number, pageIndex: number) {
    console.log(this._drageStatus);
    if (this._drageStatus === "no" || !this._dragSealResultCacheMapLen) {
      return;
    }

    if (this._dragSealInfo.options.mode === "qiFeng") {
      this._qiFenLoad();
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
   * 继续调整按钮点击
   * @param this 当前对象
   * @param event 事件
   */
  private _menuOptionManualPositionClick(
    this: SealComponent,
    event: MouseEvent
  ) {
    if (!this._manualPositionInfo) {
      return;
    }

    const {
      wrapperEle,
      sealImgEle,
      maskEle,
    } = this._manualPositionInfo.sealDragResultCache._;

    this._manualPositionInfo.globalOptions = this._dragSealInfo.options;

    this._dragSealInfo = {
      ...this._dragSealInfo,
      wrapperEle,
      sealImgEle,
      maskEle,
      options: {
        ...this._dragSealInfo.options,
        pageNo: [this._manualPositionInfo.pageNo],
      },
    };
    this._manualPositionInfo.status = "drag";
    this._drageStatus = "drag";
    this._dragMaskEle[this._manualPositionInfo.pageNo - 1].dispatchEvent(
      new MouseEvent("mouseenter")
    );
  }

  /**
   * 取消菜单点击
   * @param event 事件
   */
  private _menuOptionCancelClick(this: SealComponent, event: MouseEvent) {
    const { _cacheId, _cachePageIndexStr, options } = this._dragSealInfo;
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
      this._manualPositionInfo = undefined;
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
      return;
    }

    const dragSealInfo = this._._dragSealInfo;
    if (!dragSealInfo) {
      return;
    }

    const allowPageNoList = dragSealInfo.options.pageNo || [];
    if (!allowPageNoList.includes(this.pageIndex)) {
      this.sealDragMaskEle.style.zIndex = "0";
      return;
    }

    const { mode } = this._._dragSealInfo.options;
    if (mode === "qiFeng") {
    }

    this._._dragSealInfo.pageIndex = this.pageIndex;
    this.sealDragMaskEle.style.zIndex = "999999";
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
    if (
      self._drageStatus !== "drag" ||
      self._dragSealInfo.options.mode === "qiFeng"
    ) {
      return;
    }

    const dragSealInfo = self._dragSealInfo;

    const targetEle = event.target as HTMLElement;

    const scale = this._._scaleGet();

    const { sealInfo, wrapperEle } = dragSealInfo;

    wrapperEle.onclick = (event) => {
      this._._isRight = false;
      return this._._dragSealClick.call(this, event);
    };

    if (dragSealInfo.options.mode === "default") {
      wrapperEle.oncontextmenu = (event) => {
        this._._isRight = true;
        return this._._dragSealClick.call(this, event);
      };
    }

    // this._._dragSealClick.bind(
    //   Object.assign({}, this, { isRight: true })
    // );

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

  private _maskMouseClick(this: SealDragThisInfo, event: MouseEvent) {
    if (
      this._._multipageClickMenu.isShow() ||
      !this._._dragSealInfo ||
      this._._dragSealInfo.options.mode !== "multipage" ||
      this._._dragSealInfo.options.allowManualPosition
    ) {
      return;
    }
    event.stopImmediatePropagation && event.stopImmediatePropagation();
    event.stopPropagation && event.stopPropagation();

    const rootEle = this._._appGet().getRootEle() || document.body;
    const { top, left } = rootEle.getBoundingClientRect();
    const x = event.x - left;
    const y = event.y - top;
    if (this._._dragSealInfo.options.allowManualPosition) {
      this._._multipageClickMenu.showOption(this._._manualMenuOptionId);
    } else {
      this._._multipageClickMenu.hideOption(this._._manualMenuOptionId);
    }
    this._._multipageClickMenu.show(x, y, rootEle);
  }

  /**
   * 拖拽印章鼠标单击事件
   * @param this this指向
   * @param event 事件
   */
  private _dragSealClick(this: SealDragThisInfo, event: MouseEvent) {
    this._._drageStatus = "confirm";

    const pageIndex = this.pageIndex;
    const dragSealInfo = this._._dragSealInfo;
    const { sealInfo, options, wrapperEle, sealImgEle, maskEle } = dragSealInfo;

    console.log(pageIndex);
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

    x /= scale;
    y /= scale;
    top += wrapperEle.clientHeight / 2;
    left += wrapperEle.clientWidth / 2;
    top /= scale;
    left /= scale;

    const id = createId();
    let dragSealResult: SealDragResultCache = {
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

    if (dragSealInfo.options.mode === "default") {
      cacheMap[id] = dragSealResult;
      this._._dragSealResultCacheMapLen += 1;
    } else if (dragSealInfo.options.mode === "multipage") {
      if (
        this._._manualPositionInfo &&
        this._._manualPositionInfo.status === "drag"
      ) {
        const thisInfo: SealDragThisInfo = {
          _: this._,
          pageIndex: pageIndex,
          sealDragMaskEle: this.sealDragMaskEle,
          sealDragResultCache: dragSealResult,
          resultId: id,
        };
        dragSealResult._.wrapperEle.onclick = this._._dragSealMouseClick.bind(
          thisInfo
        );
        dragSealResult._.id = this._._manualPositionInfo.sealDragResultCache._.id;
        Object.assign(
          this._._manualPositionInfo.sealDragResultCache,
          dragSealResult
        );
        dragSealInfo.options = this._._manualPositionInfo.globalOptions;
        this._._manualPositionInfo.status = "no";
      } else {
        const pageNoList = dragSealInfo.options.pageNo;
        const { wrapperEle: srcWrapperEle, top, left } = dragSealResult._;
        srcWrapperEle.remove();

        for (let i = 0; i < pageNoList.length; i++) {
          const pageNo = pageNoList[i];
          const wrapperIndex = pageNo - 1;
          const wrapperMaskEle = this._._dragMaskEle[wrapperIndex];
          if (!wrapperMaskEle) {
            continue;
          }

          const id = createId();
          // wrapperEle.style.top = srcWrapperEle.style.top;
          // wrapperEle.style.left = srcWrapperEle.style.left;
          const cloneWrapperEle = srcWrapperEle.cloneNode(true) as HTMLElement;
          wrapperMaskEle.appendChild(cloneWrapperEle);

          const { wrapperEle, sealImgEle, maskEle } = splitSealSampleEle(
            cloneWrapperEle
          );

          const cacheResult: SealDragResultCache = {
            ...dragSealResult,
            _: {
              id,
              top,
              left,
              wrapperEle,
              sealImgEle,
              maskEle,
            },
            pageNo: wrapperIndex + 1,
          };

          if (pageNo === dragSealResult.pageNo) {
            dragSealResult = cacheResult;
            this._._manualPositionInfo = {
              pageNo,
              sealDragResultCache: cacheResult,
              status: "no",
            };
          }

          const thisInfo: SealDragThisInfo = {
            _: this._,
            pageIndex: pageNo,
            sealDragMaskEle: wrapperMaskEle,
            sealDragResultCache: cacheResult,
            resultId: id,
          };
          wrapperEle.onclick = this._._dragSealMouseClick.bind(thisInfo);

          let cacheMap = this._._dragSealResultCacheMap[pageNo + ""];
          if (!cacheMap) {
            cacheMap = {};
            this._._dragSealResultCacheMap[pageNo + ""] = cacheMap;
          }
          cacheMap[id] = cacheResult;
          this._._dragSealResultCacheMapLen += 1;
        }
      }
    }

    dragSealInfo._cacheResult = dragSealResult;
    dragSealInfo._cachePageIndexStr = pageIndexStr;
    dragSealInfo._cacheId = id;

    const rootEle = this._._appGet().getRootEle() || document.body;
    const { top: _top, left: _left } = rootEle.getBoundingClientRect();
    let dragMenu = this._._dragSealClickMenu;
    if (dragSealInfo.options.mode === "multipage") {
      dragMenu = this._._multipageClickMenu;
      if (this._._dragSealInfo.options.allowManualPosition) {
        this._._multipageClickMenu.showOption(this._._manualMenuOptionId);
      } else {
        this._._multipageClickMenu.hideOption(this._._manualMenuOptionId);
      }
    } else if (this._._isRight) {
      dragMenu = this._._dragSealContextmenu;
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

    const dragSealInfo = this._._dragSealInfo;
    if (!dragSealInfo || dragSealInfo.options.mode === "default") {
      return;
    }

    const rootEle = this._._appGet().getRootEle();
    const { top, left } = rootEle.getBoundingClientRect();
    const x = event.x - left;
    const y = event.y - top;
    if (
      dragSealInfo.options.mode === "multipage" &&
      !this._._multipageClickMenu.isShow()
    ) {
      if (this._._dragSealInfo.options.allowManualPosition) {
        this._._multipageClickMenu.showOption(this._._manualMenuOptionId);
      } else {
        this._._multipageClickMenu.hideOption(this._._manualMenuOptionId);
      }
      this._._multipageClickMenu.show(x, y, rootEle);
      this._._manualPositionInfo = {
        pageNo: this.pageIndex,
        sealDragResultCache: this.sealDragResultCache!,
        status: "no",
      };
      return;
    }
  }

  private _qiFenDragSeal(this: SealDragThisInfo, event: MouseEvent) {
    const rootEle = this._._appGet().getRootEle() || document.body;
    const { top, left } = rootEle.getBoundingClientRect();
    this._._qiFenSealClickMenu.show(event.x - left, event.y - top, rootEle);
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
      const qiFenWrapperEle = document.createElement("div");
      qiFenWrapperEle.className = styles.qiFenMask;

      maskWrapperEle.appendChild(qiFenWrapperEle);

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
      maskWrapperEle.onclick = this._maskMouseClick.bind(dragEventThis);

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

    if (options.mode === "qiFeng") {
      if (!options.qiFenConfig) {
        options.qiFenConfig = {};
      }

      if (!options.qiFenConfig.sealMode) {
        options.qiFenConfig.sealMode = "all";
      }

      if (!options.qiFenConfig.splitPageNum) {
        options.qiFenConfig.splitPageNum = 4;
      }
    }

    if (typeof options.allowManualPosition !== "boolean") {
      options.allowManualPosition = false;
    }

    if (typeof options.minPageNo !== "number" || options.minPageNo < 1) {
      options.minPageNo = 1;
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

    const scale = this._scaleGet();

    this._dragSealResultCacheMap = {};
    this._dragSealResultCacheMapLen = 0;
    if (!(options.pageNo instanceof Array)) {
      options.pageNo = [];
      for (let i = options.minPageNo; i <= options.maxPageNo; i++) {
        if (options.mode === "qiFeng") {
          const isEven = i % 2 === 0;
          if (
            (options.qiFenConfig.sealMode === "even" && !isEven) ||
            (options.qiFenConfig.sealMode === "odd" && isEven)
          ) {
            continue;
          }
          const dragMaskEle = this._dragMaskEle[i - 1];
          if (!dragMaskEle) {
            continue;
          }

          const qiFenMaskEle = dragMaskEle.querySelector(
            "." + styles.qiFenMask
          ) as HTMLElement;
          const pageIndexStr = i + "";

          const cacheMap: { [id: string]: SealDragResultCache } = {};
          this._dragSealResultCacheMap[pageIndexStr] = cacheMap;

          const { wrapperEle, sealImgEle, maskEle } = splitSealSampleEle(
            this._dragSealInfo.wrapperEle.cloneNode(true) as HTMLElement
          );
          wrapperEle.style.lineHeight = sealInfo.height + "px";
          const sealDragThisInfo: SealDragThisInfo = {
            _: this,
            pageIndex: i,
            sealDragMaskEle: dragMaskEle,
          };
          wrapperEle.onclick = this._qiFenDragSeal.bind(sealDragThisInfo);
          const id = createId();
          cacheMap[id] = {
            _: {
              id,
              wrapperEle,
              sealImgEle,
              maskEle,
              top: 0,
              left: 0,
            },
            pageNo: i,
            sealInfo,
            x: 0,
            y: dragMaskEle.clientHeight / scale,
          };
          this._dragSealResultCacheMapLen += 1;

          qiFenMaskEle.appendChild(wrapperEle);
        }
        options.pageNo.push(i);
      }
    }

    this._qiFenLoad();
    this._drageStatus = "drag";
    return await res;
  }

  public async sealVerifyAll(fileId: string) {
    this._sealVerifyMap = {};
    this._sealNavEle.innerHTML = "";
    const sealVerifyResult = await sealVerifyAll(fileId);
    for (let i = 0; i < sealVerifyResult.length; i++) {
      const verifyResult = sealVerifyResult[i];
      const pageIndexStr = verifyResult.page + "";
      let verifyMap = this._sealVerifyMap[pageIndexStr];
      if (!verifyMap) {
        verifyMap = [];
        this._sealVerifyMap[pageIndexStr] = verifyMap;
      }
      verifyMap.push({
        error: verifyResult.verifyResult,
        msg: verifyResult.verifyMsg,
        signatureName: verifyResult.signatureName,
        time: verifyResult.time,
        page: verifyResult.page,
        userName: verifyResult.userName,
      });
      
    }
  }
}
