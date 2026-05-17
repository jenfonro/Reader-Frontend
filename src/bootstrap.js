import logoUrl from "./assets/reader-logo.svg";
import { normalizeStartupAssetList, normalizeStartupAssetPath } from "./startup/startupAssets";
import { runStartupCache } from "./startup/startupCache";
import { hydrateUserStorage } from "./data/userStorage";

const overlayId = "readerStartupOverlay";
const styleId = "readerStartupOverlayStyle";
const loadedStyleLinks = new Set();
const loadedScriptLinks = new Set();

const fallbackLoadApplication = () => import("./main.js");

const createStartupStyle = () => {
  if (document.getElementById(styleId)) return;

  const style = document.createElement("style");
  style.id = styleId;
  style.textContent = `
    .startup-overlay {
      position: fixed;
      inset: 0;
      z-index: 9999;
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 32px;
      box-sizing: border-box;
      background: var(--reader-app-bg);
      opacity: 1;
      transition: opacity 0.55s ease, visibility 0.55s ease;
    }
    .startup-overlay--leaving {
      opacity: 0;
      visibility: hidden;
    }
    .startup-overlay__panel {
      width: min(260px, 76vw);
      display: flex;
      flex-direction: column;
      align-items: center;
    }
    .startup-overlay__logo {
      width: 76px;
      height: 76px;
      object-fit: contain;
      filter: drop-shadow(0 14px 24px rgba(44, 62, 80, 0.12));
      user-select: none;
      -webkit-user-drag: none;
    }
    .startup-overlay__loading {
      display: inline-flex;
      align-items: center;
      gap: 10px;
      margin-top: 28px;
      color: var(--reader-app-text);
      font-size: 14px;
      line-height: 24px;
    }
    .startup-overlay__spinner {
      width: 24px;
      height: 24px;
      border: 2px solid color-mix(in srgb, var(--reader-app-text) 14%, transparent);
      border-top-color: color-mix(in srgb, var(--reader-app-text) 72%, transparent);
      border-radius: 50%;
      animation: startup-spin 0.85s linear infinite;
    }
    .startup-overlay__progress {
      width: 100%;
      height: 5px;
      margin-top: 22px;
      overflow: hidden;
      border-radius: 999px;
      background: color-mix(in srgb, var(--reader-app-text) 12%, transparent);
    }
    .startup-overlay__progress-bar {
      height: 100%;
      width: 0;
      border-radius: inherit;
      background: var(--reader-app-text);
      transition: width 0.28s ease;
    }
    .startup-overlay__status {
      min-height: 20px;
      margin-top: 14px;
      color: var(--reader-app-muted);
      font-size: 14px;
      line-height: 20px;
      text-align: center;
      letter-spacing: 0.02em;
    }
    @keyframes startup-spin {
      to { transform: rotate(360deg); }
    }
  `;
  document.head.appendChild(style);
};

const createStartupOverlay = () => {
  createStartupStyle();

  const overlay = document.createElement("div");
  overlay.id = overlayId;
  overlay.className = "startup-overlay";
  overlay.setAttribute("role", "status");
  overlay.setAttribute("aria-live", "polite");
  overlay.innerHTML = `
    <div class="startup-overlay__panel">
      <img class="startup-overlay__logo" src="${logoUrl}" alt="阅读" />
      <div class="startup-overlay__loading">
        <div class="startup-overlay__spinner" aria-hidden="true"></div>
        <span>加载中</span>
      </div>
      <div class="startup-overlay__progress" aria-hidden="true">
        <div class="startup-overlay__progress-bar"></div>
      </div>
      <div class="startup-overlay__status">正在检测新版本...</div>
    </div>
  `;
  document.body.appendChild(overlay);
  return overlay;
};

const setOverlayStatus = (overlay, status) => {
  const statusElement = overlay.querySelector(".startup-overlay__status");
  if (statusElement) {
    statusElement.textContent = status;
  }
};

const setOverlayProgress = (overlay, progress) => {
  const progressElement = overlay.querySelector(".startup-overlay__progress-bar");
  if (progressElement) {
    progressElement.style.width = `${Math.max(0, Math.min(100, Math.round(progress)))}%`;
  }
};

const removeStartupOverlay = overlay => {
  overlay.classList.add("startup-overlay--leaving");
  window.setTimeout(() => {
    overlay.remove();
  }, 560);
};

const getApplicationScripts = versionInfo =>
  normalizeStartupAssetList(versionInfo?.assets)
    .filter(asset => asset.endsWith(".js"))
    .filter(asset => !asset.endsWith("/service-worker.js"));

const loadStyles = styles =>
  Promise.all(
    normalizeStartupAssetList(styles).map(styleHref => {
      const href = normalizeStartupAssetPath(styleHref);
      if (!href || loadedStyleLinks.has(href) || document.querySelector(`link[href="${href}"]`)) {
        return Promise.resolve();
      }

      loadedStyleLinks.add(href);
      return new Promise((resolve, reject) => {
        const link = document.createElement("link");
        link.rel = "stylesheet";
        link.href = href;
        link.onload = () => resolve();
        link.onerror = () => reject(new Error(`Stylesheet load failed: ${href}`));
        document.head.appendChild(link);
      });
    })
  );

const preloadScripts = scripts =>
  Promise.all(
    scripts.map(scriptSrc => {
      const src = normalizeStartupAssetPath(scriptSrc);
      if (!src || loadedScriptLinks.has(src) || document.querySelector(`link[href="${src}"]`)) {
        return Promise.resolve();
      }

      loadedScriptLinks.add(src);
      return new Promise((resolve, reject) => {
        const link = document.createElement("link");
        link.rel = "modulepreload";
        link.href = src;
        link.onload = () => resolve();
        link.onerror = () => reject(new Error(`Script preload failed: ${src}`));
        document.head.appendChild(link);
      });
    })
  );

const loadApplication = async versionInfo => {
  const appEntry = normalizeStartupAssetPath(versionInfo?.app?.entry);
  const appStyles = normalizeStartupAssetList(versionInfo?.app?.styles);
  const appScripts = getApplicationScripts(versionInfo);

  await Promise.all([loadStyles(appStyles), preloadScripts(appScripts)]);

  if (appEntry) {
    await import(/* @vite-ignore */ appEntry);
    return;
  }

  await fallbackLoadApplication();
};

const start = async () => {
  const overlay = createStartupOverlay();
  const versionInfo = await runStartupCache({
    onStatus: status => setOverlayStatus(overlay, status),
    onProgress: progress => setOverlayProgress(overlay, progress)
  });

  await hydrateUserStorage();
  await loadApplication(versionInfo);
  removeStartupOverlay(overlay);
};

start().catch(error => {
  console.error(error);
  hydrateUserStorage()
    .catch(console.error)
    .finally(() => fallbackLoadApplication().catch(console.error));
});
