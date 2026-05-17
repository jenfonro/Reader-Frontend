import { readPersistentJson, writePersistentJson } from "./persistentStorage";
import { systemSettingsStorageKey } from "./userStorageKeys";

export const systemSettingsChangedEvent = "reader-system-settings-change";

const defaultSystemSettings = {
  siteName: "开源阅读",
  searchConcurrency: 24
};

const normalizeSearchConcurrency = value => {
  const parsed = Number(value);
  return Number.isFinite(parsed) && parsed > 0 ? Math.floor(parsed) : 24;
};

const normalizeSystemSettings = value => ({
  ...defaultSystemSettings,
  ...(value && typeof value === "object" ? value : {}),
  siteName:
    value && typeof value.siteName === "string" && value.siteName.trim()
      ? value.siteName.trim()
      : defaultSystemSettings.siteName,
  searchConcurrency: normalizeSearchConcurrency(value && value.searchConcurrency)
});

export const getSystemSettings = () =>
  normalizeSystemSettings(readPersistentJson(systemSettingsStorageKey, null));

export const setSystemSettings = settings => {
  const nextSettings = normalizeSystemSettings(settings);
  writePersistentJson(systemSettingsStorageKey, nextSettings);
  window.dispatchEvent(new CustomEvent(systemSettingsChangedEvent, { detail: nextSettings }));
  return nextSettings;
};

export const setSystemSetting = (key, value) =>
  setSystemSettings({
    ...getSystemSettings(),
    [key]: value
  });

export const subscribeSystemSettings = handler => {
  if (typeof window === "undefined" || typeof handler !== "function") return () => {};

  const handleChange = event => {
    handler(normalizeSystemSettings(event && event.detail ? event.detail : getSystemSettings()));
  };

  window.addEventListener(systemSettingsChangedEvent, handleChange);
  return () => {
    window.removeEventListener(systemSettingsChangedEvent, handleChange);
  };
};
