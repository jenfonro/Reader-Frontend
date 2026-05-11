<template>
  <PageLayout root-class="reader-search-page" body-class="reader-search-page__body">
    <template #header>
      <form class="reader-search-page__header" role="search" @submit.prevent="submitSearch">
        <label class="reader-search reader-search-page__input">
          <Icon name="search" :size="20" />
          <input
            v-model="keyword"
            type="search"
            autocomplete="off"
            placeholder="搜索书名、作者、关键词..."
          />
          <button
            v-if="keyword"
            class="reader-search-page__clear"
            type="button"
            aria-label="清空搜索"
            @click="clearSearch"
          >×</button>
        </label>
        <button class="reader-search-page__button" type="submit">搜索</button>
      </form>
    </template>

    <section class="reader-search-results" aria-label="搜索结果">
      <p v-if="searchError" class="reader-search-status is-error">{{ searchError }}</p>
      <p v-else-if="searching && !results.length" class="reader-search-status">正在搜索...</p>
      <p v-else-if="searched && !results.length" class="reader-search-status">没有搜索结果</p>

      <div v-if="results.length" class="reader-search-results__list">
        <article
          v-for="result in results"
          :key="result.key"
          class="reader-search-result"
          role="button"
          tabindex="0"
          :aria-label="`查看${result.name}详情`"
          @click="emit('enter-reader')"
          @keydown.enter.prevent="emit('enter-reader')"
          @keydown.space.prevent="emit('enter-reader')"
        >
          <div
            class="reader-search-result__cover"
            :class="{ 'has-cover': result.hasCover, 'has-chapter': result.latestChapter }"
          >
            <img
              :src="result.coverUrl || defaultCoverUrl"
              :alt="`${result.name}封面`"
              @error="handleCoverError(result)"
            />
            <span v-if="result.latestChapter" class="reader-search-result__chapter">
              {{ result.latestChapter }}
            </span>
          </div>

          <div class="reader-search-result__content">
            <div class="reader-search-result__main">
              <div class="reader-search-result__title-row">
                <h2>{{ result.name }}</h2>
                <span v-if="result.sourceCount > 1" class="reader-search-result__source-count">
                  {{ result.sourceCount }}
                </span>
              </div>
              <p class="reader-search-result__author">作者：{{ result.author || "未知" }}</p>
              <p class="reader-search-result__intro">{{ result.intro || "暂无简介" }}</p>
            </div>

            <div v-if="result.tags.length" class="reader-search-result__tags" aria-label="书籍信息">
              <span
                v-for="tag in result.tags"
                :key="tag"
                :class="{ 'is-highlight': tag === result.highlightTag }"
              >{{ tag }}</span>
            </div>
          </div>
        </article>
      </div>
    </section>
  </PageLayout>
</template>

<script setup>
import { onBeforeUnmount, ref } from "vue";
import noImageUrl from "../assets/imgs/noImage.png";
import Icon from "../components/Icon.vue";
import PageLayout from "../components/PageLayout.vue";
import { readSearchableSources, searchBooksBySources } from "../search/bookSourceSearch.js";
import { summarizeSearchErrors } from "../search/searchErrors.js";

const emit = defineEmits(["enter-reader"]);
const defaultCoverUrl = noImageUrl;

const keyword = ref("");
const results = ref([]);
const searched = ref(false);
const searching = ref(false);
const searchError = ref("");
let activeSearchKeyword = "";
let searchController = null;
let resultGroups = new Map();
let sourceErrorCount = 0;
let sourceErrors = [];
let resultSequence = 0;

const normalizeGroupText = value =>
  String(value || "")
    .trim()
    .replace(/\s+/g, "")
    .toLowerCase();

const buildGroupKey = book => `${normalizeGroupText(book.name)}:${normalizeGroupText(book.author)}`;

const buildTags = book =>
  [book.kind, book.wordCount, book.originName]
    .map(value => String(value || "").trim())
    .filter(Boolean)
    .filter((value, index, array) => array.indexOf(value) === index)
    .slice(0, 5);

