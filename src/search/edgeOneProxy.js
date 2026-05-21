import { getApiSettings } from "../data/apiSettings.js";
import { toText } from "./legadoCommon.js";

const EDGEONE_FETCH_ROUTE = "/api/fetch";
const isHttpUrl = value => /^https?:\/\//i.test(value);

const normalizeProxyEndpoint = ({ edgeOneUrl }) => {
  const rawUrl = toText(edgeOneUrl).trim();
  if (!rawUrl) return null;

  let endpoint;
  try {
    endpoint = new URL(rawUrl, window.location.href);
  } catch (error) {
    return null;
  }

  if (!isHttpUrl(endpoint.toString())) return null;

  const pathname = endpoint.pathname.replace(/\/+$/, "");
  endpoint.pathname = pathname.endsWith(EDGEONE_FETCH_ROUTE)
    ? pathname
    : EDGEONE_FETCH_ROUTE;
  endpoint.search = "";
  endpoint.hash = "";
  return endpoint.toString();
};

const getEdgeOneProxySettings = () => {
  const settings = getApiSettings();
  const endpoint = normalizeProxyEndpoint(settings);
  const secret = toText(settings.edgeOneSecret).trim();
  if (!endpoint || !secret) return null;
  return { endpoint, secret };
};

export const getEdgeOneProxyEndpoint = () => getEdgeOneProxySettings()?.endpoint || null;

const normalizeProxyPayload = request => {
  const method = toText(request.method || "GET").trim().toUpperCase() || "GET";
  const payload = {
    url: request.url,
    method,
    headers: request.headers || {},
    followRedirect: true
  };

  if (method === "POST" && request.body !== undefined) {
    payload.data = request.body;
  }

  return payload;
};

export const fetchWithEdgeOneProxy = async (request, signal) => {
  const settings = getEdgeOneProxySettings();
  if (!settings) return null;

  return fetch(settings.endpoint, {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${settings.secret}`,
      "Content-Type": "application/json;charset=UTF-8"
    },
    body: JSON.stringify(normalizeProxyPayload(request)),
    credentials: "omit",
    redirect: "follow",
    signal
  });
};
