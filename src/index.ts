import {
  FileInfo,
  ReaderParserAbstract,
  ReaderParserSupport,
  ieUtil,
  SealDragResult,
  SealPositionInfo,
  SealListResult,
  SealQiFenInfo,
} from "@byzk/document-reader";
import {
  fileOpen,
  sealVerifyAll,
  sealQuery,
  sealInMany,
  SealInManyInfo,
  fileUrl,
  sealInKeyword,
  sealInQF,
} from "@byzk/pdf-locale-call";
import * as pdfjsLib from "pdfjs-dist";
import pdfjsWorker from "pdfjs-dist/build/pdf.worker.entry.js";
//@ts-ignore
import AsyncLock from "async-lock";

// import "pdfjs-dist/web/pdf_viewer.css";
import { PagesComponent } from "./components/Pages";
import { ThumbnailComponent } from "./components/Thumbnail";
import { base64ToBlob, mmConversionPx, waitBreakUndefined } from "./utils";
import { OutlineComponent } from "./components/Outline";
import { TextLayerComponent } from "./components/TextLayer";
import { AnnotationsComponent } from "./components/Annotations";
import { SealComponent } from "./components/Seal";
import { SealInfo, SealDragOption } from "@byzk/document-reader";
import { showPinPopAndGetPassword } from "./views/PinPop";

const lock = new AsyncLock();

let cMapUrl: string | undefined = undefined;
let cMapPacked: boolean | undefined = undefined;

pdfjsLib.GlobalWorkerOptions.workerSrc = pdfjsWorker;

class Parser extends ReaderParserAbstract {
  private _pdfDoc: pdfjsLib.PDFDocumentProxy | undefined;
  private _pageComponent: PagesComponent;
  private _thumbnailComponent: ThumbnailComponent;
  private _outlineComponent: OutlineComponent;
  private _annotationsComponent: AnnotationsComponent;

  private _textlayerComponent: TextLayerComponent;

  private _sealComponent: SealComponent;

  private _modeSupportSelect = navigator.userAgent.indexOf("Firefox") < 0;
  private _mode: "select" | "move" = this._modeSupportSelect
    ? "select"
    : "move";

  private _fileUploadInfo: {
    status: "no" | "loading" | "ok";
    id?: string;
    error?: boolean;
    errMsg?: string;
    fileName?: string;
  } = { status: "no" };

  private _nowPageNo: number = 1;

  private _doc() {
    return this._pdfDoc;
  }

  private _pageScrollEvent(index: number) {
    this._nowPageNo = index;
    this.fire("pageNoChange", index);
  }

  async render(domEle: HTMLDivElement) {
    if (!this._pdfDoc) {
      throw new Error("?????????????????????????????????");
    }

    this.getScale = this.getScale.bind(this);
    this._doc = this._doc.bind(this);

    this._pageComponent = new PagesComponent(
      this._doc,
      domEle,
      this.getScale,
      {}
    );
    this._pageComponent.addPageScrollEvent(this._pageScrollEvent.bind(this));

    this._thumbnailComponent = new ThumbnailComponent(this._pageComponent);

    this._textlayerComponent = new TextLayerComponent(this.getScale, "select");

    this._annotationsComponent = new AnnotationsComponent(
      this._pageComponent,
      this.getScale
    );

    this._sealComponent = new SealComponent(
      this._pageComponent,
      this.getScale,
      () => this.app
    );

    this._pageComponent.init(
      this._thumbnailComponent,
      this._textlayerComponent,
      this._annotationsComponent,
      this._sealComponent
    );
    this._outlineComponent = new OutlineComponent(
      this._doc,
      this._pageComponent,
      this.getScale
    );
  }

  public setScale(scale: number): void {
    if (this.scale === scale) {
      return;
    }
    this.scale = scale;
    this.fire("scaleChange", scale);
    // this._reloadAllPage();
    this._pageComponent.reloadAllPage();
  }

  async loadFile(file: FileInfo): Promise<void> {
    this._fileUploadInfo.fileName = file.name;
    this._pdfDoc = await pdfjsLib.getDocument({
      url: file.path,
      cMapPacked,
      cMapUrl,
    }).promise;
    fileOpen({
      ...file,
    })
      .then(async (id) => {
        debugger;
        this._fileUploadInfo.status = "ok";
        this._fileUploadInfo.id = id;
        // this._fileUploadInfo.fileName = file.name;
        await this._sealComponent.sealVerifyAll(id);
      })
      .catch((err) => {
        debugger;
        this._fileUploadInfo.status = "ok";
        this._fileUploadInfo.error = true;
        this._fileUploadInfo.errMsg = err.message || err;
      });
  }

