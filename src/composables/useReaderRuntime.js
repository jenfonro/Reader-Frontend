import { computed, ref } from "vue";
import { isIntroStreamItem } from "../utils/readerStream.js";
import {
  findSourceForBook,
  loadBookCatalog,
  loadBookInfo,
  loadChapterContent
} from "../search/bookSourceRuntime.js";
import { useReaderTaskControllers } from "./useReaderTaskControllers.js";
import {
  createChapterStreamItem,
  createEmptyBook,
  createInitialBook,
  createIntroStreamItem,
  createSwitchedBook,
  getChapterKey,
  getHistoryChapter,
  hasBookUrl,
  toChapterIndex
} from "../utils/readerRuntimeBook.js";

export const useReaderRuntime = () => {
  const title = ref("");
  const chapterContent = ref("");
  const error = ref(false);
  const loadingVisible = ref(false);
  const loadingText = ref("正在加载");
  const introLoading = ref(false);
  const catalogLoading = ref(false);
  const currentSource = ref(null);
  const contentStyle = ref({});
  const readingBook = ref(createEmptyBook());
  const catalog = ref([]);
  const chapterStream = ref([]);
  const bookInfoLoaded = ref(false);
  const chapterContentCache = new Map();
  const {
    abortReaderTask,
    clearBookInfoTask,
    clearReaderTask,
    runStreamTask,
    startBookInfoTask,
    startReaderTask
  } = useReaderTaskControllers({
    onAbortBookInfo: () => {
      introLoading.value = false;
    },
    onAbortReader: () => {
      loadingVisible.value = false;
      catalogLoading.value = false;
    }
  });

  const chapterIndex = computed(() => toChapterIndex(readingBook.value.durChapterIndex));

  const setIntroStream = () => {
    error.value = false;
    loadingVisible.value = false;
    title.value = readingBook.value.name || readingBook.value.title || "";
    chapterContent.value = "";
    chapterStream.value = [createIntroStreamItem(readingBook.value)];
  };

  const setChapterStreamCurrent = (chapter, result = {}) => {
    const item = createChapterStreamItem(chapter, result);
    chapterStream.value = [item];
    return item;
  };

  const applyChapterContent = (chapter, result = {}) => {
    const nextTitle = result.title || chapter.title || chapter.name || "";
    const nextContent = result.content || "正文为空";
    const nextChapterUrl = result.chapter?.chapterUrl || result.chapter?.url || chapter.chapterUrl || chapter.url || "";
    title.value = nextTitle;
    chapterContent.value = nextContent;
    chapterContentCache.set(getChapterKey(chapter), { title: nextTitle, content: nextContent });
    const item = setChapterStreamCurrent(chapter, { ...result, title: nextTitle, content: nextContent });
    const nextIndex = toChapterIndex(chapter.index);
    readingBook.value = {
      ...readingBook.value,
      durChapterIndex: nextIndex,
      durChapterTitle: nextTitle,
      durChapterUrl: nextChapterUrl
    };
    return item;
  };

  const syncReadingProgress = item => {
    if (!item || isIntroStreamItem(item)) return;
    const nextIndex = toChapterIndex(item.index);
    const nextTitle = item.title || item.chapter?.title || item.chapter?.name || "";
    const nextChapterUrl = item.chapter?.chapterUrl || item.chapter?.url || "";
    if (
      toChapterIndex(readingBook.value.durChapterIndex) === nextIndex &&
      readingBook.value.durChapterTitle === nextTitle
    ) {
      return;
    }

    readingBook.value = {
      ...readingBook.value,
      durChapterIndex: nextIndex,
      durChapterTitle: nextTitle,
      durChapterUrl: nextChapterUrl
    };
  };

  const setReaderError = message => {
    const errorTitle = readingBook.value.name || "加载失败";
    const errorContent = message || "加载失败，请稍后再试";
    error.value = true;
    loadingVisible.value = false;
    title.value = errorTitle;
    chapterContent.value = errorContent;
    const errorChapterUrl = `reader-error:${Date.now()}`;
    chapterStream.value = [createChapterStreamItem(
      {
        index: toChapterIndex(readingBook.value.durChapterIndex),
        title: errorTitle,
        name: errorTitle,
        chapterUrl: errorChapterUrl,
        url: errorChapterUrl
      },
      { title: errorTitle, content: errorContent }
    )];
  };

  const applyCatalogToBook = chapters => {
    catalog.value = chapters;
    const latestChapter = chapters[chapters.length - 1]?.title || readingBook.value.latestChapterTitle || "";
    readingBook.value = {
      ...readingBook.value,
      catalog: chapters,
      totalChapterNum: chapters.length,
      latestChapterTitle: latestChapter,
      lastChapter: latestChapter
    };
  };

  const loadBookIntro = async ({ signal } = {}) => {
    if (!currentSource.value || !hasBookUrl(readingBook.value) || bookInfoLoaded.value) {
      return readingBook.value;
    }

    const ownController = signal ? null : startBookInfoTask();
    const taskSignal = signal || ownController.signal;

    introLoading.value = true;
    try {
      const detailBook = await loadBookInfo({
        source: currentSource.value,
        book: readingBook.value,
        signal: taskSignal
      });
      if (taskSignal?.aborted) return readingBook.value;
      readingBook.value = detailBook;
      bookInfoLoaded.value = true;
      title.value = detailBook.name || detailBook.title || title.value;
      return detailBook;
    } catch (loadError) {
      if (loadError?.name !== "AbortError") return readingBook.value;
      return readingBook.value;
    } finally {
      if (!taskSignal?.aborted) introLoading.value = false;
      if (ownController) clearBookInfoTask(ownController);
    }
  };

  const loadHistoryChapter = async (historyChapter, signal) => {
    await loadBookIntro({ signal });
    if (signal?.aborted) return;

    const chapters = await loadCatalog({ signal, silent: true });
    if (signal?.aborted) return;

    const historyIndex = toChapterIndex(historyChapter.index);
    const indexedChapter = chapters?.length
      ? chapters[Math.min(historyIndex, chapters.length - 1)]
      : null;
    return await loadChapter(indexedChapter || historyChapter, signal);
  };

  const loadChapter = async (chapter, signal) => {
    if (!currentSource.value || !chapter) return;
    error.value = false;
    loadingText.value = "正在加载";
    loadingVisible.value = true;

    try {
      const result = await loadChapterContent({
        source: currentSource.value,
        book: readingBook.value,
        chapter,
        signal
      });
      if (signal?.aborted) return;

      return applyChapterContent(chapter, result);
    } catch (loadError) {
      if (loadError?.name !== "AbortError") setReaderError("章节正文加载失败，请稍后再试");
    } finally {
      if (!signal?.aborted) loadingVisible.value = false;
    }
  };

  const loadCatalog = async ({ signal, loadFirstChapter = false, silent = false } = {}) => {
    if (!currentSource.value) return;
    catalogLoading.value = true;

    try {
      const chapters = await loadBookCatalog({
        source: currentSource.value,
        book: readingBook.value,
        signal
      });
      if (signal?.aborted) return;

      applyCatalogToBook(chapters);
      if (!loadFirstChapter) return chapters;
      if (chapters.length) {
        await loadChapter(chapters[0], signal);
        return chapters;
      }
      title.value = readingBook.value.name || "目录为空";
      chapterContent.value = "未获取到章节目录";
    } catch (loadError) {
      if (loadError?.name !== "AbortError" && !silent) setReaderError("目录加载失败，请稍后再试");
      return [];
    } finally {
      if (!signal?.aborted) catalogLoading.value = false;
    }
  };

  const loadChapterContentForStream = async (chapter, signal) => {
    const key = getChapterKey(chapter);
    if (chapterContentCache.has(key)) return chapterContentCache.get(key);

    const result = await loadChapterContent({
      source: currentSource.value,
      book: readingBook.value,
      chapter,
      signal
    });
    const content = {
      title: result.title || chapter.title || chapter.name || "",
      content: result.content || "正文为空"
    };
    chapterContentCache.set(key, content);
    return content;
  };

  const findChapterStreamItem = chapter => {
    const key = getChapterKey(chapter);
    return chapterStream.value.find(item => item.key === key) || null;
  };

  const loadChapterStreamItem = async chapter => {
    if (!chapter) return false;
    if (isIntroStreamItem(chapter)) return createIntroStreamItem(readingBook.value);
    if (!currentSource.value) return false;

    const existingItem = findChapterStreamItem(chapter);
    if (existingItem) return existingItem;

    const key = getChapterKey(chapter);
    return runStreamTask(key, async signal => {
      try {
        const result = await loadChapterContentForStream(chapter, signal);
        if (signal.aborted) return false;
        return createChapterStreamItem(chapter, result);
      } catch (loadError) {
        return false;
      }
    });
  };

  const insertChapterStreamItem = (item, direction) => {
    if (!item) return false;
    if (chapterStream.value.some(chapterItem => chapterItem.key === item.key)) return item;

    chapterStream.value = direction === "previous"
      ? [item, ...chapterStream.value]
      : [...chapterStream.value, item];
    return item;
  };

  const getStreamBoundaryIndex = direction => {
    if (!chapterStream.value.length) return chapterIndex.value;
    const indexes = chapterStream.value.map(item => Number(item.index)).filter(Number.isFinite);
    if (!indexes.length) return chapterIndex.value;
    return direction === "previous" ? Math.min(...indexes) : Math.max(...indexes);
  };

  const ensureCatalogLoaded = async () => {
    if (catalog.value.length) return catalog.value;
    return await loadCatalog({ silent: true }) || [];
  };

  const hasIntroInStream = () => chapterStream.value.some(isIntroStreamItem);

  const getAdjacentStreamChapter = async direction => {
    await ensureCatalogLoaded();
    const boundaryIndex = getStreamBoundaryIndex(direction);
    if (direction === "previous" && boundaryIndex <= 0) {
      return hasIntroInStream() ? null : createIntroStreamItem(readingBook.value);
    }

    const chapterOffset = direction === "previous" ? -1 : 1;
    return catalog.value[boundaryIndex + chapterOffset];
  };

  async function loadAdjacentChapterStreamItem(direction) {
    return loadChapterStreamItem(await getAdjacentStreamChapter(direction));
  }

  async function loadNextChapterIntoStream() {
    const item = await loadAdjacentChapterStreamItem("next");
    return insertChapterStreamItem(item, "next");
  }

  const getFirstReadableStreamItem = () =>
    chapterStream.value.find(item => !isIntroStreamItem(item)) || null;

  const loadReaderBook = book => {
    abortReaderTask();
    const initialBook = createInitialBook(book);
    const historyChapter = getHistoryChapter(initialBook);
    readingBook.value = initialBook;
    currentSource.value = findSourceForBook(initialBook);
    bookInfoLoaded.value = false;
    error.value = false;
    title.value = "";
    chapterContent.value = "";
    chapterStream.value = [];
    chapterContentCache.clear();
    catalog.value = [];

    if (!hasBookUrl(initialBook)) {
      setReaderError("未选择书籍");
      return;
    }

    if (!currentSource.value) {
      setIntroStream();
      return;
    }

    if (historyChapter) {
      loadingText.value = "正在加载";
      const controller = startReaderTask();
      loadingVisible.value = true;
      loadHistoryChapter(historyChapter, controller.signal).finally(() => {
        clearReaderTask(controller);
      });
      return;
    }

    setIntroStream();

    const controller = startReaderTask();
    loadBookIntro({ signal: controller.signal })
      .then(() => loadCatalog({ signal: controller.signal, silent: true }))
      .finally(() => {
        clearReaderTask(controller);
      });
  };

  const switchBookSource = async selectedBook => {
    if (!selectedBook) {
      setReaderError("未找到可用书源，换源失败");
      return false;
    }

    const nextSource = findSourceForBook(selectedBook);
    if (!nextSource) {
      setReaderError("未找到可用书源，换源失败");
      return false;
    }

    const targetIndex = chapterIndex.value;
    const previousState = {
      title: title.value,
      chapterContent: chapterContent.value,
      error: error.value
    };
    const candidateBook = createSwitchedBook({
      selectedBook,
      source: nextSource,
      previousBook: readingBook.value || {},
      targetIndex
    });
    const controller = startReaderTask();

    error.value = false;
    loadingText.value = "正在换源";
    loadingVisible.value = true;
    title.value = candidateBook.name || "正在换源...";
    chapterContent.value = "";

    try {
      let nextBook = candidateBook;
      try {
        nextBook = await loadBookInfo({
          source: nextSource,
          book: candidateBook,
          signal: controller.signal
        });
      } catch (loadError) {
        if (loadError?.name === "AbortError") throw loadError;
      }
      if (controller.signal.aborted) return false;

      const chapters = await loadBookCatalog({
        source: nextSource,
        book: nextBook,
        signal: controller.signal
      });
      if (controller.signal.aborted) return false;
      if (!chapters?.length) throw new Error("新书源目录为空，换源失败");

      const nextChapterIndex = Math.min(targetIndex, chapters.length - 1);
      const nextChapter = chapters[nextChapterIndex];
      const chapterResult = await loadChapterContent({
        source: nextSource,
        book: nextBook,
        chapter: nextChapter,
        signal: controller.signal
      });
      if (controller.signal.aborted) return false;

      currentSource.value = nextSource;
      readingBook.value = nextBook;
      bookInfoLoaded.value = true;
      chapterStream.value = [];
      chapterContentCache.clear();
      catalog.value = [];
      applyCatalogToBook(chapters);
      error.value = false;
      applyChapterContent(nextChapter, chapterResult);
      return true;
    } catch (loadError) {
      if (loadError?.name !== "AbortError") {
        title.value = previousState.title;
        chapterContent.value = previousState.chapterContent;
        error.value = previousState.error;
      }
      return false;
    } finally {
      if (!controller.signal.aborted) loadingVisible.value = false;
      clearReaderTask(controller);
    }
  };


  const startReading = async () => {
    if (!hasBookUrl(readingBook.value)) {
      setReaderError("未选择书籍");
      return null;
    }

    if (!currentSource.value) {
      setReaderError("暂无可用书源，无法开始阅读");
      return null;
    }

    const controller = startReaderTask();
    error.value = false;
    loadingText.value = "正在加载";
    loadingVisible.value = true;

    try {
      await loadBookIntro({ signal: controller.signal });
      if (controller.signal.aborted) return null;
      await loadCatalog({ signal: controller.signal, silent: true });
      if (controller.signal.aborted) return null;
      return getFirstReadableStreamItem() || await loadNextChapterIntoStream();
    } finally {
      if (!controller.signal.aborted) loadingVisible.value = false;
      clearReaderTask(controller);
    }
  };

  const openChapter = async note => {
    const controller = startReaderTask();
    try {
      return await loadChapter(note, controller.signal);
    } finally {
      clearReaderTask(controller);
    }
  };

  const refreshCatalog = () => {
    const controller = startReaderTask();
    loadBookIntro({ signal: controller.signal })
      .then(() => loadCatalog({ signal: controller.signal }))
      .finally(() => {
        clearReaderTask(controller);
      });
  };

  return {
    title,
    chapterContent,
    error,
    loadingVisible,
    loadingText,
    introLoading,
    catalogLoading,
    contentStyle,
    readingBook,
    catalog,
    chapterStream,
    chapterIndex,
    abortReaderTask,
    loadReaderBook,
    switchBookSource,
    loadBookIntro,
    startReading,
    syncReadingProgress,
    insertChapterStreamItem,
    loadAdjacentChapterStreamItem,
    openChapter,
    refreshCatalog
  };
};
