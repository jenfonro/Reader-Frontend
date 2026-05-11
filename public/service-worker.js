const CACHE_PREFIX = "reader-frontend-cache-";
const CACHE_UPDATE_HEADER = "x-reader-cache-update";
let activeCacheName = "";

const isSameOriginGet = request =>
  request.method === "GET" && new URL(request.url).origin === self.location.origin;

const isCacheUpdateRequest = request =>
  request.headers.get(CACHE_UPDATE_HEADER) === "1";

const getLatestCacheName = async () => {
  if (activeCacheName) {
    return activeCacheName;
  }

  const cacheNames = await caches.keys();
  const appCaches = cacheNames
    .filter(cacheName => cacheName.startsWith(CACHE_PREFIX))
    .sort();

  activeCacheName = appCaches[appCaches.length - 1] || "";
  return activeCacheName;
};

const putInLatestCache = async (request, response) => {
  const cacheName = await getLatestCacheName();
  if (!cacheName || !response || !response.ok) {
    return;
  }

  const cache = await caches.open(cacheName);
  await cache.put(request, response.clone());
};

const fromCache = async request => {
  const cachedResponse = await caches.match(request);
  if (cachedResponse) {
    return cachedResponse;
  }

  if (request.mode === "navigate") {
    return caches.match("/index.html") || caches.match("/");
  }

  return null;
};

const shouldFallbackToCache = response =>
  !response || response.status === 408 || response.status === 429 || response.status >= 500;

const networkFirst = async request => {
  try {
    const response = await fetch(request);
    if (shouldFallbackToCache(response)) {
      const cachedResponse = await fromCache(request);
      if (cachedResponse) {
        return cachedResponse;
      }
    }

    await putInLatestCache(request, response);
    return response;
  } catch (error) {
    const cachedResponse = await fromCache(request);
    if (cachedResponse) {
      return cachedResponse;
    }
    throw error;
  }
};

const cacheFirst = async request => {
  const cachedResponse = await fromCache(request);
  if (cachedResponse) {
    return cachedResponse;
  }

  const response = await fetch(request);
  await putInLatestCache(request, response);
  return response;
};

self.addEventListener("install", event => {
  event.waitUntil(self.skipWaiting());
});

self.addEventListener("activate", event => {
  event.waitUntil(self.clients.claim());
});

self.addEventListener("message", event => {
  if (event.data?.type === "READER_CACHE_READY" && event.data.cacheName) {
    activeCacheName = event.data.cacheName;
  }
});

self.addEventListener("fetch", event => {
  if (!isSameOriginGet(event.request)) {
    return;
  }

  const requestUrl = new URL(event.request.url);
  if (isCacheUpdateRequest(event.request)) {
    event.respondWith(fetch(event.request));
    return;
  }

  if (requestUrl.pathname === "/app-version.json" || event.request.cache === "reload") {
    event.respondWith(networkFirst(event.request));
    return;
  }

  event.respondWith(cacheFirst(event.request));
});
