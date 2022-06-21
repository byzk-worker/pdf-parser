import { PDFDocumentProxy, PDFPageProxy, renderTextLayer } from "pdfjs-dist";
import { PageComponentAttachInterface } from "../Pages";
import styles from "./index.module.less";
import pdfStyles from "../../styles/pdf.module.less";

const highlightClassName = `${pdfStyles.highlight} ${pdfStyles.appended} ${pdfStyles.begin} ${pdfStyles.end}`;

export class TextLayerComponent implements PageComponentAttachInterface {
  private _moveWrapper: HTMLDivElement[] = [];
  private _selectWrapper: HTMLDivElement[] = [];
  private _currentMod: "select" | "move" = "select";

  private _currentSearchKeyWords: string | undefined = "攻击方向";

  public constructor(
    private _scaleGet: () => number,
    defaultMod: "select" | "move" = "select"
  ) {
    this._currentMod = defaultMod;
    // this.convert(defaultMod);
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
    const index = pageIndex - 1;
    if (!this._moveWrapper[index]) {
      this._moveWrapper[index] = document.createElement("div");
      this._moveWrapper[index].className = styles.moveContent;
      this._loadPageMoveContentEvents(index, pageWrapperEle.parentElement);

      pageWrapperEle.appendChild(this._moveWrapper[index]);
    }

    if (!this._selectWrapper[index]) {
      this._selectWrapper[index] = document.createElement("div");
      this._selectWrapper[index].className = pdfStyles.textLayer;
      pageWrapperEle.appendChild(this._selectWrapper[index]);
    }

    const textContent = await page.getTextContent();
    const viewport = page.getViewport({ scale: this._scaleGet() });

    const template = document.createElement("template");
    const container = template.content;

    await renderTextLayer({
      textContent,
      container,
      viewport,
      enhanceTextSelection: true,
    }).promise;

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
    this._selectWrapper[index].innerHTML = "";
    this._selectWrapper[index].appendChild(container);
    if (this._currentMod === "select") {
      this._moveWrapper[index].style.zIndex = "8";
      this._selectWrapper[index].style.zIndex = "9";
    } else {
      this._moveWrapper[index].style.zIndex = "9";
      this._selectWrapper[index].style.zIndex = "8";
    }
  }

  private _loadPageMoveContentEvents(
    pageIndex: number,
    pageBigWrapper: HTMLElement
  ) {
    const pageMoveEle = this._moveWrapper[pageIndex];
    let startX = 0;
    let startY = 0;
    const pageMove = (event: MouseEvent) => {
      const x = event.x;
      const y = event.y;

      const moveX = startX - x;
      const moveY = startY - y;
      startX = x;
      startY = y;
      pageBigWrapper.scrollTop += moveY;
      pageBigWrapper.scrollLeft += moveX;
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

  /**
   * 切换模式
   * @param mode 模式
   */
  public convert(mode: "select" | "move") {
    if (this._currentMod === mode) {
      return;
    }
    this._currentMod = mode;
    let moveWrapperZindex = "9";
    let selectWrapperZindex = "8";
    if (mode === "select") {
      moveWrapperZindex = "8";
      selectWrapperZindex = "9";
    }

    const len = this._moveWrapper.length;
    for (let i = 0; i < len; i++) {
      this._moveWrapper[i].style.zIndex = moveWrapperZindex;
      this._selectWrapper[i].style.zIndex = selectWrapperZindex;
    }
  }
}
