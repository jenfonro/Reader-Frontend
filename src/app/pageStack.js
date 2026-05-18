import { createReaderBookFromSearchResult } from "../search/searchResultBook.js";

export const PAGE_HOME = "home";
export const PAGE_READER = "reader";
export const PAGE_SEARCH = "search";
export const PAGE_SYSTEM_SETTINGS = "settings-system";
export const PAGE_API_SETTINGS = "settings-api";
export const PAGE_EDGEONE_SETTINGS = "settings-edgeone";
export const PAGE_INTERFACE_SETTINGS = "settings-interface";
export const PAGE_BOOK_SOURCES = "settings-sources";
export const PAGE_REPLACE_RULES = "settings-replace";
export const PAGE_SOURCE_EDITOR = "source-editor";
export const PAGE_REPLACE_EDITOR = "replace-editor";
export const PAGE_SETTINGS_DETAIL = "settings-detail";
export const HOME_ACTIVE_DEFAULT = "home";

export const createHomePage = (activeKey = HOME_ACTIVE_DEFAULT) => ({
  name: PAGE_HOME,
  activeKey: activeKey || HOME_ACTIVE_DEFAULT
});

export const normalizeReaderBook = book => {
  if (!book || typeof book !== "object" || Array.isArray(book)) return null;
  try {
    return JSON.parse(JSON.stringify(createReaderBookFromSearchResult(book)));
  } catch (error) {
    return createReaderBookFromSearchResult(book);
  }
};

export const normalizePage = value => {
  if (value?.name === PAGE_READER) {
    return {
      name: PAGE_READER,
      book: normalizeReaderBook(value.book || value.readerBook)
    };
  }
  if (value?.name === PAGE_SEARCH) return { name: PAGE_SEARCH };
  if (value?.name === PAGE_SYSTEM_SETTINGS) return { name: PAGE_SYSTEM_SETTINGS };
  if (value?.name === PAGE_API_SETTINGS) return { name: PAGE_API_SETTINGS };
  if (value?.name === PAGE_EDGEONE_SETTINGS) return { name: PAGE_EDGEONE_SETTINGS };
  if (value?.name === PAGE_INTERFACE_SETTINGS) return { name: PAGE_INTERFACE_SETTINGS };
  if (value?.name === PAGE_BOOK_SOURCES) return { name: PAGE_BOOK_SOURCES };
  if (value?.name === PAGE_REPLACE_RULES) return { name: PAGE_REPLACE_RULES };
  if (value?.name === PAGE_SOURCE_EDITOR) {
    return {
      name: PAGE_SOURCE_EDITOR,
      sourceKey: typeof value.sourceKey === "string" ? value.sourceKey : "",
      sourceName: typeof value.sourceName === "string" ? value.sourceName : ""
    };
  }
  if (value?.name === PAGE_REPLACE_EDITOR) {
    return {
      name: PAGE_REPLACE_EDITOR,
      ruleKey: typeof value.ruleKey === "string" ? value.ruleKey : "",
      ruleName: typeof value.ruleName === "string" ? value.ruleName : ""
    };
  }
  if (value?.name === PAGE_SETTINGS_DETAIL) {
    return {
      name: PAGE_SETTINGS_DETAIL,
      settingKey: typeof value.settingKey === "string" ? value.settingKey : ""
    };
  }
  return createHomePage(value?.activeKey);
};

export const getHistoryPage = stateValue => {
  if (typeof window === "undefined") return createHomePage();
  const state = stateValue === undefined ? window.history.state : stateValue;
  if (state?.appPage) return normalizePage(state.appPage);
  return normalizePage(state);
};

export const writeHistoryPage = (page, mode = "replace") => {
  const normalizedPage = normalizePage(page);
  const method = mode === "push" ? "pushState" : "replaceState";
  window.history[method]({ appPage: normalizedPage }, "", window.location.href);
  return normalizedPage;
};
