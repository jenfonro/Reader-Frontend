import { normalizeStartupAssetList, normalizeStartupAssetPath } from "./startupAssets";

const VERSION_URL = "/app-version.json";
const SERVICE_WORKER_URL = "/service-worker.js";
const CACHE_PREFIX = "reader-frontend-cache-";
const VERSION_STORAGE_KEY = "reader-frontend-version";
const VERSION_INFO_STORAGE_KEY = "reader-frontend-version-info";
const CACHE_UPDATE_HEADER = "X-Reader-Cache-Update";

const STARTUP_STATUS = {
  checking: "正在检测新版本...",
  updating: "检测到新版本，正在更新...",
  completing: "正在补全离线资源...",
  failed: "连接服务器失败"
};

const delay = ms => new Promise(resolve => window.setTimeout(resolve, ms));
const noop = () => {};
const clampProgress = progress => Math.max(0, Math.min(100, progress));

const createReporter = ({ onStatus, onProgress, visible = true }) => ({
  setStatus(status) {
    if (visible) {
      onStatus(status);
    }
  },
  setProgress(progress) {
    if (visible) {
      onProgress(clampProgress(progress));
    }
  }
});

const normalizeVersionInfo = value => ({
  version: value?.version ? String(value.version) : "",
  assets: normalizeStartupAssetList(value?.assets),
  app: {
    entry: normalizeStartupAssetPath(value?.app?.entry),
    styles: normalizeStartupAssetList(value?.app?.styles)
  }
});

const canUseLocalStorage = () =>
  typeof window !== "undefined" && Boolean(window.localStorage);

const getCachedVersion = () => {
  if (!canUseLocalStorage()) return "";
  return window.localStorage.getItem(VERSION_STORAGE_KEY) || "";
};

const getCachedVersionInfo = () => {
  if (!canUseLocalStorage()) return normalizeVersionInfo(null);

  try {
    const rawValue = window.localStorage.getItem(VERSION_INFO_STORAGE_KEY);
    return normalizeVersionInfo(rawValue ? JSON.parse(rawValue) : null);
  } catch (error) {
    return normalizeVersionInfo(null);
  }
};

const setCachedVersionInfo = versionInfo => {
  const normalizedVersionInfo = normalizeVersionInfo(versionInfo);
  if (!canUseLocalStorage() || !normalizedVersionInfo.version) return normalizedVersionInfo;

  window.localStorage.setItem(VERSION_STORAGE_KEY, normalizedVersionInfo.version);
  window.localStorage.setItem(VERSION_INFO_STORAGE_KEY, JSON.stringify(normalizedVersionInfo));
  return normalizedVersionInfo;
};

const waitForServiceWorkerController = () => {
  if (navigator.serviceWorker.controller) {
    return Promise.resolve();
  }

  return new Promise(resolve => {
    const complete = () => {
      window.clearTimeout(timeoutId);
      navigator.serviceWorker.removeEventListener("controllerchange", complete);
      resolve();
    };
    const timeoutId = window.setTimeout(complete, 1500);

    navigator.serviceWorker.addEventListener("controllerchange", complete);
  });
};

const registerServiceWorker = async () => {
  if (!import.meta.env.PROD || !("serviceWorker" in navigator)) {
    return null;
  }

  const registration = await navigator.serviceWorker.register(SERVICE_WORKER_URL);
  await navigator.serviceWorker.ready;
  await waitForServiceWorkerController();
  return registration;
};

const fetchVersionInfo = async () => {
  const response = await fetch(`${VERSION_URL}?t=${Date.now()}`, {
    cache: "no-store",
    headers: {
      Accept: "application/json"
    }
  });

  if (!response.ok) {
    throw new Error(`Version request failed: ${response.status}`);
  }

  const versionInfo = normalizeVersionInfo(await response.json());
  if (!versionInfo.version) {
    throw new Error("Invalid version info");
  }

  return versionInfo;
};

const removeOldCaches = async currentCacheName => {
  if (!("caches" in window)) {
    return;
  }

  const cacheNames = await caches.keys();
  await Promise.all(
    cacheNames
      .filter(cacheName => cacheName.startsWith(CACHE_PREFIX) && cacheName !== currentCacheName)
      .map(cacheName => caches.delete(cacheName))
  );
};

