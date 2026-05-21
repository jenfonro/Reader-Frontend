import { getApiSettings } from "../data/apiSettings.js";
import { toText } from "./legadoCommon.js";
import { SearchRequestError } from "./searchErrors.js";

const EDGEONE_FETCH_ROUTE = "/api/fetch";
const STANDARD_ENDPOINT_PATHS = new Set(["", "/", EDGEONE_FETCH_ROUTE]);
const ALLOWED_METHODS = new Set(["GET", "POST"]);
const FORBIDDEN_HEADER_NAMES = new Set([
  "accept-encoding",
  "connection",
  "content-length",
  "cookie",
  "host",
  "keep-alive",
  "origin",
  "proxy-authenticate",
  "proxy-authorization",
  "referer",
  "te",
  "trailer",
  "transfer-encoding",
  "upgrade",
  "user-agent"
]);

const createEdgeOneConfigError = message =>
  new SearchRequestError({
    type: "edgeone-config",
    message
  });

const isHttpUrl = value => /^https?:\/\//i.test(value);

const normalizeEndpointPath = pathname => toText(pathname).replace(/\/+$/, "") || "/";

const normalizeEdgeOneFetchEndpoint = edgeOneUrl => {
  const rawUrl = toText(edgeOneUrl).trim();
  if (!rawUrl) return "";

  let endpoint;
  try {
    endpoint = new URL(rawUrl, window.location.href);
  } catch (error) {
    throw createEdgeOneConfigError("EdgeOne 地址无效");
  }

  if (!isHttpUrl(endpoint.toString())) {
    throw createEdgeOneConfigError("EdgeOne 地址必须是 HTTP 或 HTTPS");
  }

  const pathname = normalizeEndpointPath(endpoint.pathname);
  if (!STANDARD_ENDPOINT_PATHS.has(pathname)) {
    throw createEdgeOneConfigError("EdgeOne 地址只支持部署根地址或 /api/fetch");
  }

  endpoint.pathname = EDGEONE_FETCH_ROUTE;
  endpoint.search = "";
  endpoint.hash = "";
  return endpoint.toString();
};

const getEdgeOneFetchSettings = () => {
  const settings = getApiSettings();
  const rawUrl = toText(settings.edgeOneUrl).trim();
  const secret = toText(settings.edgeOneSecret).trim();

  if (!rawUrl && !secret) return null;
  if (!rawUrl || !secret) {
    throw createEdgeOneConfigError("EdgeOne 地址和 Secret 需要同时设置");
  }

  return {
    endpoint: normalizeEdgeOneFetchEndpoint(rawUrl),
    secret
  };
};

const isForbiddenHeaderName = name => {
  const lowerName = toText(name).trim().toLowerCase();
  return !lowerName
    || lowerName.startsWith("proxy-")
    || lowerName.startsWith("sec-")
    || FORBIDDEN_HEADER_NAMES.has(lowerName);
};

const normalizeHeaders = headers => {
  if (!headers || typeof headers !== "object" || Array.isArray(headers)) return {};

  return Object.entries(headers).reduce((result, [key, value]) => {
    const name = toText(key).trim();
    if (isForbiddenHeaderName(name) || value == null) return result;

    if (Array.isArray(value)) {
      const values = value.map(item => toText(item).trim()).filter(Boolean);
      if (values.length) result[name] = values;
      return result;
    }

    const text = toText(value).trim();
    if (text) result[name] = text;
    return result;
  }, {});
};

const normalizeMethod = method => {
  const normalizedMethod = toText(method || "GET").trim().toUpperCase() || "GET";
  if (!ALLOWED_METHODS.has(normalizedMethod)) {
    throw createEdgeOneConfigError("EdgeOne 标准接口只支持 GET 和 POST");
  }
  return normalizedMethod;
};

const createEdgeOneFetchPayload = request => {
  const method = normalizeMethod(request?.method);
  const payload = {
    url: toText(request?.url).trim(),
    method,
    headers: normalizeHeaders(request?.headers),
    followRedirect: true
  };

  if (method === "POST" && request.body !== undefined) {
    payload.data = request.body;
  }

  return payload;
};

export const fetchWithEdgeOneFetch = async (request, signal) => {
  const settings = getEdgeOneFetchSettings();
  if (!settings) return null;

  return fetch(settings.endpoint, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${settings.secret}`,
      "Content-Type": "application/json; charset=utf-8"
    },
    body: JSON.stringify(createEdgeOneFetchPayload(request)),
    credentials: "omit",
    redirect: "follow",
    signal
  });
};

const readEdgeOneErrorMessage = async response => {
  try {
    const data = await response.clone().json();
    return toText(data?.message || data?.error).trim();
  } catch (error) {
    return "";
  }
};

export const isEdgeOneServiceErrorResponse = response => {
  if (!response) return false;
  if (response.headers.get("x-edge-fetch-target")) return false;
  return toText(response.headers.get("content-type")).toLowerCase().includes("application/json");
};

export const createEdgeOneServiceError = async response => {
  const message = await readEdgeOneErrorMessage(response);
  return new SearchRequestError({
    type: "edgeone-service",
    url: response.url || "",
    status: response.status,
    statusText: response.statusText || "",
    message: `EdgeOne 接口错误${response.status ? ` ${response.status}` : ""}${message ? `：${message}` : ""}`
  });
};
