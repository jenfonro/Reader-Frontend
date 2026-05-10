const VERSION_URL = "/app-version.json";
const SERVICE_WORKER_URL = "/service-worker.js";
const CACHE_PREFIX = "reader-frontend-cache-";
const VERSION_STORAGE_KEY = "reader-frontend-version";

const delay = ms => new Promise(resolve => window.setTimeout(resolve, ms));

const normalizeAssetPath = asset => {
  if (!asset || typeof asset !== "string") {
    return "";
  }
  if (asset.startsWith("http://") || asset.startsWith("https://")) {
    return asset;
  }
  return asset.startsWith("/") ? asset : `/${asset}`;
};

const getCachedVersion = () => window.localStorage.getItem(VERSION_STORAGE_KEY) || "";

const setCachedVersion = version => {
  window.localStorage.setItem(VERSION_STORAGE_KEY, version);
};

const registerServiceWorker = async () => {
  if (!import.meta.env.PROD || !("serviceWorker" in navigator)) {
    return null;
  }

  const registration = await navigator.serviceWorker.register(SERVICE_WORKER_URL);
  if (registration.installing) {
    await navigator.serviceWorker.ready;
  }
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

  const versionInfo = await response.json();
  if (!versionInfo || !versionInfo.version) {
    throw new Error("Invalid version info");
  }

  return {
    version: String(versionInfo.version),
    assets: Array.isArray(versionInfo.assets)
      ? versionInfo.assets.map(normalizeAssetPath).filter(Boolean)
      : []
  };
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

const cacheResponse = async (cache, asset) => {
  const response = await fetch(asset, { cache: "reload" });
  if (!response.ok) {
    throw new Error(`Asset request failed: ${asset}`);
  }
  await cache.put(asset, response.clone());
};

const downloadAssets = async (versionInfo, onProgress) => {
  if (!("caches" in window)) {
    setCachedVersion(versionInfo.version);
    return;
  }

  const uniqueAssets = [...new Set(["/", "/index.html", VERSION_URL, ...versionInfo.assets])];
  const cacheName = `${CACHE_PREFIX}${versionInfo.version}`;
  const cache = await caches.open(cacheName);

  for (const [index, asset] of uniqueAssets.entries()) {
    await cacheResponse(cache, asset);
    onProgress(Math.round(((index + 1) / uniqueAssets.length) * 100));
  }

  await removeOldCaches(cacheName);
  setCachedVersion(versionInfo.version);
  notifyServiceWorker(versionInfo.version);
};

export const runStartupCache = async ({ onStatus, onProgress }) => {
  const setStatus = status => onStatus(status);
  const setProgress = progress => onProgress(Math.max(0, Math.min(100, progress)));

  setStatus("正在连接服务器");
  setProgress(8);

  try {
    await registerServiceWorker();
    const versionInfo = await fetchVersionInfo();

    setStatus("连接成功");
    setProgress(24);
    await delay(160);

    setStatus("正在检测版本");
    setProgress(36);
    await delay(160);

    if (getCachedVersion() === versionInfo.version) {
      setProgress(100);
      await delay(220);
      return;
    }

    setStatus("检测到新版本，正在更新...");
    setProgress(42);
    await downloadAssets(versionInfo, assetProgress => {
      setProgress(42 + assetProgress * 0.58);
    });
    setProgress(100);
    await delay(260);
  } catch (error) {
    if (getCachedVersion()) {
      setStatus("服务器连接失败，使用本地缓存");
      setProgress(100);
      await delay(500);
      return;
    }

    setStatus("当前服务不可用，请稍后再试");
    setProgress(100);
    await delay(800);
  }
};
