import { hasReadingHistory } from "./readingHistory.js";
import { INTRO_STREAM_INDEX, INTRO_STREAM_KEY, INTRO_STREAM_TYPE } from "./readerStream.js";

export const createEmptyBook = () => ({
  name: "",
  title: "",
  bookUrl: "",
  durChapterIndex: 0
});

export const createInitialBook = book => (book ? { ...book } : createEmptyBook());

export const createIntroStreamItem = book => ({
  key: INTRO_STREAM_KEY,
  type: INTRO_STREAM_TYPE,
  index: INTRO_STREAM_INDEX,
  title: "简介",
  content: "",
  chapter: {
    index: INTRO_STREAM_INDEX,
    title: "简介",
    name: "简介",
    chapterUrl: INTRO_STREAM_KEY,
    url: INTRO_STREAM_KEY
  },
  book
});

const normalizeUrl = value => String(value || "").trim().replace(/\/+$/, "");

export const createSwitchedBook = ({ selectedBook, source, previousBook, targetIndex }) => {
  const bookUrl = selectedBook.bookUrl || selectedBook.url || "";
  const name = selectedBook.name || selectedBook.title || previousBook.name || previousBook.title || "";
  const sourceName = source.bookSourceName || selectedBook.originName || selectedBook.sourceName || "";
  const origin = normalizeUrl(source.bookSourceUrl || selectedBook.origin || selectedBook.bookSourceUrl);

  return {
    name,
    title: name,
    author: selectedBook.author || previousBook.author || "",
    intro: selectedBook.intro || previousBook.intro || "",
    kind: selectedBook.kind || previousBook.kind || "",
    wordCount: selectedBook.wordCount || previousBook.wordCount || "",
    coverUrl: selectedBook.coverUrl || selectedBook.cover || previousBook.coverUrl || previousBook.cover || "",
    imageUrl: selectedBook.imageUrl || selectedBook.coverUrl || previousBook.imageUrl || previousBook.coverUrl || "",
    tags: selectedBook.tags || previousBook.tags || [],
    latestChapterTitle: selectedBook.latestChapterTitle || selectedBook.latestChapter || "",
    lastChapter: selectedBook.latestChapterTitle || selectedBook.latestChapter || "",
    bookUrl,
    url: bookUrl,
    tocUrl: selectedBook.tocUrl || "",
    origin,
    bookSourceUrl: origin,
    originName: sourceName,
    sourceName,
    sourceGroup: source.bookSourceGroup || selectedBook.sourceGroup || "",
    sourceKey: source.__sourceKey || selectedBook.sourceKey || "",
    sourceCount: selectedBook.sourceCount || previousBook.sourceCount || 1,
    sources: selectedBook.sources || [selectedBook],
    durChapterIndex: targetIndex,
    durChapterTitle: previousBook.durChapterTitle || ""
  };
};

export const getChapterKey = chapter =>
  String(chapter?.chapterUrl || chapter?.url || (chapter?.index ?? chapter?.title ?? chapter?.name ?? ""));

export const toChapterIndex = value => {
  const index = Number(value);
  return Number.isFinite(index) ? Math.max(0, Math.trunc(index)) : 0;
};

export const createChapterStreamItem = (chapter, result = {}) => {
  const index = toChapterIndex(chapter?.index);
  const title = result.title || chapter?.title || chapter?.name || "";

  return {
    key: getChapterKey(chapter) || `chapter-${index}`,
    index,
    title,
    content: result.content || "正文为空",
    chapter
  };
};

export const hasBookUrl = book => Boolean(String(book?.bookUrl || book?.url || "").trim());

export const getHistoryChapter = book => {
  if (!hasReadingHistory(book)) return null;

  const index = toChapterIndex(book.durChapterIndex);
  const chapterUrl = book.durChapterUrl || "";
  const title = book.durChapterTitle || `第${index + 1}章`;

  return {
    index,
    title,
    name: title,
    chapterUrl,
    url: chapterUrl
  };
};
