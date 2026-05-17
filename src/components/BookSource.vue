<template>
  <div class="reader-popup">
    <div class="reader-popup__header">
      <div class="reader-popup__title">来源({{ filteredBookSources.length }})</div>
      <div class="reader-popup__actions" :class="{ loading: searchRunning }">
        <el-select
          v-model="bookSourceGroup"
          size="small"
          class="booksource-group-select"
          filterable
          placeholder="全部分组"
        >
          <el-option
            v-for="item in bookSourceGroupList"
            :key="item.value || 'all'"
            :label="`${item.name} (${item.count})`"
            :value="item.value"
          />
        </el-select>
        <span :class="{ loading }" @click="refresh">
          <el-icon v-if="loading" class="is-loading">
            <Loading />
          </el-icon>
          {{ loading ? "刷新中..." : "刷新" }}
        </span>
        <span :class="{ loading: loadingMore }" @click="loadMoreBookSources">
          <el-icon v-if="loadingMore" class="is-loading">
            <Loading />
          </el-icon>
          {{ loadingMore ? "加载中..." : "加载更多" }}
        </span>
      </div>
    </div>
    <div class="reader-popup__body">
      <p v-if="statusText" class="source-status" :class="{ 'is-error': Boolean(searchError) }">
        {{ statusText }}
      </p>
      <div v-if="filteredBookSources.length" class="source-list">
        <div
          v-for="searchBook in filteredBookSources"
          :key="searchBook.key"
          class="source-item"
          :class="{ selected: isSelected(searchBook) }"
          @click="changeBookSource(searchBook)"
        >
          <div class="source-title">
            <div class="source-name">
              {{ searchBook.originName || "未知书源" }}
            </div>
            <div class="source-time">
              {{ isSelected(searchBook) ? "当前" : formatResponseTime(searchBook.time) }}
            </div>
          </div>
          <div class="source-latest-chapter">
            {{ formatBookSummary(searchBook) }}
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed, onBeforeUnmount, ref, watch } from "vue";
import { ElIcon } from "element-plus/es/components/icon/index.mjs";
import { ElOption, ElSelect } from "element-plus/es/components/select/index.mjs";
import "element-plus/es/components/icon/style/css.mjs";
import "element-plus/es/components/select/style/css.mjs";
import { Loading } from "@element-plus/icons-vue";
import { readSearchableSources, searchBooksBySources } from "../search/bookSourceSearch.js";
import "../styles/reader-popup.css";

const FIRST_PAGE = 1;

const props = defineProps({
  visible: {
    type: Boolean,
    default: false
  },
  book: {
    type: Object,
    default: null
  }
});

const emit = defineEmits(["change-book-source"]);

const bookSource = ref([]);
const bookSourceGroup = ref("");
const sourceList = ref([]);
const loading = ref(false);
const loadingMore = ref(false);
const searched = ref(false);
const searchError = ref("");
const page = ref(FIRST_PAGE);
let searchController = null;

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
  if (loading.value && !bookSource.value.length) return "正在搜索可用来源...";
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

const cancelSearch = () => {
  if (searchController) {
    searchController.abort();
    searchController = null;
  }
  loading.value = false;
  loadingMore.value = false;
};

const appendSearchBooks = books => {
  const existingKeys = new Set(bookSource.value.map(getResultKey));
  const nextBooks = [];
  books.forEach(book => {
    const key = getResultKey(book);
    if (existingKeys.has(key)) return;
    existingKeys.add(key);
    nextBooks.push({ ...book, key });
  });
  if (nextBooks.length) bookSource.value = [...bookSource.value, ...nextBooks];
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

const formatBookSummary = searchBook => {
  const parts = [
    searchBook.name,
    searchBook.author ? `作者：${searchBook.author}` : "",
    searchBook.latestChapterTitle || searchBook.latestChapter || "无最新章节"
  ].filter(Boolean);
  return parts.join(" · ");
};

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
</script>
