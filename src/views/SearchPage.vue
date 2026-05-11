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
      <p v-if="searching && !results.length" class="reader-search-status">正在搜索...</p>
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

const emit = defineEmits(["enter-reader"]);
const defaultCoverUrl = noImageUrl;
const previewResults = [
  {
    key: "preview-jianlai",
    name: "剑来",
    author: "烽火戏诸侯",
    intro: "大千世界，无奇不有。少年陈平安从骊珠洞天走出，一路远游，一路问剑。",
    latestChapter: "第一千二百三十章",
    tags: ["仙侠", "连载中", "预览书源"],
    highlightTag: "连载中",
    sourceCount: 6,
    coverUrl: "",
    hasCover: false
  },
  {
    key: "preview-guimi",
    name: "诡秘之主",
    author: "爱潜水的乌贼",
    intro: "蒸汽与机械的浪潮中，谁能触及非凡？历史和黑暗迷雾里又隐藏着什么？",
    latestChapter: "第一千四百三十二章",
    tags: ["玄幻", "完结", "高匹配"],
    highlightTag: "高匹配",
    sourceCount: 4,
    coverUrl: "",
    hasCover: false
  },
  {
    key: "preview-dafeng",
    name: "大奉打更人",
    author: "卖报小郎君",
    intro: "这个世界，有儒；有道；有佛；有妖；有术士。主角从京城打更人开始破局。",
    latestChapter: "第两百一十章",
    tags: ["仙侠", "完结", "榜单"],
    highlightTag: "榜单",
    sourceCount: 2,
    coverUrl: "",
    hasCover: false
  }
];

const keyword = ref("");
const results = ref([]);
const searched = ref(false);
const searching = ref(false);
let searchTimer = 0;

const submitSearch = () => {
  const value = keyword.value.trim();
  keyword.value = value;
  if (!value) {
    clearSearch();
    return;
  }

  searched.value = true;
  searching.value = true;
  clearSearchTimer();
  searchTimer = window.setTimeout(() => {
    const normalizedKeyword = value.toLowerCase();
    const matchedResults = previewResults.filter(result =>
      [result.name, result.author, result.intro, ...result.tags]
        .join(" ")
        .toLowerCase()
        .includes(normalizedKeyword)
    );
    results.value = matchedResults.length ? matchedResults : [];
    searching.value = false;
    searchTimer = 0;
  }, 160);
};

const clearSearchTimer = () => {
  if (!searchTimer) return;
  window.clearTimeout(searchTimer);
  searchTimer = 0;
};

const handleCoverError = result => {
  result.coverUrl = defaultCoverUrl;
  result.hasCover = false;
};

const clearSearch = () => {
  keyword.value = "";
  clearSearchTimer();
  results.value = [];
  searched.value = false;
  searching.value = false;
};

onBeforeUnmount(clearSearchTimer);
</script>
