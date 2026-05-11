const systemSettingsStorageKey = "reader.system.settings";
export const systemSettingsChangedEvent = "reader-system-settings-change";

const defaultSystemSettings = {
  siteName: "开源阅读",
  searchConcurrency: 24
};

const canUseLocalStorage = () =>
  typeof window !== "undefined" && Boolean(window.localStorage);

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

export const getSystemSettings = () => {
  if (!canUseLocalStorage()) return { ...defaultSystemSettings };
  try {
    const raw = window.localStorage.getItem(systemSettingsStorageKey);
    return normalizeSystemSettings(raw ? JSON.parse(raw) : null);
  } catch (error) {
    return { ...defaultSystemSettings };
  }
};

export const setSystemSettings = settings => {
  const nextSettings = normalizeSystemSettings(settings);
  if (!canUseLocalStorage()) return nextSettings;

  try {
    window.localStorage.setItem(systemSettingsStorageKey, JSON.stringify(nextSettings));
  } catch (error) {
    return nextSettings;
  }
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
  const handleStorage = event => {
    if (event.key === systemSettingsStorageKey) handler(getSystemSettings());
  };

  window.addEventListener(systemSettingsChangedEvent, handleChange);
  window.addEventListener("storage", handleStorage);
  return () => {
    window.removeEventListener(systemSettingsChangedEvent, handleChange);
    window.removeEventListener("storage", handleStorage);
  };
};
