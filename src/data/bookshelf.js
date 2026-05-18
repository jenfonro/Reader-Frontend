import { getBookIdentityAuthor, getBookIdentityName } from "../utils/bookIdentity.js";
import { INTRO_STREAM_KEY } from "../utils/readerStream.js";
import { readPersistentJson, writePersistentJson } from "./persistentStorage";
import { historyStorageKey, shelfStorageKey } from "./userStorageKeys";

export const bookshelfChangedEvent = "reader-bookshelf-change";

const cloneValue = value => {
  try {
    return JSON.parse(JSON.stringify(value));
  } catch (error) {
    return value;
  }
};

const normalizeString = value => (typeof value === "string" ? value.trim() : "");

export const getBookKey = book => {
  if (!book || typeof book !== "object") return "";

  const name = getBookIdentityName(book);
  const author = getBookIdentityAuthor(book);
  if (name && author) return `book:${name}::${author}`;

  const bookUrl = normalizeString(book.bookUrl || book.url);
  if (name && bookUrl) return `book:${name}::${bookUrl}`;
  return name ? `book:${name}` : bookUrl;
};

const normalizeTimestamp = value => {
  const timestamp = Number(value);
  return Number.isFinite(timestamp) && timestamp > 0 ? timestamp : 0;
};

const hasUnsupportedBookUrlProtocol = value => {
  const protocol = value.match(/^([a-z][a-z\d+.-]*):/i)?.[1]?.toLowerCase();
  return Boolean(protocol && protocol !== "http" && protocol !== "https");
};

export const normalizeShelfBook = book => {
  if (!book || typeof book !== "object") return null;
  const name = normalizeString(book.name || book.title || book.bookName);
  const bookUrl = normalizeString(book.bookUrl || book.url);
  if (hasUnsupportedBookUrlProtocol(bookUrl)) return null;

  const key = getBookKey({ ...book, name, bookUrl });
  if (!key || !name) return null;

  const clonedBook = cloneValue(book);
  delete clonedBook.readingUpdatedAt;

  return {
    ...clonedBook,
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
    durChapterIndex: Number.isFinite(Number(book.durChapterIndex))
      ? Number(book.durChapterIndex)
      : 0,
    durChapterTitle: normalizeString(book.durChapterTitle),
    totalChapterNum: Number.isFinite(Number(book.totalChapterNum))
      ? Number(book.totalChapterNum)
      : Array.isArray(book.catalog)
        ? book.catalog.length
        : 0,
    pinnedAt: normalizeTimestamp(book.pinnedAt),
    durChapterProgress: Math.min(1, Math.max(0, Number(book.durChapterProgress) || 0)),
    updatedAt: normalizeTimestamp(book.updatedAt)
  };
};

const hasRealHistoryChapter = book => {
  const chapterIndex = Number(book?.durChapterIndex);
  const chapterUrl = normalizeString(book?.durChapterUrl);
  return Number.isFinite(chapterIndex) && Boolean(chapterUrl) && chapterUrl !== INTRO_STREAM_KEY;
};

const normalizeHistoryBook = book => {
  const normalizedBook = normalizeShelfBook(book);
  const readingUpdatedAt = normalizeTimestamp(book?.readingUpdatedAt);
  if (!normalizedBook || !readingUpdatedAt || !hasRealHistoryChapter(book)) return null;

  return {
    ...normalizedBook,
    readingUpdatedAt,
    updatedAt: readingUpdatedAt
  };
};

const mergeDuplicateBook = (currentBook, nextBook) => {
  const currentUpdatedAt = normalizeTimestamp(currentBook.updatedAt);
  const nextUpdatedAt = normalizeTimestamp(nextBook.updatedAt);
  const nextIsNewer = nextUpdatedAt > currentUpdatedAt;
  const primaryBook = nextIsNewer ? nextBook : currentBook;
  const secondaryBook = nextIsNewer ? currentBook : nextBook;

  return {
    ...secondaryBook,
    ...primaryBook,
    pinnedAt: Math.max(
      normalizeTimestamp(currentBook.pinnedAt),
      normalizeTimestamp(nextBook.pinnedAt)
    ),
    updatedAt: Math.max(currentUpdatedAt, nextUpdatedAt)
  };
};

const dedupeBookList = books => {
  const bookMap = new Map();

  books.forEach(book => {
    const existingBook = bookMap.get(book.key);
    bookMap.set(book.key, existingBook ? mergeDuplicateBook(existingBook, book) : book);
  });

  return Array.from(bookMap.values());
};

const normalizeBookList = value =>
  dedupeBookList(
    (Array.isArray(value) ? value : [])
      .map(normalizeShelfBook)
      .filter(Boolean)
  );

const readBookList = (key, defaultValue = []) =>
  normalizeBookList(readPersistentJson(key, defaultValue));

const normalizeHistoryBookList = value =>
  dedupeBookList(
    (Array.isArray(value) ? value : [])
      .map(normalizeHistoryBook)
      .filter(Boolean)
  );

const readHistoryBookList = () =>
  normalizeHistoryBookList(readPersistentJson(historyStorageKey, []));

