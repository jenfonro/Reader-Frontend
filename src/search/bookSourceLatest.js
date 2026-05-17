import { findSourceForBook, loadBookCatalog, loadBookInfo } from "./bookSourceRuntime.js";
import { toText } from "./legadoCommon.js";

export const getBookLatestChapterTitle = book =>
  toText(book?.latestChapterTitle || book?.latestChapter || book?.lastChapter).trim();

export const getBookAuthorName = book => toText(book?.author).trim();

export const getBookChapterCount = book => {
  const totalChapterNum = Number(book?.totalChapterNum || book?.chapterCount || 0);
  if (Number.isFinite(totalChapterNum) && totalChapterNum > 0) return totalChapterNum;
  return Array.isArray(book?.catalog) ? book.catalog.length : 0;
};

const getCatalogLatestChapterTitle = catalog => {
  if (!Array.isArray(catalog) || !catalog.length) return "";
  const latestChapter = catalog[catalog.length - 1];
  return toText(latestChapter?.title || latestChapter?.name).trim();
};

const withLatestChapter = (book, latestChapterTitle, patch = {}) => {
  if (!latestChapterTitle) return { ...book, ...patch };
  return {
    ...book,
    ...patch,
    latestChapterTitle,
    latestChapter: latestChapterTitle,
    lastChapter: latestChapterTitle
  };
};

export const enrichBookCatalogSummary = async ({ book, signal } = {}) => {
  const source = findSourceForBook(book || {});
  if (!source) return book;

  let detailBook = book;
  try {
    detailBook = await loadBookInfo({ source, book, signal });
  } catch (error) {
    if (error?.name === "AbortError") throw error;
  }

  try {
    const catalog = await loadBookCatalog({ source, book: detailBook || book, signal });
    const catalogLatestChapter = getCatalogLatestChapterTitle(catalog);
    const latestChapterTitle = catalogLatestChapter || getBookLatestChapterTitle(detailBook) || getBookLatestChapterTitle(book);
    return withLatestChapter(book, latestChapterTitle, {
      ...detailBook,
      catalog,
      totalChapterNum: Array.isArray(catalog) ? catalog.length : 0
    });
  } catch (error) {
    if (error?.name === "AbortError") throw error;
    return withLatestChapter(book, "", detailBook);
  }
};

export const enrichBookLatestChapter = async ({ book, signal } = {}) => {
  const currentLatestChapter = getBookLatestChapterTitle(book);
  const currentAuthor = getBookAuthorName(book);
  if (currentLatestChapter && currentAuthor) return withLatestChapter(book, currentLatestChapter);
  return enrichBookCatalogSummary({ book, signal });
};
