import {
  htmlTemplateConvertEle,
  htmlTemplateParser,
  waitBreakUndefined,
} from "../../utils";
import styles from "./index.module.less";
import htmlStr from "./index.html";

let waitResult:
  | {
      resovle: (res: { cancel: boolean; password?: string }) => void;
      reject: (err: any) => void;
    }
  | undefined;

const pinPopEle = htmlTemplateConvertEle(
  htmlTemplateParser(htmlStr)({ styles })
) as HTMLElement;

const passwordEle = pinPopEle.querySelector(
  "#" + styles.password
) as HTMLInputElement;
const okBtnEle = pinPopEle.querySelector("#" + styles.okBtn) as HTMLElement;
const closeEle = pinPopEle.querySelector("#" + styles.close) as HTMLElement;

function escKeyHandle(event: KeyboardEvent) {
  if (event.key === "Escape") {
    closeEle.dispatchEvent(new MouseEvent("click"));
  }
}

passwordEle.onkeyup = (event) => {
  if (event.key === "Enter") {
    okBtnEle.dispatchEvent(new MouseEvent("click"));
    return;
  }
  const valLen = passwordEle.value.length;
  if (valLen === 0) {
    okBtnEle.className = styles.disabled;
  } else {
    okBtnEle.className = "";
  }
};

closeEle.onclick = async () => {
  document.removeEventListener("keydown", escKeyHandle);
  pinPopEle.className += " " + styles.hide;
  const res = await waitBreakUndefined(() => waitResult);
  waitResult = undefined;
  passwordEle.value = "";
  res.resovle({ cancel: true });
};

okBtnEle.onclick = async () => {
  if (okBtnEle.className.includes(styles.disabled)) {
    return;
  }
  document.removeEventListener("keydown", escKeyHandle);
  pinPopEle.className += " " + styles.hide;
  const res = await waitBreakUndefined(() => waitResult);
  waitResult = undefined;
  const password = passwordEle.value;
  passwordEle.value = "";
  res.resovle({ cancel: false, password: password });
};

export function showPinPopAndGetPassword(
  rootEle?: HTMLElement
): Promise<{
  cancel: boolean;
  password?: string;
}> {
  rootEle = rootEle || document.body;
  if (pinPopEle.parentElement !== rootEle) {
    rootEle.appendChild(pinPopEle);
  }
  if (waitResult) {
    throw new Error("密码获取进程被锁定");
  }
  pinPopEle.className = pinPopEle.className.split(" " + styles.hide).join("");
  passwordEle.focus();
  document.addEventListener("keydown", escKeyHandle);

  return new Promise((resovle, reject) => {
    waitResult = { resovle, reject };
  });
}
