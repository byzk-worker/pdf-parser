import { SealVerifyInfo } from "../../components/Seal";
import styles from "./index.module.less";

function newGuid() {
  var curguid = "";
  for (var i = 1; i <= 32; i++) {
    var id = Math.floor(Math.random() * 16.0).toString(16);
    curguid += id;
    if (i === 8 || i === 12 || i === 16 || i === 20) curguid += "";
  }
  return `a${curguid}`;
}

function certInfo(rootEle?: HTMLElement, cerInfo?: any) {
  const elementGuid = newGuid();
  var certInfo = `<div id="${elementGuid}" class='${styles.maskContainer}'>
    <div class='${styles.certInfo}'>
    <div class='${styles.title}'> 证书信息 <span class='${styles.close}' onclick="document.getElementById('${elementGuid}').remove()">
    <img width=100% title="关闭" src="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAMgAAADICAYAAACtWK6eAAAAAXNSR0IArs4c6QAACZ1JREFUeF7tnc+rdWUVx79rHgqOdNBYEJGyBhYEhuhr816FomEgTQTLwH+gwB8QTYRqWEHqOBOlogYWIaHoxEEDZw7LP+CRbefq9fWee/Zee6199vOsz4U722udZ32+z+c+55597rkmviAAgaMEDDYQgMBxAgjC7oDANQQQhO0BAQRhD0DAR4ATxMeNqiIEEKRI0IzpI4AgPm5UFSGAIEWCZkwfAQTxcaOqCAEEKRI0Y/oIIIiPG1VFCCBIkaAZ00cAQXzcqCpCAEGKBM2YPgII4uNGVRECCFIkaMb0EUAQHzeqihBAkCJBM6aPAIL4uFFVhACCFAmaMX0EEMTHjaoiBBCkSNCM6SOAID5uVBUhgCBFgmZMHwEE8XGjqggBBCkSNGP6CCCIjxtVRQggSJGgGdNHAEF83KgqQgBBigTNmD4CCOLjRlURAghSJGjG9BFAEB83qooQQJAiQTOmjwCC+LhRVYQAghQJmjF9BBDEx42qIgQQpEjQjOkjgCA+blQVIYAgRYJmTB8BBPFxo6oIAQQpEjRj+gggiI8bVUUIIEiRoBnTRwBBfNyoKkIAQYoEzZg+Agji40ZVEQIIUiRoxvQRQBAfN6qKEECQIkEzpo8Agvi4UVWEwNCCtNbul/QjSQ9I+rKkNyW9I+kFM/uwSMYhY7bW7pT0lKT7JH1D0n8k/UPSy2b255AH2WGTYQVprT0q6dUjzN+W9LSZvb7DTHa3pNbaw5KeP8hx1fqeNLNf7m7hAQsaUpDW2pOSfnGCT5P0uJm9HMBx2BattZuS/iDp1F551MxeGw3EqaG7m7e19pCkN2YuHEmuAbVAjosu95vZv2ey7+KyEQV5UdITC+gjyRWwHHJMXX5jZj9cwH73l44oyPQT7CsLySPJJWBOOaYO75nZvQvZ7/ryEQX5r6TbHNSRRNIKOSbk/zOz2x3sd1syoiB/knTDSby0JCvlmJC/ZmbTq4fDfI0oyLPTS7grEiopSYAcE/LnzOynK9jvrnREQaYbWtPLjdMNLe9XKUmC5JjuLd0Y7QbscIJMRrTWHjlI4hXkkzYV7pMEyTGxmuQY7sbrkIIcJJlucL20xpDRJQmU4zEze2Ul612WDysIkly/35Bjno9DC4IkV28C5Jgnx3TV8IIgyec3A3LMl6OMIEjy/02BHMvkKCVIdUmQY7kc5QSpKgly+OQoKUg1SZDDL0dZQapIghzr5CgtyOiSIMd6OcoLMqokyBEjB4IcOB421BBvS0GOODkQ5BLLESQJnGHY91Yt1afEnfS5UAI32OaflhK4duS4tGEQ5BZ7AjfaZpIErhk5btkPCHLF8RK44dIlCVwrclyxFxDkyPOvwI2XJkngGpHjyD5AkGt+QQncgOGSBK4NOa7ZAwhy4jf4wI0YJkngmpDjRP4IMuMlrsANuVqSwLUgx4zsEWQGpL3ccQ+SYxrn5qh/Qz4zztmXIchsVJ/+wdFZ7rgjx4KgAi9FkIUwgzbqoo8UCnpMTo6FWfNWEwewrZ9uIYczpKAyThAnyKCNe+1JEvQYnBzOjDlBVoDLPkmQY2U4QeWcICtBBm3kz50kQT2nyaaXcvkXcysyRpAV8C5Kgzb0J5Iceq59pQw5AnLlKVYQxOCnWxE/tDg5grKNCCNoKf23CTpJ1oJAjrUEL9UjSCDMwJPEuyrk8JI7UocgwUDPKAlyJGSJIAlQzyAJciTliCBJYDeUBDkSM0SQRLgbSIIcyfkhSDLgREmQY4PsEGQDyAmSIMdGuSHIRqAD75Eseqv8RuMN+zAIskG0gXJcrBZJNshteggESQadIAeSJGd2uT2CJMJOlANJEnNDkA3gbiAHkmyQIydIAuQN5UCShPw4QRKhnkEOJEnMkxMkEO4Z5UCSwBw5QRJg7kAOJEnIlRMkAGqgHI8dlrP2T265TxKQK/dBAiBGynHxAQtBPZEkIF9OkBUQgzbytIIvvLcqqPckCR9SvSJjBHHCC9rAV8rx6S8Trd2UFPF0C0mcOSOIA9wWciCJI5iEEgRZCHVLOZBkYTgJlyPIAqjnkANJFgSUcCmCzIR6TjmQZGZICZchyAyoe5ADSWYElXAJgpyAuic5kCTBgBMtEeQaQHuUA0m2lQRBjvDesxxIsp0kCHIF6x7kQJJtJEGQWzj3JAeS5EuCIJcY9ygHkuRKgiAHvj3LgSR5kiCIpBHkQJIcScoLMpIcSBIvSWlBRpQDSWIlKSvIyHIgSZwkJQWpIAeSxEhSTpBKciDJeklKCVJRDiRZJ0kZQSrLgSR+SUoIghyfbZAgFmU+LWV4QYI2xLTDhvm3Z0FMSkgytCBBG2EoOXi6tezp1rCCIMfpjRDEaOiTZEhBWmvfkvS301vk5BXDPK06NmmgJDfM7PWTRDu7YFRB/ijpOyuzGF6O4Kdbb0uaJPlwJfddlQ8nSNBPxDJyBEvygpn9ZFc7fOViRhTkeUk/XsGlnByBkvzVzL69gv3uSkcU5C+SHnSSLitHkCQfmdltTva7LBtRkJ9JesZBu7wcAZK8b2Z3O9jvtmREQb4n6XcLiSPHLcCcv8v93sy+v5D9ri8fUZA7JL0r6a6Z5JHjCCiHJD8ws9/O5N7FZcMJMlFvrU0/xeYEhRwntukCSV4ys8e72PULFjmkIAdJvinp15LuuYLHq5J+bmZ/X8Cq7KWttUckPSfpviMQ3jKzr48IaFhBDpJ8SdJ3JX31EO5bkv558c8yRww0a6bW2p2SpnscXzt8fyDpX5LeNLNfZT3uufsOLci54fL4/RNAkP4zZIJEAgiSCJfW/RNAkP4zZIJEAgiSCJfW/RNAkP4zZIJEAgiSCJfW/RNAkP4zZIJEAgiSCJfW/RNAkP4zZIJEAgiSCJfW/RNAkP4zZIJEAgiSCJfW/RNAkP4zZIJEAgiSCJfW/RNAkP4zZIJEAgiSCJfW/RNAkP4zZIJEAgiSCJfW/RNAkP4zZIJEAgiSCJfW/RNAkP4zZIJEAgiSCJfW/RNAkP4zZIJEAgiSCJfW/RNAkP4zZIJEAgiSCJfW/RNAkP4zZIJEAgiSCJfW/RNAkP4zZIJEAgiSCJfW/RNAkP4zZIJEAgiSCJfW/RNAkP4zZIJEAgiSCJfW/RNAkP4zZIJEAgiSCJfW/RNAkP4zZIJEAgiSCJfW/RNAkP4zZIJEAgiSCJfW/RNAkP4zZIJEAgiSCJfW/RNAkP4zZIJEAgiSCJfW/RNAkP4zZIJEAgiSCJfW/RNAkP4zZIJEAgiSCJfW/RNAkP4zZIJEAgiSCJfW/RNAkP4zZIJEAh8D3gPK9jeZ3z0AAAAASUVORK5CYII=" /></span></div>
      <div class='${styles.div}' style=margin-top:18px><div class='${styles.left}'>证书序列号 : </div><div class='${styles.right}'> 4e11000000000ab</div></div>
      <div class='${styles.div}'><div class='${styles.left}'>制章者证书 : </div><div class='${styles.right}' style=color:#2752E7> 查看</div></div>
      <div class='${styles.div}'><div class='${styles.left}'>印章有效起始信息 : </div><div class='${styles.right}'> 2020年10月10日  09:28:25</div></div>
      <div class='${styles.div}'><div class='${styles.left}'>印章有效起始信息 : </div><div class='${styles.right}'> 2020年10月10日  09:28:25</div></div>
      <div class='${styles.div}'><div class='${styles.left}'>印章制作时间 : </div><div class='${styles.right}'> 2020年10月10日  09:28:25</div></div>
    <div class='${styles.okBtn}' onclick="document.getElementById('${elementGuid}').remove()">关闭</div>
    </div>
  </div>`;
  let div = document.createElement("div");
  div.innerHTML = certInfo;
  (rootEle || document.body).appendChild(div);
}

