import { previewShelfBooks } from "../previewData";

const shelfStorageKey = "reader.bookshelf.items";
const historyStorageKey = "reader.reading.history";
export const bookshelfChangedEvent = "reader-bookshelf-change";

const canUseLocalStorage = () =>
  typeof window !== "undefined" && Boolean(window.localStorage);

const cloneValue = value => {
  try {
    return JSON.parse(JSON.stringify(value));
  } catch (error) {
    return value;
  }
};

export const getBookKey = book => {
  if (!book || typeof book !== "object") return "";
  return String(
    book.bookUrl ||
      book.url ||
      book.bookName ||
      [book.name || book.title || "", book.author || "", book.origin || ""].join("::")
  );
};

const normalizeString = value => (typeof value === "string" ? value.trim() : "");

export const normalizeShelfBook = book => {
  if (!book || typeof book !== "object") return null;
  const name = normalizeString(book.name || book.title || book.bookName);
  const bookUrl = normalizeString(book.bookUrl || book.url);
  const key = getBookKey({ ...book, name, bookUrl });
  if (!key || !name) return null;

  return {
    ...cloneValue(book),
    key,
    name,
    title: name,
    author: normalizeString(book.author),
    bookUrl,
    coverUrl: normalizeString(book.coverUrl || book.cover),
    intro: normalizeString(book.intro),
    origin: normalizeString(book.origin),
    originName: normalizeString(book.originName || book.bookSourceName),
    latestChapterTitle: normalizeString(book.latestChapterTitle || book.latestChapter),
    durChapterIndex: Number.isFinite(Number(book.durChapterIndex ?? book.index))
      ? Number(book.durChapterIndex ?? book.index)
      : 0,
    durChapterTitle: normalizeString(
      book.durChapterTitle || book.chapterTitle || book.latestChapterTitle || book.latestChapter
    ),
    totalChapterNum: Number.isFinite(Number(book.totalChapterNum))
      ? Number(book.totalChapterNum)
      : Array.isArray(book.catalog)
        ? book.catalog.length
        : 0,
    updatedAt: Number(book.updatedAt || book.durChapterTime || Date.now())
  };
};

const normalizeBookList = value =>
  (Array.isArray(value) ? value : [])
    .map(normalizeShelfBook)
    .filter(Boolean);

const readBookList = (key, fallback = []) => {
  if (!canUseLocalStorage()) return normalizeBookList(fallback);
  try {
    const raw = window.localStorage.getItem(key);
    return normalizeBookList(raw ? JSON.parse(raw) : fallback);
  } catch (error) {
    return normalizeBookList(fallback);
  }
};

const writeBookList = (key, books) => {
  const nextBooks = normalizeBookList(books);
  if (!canUseLocalStorage()) return nextBooks;
  try {
    window.localStorage.setItem(key, JSON.stringify(nextBooks));
  } catch (error) {
    return nextBooks;
  }
  window.dispatchEvent(
    new CustomEvent(bookshelfChangedEvent, { detail: { key, books: nextBooks } })
  );
  return nextBooks;
};

const upsertBook = (books, book) => {
  const nextBook = normalizeShelfBook({ ...book, updatedAt: Date.now() });
  if (!nextBook) return normalizeBookList(books);
  const nextBooks = normalizeBookList(books).filter(item => item.key !== nextBook.key);
  return [nextBook, ...nextBooks];
};

export const getShelfBooks = () => readBookList(shelfStorageKey, previewShelfBooks);

export const setShelfBooks = books => writeBookList(shelfStorageKey, books);

export const addShelfBook = book => setShelfBooks(upsertBook(getShelfBooks(), book));

export const getHistoryBooks = () => readBookList(historyStorageKey, []);

export const setHistoryBooks = books => writeBookList(historyStorageKey, books);

export const addHistoryBook = book => setHistoryBooks(upsertBook(getHistoryBooks(), book));

export const isBookInShelf = book => {
  const key = getBookKey(book);
  if (!key) return false;
  return getShelfBooks().some(item => item.key === key);
};

export const subscribeBookshelf = handler => {
  if (typeof window === "undefined" || typeof handler !== "function") return () => {};

  const handleChange = () => {
    handler({ shelfBooks: getShelfBooks(), historyBooks: getHistoryBooks() });
  };
  const handleStorage = event => {
    if (event.key === shelfStorageKey || event.key === historyStorageKey) handleChange();
  };

  window.addEventListener(bookshelfChangedEvent, handleChange);
  window.addEventListener("storage", handleStorage);
  return () => {
    window.removeEventListener(bookshelfChangedEvent, handleChange);
    window.removeEventListener("storage", handleStorage);
  };
};
