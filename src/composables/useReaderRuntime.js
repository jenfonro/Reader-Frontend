import { computed, ref } from "vue";
import { previewBook, previewCatalog } from "../previewData";
import {
  findSourceForBook,
  loadBookCatalog,
  loadBookInfo,
  loadChapterContent
} from "../search/bookSourceRuntime.js";

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

export const useReaderRuntime = () => {
  const title = ref("第一章 预览章节");
  const chapterContent = ref(previewChapterContent);
  const error = ref(false);
  const catalogLoading = ref(false);
  const currentSource = ref(null);
  const contentStyle = ref({});
  const currentPage = ref(1);
  const totalPages = ref(1);
  const progressValue = ref(1);
  const readingBook = ref({ ...previewBook });
  const catalog = ref(previewCatalog);
  let readerController = null;

  const chapterIndex = computed(() => toChapterIndex(readingBook.value.index));
  const isPreviewBook = computed(() => isPreviewReadingBook(readingBook.value));

  const abortReaderTask = () => {
    catalogLoading.value = false;
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
    catalogLoading.value = false;
    title.value = previewCatalog[0]?.title || "第一章 预览章节";
    chapterContent.value = previewChapterContent;
    catalog.value = previewCatalog;
    totalPages.value = Math.max(previewCatalog.length, 1);
    currentPage.value = 1;
    progressValue.value = 1;
  };

  const setReaderError = message => {
    error.value = true;
    title.value = readingBook.value.name || "加载失败";
    chapterContent.value = message || "加载失败，请稍后再试";
  };

  const applyCatalogToBook = chapters => {
    catalog.value = chapters;
    totalPages.value = Math.max(chapters.length, 1);
    const latestChapter = chapters[chapters.length - 1]?.title || readingBook.value.latestChapterTitle || "";
    readingBook.value = {
      ...readingBook.value,
      catalog: chapters,
      totalChapterNum: chapters.length,
      latestChapterTitle: latestChapter,
      lastChapter: latestChapter
    };
  };

  const loadChapter = async (chapter, signal) => {
    if (!currentSource.value || !chapter) return;
    error.value = false;
    title.value = chapter.title || chapter.name || "正在加载章节...";
    chapterContent.value = "正在加载章节正文...";

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
      currentPage.value = nextIndex + 1;
      progressValue.value = currentPage.value;
    } catch (loadError) {
      if (loadError?.name !== "AbortError") setReaderError("章节正文加载失败，请稍后再试");
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

  const loadReaderBook = async book => {
    abortReaderTask();
    const initialBook = createInitialBook(book);
    readingBook.value = initialBook;
    currentSource.value = findSourceForBook(initialBook);

    if (!currentSource.value || isPreviewReadingBook(initialBook)) {
      setPreviewContent();
      return;
    }

    const controller = startReaderTask();
    error.value = false;
    title.value = initialBook.name || "正在加载书籍详情...";
    chapterContent.value = "正在加载书籍详情...";

    try {
      const detailBook = await loadBookInfo({
        source: currentSource.value,
        book: initialBook,
        signal: controller.signal
      });
      if (controller.signal.aborted) return;
      readingBook.value = detailBook;
      await loadCatalog({ signal: controller.signal, loadFirstChapter: true });
    } catch (loadError) {
      if (loadError?.name !== "AbortError") setReaderError("书籍详情加载失败，请稍后再试");
    } finally {
      if (readerController === controller) readerController = null;
    }
  };

  const openChapter = note => {
    const controller = startReaderTask();
    loadChapter(note, controller.signal).finally(() => {
      if (readerController === controller) readerController = null;
    });
  };

  const refreshCatalog = () => {
    const controller = startReaderTask();
    loadCatalog({ signal: controller.signal }).finally(() => {
      if (readerController === controller) readerController = null;
    });
  };

  return {
    title,
    chapterContent,
    error,
    catalogLoading,
    contentStyle,
    currentPage,
    totalPages,
    progressValue,
    readingBook,
    catalog,
    chapterIndex,
    isPreviewBook,
    abortReaderTask,
    loadReaderBook,
    openChapter,
    refreshCatalog
  };
};
