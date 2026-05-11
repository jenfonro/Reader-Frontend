import { getApiSettings } from "../data/apiSettings.js";
import { toText } from "./legadoCommon.js";

const isHttpUrl = value => /^https?:\/\//i.test(value);

const normalizeProxyEndpoint = ({ edgeOneUrl, edgeOneSecret }) => {
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
  if (!pathname) {
    endpoint.pathname = "/proxy";
  } else if (pathname.endsWith("/proxy")) {
    endpoint.pathname = pathname;
  } else {
    endpoint.pathname = "/proxy";
  }

  const secret = toText(edgeOneSecret).trim();
  if (secret) {
    endpoint.searchParams.set("secret", secret);
  }

  if (!endpoint.searchParams.get("secret")) return null;
  return endpoint.toString();
};

export const getEdgeOneProxyEndpoint = () => normalizeProxyEndpoint(getApiSettings());

const normalizeProxyPayload = request => {
  const method = toText(request.method || "GET").trim().toUpperCase() || "GET";
  const payload = {
    url: request.url,
    method,
    headers: request.headers || {},
    followRedirect: true
  };

  if (method !== "GET" && method !== "HEAD" && request.body !== undefined) {
    payload.data = request.body;
  }

  return payload;
};

export const fetchWithEdgeOneProxy = async (request, signal) => {
  const endpoint = getEdgeOneProxyEndpoint();
  if (!endpoint) return null;

  return fetch(endpoint, {
    method: "POST",
    headers: {
      "Content-Type": "application/json;charset=UTF-8"
    },
    body: JSON.stringify(normalizeProxyPayload(request)),
    credentials: "omit",
    redirect: "follow",
    signal
  });
};
