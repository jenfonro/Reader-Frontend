import { toText } from "./legadoCommon.js";

export class SearchRequestError extends Error {
  constructor({ type, message, url = "", status = 0, statusText = "", cause = null } = {}) {
    super(message || "搜索请求失败");
    this.name = "SearchRequestError";
    this.type = type || "unknown";
    this.url = url;
    this.status = status;
    this.statusText = statusText;
    this.cause = cause;
  }
}

export const isMixedContentRequest = url => {
  if (typeof window === "undefined" || window.location.protocol !== "https:") return false;
  try {
    return new URL(url, window.location.href).protocol === "http:";
  } catch (error) {
    return false;
  }
};

export const isCrossOriginRequest = url => {
  if (typeof window === "undefined") return false;
  try {
    return new URL(url, window.location.href).origin !== window.location.origin;
  } catch (error) {
    return false;
  }
};

const describeHttpStatus = status => {
  if (status === 400) return "请求参数错误";
  if (status === 401) return "需要登录或授权";
  if (status === 403) return "目标网站拒绝访问";
  if (status === 404) return "目标地址不存在";
  if (status === 408) return "目标网站请求超时";
  if (status === 429) return "请求过于频繁";
  if (status === 500) return "目标网站内部错误";
  if (status === 502) return "目标服务网关错误";
  if (status === 503) return "目标服务不可用";
  if (status === 504) return "目标服务网关超时";
  if (status >= 400 && status < 500) return "目标网站拒绝或无法处理请求";
  if (status >= 500) return "目标网站服务异常";
  return "HTTP 请求失败";
};

export const createHttpError = (response, url = response.url) => {
  const status = response.status;
  const statusText = response.statusText || "";
  return new SearchRequestError({
    type: "http",
    url,
    status,
    statusText,
    message: `HTTP ${status}${statusText ? ` ${statusText}` : ""}：${describeHttpStatus(status)}`
  });
};

export const createMixedContentError = url =>
  new SearchRequestError({
    type: "mixed-content",
    url,
    message: "Mixed Content：HTTPS 页面不能请求 HTTP 书源，浏览器已拦截"
  });

export const createFetchFailureError = (url, cause) => {
  if (isMixedContentRequest(url)) return createMixedContentError(url);
  const crossOrigin = isCrossOriginRequest(url);
  return new SearchRequestError({
    type: crossOrigin ? "cors-or-network" : "network",
    url,
    cause,
    message: crossOrigin
      ? "跨域请求失败：浏览器未暴露具体原因，可能是 CORS、DNS、证书或目标网络不可达"
      : "网络请求失败：目标网络不可达或连接被中断"
  });
};

export const formatSearchError = error => {
  if (!error) return "搜索失败";
  if (error instanceof SearchRequestError) return error.message;
  const message = toText(error.message).trim();
  if (message) return message;
  return "搜索失败";
};

export const summarizeSearchErrors = errors => {
  const validErrors = Array.isArray(errors) ? errors.filter(Boolean) : [];
  if (!validErrors.length) return "搜索失败";

  const groupedErrors = new Map();
  validErrors.forEach(error => {
    const label = formatSearchError(error);
    groupedErrors.set(label, (groupedErrors.get(label) || 0) + 1);
  });

  const messages = [...groupedErrors.entries()]
    .sort((left, right) => right[1] - left[1])
    .slice(0, 3)
    .map(([label, count]) => (count > 1 ? `${label}（${count} 个书源）` : label));

  return messages.join("；");
};