const writeHistoryBookList = books => {
  const nextBooks = normalizeHistoryBookList(books);
  writePersistentJson(historyStorageKey, nextBooks);
  window.dispatchEvent(
    new CustomEvent(bookshelfChangedEvent, {
      detail: { key: historyStorageKey, books: nextBooks }
    })
  );
  return nextBooks;
};

const writeBookList = (key, books) => {
  const nextBooks = normalizeBookList(books);
  writePersistentJson(key, nextBooks);
  window.dispatchEvent(
    new CustomEvent(bookshelfChangedEvent, { detail: { key, books: nextBooks } })
  );
  return nextBooks;
};

const upsertBook = (books, book, { preservePinned = false } = {}) => {
  const normalizedBooks = normalizeBookList(books);
  const key = getBookKey(book);
  const existingBook = key ? normalizedBooks.find(item => item.key === key) : null;
  const pinnedAt = preservePinned
    ? normalizeTimestamp(book?.pinnedAt) || existingBook?.pinnedAt || 0
    : 0;
  const nextBook = normalizeShelfBook({ ...book, pinnedAt, updatedAt: Date.now() });
  if (!nextBook) return normalizedBooks;
  return [nextBook, ...normalizedBooks.filter(item => item.key !== nextBook.key)];
};

const removeBookFromList = (books, book) => {
  const key = getBookKey(book);
  if (!key) return normalizeBookList(books);
  return normalizeBookList(books).filter(item => item.key !== key);
};

const pinBook = (books, book) => {
  const key = getBookKey(book);
  if (!key) return normalizeBookList(books);

  const pinnedAt = Date.now();
  return normalizeBookList(books).map(item =>
    item.key === key ? { ...item, pinnedAt } : item
  );
};

const buildHistoryOrder = () => {
  const historyBooks = readHistoryBookList();
  return new Map(historyBooks.map((book, index) => [book.key, { book, index }]));
};

const getShelfBookSortMeta = (book, historyOrder) => {
  const history = historyOrder.get(book.key);
  return {
    isPinned: book.pinnedAt > 0,
    hasHistory: Boolean(history),
    historyIndex: history?.index ?? Number.MAX_SAFE_INTEGER,
    historyUpdatedAt: history?.book?.updatedAt || 0,
    fallbackUpdatedAt: book.pinnedAt > 0 ? book.pinnedAt : book.updatedAt || 0
  };
};

const compareShelfBooks = (historyOrder, leftBook, rightBook) => {
  const left = getShelfBookSortMeta(leftBook, historyOrder);
  const right = getShelfBookSortMeta(rightBook, historyOrder);

  if (left.isPinned !== right.isPinned) return left.isPinned ? -1 : 1;
  if (left.hasHistory !== right.hasHistory) return left.hasHistory ? -1 : 1;

  if (left.hasHistory && right.hasHistory) {
    const historyTimeDiff = right.historyUpdatedAt - left.historyUpdatedAt;
    if (historyTimeDiff) return historyTimeDiff;
    return left.historyIndex - right.historyIndex;
  }

  const fallbackTimeDiff = right.fallbackUpdatedAt - left.fallbackUpdatedAt;
  if (fallbackTimeDiff) return fallbackTimeDiff;
  return leftBook.name.localeCompare(rightBook.name, "zh-Hans-CN");
};

const sortShelfBooks = books => {
  const historyOrder = buildHistoryOrder();
  return [...normalizeBookList(books)].sort((leftBook, rightBook) =>
    compareShelfBooks(historyOrder, leftBook, rightBook)
  );
};

export const getShelfBooks = () => sortShelfBooks(readBookList(shelfStorageKey));

export const setShelfBooks = books => writeBookList(shelfStorageKey, sortShelfBooks(books));

export const addShelfBook = book =>
  setShelfBooks(upsertBook(getShelfBooks(), book, { preservePinned: true }));

export const removeShelfBook = book => setShelfBooks(removeBookFromList(getShelfBooks(), book));

export const pinShelfBook = book => setShelfBooks(pinBook(getShelfBooks(), book));

export const getHistoryBooks = () => readHistoryBookList();

export const getHistoryBook = book => {
  const key = getBookKey(book);
  if (!key) return null;
  return getHistoryBooks().find(item => item.key === key) || null;
};

export const setHistoryBooks = books => writeHistoryBookList(books);

export const addHistoryBook = book => {
  const key = getBookKey(book);
  const currentBooks = getHistoryBooks();
  const readingUpdatedAt = Date.now();
  const nextBook = normalizeHistoryBook({ ...book, readingUpdatedAt, updatedAt: readingUpdatedAt });
  if (!key || !nextBook) return currentBooks;

  return setHistoryBooks([
    nextBook,
    ...currentBooks.filter(item => item.key !== key)
  ]);
};

export const removeHistoryBook = book =>
  setHistoryBooks(removeBookFromList(getHistoryBooks(), book));

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

  window.addEventListener(bookshelfChangedEvent, handleChange);
  return () => {
    window.removeEventListener(bookshelfChangedEvent, handleChange);
  };
};
