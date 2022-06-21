import styles from "../index.module.less";
export function createFullPromptEle(text: string) {
  const fullPromptEle = document.createElement("div") as HTMLElement;
  fullPromptEle.className = styles.fullPrompt;
  return fullPromptEle;
}

export const fullPromptEleDefaultTexte = "按Esc推出全屏";

const fullEventName = [
  "fullscreenchange",
  "webkitfullscreenchange",
  "mozfullscreenchange",
];

export function bindFullEvent(ele: HTMLElement, callback: any) {
  fullEventName.forEach((eventName) => {
    ele.addEventListener(eventName, callback);
  });
}
