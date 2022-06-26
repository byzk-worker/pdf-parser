import { PDFDocumentProxy, PDFPageProxy } from "pdfjs-dist";
//@ts-ignore
import AsyncLock from "async-lock";
import { full, waitBreakUndefined } from "../../utils";
import styles from "./index.module.less";
import {
  bindFullEvent,
  createFullPromptEle,
  fullPromptEleDefaultTexte,
} from "./utils";

const lock = new AsyncLock();

const pageNoFontSize = 16;
const pageNolineWidth = 139;
const pageNolineBottom = 19;
const pageNoLineFontSplitSize = 40;

export interface PageComponentAttachInterface {
  /**
   * 附加方法运行在初始化
   */
  attachRunInit?(): boolean;
  /**
   * 附加组件到页面
   * @param doc 文档
   * @param page 页面
   * @param pageWrapperEle 页面元素
   * @param pageIndex 当前页
   */
  attach?(
    doc: PDFDocumentProxy,
    page: PDFPageProxy,
    pageWrapperEle: HTMLDivElement,
    pageCanvas: HTMLCanvasElement,
    pageIndex: number
  ): void | Promise<void>;
}

export interface PagesOptions {
  scale?: number;
  showPageNo?: boolean;
}

/**
 * pdf页组件
 */
export class PagesComponent {
  /**
   * 页面外层包装元素
   */
  private _pageWrapperEle = document.createElement("div");
  /**
   * 页面元素列表
   */
  private _pageEleList: HTMLCanvasElement[] = [];
  /**
   * 页面信息
   */
  private _pageInfoList: PDFPageProxy[] = [];
  /**
   * 当前是否处于全屏
   */
  private _isFull: boolean = false;
  /**
   * 原始缩放比率
   */
  private _srcScale: number | undefined;
  /**
   * 全屏提示元素
   */
  private _fullPromptEle: HTMLElement | undefined;
  /**
   * 全屏提示的超时时间
   */
  private _fullPromptTimeout: number;
  /**
   * 全屏提示的超时id
   */
  private _fullPromptTimeoutId: any;
  /**
   * 页面元素距离top距离列表
   */
  private _pageEleTopList: number[] = [];
  /**
   * 目标滚动的top
   */
  private _targetScrollTop: number | undefined;
  /**
   * 滚动事件列表
   */
  private _scrollEventList: any[] = [];
  /**
   * 当前展示的页面索引
   */
  private _currentShowPageIndex: number = 1;

  /**
   *  加载完成的页
   */
  private _loadOkPage: boolean[] = [];

  /**
   * 旋转角度
   */
  private _rotation: number = 0;

  // /**
  //  * 当前缩放比率
  //  */
  // private _currentScale: number | undefined;

  /**
   * 页内组件加载列表
   */
  private _pageCommpontAttachList: PageComponentAttachInterface[];

  public constructor(
    private _doc: () => PDFDocumentProxy,
    private _topEle: HTMLElement,
    private _initOptions?: PagesOptions
  ) {
    this._initOptions = this._initOptions || {
      scale: 1,
    };
    this._pageWrapperEle.className = styles.pdfContentsWrapper;
    bindFullEvent(
      this._pageWrapperEle,
      this._pageWrapperFullSreenchange.bind(this)
    );
    this._pageWrapperEle.onscroll = this._pageWrapperEleOnScroll.bind(this);
  }

  /**
   * 页面全屏事件监听
   */
  private _pageWrapperFullSreenchange() {
    let isFullScreen =
      document.fullscreenElement ||
      (document as any).fullScreen ||
      (document as any).mozFullScreen ||
      (document as any).webkitIsFullScreen;
    if (isFullScreen) {
      setTimeout(() => {
        this.fullWidth();
      }, 300);
      this._pageWrapperEle.insertBefore(
        this._fullPromptEle,
        this._pageWrapperEle.children[0]
      );
      if (this._fullPromptTimeout >= 0) {
        this._fullPromptTimeoutId = setTimeout(() => {
          this._fullPromptTimeoutId = undefined;
          this._fullPromptEle.style.opacity = "0";
          setTimeout(() => {
            try {
              this._fullPromptEle.remove();
              this._fullPromptEle = undefined;
            } catch (e) {}
          }, 300);
        }, this._fullPromptTimeout);
      }
    } else {
      this._isFull = false;
      if (this._fullPromptTimeoutId) {
        clearTimeout(this._fullPromptTimeoutId);
      }
      if (this._fullPromptEle) {
        this._fullPromptEle.remove();
        this._fullPromptEle = undefined;
      }
      this.reloadAllPage({ scale: this._srcScale });
      // this.setScale(this._tempScale || this.scale);
      this._srcScale = undefined;
      this._fullPromptEle = undefined;
      this._fullPromptTimeout = undefined;
      this._fullPromptTimeoutId = undefined;
    }
  }