  getNumPages(): number {
    return this._pdfDoc ? this._pdfDoc.numPages : 1;
  }

  public async renderOutline(domEle: HTMLElement): Promise<void> {
    await waitBreakUndefined(() => this._outlineComponent);
    this._outlineComponent.render(domEle);
  }

  public jumpTo(page: number): void {
    this._pageComponent.jumpTo(page);
    this.fire("pageNoChange", page);
  }

  public showPageNo(): void {
    this._pageComponent.reloadAllPage({
      showPageNo: true,
    });
  }

  public hidePageNo(): void {
    this._pageComponent.reloadAllPage({
      showPageNo: false,
    });
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
    waitBreakUndefined(() => this._textlayerComponent).then((textlayer) =>
      textlayer.convert(mode)
    );
  }

  public setFull(
    mode: "content" | "width",
    options?: {
      /**
       * ????????????
       */
      prompt?: string | HTMLElement;
      /**
       * ????????????, ??????3000(ms), ??????0?????????
       */
      timeout?: number;
    }
  ): void {
    if (mode === "width") {
      this._pageComponent.fullWidth().then((scale) => {
        this.scale = scale;
        this.fire("scaleChange", scale);
      });
    } else {
      this._pageComponent.fullContent(options);
    }
  }

  public async renderThumbnail(
    domEle: HTMLElement,
    options?: {
      width?: number;
      height?: number;
      widthUnit?: "px" | "%";
      heightUnit?: "px" | "%";
    }
  ): Promise<void> {
    await waitBreakUndefined(() => this._thumbnailComponent);
    return this._thumbnailComponent.render(domEle, options);
  }

  public async renderAnnotations(domEle: HTMLElement): Promise<void> {
    await waitBreakUndefined(() => this._annotationsComponent);
    this._annotationsComponent.render(domEle);
  }

  public nowPageNo(): number {
    return this._nowPageNo;
  }

  public async sealList(): Promise<SealListResult> {
    const res = await showPinPopAndGetPassword(this.app.getRootEle());
    if (res.cancel) {
      return undefined;
    }
    this.app.loading.show("????????????????????????...");
    try {
      const sealList = await sealQuery(res.password);
      const sealResult: SealInfo[] = [];
      for (let i = 0; i < sealList.total; i++) {
        const seal = sealList.sealInfoVo[i];
        sealResult.push({
          id: seal.id,
          name: seal.sealMsg,
          title: seal.sealMsg,
          imgUrl: window.URL.createObjectURL(
            base64ToBlob("data:image/png;base64," + seal.sealImg)
          ),
          width: mmConversionPx(parseInt(seal.width)),
          height: mmConversionPx(parseInt(seal.height)),
          metadata: seal,
        } as SealInfo);
      }

      return {
        password: res.password,
        sealList: sealResult,
      };
    } finally {
      this.app.loading.hide();
    }
  }

  public getRotation(): number {
    return this._pageComponent.getRotation();
  }

  public setRotation(deg: number): void {
    lock.acquire("changeRotation", async (done) => {
      try {
        await this._pageComponent.setRotation(deg);
      } finally {
        done();
      }
    });
  }

  public sealDrag(
    sealInfo: SealInfo,
    options?: SealDragOption
  ): Promise<SealDragResult[]> {
    return this._sealComponent.sealDrag(sealInfo, options);
  }

  public async signSealPositionList(
    sealInfo: SealInfo,
    password: string | undefined,
    ...positionInfoList: SealPositionInfo[]
  ): Promise<void> {
    if (!password) {
      throw new Error("??????????????????");
    }

    if (this._fileUploadInfo.status !== "ok") {
      throw new Error("?????????????????????, ??????????????????!!!");
    }

    if (this._fileUploadInfo.error) {
      throw new Error(this._fileUploadInfo.errMsg || "???????????????????????????");
    }

    if (!this._fileUploadInfo.id) {
      throw new Error("????????????ID??????");
    }

    if (positionInfoList.length === 0) {
      throw new Error("????????????????????????");
    }

    const reloadPageNo: number[] = [];

    const sealPosList: SealInManyInfo[] = positionInfoList.map((r) => {
      if (!reloadPageNo.includes(r.pageNo)) {
        reloadPageNo.push(r.pageNo);
      }
      return {
        page: r.pageNo,
        positionX: r.x,
        positionY: r.y,
        // positionX: 0,
        // positionY: 0,
      };
    });

    await sealInMany({
      sealId: sealInfo.id,
      fileId: this._fileUploadInfo.id,
      pages: sealPosList,
      pwd: password,
    });

    const url = fileUrl(this._fileUploadInfo.id);
    this._pdfDoc = await pdfjsLib.getDocument({
      url: url,
      cMapPacked,
      cMapUrl,
    }).promise;
    // this._pageComponent.reloadAllPage({
    //   force: true
    // })

    reloadPageNo.forEach((pageNo) =>
      this._pageComponent.reloadPage(pageNo, {
        force: true,
      })
    );

    this._sealComponent.sealVerifyAll(this._fileUploadInfo.id);
  }

