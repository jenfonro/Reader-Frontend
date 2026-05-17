import { readPersistentJson, writePersistentJson } from "./persistentStorage";
import { uiPreferencesStorageKey } from "./userStorageKeys";

export const uiPreferencesChangedEvent = "reader-ui-preferences-change";

const defaultUiPreferences = {
  fullscreenMode: false
};

const normalizeUiPreferences = value => ({
  ...defaultUiPreferences,
  ...(value && typeof value === "object" ? value : {}),
  fullscreenMode: Boolean(value && value.fullscreenMode)
});

export const getUiPreferences = () =>
  normalizeUiPreferences(readPersistentJson(uiPreferencesStorageKey, null));

export const setUiPreferences = preferences => {
  const nextPreferences = normalizeUiPreferences(preferences);
  writePersistentJson(uiPreferencesStorageKey, nextPreferences);
  window.dispatchEvent(new CustomEvent(uiPreferencesChangedEvent, { detail: nextPreferences }));
  return nextPreferences;
};

export const setUiPreference = (key, value) =>
  setUiPreferences({
    ...getUiPreferences(),
    [key]: value
  });

export const subscribeUiPreferences = handler => {
  if (typeof window === "undefined" || typeof handler !== "function") return () => {};

  const handleChange = event => {
    handler(normalizeUiPreferences(event && event.detail ? event.detail : getUiPreferences()));
  };

  window.addEventListener(uiPreferencesChangedEvent, handleChange);
  return () => {
    window.removeEventListener(uiPreferencesChangedEvent, handleChange);
  };
};
