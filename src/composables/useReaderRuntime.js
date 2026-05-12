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
  const currentPage = ref(1);
  const totalPages = ref(1);
  const progressValue = ref(1);
  const readingBook = ref({ ...previewBook });
  const catalog = ref(previewCatalog);
  const readerPageMode = ref(READER_PAGE_MODE.chapter);
  const introPageEnabled = ref(false);
  const bookInfoLoaded = ref(false);
  let readerController = null;
  let bookInfoController = null;

  const chapterIndex = computed(() => toChapterIndex(readingBook.value.index));
  const isPreviewBook = computed(() => isPreviewReadingBook(readingBook.value));
  const isIntroPage = computed(() => readerPageMode.value === READER_PAGE_MODE.intro);

  const getChapterPage = index => index + 1 + (introPageEnabled.value ? 1 : 0);

  const abortBookInfoTask = () => {
    introLoading.value = false;
    if (!bookInfoController) return;
    bookInfoController.abort();
    bookInfoController = null;
  };

  const abortReaderTask = () => {
    loadingVisible.value = false;
    catalogLoading.value = false;
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
    bookInfoLoaded.value = true;
    readerPageMode.value = READER_PAGE_MODE.chapter;
    title.value = previewCatalog[0]?.title || "第一章 预览章节";
    chapterContent.value = previewChapterContent;
    catalog.value = previewCatalog;
    totalPages.value = Math.max(previewCatalog.length, 1);
    currentPage.value = 1;
    progressValue.value = 1;
  };

  const setIntroPage = () => {
    error.value = false;
    loadingVisible.value = false;
    readerPageMode.value = READER_PAGE_MODE.intro;
    title.value = readingBook.value.name || readingBook.value.title || "";
    chapterContent.value = "";
    currentPage.value = 1;
    progressValue.value = 1;
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
    totalPages.value = Math.max(chapters.length + (introPageEnabled.value ? 1 : 0), 1);
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

      title.value = result.title || chapter.title || chapter.name || "";
      chapterContent.value = result.content || "正文为空";
      const nextIndex = toChapterIndex(chapter.index);
      readingBook.value = {
        ...readingBook.value,
        index: nextIndex,
        durChapterIndex: nextIndex,
        durChapterTitle: title.value
      };
      currentPage.value = getChapterPage(nextIndex);
      progressValue.value = currentPage.value;
    } catch (loadError) {
      if (loadError?.name !== "AbortError") setReaderError("章节正文加载失败，请稍后再试");
    } finally {
      if (!signal?.aborted) loadingVisible.value = false;
    }
  };

  const loadCatalog = async ({ signal, loadFirstChapter = false } = {}) => {
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
      if (!loadFirstChapter) return;
      if (chapters.length) {
        await loadChapter(chapters[0], signal);
        return;
      }
      title.value = readingBook.value.name || "目录为空";
      chapterContent.value = "未获取到章节目录";
    } catch (loadError) {
      if (loadError?.name !== "AbortError") setReaderError("目录加载失败，请稍后再试");
    } finally {
      if (!signal?.aborted) catalogLoading.value = false;
    }
  };

  const loadReaderBook = book => {
    abortReaderTask();
    const initialBook = createInitialBook(book);
    const historyChapter = getHistoryChapter(initialBook);
    readingBook.value = initialBook;
    currentSource.value = findSourceForBook(initialBook);
    bookInfoLoaded.value = false;
    catalog.value = [];
    totalPages.value = 1;
    currentPage.value = 1;
    progressValue.value = 1;

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
    loadBookIntro({ signal: controller.signal }).finally(() => {
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

  const goToReaderPage = page => {
    const nextPage = Math.max(1, toChapterIndex(page));
    if (introPageEnabled.value && nextPage <= 1) {
      showIntroPage();
      return;
    }

    const chapterOffset = introPageEnabled.value ? 2 : 1;
    const targetChapter = catalog.value[nextPage - chapterOffset];
    if (targetChapter) {
      openChapter(targetChapter);
      return;
    }

    if (isIntroPage.value) startReading();
  };

  const goNextPage = () => {
    if (isIntroPage.value) {
      startReading();
      return;
    }
    const nextChapter = catalog.value[chapterIndex.value + 1];
    if (nextChapter) openChapter(nextChapter);
  };

  const goPreviousPage = () => {
    if (isIntroPage.value) return;
    const previousChapter = catalog.value[chapterIndex.value - 1];
    if (previousChapter) {
      openChapter(previousChapter);
      return;
    }
    showIntroPage();
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
    currentPage,
    totalPages,
    progressValue,
    readingBook,
    catalog,
    chapterIndex,
    isPreviewBook,
    isIntroPage,
    abortReaderTask,
    loadReaderBook,
    loadBookIntro,
    startReading,
    showIntroPage,
    openChapter,
    refreshCatalog,
    goToReaderPage,
    goNextPage,
    goPreviousPage
  };
};
