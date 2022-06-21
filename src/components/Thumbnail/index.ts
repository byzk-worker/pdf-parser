import { PDFDocumentProxy, PDFPageProxy } from "pdfjs-dist";
import { waitBreakUndefined } from "../../utils";
import { PageComponentAttachInterface, PagesComponent } from "../Pages";
import styles from "./index.module.less";

export class ThumbnailComponent implements PageComponentAttachInterface {
  /**
   * 包装元素
   */
  private _wrapperEle = document.createElement("div");
  /**
   * 元素列表
   */
  private _eleList: HTMLImageElement[] = [];
  /**
   * 元素包裹列表
   */
  private _eleWrapperList: HTMLElement[] = [];
  /**
   * 滚动距离
   */
  private _scrollTopList: number[] = [];

  /**
   * 加载状态
   */
  private loadStatus: "no" | "loading" | "ok" = "no";
  private _imgSize: { width?: string; height?: string } | undefined = undefined;

  public constructor(
    private _pageComponent: PagesComponent,
  ) {
    this._wrapperEle.className = styles.thumbnail;
    this._pageComponent.addPageScrollEvent(this._pageOnScroll.bind(this));
  }

  /**
   * 页面滚动
   * @param pageIndex 页面索引
   */
  private async _pageOnScroll(pageIndex: number) {
    const targetEle = await waitBreakUndefined(
      () => this._eleList[pageIndex - 1]
    );

    this._wrapperEle.querySelectorAll("." + styles.active).forEach((item) => {
      item.className = item.className.split(" " + styles.active).join("");
    });
    targetEle.className += " " + styles.active;
    this._scrollToCurrentThumbnail();
  }

  /**
   * 滚动到当前的缩略图
   */
  private _scrollToCurrentThumbnail() {
    let targetEle = this._wrapperEle.querySelector("." + styles.active);
    let pageIndex = parseInt(targetEle.getAttribute("i"));
    targetEle = targetEle.parentElement;

    const wrapperWidth = this._wrapperEle.clientWidth;
    pageIndex = Math.ceil(pageIndex / Math.floor(wrapperWidth / 127));

    const eleHeight = targetEle.clientHeight + 16;
    const eleStartHeight = eleHeight * (pageIndex - 1);
    const eleEndHeight = eleStartHeight + eleHeight;

    const wrapperStartHeight = this._wrapperEle.scrollTop;
    const wrapperEndHeight =
      this._wrapperEle.scrollTop + this._wrapperEle.clientHeight;

    if (
      eleStartHeight >= wrapperStartHeight &&
      eleEndHeight <= wrapperEndHeight
    ) {
      return;
    }

    let scrollTop = eleStartHeight;
    if (eleEndHeight > wrapperEndHeight) {
      scrollTop = wrapperStartHeight + (eleEndHeight - wrapperEndHeight);
    }

    scrollTop = parseInt(scrollTop + "");
    this._wrapperEle.scrollTo({
      top: scrollTop,
      behavior: "smooth",
    });
  }

  attachRunInit(): boolean {
    return true;
  }

  async attach(
    doc: PDFDocumentProxy,
    page: PDFPageProxy,
    pageWrapperEle: HTMLDivElement,
    pageCanvas: HTMLCanvasElement,
    pageIndex: number
  ): Promise<void> {
    console.log("attach...");
    const index = pageIndex - 1;

    const wrapperEle = document.createElement("div");
    wrapperEle.className = styles.thumbnailWrapper;

    const imgEle = document.createElement("img");

    const blob = await new Promise<Blob>((resovle) => {
      pageCanvas.toBlob((blob) => {
        resovle(blob);
      });
    });
    imgEle.src = window.URL.createObjectURL(blob);
    imgEle.setAttribute("i", pageIndex + "");

    const pageNoText = pageIndex + "/" + doc.numPages;
    const pageNoDiv = document.createElement("div");
    pageNoDiv.className = styles.pageNo;
    pageNoDiv.innerText = pageNoText;

    wrapperEle.title = pageNoText;
    wrapperEle.appendChild(imgEle);
    wrapperEle.appendChild(pageNoDiv);
    wrapperEle.onclick = () => {
      this._pageComponent.jumpTo(pageIndex);
    };

    if (pageIndex === 1) {
      imgEle.className += " " + styles.active;
    }
    this._wrapperEle.appendChild(wrapperEle);
    this._eleList[index] = imgEle;
    this._eleWrapperList[index] = wrapperEle;
    if (this._imgSize) {
      if (this._imgSize.width) {
        imgEle.style.width = "calc(100% - 4px)";
        wrapperEle.style.width = `calc(${this._imgSize.width} - 4px)`;
      }

      if (this._imgSize.height) {
        imgEle.style.height = "100%";
        wrapperEle.style.height = this._imgSize.height;
      }
    }

    if (doc.numPages === pageIndex) {
      this.loadStatus = "ok";
    } else {
      this.loadStatus = "loading";
    }
  }

  public render(
    domEle: HTMLElement,
    options?: {
      width?: number;
      height?: number;
      widthUnit?: "px" | "%";
      heightUnit?: "px" | "%";
    }
  ) {
    console.log("render...");
    options = options || {};
    if (!options.width && !options.height) {
      options.width = 100;
      options.widthUnit = "%";
    }

    const width = options.width
      ? options.width + (options.widthUnit || "px")
      : "";
    const height = options.height
      ? options.height + (options.heightUnit || "px")
      : "";
    this._imgSize = {
      width,
      height,
    };

    const len = this._eleList.length;
    for (let i = 0; i < len; i++) {
      const ele = this._eleList[i];
      if (width) {
        ele.style.width = "calc(100% - 4px)";
        this._eleWrapperList[i].style.width = `calc(${width} - 4px)`;
      }

      if (height) {
        ele.style.height = "100%";
        this._eleWrapperList[i].style.height = height;
      }
    }

    if (domEle.children[0] !== this._wrapperEle) {
      domEle.innerHTML = "";
      domEle.appendChild(this._wrapperEle);
    }
  }
}
