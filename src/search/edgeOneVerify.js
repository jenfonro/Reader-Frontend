import { getApiSettings } from "../data/apiSettings.js";
import { readSourceCookieJar, writeSourceCookieJar } from "../data/cookieJar.js";
import { normalizeBaseUrl, toText } from "./legadoCommon.js";
import { getEdgeOneVerificationAutoUrl, getEdgeOneVerificationPageUrl } from "./edgeOneFetch.js";

const DEFAULT_USER_AGENT = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/102.0.0.0 Safari/537.36";
const VERIFY_MESSAGE_TYPE = "reader-edgeone-verify";
const createAbortError = () => new DOMException("Aborted", "AbortError");

const encodeBase64Url = value => {
  const text = JSON.stringify(value || {});
  const bytes = new TextEncoder().encode(text);
  let binary = "";
  bytes.forEach(byte => {
    binary += String.fromCharCode(byte);
  });
  return btoa(binary).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/g, "");
};

const buildBrowserLikeHeaders = source => {
  const sourceBaseUrl = normalizeBaseUrl(source?.bookSourceUrl);
  const headers = {
    "User-Agent": DEFAULT_USER_AGENT
  };
  if (sourceBaseUrl) headers.Referer = sourceBaseUrl.endsWith("/") ? sourceBaseUrl : `${sourceBaseUrl}/`;
  return headers;
};

const injectVerifyStyles = () => {
  if (document.getElementById("readerEdgeOneVerifyStyle")) return;

  const style = document.createElement("style");
  style.id = "readerEdgeOneVerifyStyle";
  style.textContent = `
    .reader-edgeone-verify {
      position: fixed;
      inset: 0;
      z-index: 10000;
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 18px;
      box-sizing: border-box;
      background: rgba(0, 0, 0, 0.38);
      backdrop-filter: blur(14px);
    }
    .reader-edgeone-verify__panel {
      width: min(960px, 100%);
      height: min(720px, 92vh);
      display: flex;
      flex-direction: column;
      overflow: hidden;
      border-radius: 22px;
      background: var(--reader-card-solid, #fff);
      color: var(--reader-app-text, #1d1d1f);
      box-shadow: 0 24px 72px rgba(0, 0, 0, 0.28);
    }
    .reader-edgeone-verify__bar {
      min-height: 50px;
      display: grid;
      grid-template-columns: minmax(0, 1fr) auto;
      align-items: center;
      gap: 12px;
      padding: 0 14px 0 18px;
      border-bottom: 1px solid color-mix(in srgb, var(--reader-app-text, #1d1d1f) 10%, transparent);
    }
    .reader-edgeone-verify__title {
      min-width: 0;
      overflow: hidden;
      font-size: 15px;
      font-weight: 600;
      line-height: 20px;
      text-overflow: ellipsis;
      white-space: nowrap;
    }
    .reader-edgeone-verify__close {
      width: 34px;
      height: 34px;
      border: 0;
      border-radius: 999px;
      background: color-mix(in srgb, var(--reader-app-text, #1d1d1f) 8%, transparent);
      color: inherit;
      font-size: 18px;
      line-height: 34px;
    }
    .reader-edgeone-verify__frame {
      width: 100%;
      min-height: 0;
      flex: 1 1 auto;
      border: 0;
      background: #fff;
    }
  `;
  document.head.appendChild(style);
};

const createVerifyOverlay = ({ title, onCancel }) => {
  injectVerifyStyles();

  const root = document.createElement("div");
  root.className = "reader-edgeone-verify";
  root.innerHTML = `
    <section class="reader-edgeone-verify__panel" role="dialog" aria-modal="true">
      <header class="reader-edgeone-verify__bar">
        <div class="reader-edgeone-verify__title"></div>
        <button class="reader-edgeone-verify__close" type="button" aria-label="关闭验证">×</button>
      </header>
      <iframe class="reader-edgeone-verify__frame" title="书源验证"></iframe>
    </section>
  `;

  root.querySelector(".reader-edgeone-verify__title").textContent = title || "正在验证书源";
  root.querySelector(".reader-edgeone-verify__close").addEventListener("click", onCancel);
  document.body.appendChild(root);

  return {
    frame: root.querySelector(".reader-edgeone-verify__frame"),
    close: () => root.remove()
  };
};

const buildVerifyPayload = ({ source, targetUrl, sourceBaseUrl, title, secret, autoConfirm }) => ({
  secret,
  targetUrl,
  sourceBaseUrl,
  title,
  autoConfirm: autoConfirm === true,
  headers: buildBrowserLikeHeaders(source),
  cookieJar: readSourceCookieJar(source)
});

