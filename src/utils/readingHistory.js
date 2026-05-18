import { INTRO_STREAM_KEY } from "./readerStream.js";

const getHistoryChapterUrl = book => String(book?.durChapterUrl || "").trim();

export const hasReadingHistory = book => {
  const chapterUrl = getHistoryChapterUrl(book);
  return Number(book?.readingUpdatedAt) > 0 &&
    Number.isFinite(Number(book?.durChapterIndex)) &&
    Boolean(chapterUrl) &&
    chapterUrl !== INTRO_STREAM_KEY;
};
