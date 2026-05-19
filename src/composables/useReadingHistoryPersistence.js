import { watch } from "vue";
import { addHistoryBook } from "../data/bookshelf";
import { clampProgressRatio } from "../utils/readerPagination";

const HISTORY_PERSIST_DELAY = 180;

export const useReadingHistoryPersistence = ({
  activeChapterKey,
  captureReadingHistoryAnchor,
  positionSources = [],
  findChapterStreamItemByAnchor,
  isReaderPositioning,
  loadingVisible,
  readingBook
}) => {
  let historyPersistTimer = 0;

  const buildReadingHistoryBook = () => {
    const anchor = captureReadingHistoryAnchor();
    if (!anchor) return null;

    const item = findChapterStreamItemByAnchor(anchor);
    if (!item) return null;

    const chapterUrl = item.chapter?.chapterUrl || item.chapter?.url || "";
    if (!chapterUrl) return null;

    const { chapterUrl: ignoredChapterUrl, index: ignoredIndex, ...book } = readingBook.value;
    const readingUpdatedAt = Date.now();

    return {
      ...book,
      durChapterIndex: item.index,
      durChapterTitle: item.title || readingBook.value.durChapterTitle || "",
      durChapterUrl: chapterUrl,
      durChapterProgress: clampProgressRatio(anchor.ratio),
      readingUpdatedAt,
      updatedAt: readingUpdatedAt
    };
  };

  const canPersistReadingHistory = () =>
    !loadingVisible.value &&
    !isReaderPositioning.value &&
    Boolean(readingBook.value?.name || readingBook.value?.title);

  const persistReadingHistory = () => {
    if (!canPersistReadingHistory()) return;

    const historyBook = buildReadingHistoryBook();
    if (historyBook) addHistoryBook(historyBook);
  };

  const scheduleReadingHistoryPersist = () => {
    if (historyPersistTimer) window.clearTimeout(historyPersistTimer);
    historyPersistTimer = window.setTimeout(() => {
      historyPersistTimer = 0;
      persistReadingHistory();
    }, HISTORY_PERSIST_DELAY);
  };

  const stopReadingHistoryWatch = watch(
    [readingBook, activeChapterKey, ...positionSources],
    scheduleReadingHistoryPersist,
    { deep: true }
  );

  const cleanupReadingHistoryPersistence = () => {
    stopReadingHistoryWatch();
    if (historyPersistTimer) window.clearTimeout(historyPersistTimer);
    historyPersistTimer = 0;
    persistReadingHistory();
  };

  return {
    cleanupReadingHistoryPersistence,
    persistReadingHistory,
    scheduleReadingHistoryPersist
  };
};
