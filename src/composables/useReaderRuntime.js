import { computed, ref } from "vue";
import { previewBook, previewCatalog } from "../previewData";
import {
  findSourceForBook,
  loadBookCatalog,
  loadBookInfo,
  loadChapterContent
} from "../search/bookSourceRuntime.js";

const READER_PAGE_MODE = {
  intro: "intro",
  chapter: "chapter"
};

const previewChapterContent = `这是阅读器界面预览内容。
当前阶段只用于验证 reader-server 原版阅读页菜单、按钮和弹出层是否完整复刻。
后续接入真实章节后会替换为真实内容。`;

const createInitialBook = book => (book ? { ...book } : { ...previewBook });

const createIntroContinuation = () => ({
  title: "",
  content: "",
  chapter: null,
  loading: false,
  loaded: false,
  error: false
});

const getChapterKey = chapter =>
  String(chapter?.chapterUrl || chapter?.url || (chapter?.index ?? chapter?.title ?? chapter?.name ?? ""));

const createChapterStreamItem = (chapter, result = {}) => {
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

const isPreviewReadingBook = book =>
  !book?.bookUrl || book.origin === "preview" || book.bookUrl === previewBook.bookUrl;

const toChapterIndex = value => {
  const index = Number(value);
  return Number.isFinite(index) ? Math.max(0, Math.trunc(index)) : 0;
};

const getHistoryChapter = book => {
  const chapterUrl = book?.durChapterUrl || book?.chapterUrl || book?.lastReadChapterUrl;
  if (!chapterUrl) return null;

  const index = toChapterIndex(book.durChapterIndex ?? book.chapterIndex ?? book.index);
  const title = book.durChapterTitle || book.chapterTitle || book.title || `第${index + 1}章`;
  return {
    index,
    title,
    name: title,
    chapterUrl,
    url: chapterUrl
  };
};

export const useReaderRuntime = () => {
  const title = ref("第一章 预览章节");
  const chapterContent = ref(previewChapterContent);
  const error = ref(false);
  const loadingVisible = ref(false);
  const loadingText = ref("正在加载");
  const introLoading = ref(false);
  const catalogLoading = ref(false);
  const currentSource = ref(null);
  const contentStyle = ref({});
  const readingBook = ref({ ...previewBook });
  const catalog = ref(previewCatalog);
  const introContinuation = ref(createIntroContinuation());
  const chapterStream = ref([]);
  const readerPageMode = ref(READER_PAGE_MODE.chapter);
  const introPageEnabled = ref(false);
  const bookInfoLoaded = ref(false);
  const chapterContentCache = new Map();
  let readerController = null;
  let bookInfoController = null;
  const chapterStreamControllers = new Set();
  const chapterStreamLoadingTasks = new Map();

  const chapterIndex = computed(() => toChapterIndex(readingBook.value.index));
  const isPreviewBook = computed(() => isPreviewReadingBook(readingBook.value));
  const isIntroPage = computed(() => readerPageMode.value === READER_PAGE_MODE.intro);
  const hasIntroPage = computed(() => introPageEnabled.value);

  const abortBookInfoTask = () => {
    introLoading.value = false;
    if (!bookInfoController) return;
    bookInfoController.abort();
    bookInfoController = null;
  };

  const abortChapterStreamTask = () => {
    chapterStreamControllers.forEach(controller => controller.abort());
    chapterStreamControllers.clear();
    chapterStreamLoadingTasks.clear();
  };

  const abortReaderTask = () => {
    loadingVisible.value = false;
    catalogLoading.value = false;
    if (introContinuation.value.loading) {
      introContinuation.value = {
        ...introContinuation.value,
        loading: false
      };
    }
    abortChapterStreamTask();
    abortBookInfoTask();
    if (!readerController) return;
    readerController.abort();
    readerController = null;
  };

  const startReaderTask = () => {
    abortReaderTask();
    readerController = new AbortController();
    return readerController;
  };

  const setPreviewContent = () => {
    error.value = false;
    loadingVisible.value = false;
    introLoading.value = false;
    catalogLoading.value = false;
    introPageEnabled.value = false;
    introContinuation.value = createIntroContinuation();
    bookInfoLoaded.value = true;
    readerPageMode.value = READER_PAGE_MODE.chapter;
    title.value = previewCatalog[0]?.title || "第一章 预览章节";
    chapterContent.value = previewChapterContent;
    catalog.value = previewCatalog;
    setChapterStreamCurrent(previewCatalog[0], { title: title.value, content: previewChapterContent });
  };

  const setIntroPage = () => {
    error.value = false;
    loadingVisible.value = false;
    readerPageMode.value = READER_PAGE_MODE.intro;
    title.value = readingBook.value.name || readingBook.value.title || "";
    chapterContent.value = "";
  };

  const setChapterStreamCurrent = (chapter, result = {}) => {
    chapterStream.value = [createChapterStreamItem(chapter, result)];
  };

  const applyChapterContent = (chapter, result = {}) => {
    const nextTitle = result.title || chapter.title || chapter.name || "";
    const nextContent = result.content || "正文为空";
    title.value = nextTitle;
    chapterContent.value = nextContent;
    chapterContentCache.set(getChapterKey(chapter), { title: nextTitle, content: nextContent });
    setChapterStreamCurrent(chapter, { ...result, title: nextTitle, content: nextContent });
    const nextIndex = toChapterIndex(chapter.index);
    readingBook.value = {
      ...readingBook.value,
      index: nextIndex,
      durChapterIndex: nextIndex,
      durChapterTitle: nextTitle
    };
  };

  const syncReadingProgress = item => {
    if (!item) return;
    const nextIndex = toChapterIndex(item.index);
    const nextTitle = item.title || item.chapter?.title || item.chapter?.name || "";
    if (
      toChapterIndex(readingBook.value.index) === nextIndex &&
      readingBook.value.durChapterTitle === nextTitle
    ) {
      return;
    }

    readingBook.value = {
      ...readingBook.value,
      index: nextIndex,
      durChapterIndex: nextIndex,
      durChapterTitle: nextTitle
    };
  };

  const activateChapterStreamItem = item => {
    if (!item?.chapter) return false;

    readerPageMode.value = READER_PAGE_MODE.chapter;
    error.value = false;
    loadingVisible.value = false;
    title.value = item.title || item.chapter.title || item.chapter.name || "";
    chapterContent.value = item.content || "正文为空";
    chapterContentCache.set(getChapterKey(item.chapter), {
      title: title.value,
      content: chapterContent.value
    });

    if (!chapterStream.value.some(chapterItem => chapterItem.key === item.key)) {
      chapterStream.value = [...chapterStream.value, item];
    }

    syncReadingProgress(item);
    loadAdjacentChaptersIntoStream();
    return true;
  };

  const promoteIntroContinuation = () => {
    const continuation = introContinuation.value;
    if (!continuation.loaded || !continuation.chapter || !continuation.content) return false;
    readerPageMode.value = READER_PAGE_MODE.chapter;
    error.value = false;
    loadingVisible.value = false;
    applyChapterContent(continuation.chapter, continuation);
    return true;
  };

  const setReaderError = message => {
    error.value = true;
    loadingVisible.value = false;
    readerPageMode.value = READER_PAGE_MODE.chapter;
    title.value = readingBook.value.name || "加载失败";
    chapterContent.value = message || "加载失败，请稍后再试";
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
    if (!currentSource.value || isPreviewReadingBook(readingBook.value) || bookInfoLoaded.value) {
      return readingBook.value;
    }

    const ownController = signal ? null : new AbortController();
    if (ownController) {
      abortBookInfoTask();
      bookInfoController = ownController;
    }
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
      if (isIntroPage.value) title.value = detailBook.name || detailBook.title || title.value;
      return detailBook;
    } catch (loadError) {
      if (loadError?.name !== "AbortError") return readingBook.value;
      return readingBook.value;
    } finally {
      if (!taskSignal?.aborted) introLoading.value = false;
      if (bookInfoController === ownController) bookInfoController = null;
    }
  };

  const loadChapter = async (chapter, signal) => {
    if (!currentSource.value || !chapter) return;
    readerPageMode.value = READER_PAGE_MODE.chapter;
    error.value = false;
    loadingText.value = "正在加载";
    loadingVisible.value = true;
    title.value = chapter.title || chapter.name || "正在加载章节...";
    chapterContent.value = "";

    try {
      const result = await loadChapterContent({
        source: currentSource.value,
        book: readingBook.value,
        chapter,
        signal
      });
      if (signal?.aborted) return;

      applyChapterContent(chapter, result);
      loadAdjacentChaptersIntoStream();
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

  const hasChapterInStream = chapter => {
    const key = getChapterKey(chapter);
    return chapterStream.value.some(item => item.key === key);
  };

  const loadChapterIntoStream = async (chapter, direction) => {
    if (!currentSource.value || !chapter) return false;

    const key = getChapterKey(chapter);
    if (hasChapterInStream(chapter)) return false;
    if (chapterStreamLoadingTasks.has(key)) return chapterStreamLoadingTasks.get(key);

    const controller = new AbortController();
    chapterStreamControllers.add(controller);

    const task = (async () => {
      try {
        const result = await loadChapterContentForStream(chapter, controller.signal);
        if (controller.signal.aborted || hasChapterInStream(chapter)) return false;

        const item = createChapterStreamItem(chapter, result);
        chapterStream.value = direction === "previous"
          ? [item, ...chapterStream.value]
          : [...chapterStream.value, item];
        return item;
      } catch (loadError) {
        return false;
      } finally {
        chapterStreamControllers.delete(controller);
        chapterStreamLoadingTasks.delete(key);
      }
    })();

    chapterStreamLoadingTasks.set(key, task);
    return task;
  };

  const getStreamBoundaryIndex = direction => {
    if (!chapterStream.value.length) return chapterIndex.value;
    const indexes = chapterStream.value.map(item => item.index);
    return direction === "previous" ? Math.min(...indexes) : Math.max(...indexes);
  };

  async function loadNextChapterIntoStream() {
    if (isIntroPage.value) return false;
    const nextChapter = catalog.value[getStreamBoundaryIndex("next") + 1];
    return loadChapterIntoStream(nextChapter, "next");
  }

  async function loadPreviousChapterIntoStream() {
    if (isIntroPage.value) return false;
    const previousChapter = catalog.value[getStreamBoundaryIndex("previous") - 1];
    return loadChapterIntoStream(previousChapter, "previous");
  }

  const loadAdjacentChaptersIntoStream = () => {
    loadPreviousChapterIntoStream();
    loadNextChapterIntoStream();
  };

  const loadIntroContinuation = async ({ signal } = {}) => {
    if (!currentSource.value || isPreviewReadingBook(readingBook.value)) return introContinuation.value;
    if (introContinuation.value.loading || introContinuation.value.loaded) return introContinuation.value;

    introContinuation.value = {
      ...createIntroContinuation(),
      loading: true
    };

    try {
      const chapters = catalog.value.length
        ? catalog.value
        : await loadCatalog({ signal, silent: true });
      if (signal?.aborted) return introContinuation.value;

      const firstChapter = chapters?.[0] || catalog.value[0];
      if (!firstChapter) {
        introContinuation.value = {
          ...createIntroContinuation(),
          loaded: true
        };
        return introContinuation.value;
      }

      const result = await loadChapterContent({
        source: currentSource.value,
        book: readingBook.value,
        chapter: firstChapter,
        signal
      });
      if (signal?.aborted) return introContinuation.value;

      introContinuation.value = {
        title: result.title || firstChapter.title || firstChapter.name || "",
        content: result.content || "正文为空",
        chapter: firstChapter,
        loading: false,
        loaded: true,
        error: false
      };
      chapterContentCache.set(getChapterKey(firstChapter), {
        title: introContinuation.value.title,
        content: introContinuation.value.content
      });
    } catch (loadError) {
      if (loadError?.name !== "AbortError") {
        introContinuation.value = {
          ...createIntroContinuation(),
          loading: false,
          error: true
        };
      }
    }

    return introContinuation.value;
  };

  const loadReaderBook = book => {
    abortReaderTask();
    const initialBook = createInitialBook(book);
    const historyChapter = getHistoryChapter(initialBook);
    readingBook.value = initialBook;
    currentSource.value = findSourceForBook(initialBook);
    bookInfoLoaded.value = false;
    introContinuation.value = createIntroContinuation();
    chapterStream.value = [];
    chapterContentCache.clear();
    catalog.value = [];

    if (isPreviewReadingBook(initialBook)) {
      setPreviewContent();
      return;
    }

    if (historyChapter) {
      introPageEnabled.value = false;
      const controller = startReaderTask();
      loadChapter(historyChapter, controller.signal).finally(() => {
        if (readerController === controller) readerController = null;
      });
      return;
    }

    introPageEnabled.value = true;
    setIntroPage();
    if (!currentSource.value) return;

    const controller = startReaderTask();
    loadBookIntro({ signal: controller.signal })
      .finally(() => {
        if (readerController === controller) readerController = null;
      });
  };

  const startReading = () => {
    if (isPreviewBook.value) {
      setPreviewContent();
      return;
    }

    if (!currentSource.value) {
      setReaderError("暂无可用书源，无法开始阅读");
      return;
    }

    if (promoteIntroContinuation()) {
      loadAdjacentChaptersIntoStream();
      return;
    }

    const controller = startReaderTask();
    readerPageMode.value = READER_PAGE_MODE.chapter;
    error.value = false;
    loadingText.value = "正在加载";
    loadingVisible.value = true;
    title.value = readingBook.value.name || "";
    chapterContent.value = "";

    loadBookIntro({ signal: controller.signal })
      .then(() => loadCatalog({ signal: controller.signal, loadFirstChapter: true }))
      .finally(() => {
        if (!controller.signal.aborted) loadingVisible.value = false;
        if (readerController === controller) readerController = null;
      });
  };

  const showIntroPage = () => {
    if (!introPageEnabled.value) return;
    abortReaderTask();
    setIntroPage();
  };

  const openChapter = note => {
    const controller = startReaderTask();
    loadChapter(note, controller.signal).finally(() => {
      if (readerController === controller) readerController = null;
    });
  };

  const refreshCatalog = () => {
    const controller = startReaderTask();
    loadBookIntro({ signal: controller.signal })
      .then(() => loadCatalog({ signal: controller.signal }))
      .finally(() => {
        if (readerController === controller) readerController = null;
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
    introContinuation,
    chapterStream,
    chapterIndex,
    isPreviewBook,
    isIntroPage,
    hasIntroPage,
    abortReaderTask,
    loadReaderBook,
    loadBookIntro,
    loadIntroContinuation,
    startReading,
    showIntroPage,
    promoteIntroContinuation,
    syncReadingProgress,
    activateChapterStreamItem,
    loadNextChapterIntoStream,
    loadPreviousChapterIntoStream,
    openChapter,
    refreshCatalog
  };
};
