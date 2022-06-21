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
).children[0] as HTMLElement;

document.body.appendChild(pinPopEle);

const passwordEle = pinPopEle.querySelector(
  "#" + styles.password
) as HTMLInputElement;
const okBtnEle = pinPopEle.querySelector("#" + styles.okBtn) as HTMLElement;
const closeEle = pinPopEle.querySelector("#" + styles.close) as HTMLElement;

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
  pinPopEle.className += " " + styles.hide;
  const res = await waitBreakUndefined(() => waitResult);
  waitResult = undefined;
  const password = passwordEle.value;
  passwordEle.value = "";
  res.resovle({ cancel: false, password: password });
};

export function showPinPopAndGetPassword(): Promise<{
  cancel: boolean;
  password?: string;
}> {
  if (waitResult) {
    throw new Error("密码获取进程被锁定");
  }
  pinPopEle.className = pinPopEle.className.split(" " + styles.hide).join("");

  return new Promise((resovle, reject) => {
    waitResult = { resovle, reject };
  });
}