const saveCookieJarFromResult = (source, data) => {
  if (!data?.cookieJar) return readSourceCookieJar(source);
  return writeSourceCookieJar(source, data.cookieJar);
};

const readEdgeOneVerifyAutoError = async response => {
  try {
    const data = await response.clone().json();
    return toText(data?.message || data?.error).trim();
  } catch (error) {
    return "";
  }
};

const runFunctionAutoVerification = async ({ source, targetUrl, signal, secret }) => {
  const response = await fetch(getEdgeOneVerificationAutoUrl(), {
    method: "POST",
    headers: {
      Authorization: `Bearer ${secret}`,
      "Content-Type": "application/json; charset=utf-8"
    },
    body: JSON.stringify({
      url: targetUrl,
      method: "GET",
      headers: buildBrowserLikeHeaders(source),
      cookieJar: readSourceCookieJar(source),
      followRedirect: true,
      responseMode: "json"
    }),
    credentials: "omit",
    redirect: "follow",
    signal
  });

  if (!response.ok) {
    throw new Error(await readEdgeOneVerifyAutoError(response) || `自动验证接口错误 ${response.status}`);
  }

  const data = await response.json();
  if (!data || data.ok !== true) {
    throw new Error(toText(data?.message).trim() || "自动验证接口返回异常");
  }

  if (data.cookieJar) writeSourceCookieJar(source, data.cookieJar);
  return data;
};

const runVerificationFrame = ({ source, targetUrl, sourceBaseUrl, signal, title, secret, verifyPageUrl, autoConfirm = false }) => new Promise((resolve, reject) => {
  let settled = false;
  let verifyFrame;

  const cleanup = () => {
    window.removeEventListener("message", handleMessage);
    signal?.removeEventListener?.("abort", handleAbort);
    verifyFrame?.close();
  };

  const finish = (callback, value) => {
    if (settled) return;
    settled = true;
    cleanup();
    callback(value);
  };

  const handleAbort = () => finish(reject, createAbortError());

  const handleCancel = () => finish(reject, new Error("验证已取消"));

  const handleMessage = event => {
    if (event.source !== verifyFrame?.frame?.contentWindow) return;
    const data = event.data || {};
    if (data.type !== VERIFY_MESSAGE_TYPE) return;

    if (data.status === "done") {
      finish(resolve, saveCookieJarFromResult(source, data));
      return;
    }

    if (data.status === "cancel") {
      handleCancel();
      return;
    }

    if (data.status === "error") {
      const message = toText(data.message).trim() || "验证失败";
      finish(reject, new Error(message));
    }
  };

  verifyFrame = createVerifyOverlay({ title, onCancel: handleCancel });
  window.addEventListener("message", handleMessage);
  signal?.addEventListener?.("abort", handleAbort, { once: true });

  verifyFrame.frame.src = `${verifyPageUrl}#${encodeBase64Url(buildVerifyPayload({
    source,
    targetUrl,
    sourceBaseUrl,
    title,
    secret,
    autoConfirm
  }))}`;
});

const runEdgeOneVerificationFlow = async ({ source, targetUrl, sourceBaseUrl, signal, title }) => {
  if (typeof window === "undefined" || typeof document === "undefined") {
    throw new Error("当前环境无法打开验证页");
  }
  if (signal?.aborted) throw createAbortError();

  const settings = getApiSettings();
  const secret = toText(settings.edgeOneSecret).trim();
  const verifyPageUrl = getEdgeOneVerificationPageUrl();

  const frameOptions = {
    source,
    targetUrl,
    sourceBaseUrl,
    signal,
    title,
    secret,
    verifyPageUrl
  };

  const decision = await runFunctionAutoVerification({
    source,
    targetUrl,
    signal,
    secret
  });

  if (decision.status === "passed") {
    return saveCookieJarFromResult(source, decision);
  }

  if (decision.status === "manual-required") {
    return runVerificationFrame(frameOptions);
  }

  if (decision.status === "browser-auto-required") {
    return runVerificationFrame({ ...frameOptions, autoConfirm: true });
  }

  throw new Error(toText(decision.message).trim() || "函数端暂未支持该自动验证");
};

export const runEdgeOneVerification = ({ source, url, signal, title = "书源验证" } = {}) => {
  const sourceBaseUrl = normalizeBaseUrl(source?.bookSourceUrl);
  const targetUrl = toText(url).trim() || sourceBaseUrl;
  if (!targetUrl) return Promise.reject(new Error("验证地址为空"));

  return runEdgeOneVerificationFlow({ source, targetUrl, sourceBaseUrl, signal, title });
};
