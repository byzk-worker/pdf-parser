import {
  FileInfo,
  ReaderParserAbstract,
  ReaderParserSupport,
  ieUtil,
} from "@byzk/document-reader";
import { openFile, SealVerifyInfo } from "@byzk/pdf-locale-call";
import * as pdfjsLib from "pdfjs-dist";
import pdfjsWorker from "pdfjs-dist/build/pdf.worker.entry.js";
import { sealVerify } from "@byzk/pdf-locale-call";

// import "pdfjs-dist/web/pdf_viewer.css";
import styles from "./styles/index.module.less";
import pdfStyles from "./styles/pdf.module.less";

let cMapUrl: string | undefined = undefined;
let cMapPacked: boolean | undefined = undefined;

const pageNoFontSize = 16;
const pageNolineWidth = 139;
const pageNolineBottom = 19;
const pageNoLineFontSplitSize = 40;

function base64ToBlob(base64Data: string): Blob {
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

const outlineFlagImgUrlStr = window.URL.createObjectURL(
  base64ToBlob(
    "data:image/png;base64,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"
  )
);

const fullPromptEleDefaultTexte = "按Esc推出全屏";
function createFullPromptEle(text: string) {
  const fullPromptEle = document.createElement("div") as HTMLElement;
  fullPromptEle.className = styles.fullPrompt;
  return fullPromptEle;
}

/**
 * 全屏
 * @param ele 要全屏的元素
 */
function full(ele: any) {
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

function htmlTemplate(htmlEle: string) {
  const template = document.createElement("template");
  template.innerHTML = htmlEle;

  return template.content;
}

pdfjsLib.GlobalWorkerOptions.workerSrc = pdfjsWorker;

const fullEventName = [
  "fullscreenchange",
  "webkitfullscreenchange",
  "mozfullscreenchange",
];

const highlightClassName = `${pdfStyles.highlight} ${pdfStyles.appended} ${pdfStyles.begin} ${pdfStyles.end}`;

class Parser extends ReaderParserAbstract {
  private _doc: pdfjsLib.PDFDocumentProxy | undefined;
  private _docOutlineEle: HTMLDivElement = document.createElement("div");

  private _pageEleList: HTMLCanvasElement[] = [];
  private _pageInfoList: pdfjsLib.PDFPageProxy[] = [];
  private _pageWrapperEle: HTMLDivElement;
  private _pageScrollTopList: number[] = [];
  private _pageTextlayerEleList: HTMLDivElement[] = [];
  private _pageMoveEleList: HTMLDivElement[] = [];
  private _showPageNo: boolean = false;
  private _jumpScroll: number = -1;
  private _modeSupportSelect = navigator.userAgent.indexOf("Firefox") < 0;
  private _mode: "select" | "move" = this._modeSupportSelect
    ? "select"
    : "move";
  private _tempScale: number | undefined;
  private _fullPromptEle: HTMLElement | undefined;
  private _fullPromptTimeout: number | undefined;
  private _fullPromptTimeoutId: any;
  private _fuleIs: boolean = false;
  private _pageSearchEleList: HTMLElement[][] = [];
  private _currentSearchPageIndex: number | undefined;
  private _currentSearchEleIndex: number | undefined;
  private _currentSearchKeyWords: string | undefined = "攻击方向";

  private _thumbnailWrapperEle = document.createElement("div");
  private _thumbnailWrapperEles: HTMLDivElement[] = [];
  private _thumbnailEles: HTMLImageElement[] = [];
  private _thumbnailWidth: number | undefined;
  private _thumbnailIndex: number = -1;
  private _thumbnailLoadingState: "no" | "loading" | "ok" = "no";
  private _thumbnailBlobUrl: string[] = [];
  // private _thumbnailWrapperScrollTopList: number[] = [];
  private _thumbnailWrapperScrollTop = 0;

  private _fileUploadInfo: {
    status: "no" | "loading" | "ok";
    id?: string;
    error?: boolean;
    errMsg?: string;
  } = { status: "no" };

  private _pageWrapperFullSreenchange = function (this: Parser) {
    let isFullScreen =
      document.fullscreenElement ||
      (document as any).fullScreen ||
      (document as any).mozFullScreen ||
      (document as any).webkitIsFullScreen;
    if (isFullScreen) {
      setTimeout(() => {
        this._tempScale = this.scale;
        this._fullWidth();
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
      this._fuleIs = false;
      if (this._fullPromptTimeoutId) {
        clearTimeout(this._fullPromptTimeoutId);
      }
      if (this._fullPromptEle) {
        this._fullPromptEle.remove();
        this._fullPromptEle = undefined;
      }
      this.setScale(this._tempScale || this.scale);
      this._tempScale = undefined;
      this._fullPromptEle = undefined;
      this._fullPromptTimeout = undefined;
      this._fullPromptTimeoutId = undefined;
    }
  }.bind(this);

  private async _loadThumbnail(
    domEle: HTMLElement,
    options?: {
      width?: number;
      height?: number;
      widthUnit?: "px" | "%";
      heightUnit?: "px" | "%";
    }
  ) {
    options = options || {};
    if (!options.width && !options.height) {
      options.width = 100;
      options.widthUnit = "%";
    }
    if (domEle.children[0] !== this._thumbnailWrapperEle) {
      domEle.innerHTML = "";
      domEle.appendChild(this._thumbnailWrapperEle);
    }

    if (
      this._thumbnailLoadingState === "ok" ||
      this._thumbnailLoadingState === "loading"
    ) {
      this._thumbnailWrapperEle.scrollTop = this._thumbnailWrapperScrollTop;
      return;
    }

    let loadPageIndex = 0;
    this._thumbnailLoadingState = "loading";
    const handleThumbnail = () => {
      setTimeout(async () => {
        if (!this._doc) {
          handleThumbnail();
          return;
        }
        const width = options.width + (options.widthUnit || "px");
        const height = options.height
          ? ""
          : options.height + (options.heightUnit || "px");
        for (; loadPageIndex < this._doc.numPages; loadPageIndex++) {
          const page = this._thumbnailBlobUrl[loadPageIndex];
          if (!page) {
            handleThumbnail();
            return;
          }

          if (loadPageIndex === 0) {
            this._convertThumbnailCurrent(this._thumbnailIndex);
          }
          // this._thumbnailEles[loadPageIndex].width = width;
          // this._thumbnailEles[loadPageIndex].width = width;
          if (width) {
            this._thumbnailEles[loadPageIndex].style.width = "calc(100% - 4px)";
            this._thumbnailWrapperEles[
              loadPageIndex
            ].style.width = `calc(${width} - 4px)`;
          }

          if (height) {
            this._thumbnailEles[loadPageIndex].style.height = "100%";
            this._thumbnailWrapperEles[loadPageIndex].style.height = height;
          }

          // const imgBlob = await new Promise<Blob>((resovle) => {
          //   pageEle.toBlob((b) => resovle(b));
          // });

          this._thumbnailEles[loadPageIndex].src = page;
          const i = loadPageIndex;
          const pageNoDiv = document.createElement("div");
          pageNoDiv.className = styles.pageNo;
          const pageNoText = loadPageIndex + 1 + "/" + this._doc.numPages;
          pageNoDiv.innerText = pageNoText;
          this._thumbnailWrapperEles[loadPageIndex].title = pageNoText;
          this._thumbnailWrapperEles[loadPageIndex].appendChild(pageNoDiv);
          this._thumbnailWrapperEles[loadPageIndex].onclick = () => {
            this.jumpTo(i + 1);
          };
          // domEle.appendChild(this._thumbnailWrapperEles[i]);
        }
        this._thumbnailLoadingState = "ok";
      }, 10);
    };
    handleThumbnail();
  }

  private async _loadPage(index: number, init?: boolean) {
    const page = await this._doc.getPage(index + 1);
    this._pageInfoList[index] = page;
    await this._reloadPage(index, init);
  }

  private async _reloadPage(index: number, init?: boolean) {
    const page = this._pageInfoList[index];
    if (!page) {
      throw new Error(`获取第${index + 1}页的PDF文件内容失败`);
    }
    let pageEle = this._pageEleList[index];
    // if (thumbnail) {
    //   pageEle = document.createElement("canvas");
    // }
    if (!pageEle) {
      throw new Error(`获取第${index + 1}页的PDF文件渲染目标元素失败`);
    }
    // scale = scale || this.scale;
    const viewport = page.getViewport({ scale: this.scale });

    const ctx = pageEle.getContext("2d");
    pageEle.width = viewport.width;
    pageEle.height = viewport.height;
    // pageEle.style.width = "100%";
    // pageEle.style.height = "100%";

    // if (!thumbnail) {
    const parentEle = pageEle.parentElement;
    parentEle.style.width = viewport.width + "px";
    parentEle.style.height = viewport.height + "px";
    this._pageScrollTopList[index] = viewport.height + 20;
    // }
    // else {
    // this._thumbnailWrapperScrollTopList[index] = viewport.height + 20;
    // }
    await page.render({
      canvasContext: ctx,
      viewport,
    }).promise;
    if (init) {
      this._thumbnailBlobUrl[index] = await new Promise<string>((resolve) => {
        pageEle.toBlob((b) => resolve(window.URL.createObjectURL(b)));
      });
    }
    if (this._showPageNo) {
      this._drawPageNo(ctx, viewport, index + 1);
    }

    // if (thumbnail) {
    //   return pageEle;
    // }

    await this._loadPageTextContent(index);
    if (this._mode === "move") {
      this._loadPageMoveContent(index);
    }
    // return pageEle;
  }

  private _loadPageMoveContent(pageIndex: number) {
    if (this._pageMoveEleList[pageIndex])
      this._pageMoveEleList[pageIndex].style.zIndex = "9";
    if (this._pageTextlayerEleList[pageIndex])
      this._pageTextlayerEleList[pageIndex].style.zIndex = "8";
  }

  private async _loadPageTextContent(pageIndex: number) {
    const page = this._pageInfoList[pageIndex];
    const textContent = await page.getTextContent();
    const viewport = page.getViewport({ scale: this.scale });

    const template = document.createElement("template");
    const container = template.content;

    await pdfjsLib.renderTextLayer({
      textContent,
      container,
      viewport,
      enhanceTextSelection: true,
    }).promise;

    this._pageSearchEleList[pageIndex] = [];
    const nowPageSearchEleList = this._pageSearchEleList[pageIndex];

    const children = container.children;
    for (let i = 0; i < children.length; i++) {
      const child = children[i];
      const tagName = child.tagName.toLowerCase();
      if ("span" !== tagName) {
        continue;
      }
      const spanChild = child as HTMLSpanElement;
      if (this._currentSearchKeyWords) {
        spanChild.innerHTML = spanChild.innerText
          .split(this._currentSearchKeyWords)
          .join(
            `<span class="${highlightClassName}">${this._currentSearchKeyWords}</span>`
          );
      }
      const fontSize = parseFloat(spanChild.style.fontSize);
      if (isNaN(fontSize)) {
        continue;
      }
      if (fontSize < 12) {
        spanChild.style.fontSize = 12 + "px";
        spanChild.style.transform = `scale(${fontSize / 12})`;
      }
    }
    this._pageTextlayerEleList[pageIndex].style.zIndex = "9";
    this._pageMoveEleList[pageIndex].style.zIndex = "8";
    this._pageTextlayerEleList[pageIndex].style.height = viewport.height + "px";
    this._pageTextlayerEleList[pageIndex].innerHTML = "";
    this._pageTextlayerEleList[pageIndex].appendChild(container);
  }

  private _drawPageNo(
    ctx: CanvasRenderingContext2D,
    viewport: { width: number; height: number },
    pageNo: number,
    scale?: number
  ) {
    scale = scale || this.scale;
    const filetext = pageNo + "/" + this._doc.numPages;
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

  private async _reloadAllPage() {
    for (let i = 0; i < this._pageEleList.length; i++) {
      await this._reloadPage(i);
    }
  }

  private _initEvent(eventName?: string) {
    this._eventOnScroll = this._eventOnScroll.bind(this);
    this._pageWrapperEle.onscroll = this._eventOnScroll;

    this._eventOnThumbnailWrapperScroll = this._eventOnThumbnailWrapperScroll.bind(
      this
    );
    this._thumbnailWrapperEle.onscroll = this._eventOnThumbnailWrapperScroll;
  }

  private _eventOnThumbnailWrapperScroll(event: Event) {
    this._thumbnailWrapperScrollTop = this._thumbnailWrapperEle.scrollTop;
  }

  private _eventOnScroll(event: Event) {
    // if (!this.eventExist("pageNoChange")) {
    //   return;
    // }
    if (this._jumpScroll !== -1) {
      if (this._jumpScroll !== this._pageWrapperEle.scrollTop) {
        return;
      }
      this._jumpScroll = -1;
      return;
    }
    const scrollTop = this._pageWrapperEle.scrollTop;
    let sum = 0;

    let index = -1;
    for (let i = 0; i < this._pageScrollTopList.length; i++) {
      sum += this._pageScrollTopList[i];
      if (sum >= scrollTop) {
        index = i + 1;
        break;
      }
    }

    if (index === -1) {
      index = this._pageScrollTopList.length;
    }
    this._convertThumbnailCurrent(index);
    this.fire("pageNoChange", index);
  }

  private _convertThumbnailCurrent(pageIndex: number) {
    if (pageIndex < 1) {
      pageIndex = 1;
    } else if (pageIndex > this._doc.numPages) {
      pageIndex = this._doc.numPages;
    }
    pageIndex -= 1;
    if (this._thumbnailIndex !== -1 && this._thumbnailIndex === pageIndex) {
      return;
    }

    if (pageIndex === -1) {
      pageIndex = 0;
    }

    const thumbnailEle = this._thumbnailEles[this._thumbnailIndex];
    if (thumbnailEle) {
      thumbnailEle.className = thumbnailEle.className
        .split(" " + styles.active)
        .join("");
    }

    this._thumbnailIndex = pageIndex;
    const thumbnail = this._thumbnailEles[this._thumbnailIndex];
    if (thumbnail) {
      thumbnail.className += " " + styles.active;
    }
    const height = this._thumbnailWrapperEle.clientHeight;
    let sum = 0;
    for (let i = 0; i <= this._thumbnailIndex; i++) {
      sum += this._thumbnailWrapperEles[i].clientHeight + 16;
    }

    const startHeight = this._thumbnailWrapperScrollTop;
    const endHeight = this._thumbnailWrapperScrollTop + height;

    debugger;
    if (sum > endHeight) {
      if (startHeight <= sum && endHeight >= sum) {
        return;
      }
      this._thumbnailWrapperScrollTop =
        sum - endHeight + this._thumbnailWrapperScrollTop;
    } else {
      sum -= this._thumbnailWrapperEles[this._thumbnailIndex].clientHeight + 16;
      if (startHeight <= sum && endHeight >= sum) {
        return;
      }
      this._thumbnailWrapperScrollTop = sum;
    }

    this._thumbnailWrapperEle.scrollTo({
      top: this._thumbnailWrapperScrollTop,
      behavior: "smooth",
    });
  }

  private _loadPageMoveContentEvents(pageIndex: number) {
    const pageMoveEle = this._pageMoveEleList[pageIndex];
    let startX = 0;
    let startY = 0;
    const pageMove = (event: MouseEvent) => {
      const x = event.x;
      const y = event.y;

      const moveX = startX - x;
      const moveY = startY - y;
      startX = x;
      startY = y;
      this._pageWrapperEle.scrollTop += moveY;
      this._pageWrapperEle.scrollLeft += moveX;
    };

    pageMoveEle.onmousedown = (event) => {
      startX = event.x;
      startY = event.y;
      pageMoveEle.onmousemove = pageMove;
    };
    const moveCancel = () => {
      pageMoveEle.onmousemove = undefined;
    };
    pageMoveEle.onmouseleave = moveCancel;
    pageMoveEle.onmouseup = moveCancel;
  }

  public setScale(scale: number): void {
    if (this.scale === scale) {
      return;
    }
    this.scale = scale;
    this.fire("scaleChange", scale);
    this._reloadAllPage();
  }

  async render(domEle: HTMLDivElement) {
    if (!this._doc) {
      throw new Error("没有已经打开的文档信息");
    }

    this._pageWrapperEle = document.createElement("div");
    fullEventName.forEach((eventName) => {
      this._pageWrapperEle.addEventListener(
        eventName,
        this._pageWrapperFullSreenchange
      );
    });

    this._thumbnailWrapperEle.className = styles.thumbnail;
    this._thumbnailWrapperEle.innerHTML = "";

    this._initEvent();
    domEle.appendChild(this._pageWrapperEle);
    this._pageWrapperEle.className = styles.pdfContentsWrapper;
    this._thumbnailEles = [];
    this._thumbnailWrapperEles = [];

    this._pageEleList = [];

    for (let i = 0; i < this._doc.numPages; i++) {
      this._thumbnailWrapperEles[i] = document.createElement("div");
      this._thumbnailEles[i] = document.createElement("img");

      this._thumbnailWrapperEles[i].appendChild(this._thumbnailEles[i]);
      this._thumbnailWrapperEles[i].className = styles.thumbnailWrapper;
      this._thumbnailWrapperEle.appendChild(this._thumbnailWrapperEles[i]);

      const pageContentWrapper = document.createElement("div");
      this._pageTextlayerEleList[i] = document.createElement("div");
      this._pageTextlayerEleList[i].className = pdfStyles.textLayer;

      this._pageMoveEleList[i] = document.createElement("div");
      this._pageMoveEleList[i].className = styles.moveContent;
      this._loadPageMoveContentEvents(i);

      //   this._eleAddPageNo(canvasWrapper, i + 1, this._doc.numPages);
      pageContentWrapper.className = styles.pdfContentWrapper;

      this._pageEleList[i] = document.createElement("canvas");
      this._pageEleList[i].className = styles.pdfContent;

      pageContentWrapper.appendChild(this._pageEleList[i]);
      pageContentWrapper.appendChild(this._pageTextlayerEleList[i]);
      pageContentWrapper.appendChild(this._pageMoveEleList[i]);
      this._pageWrapperEle.appendChild(pageContentWrapper);
      await this._loadPage(i, true);
    }
  }

  private async _constructDocOutline() {
    this._docOutlineEle.innerHTML = "";
    this._docOutlineEle.className = styles.outlines;
    const outlines = await this._doc.getOutline();
    if (!outlines || outlines.length === 0) {
      return;
    }

    for (let i = 0; i < outlines.length; i++) {
      const outline = outlines[i];
      const dest = outline.dest as [
        { num: number; gen: number },
        { name: string },
        number,
        number,
        number
      ];
      const pageIndex = await this._doc.getPageIndex(dest[0]);
      const outlineEle = document.createElement("div");
      outlineEle.className = styles.outline;

      const iconDiv = document.createElement("div");
      iconDiv.className = styles.icon;

      const iconImg = document.createElement("img");
      iconImg.src = outlineFlagImgUrlStr;
      iconDiv.appendChild(iconImg);

      const textDiv = document.createElement("div");
      textDiv.className = styles.text;

      const textSpan = document.createElement("span");
      textSpan.innerText = outline.title;
      textDiv.appendChild(textSpan);

      outlineEle.onclick = () => {
        let parentTop = 16;
        if (pageIndex !== 0) {
          for (let i = 0; i < pageIndex; i++) {
            parentTop += this._pageScrollTopList[i];
          }
        }

        const nowPageHeight = this._pageEleList[pageIndex].clientHeight;
        const x = dest[2] * this.scale;
        const y = nowPageHeight - dest[3] * this.scale;
        this._pageWrapperEle.scrollTo({
          top: parentTop + y,
          left: x,
          behavior: "smooth",
        });
      };
      outlineEle.appendChild(iconDiv);
      outlineEle.appendChild(textDiv);
      this._docOutlineEle.appendChild(outlineEle);
    }
  }

  async loadFile(file: FileInfo): Promise<void> {
    this._doc = await pdfjsLib.getDocument({
      url: file.path,
      cMapPacked,
      cMapUrl,
    }).promise;
    await this._constructDocOutline();
    // console.log(outline);
    // const res = await this._doc.getPageIndex(outline[2].dest[0]);
    // debugger;
    // console.log(res);
    openFile({
      ...file,
    })
      .then(async (id) => {
        debugger;
        this._fileUploadInfo.status = "ok";
        this._fileUploadInfo.id = id;
        const result = await sealVerify(id);
        debugger;
        console.log(result);
      })
      .catch((err) => {
        debugger;
        this._fileUploadInfo.status = "ok";
        this._fileUploadInfo.error = true;
        this._fileUploadInfo.errMsg = err.message || err;
      });
  }

  getNumPages(): number {
    return this._doc ? this._doc.numPages : 1;
  }

  public renderOutline(domEle: HTMLElement): void | Promise<void> {
    domEle.innerHTML = "";
    domEle.appendChild(this._docOutlineEle);
  }

  public jumpTo(page: number): void {
    if (this._pageEleList.length < page) {
      return;
    }
    let sum = 0;
    const endPage = page - 1;
    for (let i = 0; i < endPage; i++) {
      sum += this._pageScrollTopList[i];
    }
    this._jumpScroll = parseInt(sum + "");
    this._pageWrapperEle.scrollTo({
      top: this._jumpScroll,
      behavior: "smooth",
    });
    this._convertThumbnailCurrent(page);
    this.fire("pageNoChange", page);
  }
  public showPageNo(): void {
    if (this._showPageNo) {
      return;
    }
    this._showPageNo = true;
    this._reloadAllPage();
  }

  public hidePageNo(): void {
    if (!this._showPageNo) {
      return;
    }
    this._showPageNo = false;
    this._reloadAllPage();
  }
  public getMode(): "move" | "select" {
    return this._mode;
  }
  public setMode(mode: "move" | "select"): void {
    if (!this._modeSupportSelect && mode === "select") {
      return;
    }
    if (this._mode === mode) {
      return;
    }
    this._mode = mode;
    for (let i = 0; i < this._doc.numPages; i++) {
      if (this._mode === "move") {
        this._loadPageMoveContent(i);
      } else {
        this._loadPageTextContent(i);
      }
    }
  }
  public setFull(
    mode: "content" | "width",
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
  ): void {
    if (mode === "width") {
      return this._fullWidth();
    }

    if (mode === "content" && !this._fuleIs) {
      options = options || {};
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
      this._fullPromptEle = options.prompt;
      this._fullPromptTimeout = options.timeout;
      return this._fullContent(options.prompt, options.timeout);
    }
  }

  private _fullContent(promptEle: HTMLElement, timeout: number) {
    full(this._pageWrapperEle);
  }

  private _fullWidth() {
    let maxViewport: pdfjsLib.PageViewport = this._pageInfoList[0].getViewport({
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
    this.setScale(scale);
  }

  public renderThumbnail(
    domEle: HTMLElement,
    options?: {
      width?: number;
      height?: number;
      widthUnit?: "px" | "%";
      heightUnit?: "px" | "%";
    }
  ): void | Promise<void> {
    return this._loadThumbnail(domEle, options);
  }

  // public renderThumbnail(
  //   domEle: HTMLElement,
  //   width?: number
  // ): void | Promise<void> {
  //   this._loadThumbnail(domEle, width);
  // }
}

function support(): ReaderParserSupport {
  return {
    ...ReaderParserAbstract.supportAll,
    pages: {
      ...(ReaderParserAbstract.supportAll.pages as any),
      moduleSwitch: {
        select: navigator.userAgent.indexOf("Firefox") < 0,
        move: true,
      },
    },
    nowBrowser: !ieUtil.isIe(),
    fileSuffix: [".pdf"],
    isSupportFile(file) {
      return file.name.endsWith(".pdf") && typeof file.path !== "undefined";
    },
  };
}

function loadPdfFonts(url: string) {
  if (!url) {
    return;
  }
  cMapPacked = true;
  cMapUrl = url;
  // pdfjsLib.CMapCompressionType =
}

export default {
  Parser,
  support,
  loadPdfFonts,
};