  public async signSealKeyword(
    sealInfo: SealInfo,
    pwd: string,
    keyword: string
  ): Promise<void> {
    if (!pwd) {
      throw new Error("??????????????????");
    }

    if (this._fileUploadInfo.status !== "ok") {
      throw new Error("?????????????????????, ??????????????????!!!");
    }

    if (this._fileUploadInfo.error) {
      throw new Error(this._fileUploadInfo.errMsg || "???????????????????????????");
    }

    if (!this._fileUploadInfo.id) {
      throw new Error("????????????ID??????");
    }

    await sealInKeyword({
      sealId: sealInfo.id,
      fileId: this._fileUploadInfo.id,
      pwd,
      keyword,
    });

    const url = fileUrl(this._fileUploadInfo.id);
    this._pdfDoc = await pdfjsLib.getDocument({
      url: url,
      cMapPacked,
      cMapUrl,
    }).promise;

    this._pageComponent.reloadAllPage({
      force: true,
    });
  }

  public async signSealQiFen(
    sealInfo: SealInfo,
    pwd: string,
    ...options: SealQiFenInfo[]
  ): Promise<void> {
    if (!pwd) {
      throw new Error("??????????????????");
    }

    if (this._fileUploadInfo.status !== "ok") {
      throw new Error("?????????????????????, ??????????????????!!!");
    }

    if (this._fileUploadInfo.error) {
      throw new Error(this._fileUploadInfo.errMsg || "???????????????????????????");
    }

    if (!this._fileUploadInfo.id) {
      throw new Error("????????????ID??????");
    }

    const option = options[0];
    await sealInQF({
      sealId: sealInfo.id,
      fileId: this._fileUploadInfo.id,
      pwd,
      positionX: option.x,
      positionY: option.y,
      size: option.splitSize,
      page: option.pageNo,
    });
    const url = fileUrl(this._fileUploadInfo.id);
    this._pdfDoc = await pdfjsLib.getDocument({
      url: url,
      cMapPacked,
      cMapUrl,
    }).promise;

    this._pageComponent.reloadAllPage({
      force: true,
    });
    this._sealComponent.sealVerifyAll(this._fileUploadInfo.id);
  }

  public async save(savePath?: string): Promise<void> {
    const docData = await this._pdfDoc.saveDocument();
    const url = window.URL.createObjectURL(new Blob([docData], {type: "application/pdf"}));
    const link = document.createElement("a");
    link.style.display = "none";
    link.href = url;
    link.download = this._fileUploadInfo.fileName;
    link.click();
    window.URL.revokeObjectURL(url)
    // link.setAttribute("download", this._fileUploadInfo.fileName);
    // document.body.appendChild(link);
    // link.click();
    // document.body.removeChild(link);
  }

  // public async signseal

  // public async signSealPositionList(...signSeal: SealPositionInfo[]): Promise<void> {
  //   if (this._fileUploadInfo.status !== "ok") {
  //     throw new Error("?????????????????????, ??????????????????!!!");
  //   }

  //   if (this._fileUploadInfo.error) {
  //     throw new Error(this._fileUploadInfo.errMsg || "???????????????????????????");
  //   }

  //   if (!this._fileUploadInfo.id) {
  //     throw new Error("????????????ID??????");
  //   }

  //   sealInMany();
  // }
}

/**
 * ???????????????
 * @returns ????????????
 */
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

/**
 * ??????pdf??????
 * @param url ????????????
 */
function loadPdfFonts(url: string) {
  if (!url) {
    return;
  }
  cMapPacked = true;
  cMapUrl = url;
}

export default {
  Parser,
  support,
  loadPdfFonts,
};