  /**
   * 页面滚动事件
   * @param event 事件
   */
  private _pageWrapperEleOnScroll(event: Event) {
    if (this._targetScrollTop !== undefined) {
      if (this._targetScrollTop !== this._pageWrapperEle.scrollTop) {
        return;
      }
      this._targetScrollTop = undefined;
      return;
    }

    let currentPage = this._pageEleTopList.length;
    const scrollTop = this._pageWrapperEle.scrollTop;
    for (let i = 0; i < this._pageEleTopList.length - 1; i++) {
      const pageTop = this._pageEleTopList[i];
      const nextTop = this._pageEleTopList[i + 1];
      if (scrollTop >= pageTop && scrollTop <= nextTop) {
        currentPage = i + 1;
        break;
      }
    }
    if (this._currentShowPageIndex === currentPage) {
      return;
    }
    this._currentShowPageIndex = currentPage;
    this._pageScrollEventCall();
  }

  private _pageScrollEventCall() {
    for (let i = 0; i < this._scrollEventList.length; i++) {
      const eventFn = this._scrollEventList[i];
      if (typeof eventFn !== "function") {
        continue;
      }
      eventFn(
        this._currentShowPageIndex,
        this.getPageInfo(),
        this._pageEleList[this._currentShowPageIndex - 1].parentElement
      );
    }
  }

  /**
   * 绘制页码
   * @param ctx canvas上下文
   * @param viewport 视图大小
   * @param pageNo 页码
   * @param options 选项
   */
  private _drawPageNo(
    ctx: CanvasRenderingContext2D,
    viewport: { width: number; height: number },
    pageNo: number,
    options: PagesOptions
  ) {
    const scale = options.scale || 1;
    const filetext = pageNo + "/" + this._doc().numPages;
    const fontSize = pageNoFontSize * scale;
    ctx.font = fontSize + "px serif";
    const measure = ctx.measureText(filetext);
    const lineWidth = pageNolineWidth * scale;
    const splitWidth = pageNoLineFontSplitSize * scale;
    const fontWidth = measure.width * scale;
    const fontHeight =
      measure.actualBoundingBoxAscent + measure.actualBoundingBoxDescent;
    const pageNoSize = fontWidth + lineWidth * 2 + splitWidth * 2;

    const y = viewport.height - pageNolineBottom * scale;
    let x = (viewport.width - pageNoSize) / 2;
    ctx.beginPath();
    ctx.moveTo(x, y);
    x += lineWidth;
    ctx.lineTo(x, y);
    ctx.strokeStyle = "#E6E6E6";
    ctx.stroke();

    x += splitWidth;

    ctx.fillText(filetext, x, y + fontHeight / 2);
    x += splitWidth + fontWidth;
    ctx.beginPath();
    ctx.moveTo(x, y);
    x += lineWidth;
    ctx.lineTo(x, y);
    ctx.stroke();
  }

  /**
   * 重新加载页面
   * @param index 索引
   * @param init 是否初始化
   * @param options 选项
   */
  private async _reloadPage(
    index: number,
    init?: boolean,
    options?: PagesOptions
  ) {
    options = options || this._initOptions;
    const page = this._pageInfoList[index];
    if (!page) {
      throw new Error(`获取第${index + 1}页的PDF文件内容失败`);
    }
    const pageEle = this._pageEleList[index];
    if (!pageEle) {
      throw new Error(`获取第${index + 1}页的PDF文件渲染目标元素失败`);
    }

    const viewport = page.getViewport({
      scale: options.scale || 1,
    });
    pageEle.width = viewport.width;
    pageEle.height = viewport.height;

    const parentEle = pageEle.parentElement as HTMLDivElement;
    parentEle.style.width = viewport.width + "px";
    parentEle.style.height = viewport.height + "px";

    const ctx = pageEle.getContext("2d");

    await page.render({
      canvasContext: ctx,
      viewport,
    }).promise;

    if (options.showPageNo) {
      this._drawPageNo(ctx, viewport, index + 1, options);
    }

    if (index === 0) {
      this._pageEleTopList[index] = 0;
    } else {
      const prevTop = this._pageEleTopList[index - 1];
      this._pageEleTopList[index] = prevTop + pageEle.height + 20;
    }
    this._pageEleTopList[index] = parseInt(this._pageEleTopList[index] + "");

    await this._execAttachList(init, page, parentEle, pageEle, index);
  }