const normalizeSearchBook = book => {
  const tags = buildTags(book);
  return {
    key: buildGroupKey(book) || book.key || `search-result-${resultSequence}`,
    name: String(book.name || "").trim(),
    author: String(book.author || "").trim(),
    intro: String(book.intro || "").trim(),
    latestChapter: String(book.latestChapterTitle || "").trim(),
    tags,
    highlightTag: book.originName || tags[0] || "",
    sourceCount: 1,
    sources: [book],
    coverUrl: String(book.coverUrl || "").trim(),
    hasCover: Boolean(book.coverUrl),
    score: 0,
    sequence: resultSequence++
  };
};

const getRelevanceScore = (book, searchKeyword) => {
  const normalizedKeyword = normalizeGroupText(searchKeyword);
  const normalizedName = normalizeGroupText(book.name);
  const normalizedAuthor = normalizeGroupText(book.author);
  if (!normalizedKeyword) return 0;
  if (normalizedName === normalizedKeyword) return 100;
  if (normalizedName.startsWith(normalizedKeyword)) return 80;
  if (normalizedName.includes(normalizedKeyword)) return 60;
  if (normalizedAuthor.includes(normalizedKeyword)) return 30;
  return 0;
};

const sortSearchResults = values =>
  values.sort((left, right) =>
    right.score - left.score ||
    right.sourceCount - left.sourceCount ||
    left.sequence - right.sequence
  );

const mergeSearchResult = (current, next) => {
  current.sourceCount += 1;
  current.sources.push(next.sources[0]);
  if (!current.coverUrl && next.coverUrl) {
    current.coverUrl = next.coverUrl;
    current.hasCover = true;
  }
  if (!current.intro && next.intro) current.intro = next.intro;
  if (!current.latestChapter && next.latestChapter) current.latestChapter = next.latestChapter;
  current.tags = [...new Set([...current.tags, ...next.tags])].slice(0, 5);
  if (!current.highlightTag && next.highlightTag) current.highlightTag = next.highlightTag;
};

const appendSearchBooks = books => {
  books.forEach(book => {
    const normalized = normalizeSearchBook(book);
    if (!normalized.name) return;
    normalized.score = getRelevanceScore(normalized, activeSearchKeyword);
    const current = resultGroups.get(normalized.key);
    if (current) {
      mergeSearchResult(current, normalized);
    } else {
      resultGroups.set(normalized.key, normalized);
    }
  });
  results.value = sortSearchResults([...resultGroups.values()]);
};

const cancelSearch = () => {
  if (!searchController) return;
  searchController.abort();
  searchController = null;
};

const resetSearchState = () => {
  results.value = [];
  resultGroups = new Map();
  resultSequence = 0;
  sourceErrorCount = 0;
  sourceErrors = [];
  searchError.value = "";
};

const handleSearchEvent = event => {
  if (event.type === "source") {
    appendSearchBooks(event.books || []);
    return;
  }
  if (event.type === "source-error") {
    sourceErrorCount += 1;
    sourceErrors.push(event.error);
  }
};

const submitSearch = async () => {
  const value = keyword.value.trim();
  keyword.value = value;
  if (!value) {
    clearSearch();
    return;
  }
  if (value === activeSearchKeyword && (searching.value || searched.value)) return;

  cancelSearch();
  resetSearchState();
  activeSearchKeyword = value;
  searched.value = true;
  searching.value = true;

  const sources = readSearchableSources();
  if (!sources.length) {
    searchError.value = "暂无可用书源";
    searching.value = false;
    return;
  }

  const controller = new AbortController();
  searchController = controller;

  try {
    await searchBooksBySources({
      keyword: value,
      signal: controller.signal,
      onEvent: handleSearchEvent
    });
  } catch (error) {
    if (error?.name !== "AbortError") searchError.value = "搜索失败，请稍后再试";
  } finally {
    if (searchController === controller) {
      searchController = null;
      searching.value = false;
      if (!results.value.length && sourceErrorCount > 0 && !searchError.value) {
        searchError.value = summarizeSearchErrors(sourceErrors);
      }
    }
  }
};

const handleCoverError = result => {
  result.coverUrl = defaultCoverUrl;
  result.hasCover = false;
};

const clearSearch = () => {
  keyword.value = "";
  activeSearchKeyword = "";
  cancelSearch();
  resetSearchState();
  searched.value = false;
  searching.value = false;
};

onBeforeUnmount(cancelSearch);
</script>
