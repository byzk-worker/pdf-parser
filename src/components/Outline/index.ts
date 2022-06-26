import { PDFDocumentProxy } from "pdfjs-dist";
import { base64ToBlob } from "../../utils";
import { PagesComponent } from "../Pages";
import styles from "./index.module.less";

const outlineFlagImgUrlStr = window.URL.createObjectURL(
  base64ToBlob(
    "data:image/png;base64,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"
  )
);

export class OutlineComponent {
  private _wrapperEle: HTMLDivElement = document.createElement("div");
  public constructor(
    private _doc: () => PDFDocumentProxy,
    private _pagesComponent: PagesComponent,
    private _scaleGet: () => number
  ) {
    this._init();
  }

  private async _init() {
    this._wrapperEle.className = styles.outlines;
    const outlines = await this._doc().getOutline();
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
      if (!(dest instanceof Array)) {
        continue;
      }
      const pageIndex = await this._doc().getPageIndex(dest[0]);
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
        const scale = this._scaleGet();
        const x = dest[2] * scale;
        const y = dest[3] * scale;
        this._pagesComponent.jumpTo(pageIndex + 1, { x, y });
      };
      outlineEle.appendChild(iconDiv);
      outlineEle.appendChild(textDiv);
      this._wrapperEle.appendChild(outlineEle);
    }
  }

  /**
   * 渲染
   * @param ele 目标元素
   */
  public render(ele: HTMLElement) {
    ele.innerHTML = "";
    ele.appendChild(this._wrapperEle);
  }
}
