import { findBookSourceByKey, getSourceKey, readBookSources } from "../data/bookSources.js";
import {
  analyzeBookCatalogPage,
  analyzeBookInfo,
  analyzeChapterContentPage,
  finalizeBookCatalog,
  finalizeChapterContent
} from "./legadoBookRules.js";
import { normalizeBaseUrl, toText } from "./legadoCommon.js";
import { buildLegadoRequest, fetchLegadoResponse } from "./legadoUrl.js";

const MAX_FOLLOW_PAGES = 10;

const normalizeUrl = value => toText(value).trim().replace(/\/+$/, "");

const sameUrl = (left, right) => normalizeUrl(left) === normalizeUrl(right);

const addSourceKey = (source, index = 0) => ({
  ...source,
  __sourceKey: source.__sourceKey || getSourceKey(source, index)
});

export const findSourceForBook = (book = {}) => {
  if (book.sourceKey) {
    const source = findBookSourceByKey(book.sourceKey);
    if (source) return addSourceKey(source);
  }

  const sources = readBookSources();
  const bookOrigin = normalizeUrl(book.origin || book.bookSourceUrl || book.sourceUrl);
  const bookSourceName = toText(book.originName || book.sourceName).trim();
  const matchedIndex = sources.findIndex(source => {
    const sourceUrl = normalizeUrl(source.bookSourceUrl);
    const sourceName = toText(source.bookSourceName).trim();
    return (bookOrigin && sourceUrl === bookOrigin) || (bookSourceName && sourceName === bookSourceName);
  });

  return matchedIndex >= 0 ? addSourceKey(sources[matchedIndex], matchedIndex) : null;
};

const createRuntimeVariables = () => new Map();

const fetchRuntimeBody = async ({ source, ruleUrl, baseUrl, book, chapter, variables, signal }) => {
  const request = buildLegadoRequest({
    source,
    ruleUrl,
    baseUrl,
    variables,
    book,
    chapter
  });
  const body = await fetchLegadoResponse(request, signal);
  return { body, requestUrl: request.url, variables: request.variables };
};

export const loadBookInfo = async ({ source, book, signal }) => {
  const variables = createRuntimeVariables();
  const bookUrl = book.bookUrl || book.url;
  if (!bookUrl) throw new Error("书籍地址为空");
  const { body, requestUrl } = await fetchRuntimeBody({
    source,
    ruleUrl: bookUrl,
    baseUrl: bookUrl || normalizeBaseUrl(source.bookSourceUrl),
    book,
    variables,
    signal
  });
  return analyzeBookInfo({ body, source, book, requestUrl, variables });
};

export const loadBookCatalog = async ({ source, book, signal }) => {
  const variables = createRuntimeVariables();
  const firstTocUrl = book.tocUrl || book.bookUrl || book.url;
  if (!firstTocUrl) throw new Error("目录地址为空");

  const queue = [firstTocUrl];
  const seen = new Set();
  const chapters = [];
  let reverse = false;

  for (let page = 0; page < MAX_FOLLOW_PAGES && queue.length; page += 1) {
    const tocUrl = queue.shift();
    const normalizedTocUrl = normalizeUrl(tocUrl);
    if (!normalizedTocUrl || seen.has(normalizedTocUrl)) continue;
    seen.add(normalizedTocUrl);

    let body = "";
    let requestUrl = tocUrl;
    if (page === 0 && book.tocHtml && sameUrl(tocUrl, book.tocUrl || book.bookUrl)) {
      body = book.tocHtml;
    } else {
      const response = await fetchRuntimeBody({
        source,
        ruleUrl: tocUrl,
        baseUrl: book.bookUrl || book.tocUrl || normalizeBaseUrl(source.bookSourceUrl),
        book,
        variables,
        signal
      });
      body = response.body;
      requestUrl = response.requestUrl;
    }

    const pageResult = analyzeBookCatalogPage({ body, source, book, requestUrl, variables });
    reverse = reverse || pageResult.reverse;
    chapters.push(...pageResult.chapters);
    pageResult.nextTocUrls.forEach(nextUrl => {
      const normalizedNextUrl = normalizeUrl(nextUrl);
      if (normalizedNextUrl && !seen.has(normalizedNextUrl)) queue.push(nextUrl);
    });
  }

  return finalizeBookCatalog(chapters, reverse);
};

const isVolumeChapter = chapter => {
  const chapterUrl = chapter.chapterUrl || chapter.url;
  const chapterTitle = chapter.title || chapter.name;
  return chapter.isVolume && chapterTitle && toText(chapterUrl).startsWith(chapterTitle);
};

export const loadChapterContent = async ({ source, book, chapter, signal }) => {
  const variables = createRuntimeVariables();
  const firstChapterUrl = chapter.chapterUrl || chapter.url;
  if (!firstChapterUrl) throw new Error("章节地址为空");

  if (isVolumeChapter(chapter)) {
    return {
      chapterUrl: firstChapterUrl,
      chapter,
      title: chapter.title || chapter.name || "",
      content: chapter.updateTime || chapter.time || "",
      imageStyle: "",
      nextUrls: []
    };
  }

  const queue = [firstChapterUrl];
  const seen = new Set();
  const parts = [];
  const visitedUrls = [];
  let firstUrl = firstChapterUrl;
  let title = chapter.title || chapter.name || "";
  let imageStyle = "";

  for (let page = 0; page < MAX_FOLLOW_PAGES && queue.length; page += 1) {
    const chapterUrl = queue.shift();
    const normalizedChapterUrl = normalizeUrl(chapterUrl);
    if (!normalizedChapterUrl || seen.has(normalizedChapterUrl)) continue;
    seen.add(normalizedChapterUrl);

    const { body, requestUrl } = await fetchRuntimeBody({
      source,
      ruleUrl: chapterUrl,
      baseUrl: book.tocUrl || book.bookUrl || normalizeBaseUrl(source.bookSourceUrl),
      book,
      chapter,
      variables,
      signal
    });
    if (page === 0) firstUrl = requestUrl;
    visitedUrls.push(requestUrl);

    const pageResult = analyzeChapterContentPage({
      body,
      source,
      book,
      chapter,
      requestUrl,
      variables
    });
    if (pageResult.title) title = pageResult.title;
    if (pageResult.imageStyle) imageStyle = pageResult.imageStyle;
    if (pageResult.content) parts.push(pageResult.content);
    pageResult.nextContentUrls.forEach(nextUrl => {
      const normalizedNextUrl = normalizeUrl(nextUrl);
      if (normalizedNextUrl && !seen.has(normalizedNextUrl)) queue.push(nextUrl);
    });
  }

  const content = finalizeChapterContent({
    content: parts.join("\n"),
    source,
    book,
    chapter,
    requestUrl: firstUrl,
    variables
  });

  return {
    chapterUrl: firstUrl,
    chapter: {
      ...chapter,
      title,
      name: title,
      chapterUrl: firstUrl,
      url: firstUrl
    },
    title,
    content,
    imageStyle,
    nextUrls: visitedUrls
  };
};
