import htmlTemplateStr from "./index.html";
import styles from "./index.module.less";
import { PagesComponent } from "../../components/Pages";
import {
  htmlTemplateParser as templateParser,
  htmlTemplateConvertEle,
} from "../../utils";

const htmlTemplateParser = templateParser(htmlTemplateStr);

function setttingTextLine(
  textLineEle: any,
  desc: string,
  content: string
): HTMLElement {
  if (!desc.endsWith(":")) {
    desc += ":";
  }
  const targetEle = textLineEle.cloneNode(true) as HTMLElement;
  (targetEle.children[0] as any).innerText = desc;
  (targetEle.children[1] as any).innerText = content;
  targetEle.title = desc + " " + content;
  return targetEle;
}

export function createAnnotationEle(
  rect: [number, number, number, number],
  pageIndex: number,
  getScale: () => number,
  pageComponent: PagesComponent,
  data: {
    jiantouUrl: string;
    infoIconUrl: string;
    titleContent: string;
  },
  textLineList: { desc: string; content: string }[]
) {
  const annotationEle = htmlTemplateConvertEle(
    htmlTemplateParser({
      styles,
      ...data,
    })
  ).children[0] as HTMLElement;

  const jiantouEle = annotationEle.querySelector(
    "." + styles.jiantou
  ) as HTMLElement;

  jiantouEle.onclick = (event) => {
    event.stopImmediatePropagation && event.stopImmediatePropagation();
    event.stopPropagation && event.stopPropagation();
    if (annotationEle.className.includes(styles.shrink)) {
      annotationEle.className = annotationEle.className
        .split(" " + styles.shrink)
        .join("");
    } else {
      annotationEle.className += " " + styles.shrink;
    }
  };

  const textLineEle = annotationEle.querySelector("." + styles.textLine);
  textLineEle.remove();

  for (let i = 0; i < textLineList.length; i++) {
    const textLineInfo = textLineList[i];
    annotationEle.appendChild(
      setttingTextLine(textLineEle, textLineInfo.desc, textLineInfo.content)
    );
  }

  const titleEle = annotationEle.querySelector(
    "." + styles.title
  ) as HTMLElement;

  titleEle.onclick = (event) => {
    event.stopImmediatePropagation && event.stopImmediatePropagation();
    event.stopPropagation && event.stopPropagation();
    const scale = getScale();
    pageComponent.jumpTo(pageIndex, {
      x: rect[0] * scale,
      y: rect[3] * scale,
    });
  };

  return annotationEle;
}