  /**
   * 执行附加组件
   * @param init 是否为初始化
   * @param page 当前页信息
   * @param pageWrapperEle 页包裹元素
   * @param pageIndex 页码
   */
  private async _execAttachList(
    init: boolean,
    page: PDFPageProxy,
    pageWrapperEle: HTMLDivElement,
    PageCanvas: HTMLCanvasElement,
    pageIndex: number
  ) {
    for (let i = 0; i < this._pageCommpontAttachList.length; i++) {
      const attachInterface = this._pageCommpontAttachList[i];
      if (
        (attachInterface.attachRunInit &&
          attachInterface.attachRunInit() &&
          !init) ||
        typeof attachInterface.attachRunInit !== "function"
      ) {
        continue;
      }

      const res = attachInterface.attach(
        this._doc(),
        page,
        pageWrapperEle,
        PageCanvas,
        pageIndex + 1
      );
      if (res instanceof Promise) {
        await res;
      }
    }
  }

  /**
   * 初始化
   */
  public async init(...pageCommpontAttachList: PageComponentAttachInterface[]) {
    this._pageCommpontAttachList = pageCommpontAttachList || [];
    this._topEle.innerHTML = "";
    this._topEle.appendChild(this._pageWrapperEle);
    const doc = this._doc();
    for (let i = 0; i < doc.numPages; i++) {
      const pageContentWrapper = document.createElement("div");
      pageContentWrapper.className = styles.pdfContentWrapper;

      const pageEle = document.createElement("canvas");
      pageEle.className = styles.pdfContent;
      this._pageEleList[i] = pageEle;

      pageContentWrapper.appendChild(pageEle);
      this._pageWrapperEle.appendChild(pageContentWrapper);

      this._pageInfoList[i] = await doc.getPage(i + 1);

      await this._reloadPage(i, true);
      this._loadOkPage[i] = true;
    }
  }

  /**
   * 重新加载指定页面
   * @param index 页面索引
   * @param options 选项
   */
  public async reloadPage(index: number, options?: PagesOptions) {
    const maxPages = this._doc().numPages;
    if (index < 1 || index > maxPages) {
      return;
    }
    index -= 1;
    await waitBreakUndefined(() => this._loadOkPage[index]);
    lock.acquire("reloadPage-" + index, async (done) => {
      try {
        await this._reloadPage(index, false, options);
      } finally {
        done();
      }
    });
  }

  /**
   * 重新加载所有页面
   * @param options 选项
   */
  public async reloadAllPage(options?: PagesOptions) {
    for (let i = 0; i < this._doc().numPages; i++) {
      await this.reloadPage(i + 1, options);
    }
  }

  /**
   * 宽度撑满顶级节点
   */
  public async fullWidth() {
    let maxViewport = this._pageInfoList[0].getViewport({
      scale: 1,
    });
    for (let i = 1; i < this._pageInfoList.length; i++) {
      const page = this._pageInfoList[i];
      const vw = page.getViewport({ scale: 1 });
      if (vw.width > maxViewport.width) {
        maxViewport = vw;
      }
    }
    const pageWrapperWidth = this._pageWrapperEle.clientWidth;
    const scale = pageWrapperWidth / maxViewport.width;
    await this.reloadAllPage({
      scale,
    });
    return scale;
  }

