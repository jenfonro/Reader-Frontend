const uiPreferencesStorageKey = "reader.ui.preferences";
export const uiPreferencesChangedEvent = "reader-ui-preferences-change";

const defaultUiPreferences = {
  fullscreenMode: false
};

const canUseLocalStorage = () =>
  typeof window !== "undefined" && Boolean(window.localStorage);

const normalizeUiPreferences = value => ({
  ...defaultUiPreferences,
  ...(value && typeof value === "object" ? value : {}),
  fullscreenMode: Boolean(value && value.fullscreenMode)
});

export const getUiPreferences = () => {
  if (!canUseLocalStorage()) return { ...defaultUiPreferences };
  try {
    const raw = window.localStorage.getItem(uiPreferencesStorageKey);
    return normalizeUiPreferences(raw ? JSON.parse(raw) : null);
  } catch (error) {
    return { ...defaultUiPreferences };
  }
};

export const setUiPreferences = preferences => {
  const nextPreferences = normalizeUiPreferences(preferences);
  if (!canUseLocalStorage()) return nextPreferences;

  try {
    window.localStorage.setItem(uiPreferencesStorageKey, JSON.stringify(nextPreferences));
  } catch (error) {
    return nextPreferences;
  }
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
  const handleStorage = event => {
    if (event.key === uiPreferencesStorageKey) handler(getUiPreferences());
  };

  window.addEventListener(uiPreferencesChangedEvent, handleChange);
  window.addEventListener("storage", handleStorage);
  return () => {
    window.removeEventListener(uiPreferencesChangedEvent, handleChange);
    window.removeEventListener("storage", handleStorage);
  };
};
