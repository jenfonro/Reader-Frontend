import { normalizeBaseUrl, toText } from "./legadoCommon.js";
import { evaluateLegadoScript } from "./legadoScript.js";
import {
  createEdgeOneServiceError,
  fetchWithEdgeOneFetch,
  isEdgeOneServiceErrorResponse
} from "./edgeOneFetch.js";
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
  "origin"
]);

const encodePathSearch = value => toText(value).trim();

const replaceAsync = async (value, pattern, replacer) => {
  const source = toText(value);
  const matches = Array.from(source.matchAll(pattern));
  if (!matches.length) return source;

  const replacements = await Promise.all(matches.map(match => replacer(...match)));
  let result = "";
  let cursor = 0;
  matches.forEach((match, index) => {
    result += source.slice(cursor, match.index);
    result += toText(replacements[index]);
    cursor = match.index + match[0].length;
  });
  return result + source.slice(cursor);
};

const replaceTemplates = (value, context) =>
  replaceAsync(value, /\{\{([\s\S]*?)\}\}/g, async (_, expression) => {
    const script = expression.trim();
    if (script === "key") return context.key;
    if (script === "page") return String(context.page);
    const evaluated = await evaluateLegadoScript(script, context, "");
    return toText(evaluated);
  });

const evaluateScriptBlocks = async (ruleUrl, context) => {
  let nextRuleUrl = toText(ruleUrl);
  if (nextRuleUrl.trimStart().startsWith("@js:")) {
    return toText(await evaluateLegadoScript(nextRuleUrl.trimStart().slice(4), context, nextRuleUrl));
  }

  nextRuleUrl = await replaceAsync(nextRuleUrl, /<js>([\s\S]*?)<\/js>/gi, async (_, script) =>
    toText(await evaluateLegadoScript(script, context, ""))
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

export const buildLegadoRequest = async ({
  source,
  ruleUrl,
  keyword = "",
  page = 1,
  baseUrl = "",
  variables = new Map(),
  book = {},
  chapter = {},
  ajax,
  removeCookie,
  startBrowserAwait
}) => {
  const sourceBaseUrl = normalizeBaseUrl(source?.bookSourceUrl);
  const context = {
    source,
    book,
    chapter,
    key: keyword,
    page,
    baseUrl: normalizeBaseUrl(baseUrl) || sourceBaseUrl,
    variables,
    ajax,
    removeCookie,
    startBrowserAwait
  };
  let requestRule = await evaluateScriptBlocks(ruleUrl || "", context);
  requestRule = await replaceTemplates(requestRule, context);
  for (const [key, value] of context.variables.entries()) {
    context.variables.set(key, await replaceTemplates(value, context));
  }

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
    variables: context.variables,
    ajax,
    removeCookie,
    startBrowserAwait
  };

  if (method === "POST") {
    const body = await replaceTemplates(toText(option.body), context);
    request.body = normalizeBody(body, headers);
  }

  return request;
};

export const buildSearchRequest = ({ source, keyword, page = 1, variables = new Map(), ajax, removeCookie, startBrowserAwait }) =>
  buildLegadoRequest({
    source,
    ruleUrl: source.searchUrl || "",
    keyword,
    page,
    baseUrl: normalizeBaseUrl(source.bookSourceUrl),
    variables,
    ajax,
    removeCookie,
    startBrowserAwait
  });

const normalizeResponseUrl = (response, fallbackUrl) => {
  const edgeFetchFinalUrl = toText(response.headers.get("x-edge-fetch-final-url")).trim();
  const responseUrl = toText(response.url).trim();
  const nextUrl = edgeFetchFinalUrl || responseUrl || fallbackUrl;

  try {
    return new URL(nextUrl, fallbackUrl).toString();
  } catch (error) {
    return fallbackUrl;
  }
};

const fetchRequestResponse = async (request, signal) => {
  try {
    const edgeOneResponse = await fetchWithEdgeOneFetch(request, signal);
    if (!edgeOneResponse && isMixedContentRequest(request.url)) throw createMixedContentError(request.url);

    return edgeOneResponse || await fetch(request.url, {
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
};

const decodeResponseBody = async (response, request) => {
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

const finalizeLegadoResponse = async (request, response) => {
  request.responseUrl = normalizeResponseUrl(response, request.url);
  if (isEdgeOneServiceErrorResponse(response)) throw await createEdgeOneServiceError(response);

  const body = await decodeResponseBody(response, request);
  if (!response.ok) {
    throw createHttpError(response, request.responseUrl);
  }

  return body;
};

export const fetchLegadoResponse = async (request, signal) => {
  const response = await fetchRequestResponse(request, signal);
  return finalizeLegadoResponse(request, response);
};

export const fetchSearchResponse = fetchLegadoResponse;
