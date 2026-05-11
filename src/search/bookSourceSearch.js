import { getSourceKey, readBookSources } from "../data/bookSources.js";
import { getSystemSettings } from "../data/systemSettings.js";
import { buildSearchRequest, fetchSearchResponse } from "./legadoUrl.js";
import { toText } from "./legadoCommon.js";
import { analyzeSearchBooks } from "./legadoRules.js";

const isSearchableSource = source =>
  source &&
  source.enabled !== false &&
  Number(source.bookSourceType || 0) === 0 &&
  toText(source.searchUrl).trim() &&
  source.ruleSearch;

export const readSearchableSources = () => readBookSources()
  .map((source, index) => ({
    ...source,
    __sourceKey: getSourceKey(source, index)
  }))
  .filter(isSearchableSource);

export const searchBookSource = async ({ source, keyword, page = 1, signal }) => {
  const request = buildSearchRequest({ source, keyword, page });
  const body = await fetchSearchResponse(request, signal);
  return analyzeSearchBooks({
    body,
    source,
    requestUrl: request.url,
    keyword,
    page,
    variables: request.variables
  }).map(book => ({
    ...book,
    sourceKey: source.__sourceKey || book.sourceKey || ""
  }));
};

export const searchBooksBySources = async ({
  keyword,
  page = 1,
  signal,
  onEvent
} = {}) => {
  const normalizedKeyword = toText(keyword).trim();
  if (!normalizedKeyword) return [];

  const sources = readSearchableSources();
  const concurrency = Math.max(1, getSystemSettings().searchConcurrency || 24);
  const results = [];
  let cursor = 0;

  const runNext = async () => {
    while (cursor < sources.length) {
      if (signal?.aborted) throw new DOMException("Aborted", "AbortError");
      const source = sources[cursor++];
      try {
        const books = await searchBookSource({ source, keyword: normalizedKeyword, page, signal });
        if (books.length) {
          results.push(...books);
          onEvent?.({ type: "source", source, books });
        } else {
          onEvent?.({ type: "source-empty", source, books: [] });
        }
      } catch (error) {
        if (signal?.aborted || error?.name === "AbortError") throw error;
        onEvent?.({ type: "source-error", source, error });
      }
    }
  };

  await Promise.all(
    Array.from({ length: Math.min(concurrency, sources.length) }, () => runNext())
  );
  onEvent?.({ type: "done", sources, books: results });
  return results;
};