function createCertInfo(rootEle?: HTMLElement, cerInfo?: any) {
  const elementGuid = newGuid();
  var createCertInfo = `<div id="${elementGuid}" class='${styles.maskContainer}'>
   <div class='${styles.certInfo}'>
   <div class='${styles.title}'> 证书信息 <span class='${styles.close}' onclick="document.getElementById('${elementGuid}').remove()">
   <img width=100% title="关闭" src="data:image/png;base64,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" /></span></div>
     <div class='${styles.div}' style=margin-top:18px><div class='${styles.left}'>证书序列号 : </div><div class='${styles.right}'> 4e11000000000ab</div></div>
     <div class='${styles.div}'><div class='${styles.left}'>印章有效起始信息 : </div><div class='${styles.right}'> 2020年10月10日  09:28:25</div></div>
     <div class='${styles.div}'><div class='${styles.left}'>印章有效起始信息 : </div><div class='${styles.right}'> 2020年10月10日  09:28:25</div></div>
     <div class='${styles.div}'><div class='${styles.left}'>印章制作时间 : </div><div class='${styles.right}'> 2020年10月10日  09:28:25</div></div>
   <div class='${styles.okBtn}' onclick="document.getElementById('${elementGuid}').remove()">关闭</div>
   </div>
  </div>`;
  let div = document.createElement("div");
  div.innerHTML = createCertInfo;
  (rootEle || document.body).appendChild(div);
}

