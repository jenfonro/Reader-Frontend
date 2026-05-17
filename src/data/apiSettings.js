import { readPersistentJson, writePersistentJson } from "./persistentStorage";
import { apiSettingsStorageKey } from "./userStorageKeys";

export const apiSettingsChangedEvent = "reader-api-settings-change";

const defaultApiSettings = {
  edgeOneUrl: "",
  edgeOneSecret: ""
};

const normalizeText = value => (typeof value === "string" ? value.trim() : "");

const normalizeApiSettings = value => ({
  ...defaultApiSettings,
  ...(value && typeof value === "object" ? value : {}),
  edgeOneUrl: normalizeText(value && value.edgeOneUrl),
  edgeOneSecret: normalizeText(value && value.edgeOneSecret)
});

export const getApiSettings = () =>
  normalizeApiSettings(readPersistentJson(apiSettingsStorageKey, null));

export const setApiSettings = settings => {
  const nextSettings = normalizeApiSettings(settings);
  writePersistentJson(apiSettingsStorageKey, nextSettings);
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

  window.addEventListener(apiSettingsChangedEvent, handleChange);
  return () => {
    window.removeEventListener(apiSettingsChangedEvent, handleChange);
  };
};