const notifyServiceWorker = version => {
  if (!navigator.serviceWorker?.controller) {
    return;
  }

  navigator.serviceWorker.controller.postMessage({
    type: "READER_CACHE_READY",
    cacheName: `${CACHE_PREFIX}${version}`
  });
};

const getCacheName = version => `${CACHE_PREFIX}${version}`;

const cacheResponse = async (cache, asset) => {
  const response = await fetch(asset, {
    cache: "reload",
    headers: {
      [CACHE_UPDATE_HEADER]: "1"
    }
  });

  if (!response.ok) {
    throw new Error(`Asset request failed: ${asset}`);
  }

  await cache.put(asset, response.clone());
};

const getStartupAssets = versionInfo =>
  [...new Set([
    "/",
    "/index.html",
    VERSION_URL,
    versionInfo.app.entry,
    ...versionInfo.app.styles,
    ...versionInfo.assets
  ].map(normalizeStartupAssetPath).filter(Boolean))];

const getMissingStartupAssets = async versionInfo => {
  if (!("caches" in window)) {
    return getStartupAssets(versionInfo);
  }

  const cache = await caches.open(getCacheName(versionInfo.version));
  const missingAssets = [];
  for (const asset of getStartupAssets(versionInfo)) {
    if (!(await cache.match(asset))) {
      missingAssets.push(asset);
    }
  }
  return missingAssets;
};

const finishCacheUpdate = async versionInfo => {
  const cacheName = getCacheName(versionInfo.version);
  await removeOldCaches(cacheName);
  setCachedVersionInfo(versionInfo);
  notifyServiceWorker(versionInfo.version);
};

const downloadAssets = async (versionInfo, onProgress = noop, targetAssets = getStartupAssets(versionInfo)) => {
  if (!("caches" in window)) {
    setCachedVersionInfo(versionInfo);
    onProgress(100);
    return;
  }

  const assets = [...new Set(targetAssets.map(normalizeStartupAssetPath).filter(Boolean))];
  const cache = await caches.open(getCacheName(versionInfo.version));

  if (!assets.length) {
    onProgress(100);
    await finishCacheUpdate(versionInfo);
    return;
  }

  for (const [index, asset] of assets.entries()) {
    await cacheResponse(cache, asset);
    onProgress(Math.round(((index + 1) / assets.length) * 100));
  }

  await finishCacheUpdate(versionInfo);
};

const updateFromServer = async options => {
  const reporter = createReporter(options);

  reporter.setStatus(STARTUP_STATUS.checking);
  reporter.setProgress(18);

  await registerServiceWorker();
  const versionInfo = await fetchVersionInfo();
  const cachedVersion = getCachedVersion();

  reporter.setProgress(36);
  await delay(160);

  if (cachedVersion === versionInfo.version) {
    const missingAssets = await getMissingStartupAssets(versionInfo);
    if (!missingAssets.length) {
      await finishCacheUpdate(versionInfo);
      reporter.setProgress(100);
      await delay(220);
      return versionInfo;
    }

    reporter.setStatus(STARTUP_STATUS.completing);
    await downloadAssets(versionInfo, assetProgress => {
      reporter.setProgress(42 + assetProgress * 0.58);
    }, missingAssets);
    reporter.setProgress(100);
    await delay(220);
    return versionInfo;
  }

  reporter.setStatus(STARTUP_STATUS.updating);
  reporter.setProgress(42);
  await downloadAssets(versionInfo, assetProgress => {
    reporter.setProgress(42 + assetProgress * 0.58);
  });
  reporter.setProgress(100);
  await delay(260);

  return versionInfo;
};

export const runStartupCache = async ({ onStatus, onProgress }) => {
  const setStatus = status => onStatus(status);
  const setProgress = progress => onProgress(clampProgress(progress));

  setStatus(STARTUP_STATUS.checking);
  setProgress(8);

  try {
    return await updateFromServer({ onStatus, onProgress });
  } catch (error) {
    setStatus(STARTUP_STATUS.failed);
    setProgress(100);
    await delay(800);
    return getCachedVersionInfo();
  }
};
