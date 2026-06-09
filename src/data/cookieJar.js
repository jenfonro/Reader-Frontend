import { getSourceKey } from "./bookSourceStorage";
import { readPersistentJson, writePersistentJson } from "./persistentStorage";
import { cookieJarStorageKey } from "./userStorageKeys";

const createEmptyCookieJar = () => ({
  version: 1,
  cookies: []
});

const normalizeCookie = cookie => {
  if (!cookie || typeof cookie !== "object" || Array.isArray(cookie)) return null;
  const name = String(cookie.name || "").trim();
  const value = cookie.value === null || cookie.value === undefined ? "" : String(cookie.value);
  const domain = String(cookie.domain || "").trim().toLowerCase();
  const path = String(cookie.path || "/").trim() || "/";
  if (!name || !domain) return null;

  const expires = Number(cookie.expires || 0);
  const createdAt = Number(cookie.createdAt || 0);
  const updatedAt = Number(cookie.updatedAt || 0);

  return {
    name,
    value,
    domain,
    path: path.startsWith("/") ? path : `/${path}`,
    expires: Number.isFinite(expires) && expires > 0 ? expires : 0,
    secure: cookie.secure === true,
    httpOnly: cookie.httpOnly === true,
    sameSite: String(cookie.sameSite || "").trim(),
    hostOnly: cookie.hostOnly !== false,
    createdAt: Number.isFinite(createdAt) && createdAt > 0 ? createdAt : Date.now(),
    updatedAt: Number.isFinite(updatedAt) && updatedAt > 0 ? updatedAt : Date.now()
  };
};

export const normalizeCookieJar = value => {
  if (!value || typeof value !== "object" || Array.isArray(value)) return createEmptyCookieJar();
  const cookies = Array.isArray(value.cookies)
    ? value.cookies.map(normalizeCookie).filter(Boolean)
    : [];
  const now = Date.now();
  return {
    version: 1,
    cookies: cookies.filter(cookie => !cookie.expires || cookie.expires > now)
  };
};

const normalizeCookieJarStore = value => {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    return { version: 1, sources: {} };
  }

  const sources = value.sources && typeof value.sources === "object" && !Array.isArray(value.sources)
    ? Object.entries(value.sources).reduce((result, [key, jar]) => {
      const sourceKey = String(key || "").trim();
      if (!sourceKey) return result;
      const normalizedJar = normalizeCookieJar(jar);
      if (normalizedJar.cookies.length) result[sourceKey] = normalizedJar;
      return result;
    }, {})
    : {};

  return { version: 1, sources };
};

const readCookieJarStore = () => normalizeCookieJarStore(readPersistentJson(cookieJarStorageKey, null));

const writeCookieJarStore = store => writePersistentJson(cookieJarStorageKey, normalizeCookieJarStore(store));

export const getCookieJarKeyForSource = source => {
  const explicitKey = String(source?.__sourceKey || "").trim();
  return explicitKey || getSourceKey(source || {});
};

export const isCookieJarEnabledForSource = source => source?.enabledCookieJar === true;

export const readSourceCookieJar = source => {
  const key = getCookieJarKeyForSource(source);
  if (!key) return createEmptyCookieJar();
  const store = readCookieJarStore();
  return normalizeCookieJar(store.sources[key]);
};

export const writeSourceCookieJar = (source, cookieJar) => {
  const key = getCookieJarKeyForSource(source);
  if (!key) return createEmptyCookieJar();

  const store = readCookieJarStore();
  const normalizedJar = normalizeCookieJar(cookieJar);
  if (normalizedJar.cookies.length) {
    store.sources[key] = normalizedJar;
  } else {
    delete store.sources[key];
  }
  writeCookieJarStore(store);
  return normalizedJar;
};

export const removeSourceCookieJar = sourceOrKey => {
  const key = typeof sourceOrKey === "string"
    ? sourceOrKey.trim()
    : getCookieJarKeyForSource(sourceOrKey);
  if (!key) return;

  const store = readCookieJarStore();
  delete store.sources[key];
  writeCookieJarStore(store);
};
