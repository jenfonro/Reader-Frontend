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

const applyUiPreferencesToDocument = preferences => {
  if (typeof document === "undefined") return;

  const nextPreferences = normalizeUiPreferences(preferences);
  const root = document.documentElement;
  root.classList.toggle("reader-ui-fullscreen-mode", nextPreferences.fullscreenMode);
  root.style.setProperty(
    "--reader-ui-mobile-nav-bottom",
    nextPreferences.fullscreenMode ? "6px" : "calc(16px + env(safe-area-inset-bottom))"
  );
};

export const getUiPreferences = () =>
  normalizeUiPreferences(readPersistentJson(uiPreferencesStorageKey, null));

export const syncUiPreferencesToDocument = () => {
  const preferences = getUiPreferences();
  applyUiPreferencesToDocument(preferences);
  return preferences;
};

export const setUiPreferences = preferences => {
  const nextPreferences = normalizeUiPreferences(preferences);
  writePersistentJson(uiPreferencesStorageKey, nextPreferences);
  applyUiPreferencesToDocument(nextPreferences);
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
  handler(syncUiPreferencesToDocument());

  return () => {
    window.removeEventListener(uiPreferencesChangedEvent, handleChange);
  };
};
