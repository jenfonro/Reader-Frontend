<template>
  <PageLayout root-class="reader-search-page" body-class="reader-search-page__body">
    <template #header>
      <SearchBar
        v-model="keyword"
        class="reader-search-page__header"
        @submit="submitSearch"
        @clear="clearSearch"
      />
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
          @click="emit('enter-reader', result)"
          @keydown.enter.prevent="emit('enter-reader', result)"
          @keydown.space.prevent="emit('enter-reader', result)"
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
import noImageUrl from "../assets/imgs/noImage.png";
import PageLayout from "../components/PageLayout.vue";
import SearchBar from "../components/SearchBar.vue";
import {
  clearSearch,
  keyword,
  results,
  searched,
  searchError,
  searching,
  submitSearch
} from "../search/searchPageState.js";

defineOptions({
  name: "SearchPage"
});

const emit = defineEmits(["enter-reader"]);
const defaultCoverUrl = noImageUrl;

const handleCoverError = result => {
  result.coverUrl = defaultCoverUrl;
  result.hasCover = false;
};
</script>