export function showSignSealTip(
  rootEle?: HTMLElement,
  sealVerifyResult?: SealVerifyInfo,
  signSealInfo?: any
) {
  sealVerifyResult = sealVerifyResult || ({} as any);
  sealVerifyResult.userName = sealVerifyResult.userName || ["未知签名者信息"];
  const elementGuid = newGuid();
  var signSealEle = `<div id="${elementGuid}" class='${styles.maskContainer}'>
    <div class='${styles.mask}'>
          <div class='${styles.title}'> 签章信息 <span class='${
    styles.close
  }' onclick="document.getElementById('${elementGuid}').remove()">
          <img width=100% title="关闭" src="data:image/png;base64,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" />
      </span></div>
      <div class='${styles.content}'>
        <div class='${styles.titleTip}'>
          <div class='${styles.titleTipLeft}'></div>
          <div class='${styles.titleTipRight}'>
            <div class='${styles.top}'>${ sealVerifyResult.error ? "签章验证失败，签章无效。" : "签章验证成功, 签章有效" }</div>
            <div class='${styles.bottom}'>${ sealVerifyResult.error ? sealVerifyResult.msg : sealVerifyResult.msg || "自文档签署以来，文件未被篡改"
  }</div>
          </div>
        </div> 
        <hr />
        <div>
          <div class='${styles.tip}'>签章信息</div>
          <div class='${styles.sealInfo}'>签章者：${
    sealVerifyResult.userName[0]
  }</div>
         
        </div>
        <hr/>
        <div>
            <div class='${styles.tip}'>签章属性</div>
            <div class='${styles.btns}'>
              <button class='${styles.btn}' id="certInfo">签章者证书</button>
              <button class='${styles.btn}' id="">印章信息</button>
              <button class='${styles.btn}' id="createCert">制章者证书</button>
            </div>
        </div>
        <hr/>
        <div >
            <div class='${styles.tip}'>时间戳信息</div>
            <div style=display:flex;flex-direction:row;>
                <div class='${styles.timeInfoLeft}'>
                    <div class='${
                      styles.leftInfo
                    }'>该印章包含时间戳，时间戳已验证成功。</div>
                    <div class='${
                      styles.leftInfo
                    }'>单击“详细信息”查看时间戳的颁发机构证书的详细信息。</div>
                </div>
                <div>
                  <button class='${styles.btn}'>详细信息</button>
                </div>
            </div>
        </div>
        <div class='${
          styles.okBtn
        }' onclick="document.getElementById('${elementGuid}').remove()">确定</div>
      </div>
    </div>
  </div>`;

  var div = document.createElement("div");
  div.innerHTML = signSealEle;
  let btn = div.querySelector("#certInfo") as HTMLButtonElement;
  let btn1 = div.querySelector("#createCert") as HTMLButtonElement;
  btn.onclick = () => certInfo(rootEle);
  btn1.onclick = () => createCertInfo(rootEle);
  (rootEle || document.body).appendChild(div);
}
