const apiSettingsStorageKey = "reader.api.settings";
export const apiSettingsChangedEvent = "reader-api-settings-change";

const defaultApiSettings = {
  edgeOneUrl: "",
  edgeOneSecret: ""
};

const canUseLocalStorage = () =>
  typeof window !== "undefined" && Boolean(window.localStorage);

const normalizeText = value => (typeof value === "string" ? value.trim() : "");

const normalizeApiSettings = value => ({
  ...defaultApiSettings,
  ...(value && typeof value === "object" ? value : {}),
  edgeOneUrl: normalizeText(value && value.edgeOneUrl),
  edgeOneSecret: normalizeText(value && value.edgeOneSecret)
});

export const getApiSettings = () => {
  if (!canUseLocalStorage()) return { ...defaultApiSettings };
  try {
    const raw = window.localStorage.getItem(apiSettingsStorageKey);
    return normalizeApiSettings(raw ? JSON.parse(raw) : null);
  } catch (error) {
    return { ...defaultApiSettings };
  }
};

export const setApiSettings = settings => {
  const nextSettings = normalizeApiSettings(settings);
  if (!canUseLocalStorage()) return nextSettings;

  try {
    window.localStorage.setItem(apiSettingsStorageKey, JSON.stringify(nextSettings));
  } catch (error) {
    return nextSettings;
  }
  window.dispatchEvent(new CustomEvent(apiSettingsChangedEvent, { detail: nextSettings }));
  return nextSettings;
};

export const setApiSetting = (key, value) =>
  setApiSettings({
    ...getApiSettings(),
    [key]: value
  });

export const subscribeApiSettings = handler => {
  if (typeof window === "undefined" || typeof handler !== "function") return () => {};

  const handleChange = event => {
    handler(normalizeApiSettings(event && event.detail ? event.detail : getApiSettings()));
  };
  const handleStorage = event => {
    if (event.key === apiSettingsStorageKey) handler(getApiSettings());
  };

  window.addEventListener(apiSettingsChangedEvent, handleChange);
  window.addEventListener("storage", handleStorage);
  return () => {
    window.removeEventListener(apiSettingsChangedEvent, handleChange);
    window.removeEventListener("storage", handleStorage);
  };
};