  /**
   * 内容全屏
   * @param scale 原始缩放比率
   * @param options 选项
   */
  public async fullContent(
    scale: number,
    options?: {
      /**
       * 提示信息
       */
      prompt?: string | HTMLElement;
      /**
       * 超时关闭, 默认3000(ms), 小于0不关闭
       */
      timeout?: number;
    }
  ) {
    if (this._isFull) {
      return;
    }

    options = options || {};
    this._srcScale = scale;

    if (!options.prompt) {
      const fullPromptEle = createFullPromptEle(fullPromptEleDefaultTexte);
      fullPromptEle.innerText = fullPromptEleDefaultTexte;
      options.prompt = fullPromptEle;
    } else if (typeof options.prompt === "string") {
      const fullPromptEle = createFullPromptEle(options.prompt);
      options.prompt = fullPromptEle;
    }
    if (typeof options.timeout === "undefined") {
      options.timeout = 3000;
    }

    this._isFull = true;
    this._fullPromptTimeout = options.timeout;
    this._fullPromptEle = options.prompt;
    full(this._pageWrapperEle);
  }

  /**
   * 跳转到指定页页
   * @param pageIndex 跳转到的页数, 从1开始
   */
  public jumpTo(pageIndex: number, offset?: { x?: number; y?: number }) {
    pageIndex -= 1;
    if (pageIndex < 0) {
      pageIndex = 0;
    } else if (pageIndex > this._doc().numPages - 1) {
      pageIndex = this._doc().numPages;
    }

    offset = offset || {};
    if (typeof offset.x === "undefined") {
      offset.x = -1;
    }

    if (typeof offset.y === "undefined") {
      offset.y = 0;
    }

    const currentTop = this._pageEleTopList[pageIndex];
    let nextTop = this._pageEleTopList[pageIndex + 1];
    if (!nextTop) {
      nextTop = currentTop + this._pageEleList[pageIndex].clientHeight;
    }
    const top = offset.y
      ? parseInt(nextTop - offset.y - 20 + "")
      : parseInt(currentTop + "");

    this._targetScrollTop = top;

    const scrollOptions: ScrollToOptions = {
      top,
      behavior: "smooth",
    };

    if (offset.x !== -1) {
      scrollOptions.left = offset.x;
    }

    this._pageWrapperEle.scrollTo(scrollOptions);
    pageIndex += 1;
    if (pageIndex !== this._currentShowPageIndex) {
      this._currentShowPageIndex = pageIndex;
      this._pageScrollEventCall();
    }
  }

  /**
   * 获取页面信息
   * @param index 页索引
   * @returns 页信息
   */
  public getPageInfo(index?: number) {
    index = index || this._currentShowPageIndex;
    if (index < 1) {
      return;
    } else if (index > this._doc().numPages) {
      index = this._doc().numPages;
    }
    index -= 1;
    return this._pageInfoList[index];
  }

  /**
   * 添加页面滚动事件
   * @param callback 回调
   */
  public addPageScrollEvent(
    callback: (
      currentIndex: number,
      page: PDFPageProxy,
      pageWrapperEle: HTMLDivElement
    ) => void
  ) {
    this._scrollEventList.push(callback);
  }

  /**
   * 移除页面滚动监听事件
   * @param callback 回调
   */
  public removePageScrollEvent(
    callback: (
      currentIndex: number,
      page: PDFPageProxy,
      pageWrapperEle: HTMLDivElement
    ) => void
  ) {
    for (let i = this._scrollEventList.length - 1; i >= 0; i--) {
      if (this._scrollEventList[i] === callback) {
        this._scrollEventList.splice(i, 1);
      }
    }
  }

  /**
   * 绑定页面包裹元素的事件
   * @param eventName 事件名称
   * @param callback 回调函数
   */
  public bindPageWrapperEleEvent(eventName: string, callback: any) {}

  /**
   * 获取旋转角度
   * @returns 旋转角度
   */
  public getRotation() {
    return this._rotation;
  }

  /**
   * 设置旋转角度
   * @param rotation 旋转角度
   */
  public async setRotation(rotation: number) {
    if (rotation >= 360) {
      rotation -= 360;
    } else if (rotation <= -360) {
      rotation += 360;
    }
    if (rotation === this._rotation) {
      return;
    }
    this._rotation = rotation;

    debugger;
    const len = this._doc().numPages;
    for (let i = 0; i < len; i++) {
      const pageEle = await waitBreakUndefined(() => this._pageEleList[i]);
      pageEle.parentElement.style.transform = `rotate(${this._rotation}deg)`;
    }
  }

  /**
   * 获取文档总页数
   * @returns 文档页数
   */
  public docNumPages(): number {
    return this._doc().numPages;
  }
}
