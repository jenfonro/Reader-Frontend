import { normalizeBaseUrl, toText } from "./legadoCommon.js";
import { evaluateLegadoScript } from "./legadoScript.js";
import { fetchWithEdgeOneProxy } from "./edgeOneProxy.js";
import {
  createFetchFailureError,
  createHttpError,
  createMixedContentError,
  isMixedContentRequest
} from "./searchErrors.js";

const urlOptionPattern = /\s*,\s*(?=\{)/;
const forbiddenHeaderNames = new Set([
  "accept-encoding",
  "connection",
  "content-length",
  "cookie",
  "host",
  "origin",
  "referer",
  "user-agent"
]);

const encodePathSearch = value => toText(value).trim();
const replaceTemplates = (value, context) =>
  toText(value).replace(/\{\{([\s\S]*?)\}\}/g, (_, expression) => {
    const script = expression.trim();
    if (script === "key") return context.key;
    if (script === "page") return String(context.page);
    const evaluated = evaluateLegadoScript(script, context, "");
    return toText(evaluated);
  });

const evaluateScriptBlocks = (ruleUrl, context) => {
  let nextRuleUrl = toText(ruleUrl);
  if (nextRuleUrl.trimStart().startsWith("@js:")) {
    return toText(evaluateLegadoScript(nextRuleUrl.trimStart().slice(4), context, nextRuleUrl));
  }

  nextRuleUrl = nextRuleUrl.replace(/<js>([\s\S]*?)<\/js>/gi, (_, script) =>
    toText(evaluateLegadoScript(script, context, ""))
  );
  return nextRuleUrl;
};

const parseUrlOption = optionText => {
  if (!optionText) return {};
  try {
    const fn = new Function(`return (${optionText});`);
    const option = fn();
    return option && typeof option === "object" && !Array.isArray(option) ? option : {};
  } catch (error) {
    return {};
  }
};

const normalizeHeaders = headers => {
  if (!headers || typeof headers !== "object" || Array.isArray(headers)) return {};
  return Object.entries(headers).reduce((result, [key, value]) => {
    const headerName = String(key).trim();
    if (!headerName || forbiddenHeaderNames.has(headerName.toLowerCase())) return result;
    result[headerName] = toText(value);
    return result;
  }, {});
};

const splitUrlOption = value => {
  const matcher = urlOptionPattern.exec(value);
  if (!matcher) return { url: value, optionText: "" };
  return {
    url: value.slice(0, matcher.index),
    optionText: value.slice(matcher.index + matcher[0].length)
  };
};

const normalizeBody = (body, headers) => {
  if (body === null || body === undefined || body === "") return undefined;
  if (typeof body !== "string") {
    if (!headers["Content-Type"] && !headers["content-type"]) {
      headers["Content-Type"] = "application/json;charset=UTF-8";
    }
    return JSON.stringify(body);
  }

  const text = body.trim();
  if (!text) return undefined;
  if ((text.startsWith("{") || text.startsWith("[")) && !headers["Content-Type"] && !headers["content-type"]) {
    headers["Content-Type"] = "application/json;charset=UTF-8";
  } else if (!headers["Content-Type"] && !headers["content-type"]) {
    headers["Content-Type"] = "application/x-www-form-urlencoded;charset=UTF-8";
  }
  return body;
};

export const buildLegadoRequest = ({
  source,
  ruleUrl,
  keyword = "",
  page = 1,
  baseUrl = "",
  variables = new Map(),
  book = {},
  chapter = {}
}) => {
  const sourceBaseUrl = normalizeBaseUrl(source?.bookSourceUrl);
  const context = {
    source,
    book,
    chapter,
    key: keyword,
    page,
    baseUrl: normalizeBaseUrl(baseUrl) || sourceBaseUrl,
    variables
  };
  let requestRule = evaluateScriptBlocks(ruleUrl || "", context);
  requestRule = replaceTemplates(requestRule, context);
  context.variables.forEach((value, key) => {
    context.variables.set(key, replaceTemplates(value, context));
  });

  const { url: rawUrl, optionText } = splitUrlOption(requestRule);
  const option = parseUrlOption(optionText);
  const method = toText(option.method || "GET").trim().toUpperCase() === "POST" ? "POST" : "GET";
  const headers = normalizeHeaders(option.headers);
  const requestUrl = new URL(
    encodePathSearch(rawUrl),
    context.baseUrl || sourceBaseUrl || window.location.href
  );
  const request = {
    url: requestUrl.toString(),
    method,
    headers,
    charset: toText(option.charset).trim().toLowerCase(),
    source,
    keyword,
    page,
    book,
    chapter,
    variables: context.variables
  };

  if (method === "POST") {
    const body = replaceTemplates(toText(option.body), context);
    request.body = normalizeBody(body, headers);
  }

  return request;
};

export const buildSearchRequest = ({ source, keyword, page = 1 }) =>
  buildLegadoRequest({
    source,
    ruleUrl: source.searchUrl || "",
    keyword,
    page,
    baseUrl: normalizeBaseUrl(source.bookSourceUrl),
    variables: new Map()
  });

export const fetchLegadoResponse = async (request, signal) => {
  let response;
  try {
    const proxyResponse = await fetchWithEdgeOneProxy(request, signal);
    if (!proxyResponse && isMixedContentRequest(request.url)) throw createMixedContentError(request.url);

    response = proxyResponse || await fetch(request.url, {
      method: request.method,
      headers: request.headers,
      body: request.body,
      credentials: "omit",
      redirect: "follow",
      signal
    });
  } catch (error) {
    if (error?.name === "AbortError" || error?.name === "SearchRequestError") throw error;
    throw createFetchFailureError(request.url, error);
  }

  if (!response.ok) throw createHttpError(response);

  const buffer = await response.arrayBuffer();
  const contentType = response.headers.get("content-type") || "";
  const matchedCharset = /charset=([^;]+)/i.exec(contentType);
  const charset = request.charset || (matchedCharset ? matchedCharset[1].trim().toLowerCase() : "utf-8");
  try {
    return new TextDecoder(charset || "utf-8").decode(buffer);
  } catch (error) {
    return new TextDecoder("utf-8").decode(buffer);
  }
};

export const fetchSearchResponse = fetchLegadoResponse;

