import { ref } from "vue";
import { readSearchableSources, searchBooksBySources } from "./bookSourceSearch.js";
import { summarizeSearchErrors } from "./searchErrors.js";
import { createSearchResultAggregator } from "./searchResultAggregator.js";

export const keyword = ref("");
export const results = ref([]);
export const searched = ref(false);
export const searching = ref(false);
export const searchError = ref("");

let activeSearchKeyword = "";
let searchController = null;
let resultAggregator = createSearchResultAggregator("");
let sourceErrorCount = 0;
let sourceErrors = [];

const appendSearchBooks = books => {
  results.value = resultAggregator.addBooks(books);
};

const cancelSearch = () => {
  if (!searchController) return;
  searchController.abort();
  searchController = null;
};

const resetSearchState = (nextKeyword = "") => {
  results.value = [];
  resultAggregator = createSearchResultAggregator(nextKeyword);
  sourceErrorCount = 0;
  sourceErrors = [];
  searchError.value = "";
};

const handleSearchEvent = event => {
  if (event.type === "source") {
    appendSearchBooks(event.books || []);
    return;
  }
  if (event.type === "source-error") {
    sourceErrorCount += 1;
    sourceErrors.push(event.error);
  }
};

export const clearSearch = () => {
  keyword.value = "";
  activeSearchKeyword = "";
  cancelSearch();
  resetSearchState();
  searched.value = false;
  searching.value = false;
};

export const submitSearch = async () => {
  const value = keyword.value.trim();
  keyword.value = value;
  if (!value) {
    clearSearch();
    return;
  }
  if (value === activeSearchKeyword && (searching.value || searched.value)) return;

  cancelSearch();
  activeSearchKeyword = value;
  resetSearchState(value);
  searched.value = true;
  searching.value = true;

  const sources = readSearchableSources();
  if (!sources.length) {
    searchError.value = "暂无可用书源";
    searching.value = false;
    return;
  }

  const controller = new AbortController();
  searchController = controller;

  try {
    await searchBooksBySources({
      keyword: value,
      signal: controller.signal,
      onEvent: handleSearchEvent
    });
  } catch (error) {
    if (error?.name !== "AbortError") searchError.value = "搜索失败，请稍后再试";
  } finally {
    if (searchController === controller) {
      searchController = null;
      searching.value = false;
      if (!results.value.length && sourceErrorCount > 0 && !searchError.value) {
        searchError.value = summarizeSearchErrors(sourceErrors);
      }
    }
  }
};

export const searchByKeyword = nextKeyword => {
  keyword.value = String(nextKeyword || "");
  return submitSearch();
};
