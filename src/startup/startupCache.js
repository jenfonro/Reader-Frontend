const VERSION_URL = "/app-version.json";
const SERVICE_WORKER_URL = "/service-worker.js";
const CACHE_PREFIX = "reader-frontend-cache-";
const VERSION_STORAGE_KEY = "reader-frontend-version";
const CACHE_UPDATE_HEADER = "X-Reader-Cache-Update";

const STARTUP_STATUS = {
  checking: "正在检测新版本...",
  updating: "检测到新版本，正在更新...",
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
  [...new Set(["/", "/index.html", VERSION_URL, ...versionInfo.assets])];

const downloadAssets = async (versionInfo, onProgress = noop) => {
  if (!("caches" in window)) {
    setCachedVersion(versionInfo.version);
    return;
  }

  const assets = getStartupAssets(versionInfo);
  const cacheName = `${CACHE_PREFIX}${versionInfo.version}`;
  const cache = await caches.open(cacheName);

  for (const [index, asset] of assets.entries()) {
    await cacheResponse(cache, asset);
    onProgress(Math.round(((index + 1) / assets.length) * 100));
  }

  await removeOldCaches(cacheName);
  setCachedVersion(versionInfo.version);
  notifyServiceWorker(versionInfo.version);
};

const updateFromServer = async options => {
  const reporter = createReporter(options);

  reporter.setStatus(STARTUP_STATUS.checking);
  reporter.setProgress(18);

  await registerServiceWorker();
  const versionInfo = await fetchVersionInfo();

  reporter.setProgress(36);
  await delay(160);

  if (getCachedVersion() === versionInfo.version) {
    reporter.setProgress(100);
    await delay(220);
    return;
  }

  reporter.setStatus(STARTUP_STATUS.updating);
  reporter.setProgress(42);
  await downloadAssets(versionInfo, assetProgress => {
    reporter.setProgress(42 + assetProgress * 0.58);
  });
  reporter.setProgress(100);
  await delay(260);
};

const updateSilently = options => {
  updateFromServer({ ...options, visible: false }).catch(noop);
};

export const runStartupCache = async ({ onStatus, onProgress }) => {
  const setStatus = status => onStatus(status);
  const setProgress = progress => onProgress(clampProgress(progress));

  setStatus(STARTUP_STATUS.checking);

  if (getCachedVersion()) {
    setProgress(100);
    updateSilently({ onStatus, onProgress });
    await delay(120);
    return;
  }

  setProgress(8);

  try {
    await updateFromServer({ onStatus, onProgress });
  } catch (error) {
    setStatus(STARTUP_STATUS.failed);
    setProgress(100);
    await delay(800);
  }
};
