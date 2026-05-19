import { computed, onBeforeUnmount, ref, watch } from "vue";
import { readSearchableSources, searchBooksBySources } from "../search/bookSourceSearch.js";
import { isSameBookIdentity, needsAuthorIdentityEnrichment } from "../utils/bookIdentity.js";
import {
  enrichBookCatalogSummary,
  enrichBookLatestChapter,
  getBookLatestChapterTitle
} from "../search/bookSourceLatest.js";

const FIRST_PAGE = 1;
const CATALOG_SUMMARY_CONCURRENCY = 4;
const IDENTITY_ENRICH_CONCURRENCY = 4;

export const useBookSourceSwitcher = ({ props, emit }) => {
  const bookSource = ref([]);
  const bookSourceGroup = ref("");
  const sourceList = ref([]);
  const loading = ref(false);
  const loadingMore = ref(false);
  const identityLoading = ref(false);
  const searched = ref(false);
  const searchError = ref("");
  const page = ref(FIRST_PAGE);
  let searchController = null;
  let catalogSummaryController = null;
  let catalogSummaryRunning = 0;
  let catalogSummarySession = 0;
  const catalogSummaryQueue = [];
  let identityController = null;
  let identityRunning = 0;
  let identitySession = 0;
  const identityQueue = [];
  const identityPendingBooks = new Map();

  const searchRunning = computed(() => loading.value || loadingMore.value);
  const keyword = computed(() => String(props.book?.name || props.book?.title || "").trim());
  const sourceMetaMap = computed(() => {
    const entries = sourceList.value.map(source => [source.__sourceKey, source]);
    return new Map(entries);
  });
  const bookSourceGroupList = computed(() => {
    const groupMap = new Map([["", { name: "全部分组", value: "", count: sourceList.value.length }]]);
    sourceList.value.forEach(source => {
      const value = String(source.bookSourceGroup || "").trim();
      if (!value) return;
      const current = groupMap.get(value) || { name: value, value, count: 0 };
      current.count += 1;
      groupMap.set(value, current);
    });
    return [...groupMap.values()];
  });
  const filteredBookSources = computed(() => {
    if (!bookSourceGroup.value) return bookSource.value;
    return bookSource.value.filter(searchBook => getSourceGroup(searchBook) === bookSourceGroup.value);
  });
  const statusText = computed(() => {
    if (searchError.value) return searchError.value;
    if ((loading.value || identityLoading.value) && !bookSource.value.length) return "正在加载";
    if (searched.value && !bookSource.value.length) return "没有搜索到可切换来源";
    if (searched.value && bookSource.value.length && !filteredBookSources.value.length) return "当前分组没有可切换来源";
    return "";
  });

  const normalizeUrl = value => String(value || "").trim().replace(/\/+$/, "");
  const getResultKey = searchBook => [
    searchBook.sourceKey || searchBook.origin || searchBook.originName || "source",
    normalizeUrl(searchBook.bookUrl || searchBook.url),
    searchBook.name || ""
  ].join("::");
  const getSourceGroup = searchBook =>
    String(sourceMetaMap.value.get(searchBook.sourceKey)?.bookSourceGroup || "").trim();
  const getCurrentSourceKey = () => props.book?.sourceKey || "";

  const resetSources = () => {
    sourceList.value = readSearchableSources();
    if (bookSourceGroup.value && !bookSourceGroupList.value.some(group => group.value === bookSourceGroup.value)) {
      bookSourceGroup.value = "";
    }
  };

  const cancelCatalogSummary = () => {
    catalogSummarySession += 1;
    catalogSummaryQueue.length = 0;
    catalogSummaryRunning = 0;
    if (catalogSummaryController) {
      catalogSummaryController.abort();
      catalogSummaryController = null;
    }
  };

  const cancelIdentityEnrichment = () => {
    identitySession += 1;
    identityQueue.length = 0;
    identityPendingBooks.clear();
    identityRunning = 0;
    if (identityController) {
      identityController.abort();
      identityController = null;
    }
    syncIdentityLoading();
  };

  const cancelSearch = () => {
    if (searchController) {
      searchController.abort();
      searchController = null;
    }
    cancelCatalogSummary();
    cancelIdentityEnrichment();
    loading.value = false;
    loadingMore.value = false;
  };

  const ensureCatalogSummaryController = () => {
    if (!catalogSummaryController || catalogSummaryController.signal.aborted) {
      catalogSummaryController = new AbortController();
    }
    return catalogSummaryController;
  };

  const ensureIdentityController = () => {
    if (!identityController || identityController.signal.aborted) identityController = new AbortController();
    return identityController;
  };

  const syncIdentityLoading = () => {
    identityLoading.value = identityRunning > 0 || identityQueue.length > 0;
  };

  const appendVerifiedBook = (book, key = getResultKey(book)) => {
    if (!key || bookSource.value.some(item => item.key === key)) return;
    const nextBook = { ...book, key };
    bookSource.value = [...bookSource.value, nextBook];
    enqueueCatalogSummary([nextBook]);
  };

  const removeSearchBook = key => {
    bookSource.value = bookSource.value.filter(item => item.key !== key);
  };

  const updateSearchBookCatalogSummary = (key, enrichedBook) => {
    const latestChapter = getBookLatestChapterTitle(enrichedBook);

    bookSource.value = bookSource.value.map(item => {
      if (item.key !== key) return item;
      return {
        ...item,
        ...enrichedBook,
        key: item.key,
        time: item.time,
        sourceKey: item.sourceKey || enrichedBook.sourceKey,
        ...(latestChapter
          ? {
              latestChapterTitle: latestChapter,
              latestChapter,
              lastChapter: latestChapter
            }
          : {})
      };
    });
  };

  const runCatalogSummaryQueue = () => {
    const controller = ensureCatalogSummaryController();
    const session = catalogSummarySession;

    while (catalogSummaryRunning < CATALOG_SUMMARY_CONCURRENCY && catalogSummaryQueue.length) {
      const key = catalogSummaryQueue.shift();
      const currentBook = bookSource.value.find(item => item.key === key);
      if (!currentBook) continue;

      catalogSummaryRunning += 1;
      enrichBookCatalogSummary({ book: currentBook, signal: controller.signal })
        .then(enrichedBook => {
          if (catalogSummarySession !== session || controller.signal.aborted) return;
          if (!isSameBookIdentity(enrichedBook, props.book)) {
            removeSearchBook(key);
            return;
          }
          updateSearchBookCatalogSummary(key, enrichedBook);
        })
        .catch(error => {
          if (error?.name !== "AbortError") return;
        })
        .finally(() => {
          if (catalogSummarySession !== session) return;
          catalogSummaryRunning = Math.max(0, catalogSummaryRunning - 1);
          runCatalogSummaryQueue();
        });
    }
  };

  const enqueueCatalogSummary = books => {
    const keys = books
      .map(getResultKey)
      .filter(key => key && !catalogSummaryQueue.includes(key));
    if (!keys.length) return;

    catalogSummaryQueue.push(...keys);
    runCatalogSummaryQueue();
  };

  const runIdentityEnrichmentQueue = () => {
    const controller = ensureIdentityController();
    const session = identitySession;

    while (identityRunning < IDENTITY_ENRICH_CONCURRENCY && identityQueue.length) {
      const key = identityQueue.shift();
      syncIdentityLoading();
      const currentBook = identityPendingBooks.get(key);
      identityPendingBooks.delete(key);
      if (!currentBook || bookSource.value.some(item => item.key === key)) continue;

      identityRunning += 1;
      syncIdentityLoading();
      enrichBookLatestChapter({ book: currentBook, signal: controller.signal })
        .then(enrichedBook => {
          if (identitySession !== session || controller.signal.aborted) return;
          if (isSameBookIdentity(enrichedBook, props.book)) appendVerifiedBook(enrichedBook, key);
        })
        .catch(error => {
          if (error?.name !== "AbortError") return;
        })
        .finally(() => {
          if (identitySession !== session) return;
          identityRunning = Math.max(0, identityRunning - 1);
          syncIdentityLoading();
          runIdentityEnrichmentQueue();
        });
    }
  };

  const enqueueIdentityEnrichment = (book, key) => {
    if (!key || identityPendingBooks.has(key) || identityQueue.includes(key)) return;
    identityPendingBooks.set(key, { ...book, key });
    identityQueue.push(key);
    syncIdentityLoading();
    runIdentityEnrichmentQueue();
  };

  const appendSearchBooks = books => {
    const existingKeys = new Set([
      ...bookSource.value.map(getResultKey),
      ...identityPendingBooks.keys(),
      ...identityQueue
    ]);

    books.forEach(book => {
      const key = getResultKey(book);
      if (existingKeys.has(key)) return;
      existingKeys.add(key);

      const nextBook = { ...book, key };
      if (isSameBookIdentity(nextBook, props.book)) {
        appendVerifiedBook(nextBook, key);
        return;
      }

      if (needsAuthorIdentityEnrichment(nextBook, props.book)) enqueueIdentityEnrichment(nextBook, key);
    });
  };

  const runSearch = async ({ append = false } = {}) => {
    const searchKeyword = keyword.value;
    if (!searchKeyword) {
      bookSource.value = [];
      searched.value = true;
      searchError.value = "当前书籍名称为空，无法换源";
      return;
    }

    if (searchRunning.value) cancelSearch();
    resetSources();
    searchError.value = "";
    searched.value = false;
    if (!append) {
      cancelCatalogSummary();
      cancelIdentityEnrichment();
      page.value = FIRST_PAGE;
      bookSource.value = [];
    }

    if (!sourceList.value.length) {
      searched.value = true;
      searchError.value = "暂无可用书源";
      return;
    }

    const controller = new AbortController();
    searchController = controller;
    if (append) loadingMore.value = true;
    else loading.value = true;

    try {
      await searchBooksBySources({
        keyword: searchKeyword,
        page: page.value,
        signal: controller.signal,
        onEvent: event => {
          if (event.type !== "source") return;
          appendSearchBooks(event.books || []);
        }
      });
      searched.value = true;
    } catch (error) {
      if (error?.name !== "AbortError") {
        searchError.value = "换源搜索失败，请稍后再试";
        searched.value = true;
      }
    } finally {
      if (searchController === controller) searchController = null;
      if (!controller.signal.aborted) {
        loading.value = false;
        loadingMore.value = false;
      }
    }
  };

  const refresh = () => {
    if (loading.value) return;
    runSearch();
  };

  const loadMoreBookSources = () => {
    if (searchRunning.value) return;
    page.value += 1;
    runSearch({ append: true });
  };

  const isSelected = searchBook => {
    const currentBookUrl = normalizeUrl(props.book?.bookUrl || props.book?.url);
    const searchBookUrl = normalizeUrl(searchBook.bookUrl || searchBook.url);
    return Boolean(
      currentBookUrl &&
        searchBookUrl &&
        currentBookUrl === searchBookUrl &&
        getCurrentSourceKey() &&
        getCurrentSourceKey() === searchBook.sourceKey
    );
  };

  const formatResponseTime = time => {
    const value = Number(time);
    return Number.isFinite(value) && value > 0 ? `⏱ ${Math.round(value)}ms` : "";
  };

  const getLatestChapterText = searchBook => getBookLatestChapterTitle(searchBook);

  const formatBookSummary = searchBook => getLatestChapterText(searchBook);

  const changeBookSource = searchBook => {
    if (isSelected(searchBook)) return;
    emit("change-book-source", searchBook);
  };

  watch(
    () => props.visible,
    visible => {
      if (visible) {
        runSearch();
        return;
      }
      cancelSearch();
    },
    { immediate: true }
  );

  watch(
    keyword,
    () => {
      if (props.visible) runSearch();
    }
  );

  onBeforeUnmount(() => {
    cancelSearch();
  });


  return {
    bookSourceGroup,
    bookSourceGroupList,
    changeBookSource,
    filteredBookSources,
    formatBookSummary,
    formatResponseTime,
    isSelected,
    loadMoreBookSources,
    loading,
    loadingMore,
    refresh,
    searchError,
    searchRunning,
    statusText
  };
};
