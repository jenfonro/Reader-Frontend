<template>
  <PageLayout :root-class="pageRootClass" :body-class="pageBodyClass">
    <template #header>
      <PageTopbar v-if="activeKey === 'settings'" title="设置" />
      <div v-else class="home-header">
        <SearchBar
          v-model="homeSearchKeyword"
          class="home-header__search"
          @submit="submitHomeSearch"
        />

        <div class="home-bookshelf-header" role="tablist" aria-label="书架与历史">
          <button
            type="button"
            :class="{ 'is-active': activeTab === 'bookshelf' }"
            role="tab"
            :aria-selected="activeTab === 'bookshelf'"
            @click="switchTab('bookshelf')"
          >
            书架
          </button>
          <button
            type="button"
            :class="{ 'is-active': activeTab === 'history' }"
            role="tab"
            :aria-selected="activeTab === 'history'"
            @click="switchTab('history')"
          >
            历史
          </button>
        </div>
      </div>
    </template>

    <SettingsHome
      v-if="activeKey === 'settings'"
      @select="openSettingPage"
    />
    <section v-else class="home-bookshelf-view" :aria-label="activeTabLabel">
      <div v-if="visibleBooks.length" class="home-book-grid">
        <article
          v-for="book in visibleBooks"
          :key="book.key"
          class="home-book-card"
          @click="openBook(book)"
        >
          <div class="home-book-card__cover-wrap">
            <img
              class="home-book-card__cover"
              :src="book.coverUrl || noCoverImage"
              :alt="book.name"
              loading="lazy"
              @error="useFallbackCover"
            />
          </div>
          <div class="home-book-card__name">{{ book.name }}</div>
          <div class="home-book-card__chapter">{{ getChapterText(book) }}</div>
          <button
            v-if="activeTab === 'history'"
            type="button"
            class="home-book-card__shelf-button"
            :disabled="isInShelf(book)"
            @click.stop="addToShelf(book)"
          >
            {{ isInShelf(book) ? "已在书架" : "加入书架" }}
          </button>
        </article>
      </div>
      <div v-else class="home-bookshelf-empty">
        <div class="home-bookshelf-empty__title">{{ emptyTitle }}</div>
        <div class="home-bookshelf-empty__desc">{{ emptyDescription }}</div>
      </div>
    </section>
  </PageLayout>
</template>

<script setup>
import { computed, onBeforeUnmount, ref, watch } from "vue";
import PageLayout from "../components/PageLayout.vue";
import PageTopbar from "../components/PageTopbar.vue";
import SearchBar from "../components/SearchBar.vue";
import SettingsHome from "../components/settings/SettingsHome.vue";
import noCoverImage from "../assets/imgs/noCover.jpeg";
import {
  addHistoryBook,
  addShelfBook,
  getHistoryBooks,
  getShelfBooks,
  isBookInShelf,
  subscribeBookshelf
} from "../data/bookshelf";

const BOOKSHELF_TAB = "bookshelf";
const HISTORY_TAB = "history";

const props = defineProps({
  activeKey: { type: String, default: "home" }
});

const emit = defineEmits(["enter-reader", "open-page", "navigate-home", "search"]);
const homeSearchKeyword = ref("");
const shelfBooks = ref(getShelfBooks());
const historyBooks = ref(getHistoryBooks());

const pageRootClass = computed(() => [
  "reader-home-page",
  { "reader-home-page--main": props.activeKey !== "settings" }
]);
const pageBodyClass = computed(() =>
  props.activeKey === "settings" ? "reader-settings-menu-body" : "reader-home-page__body"
);
const activeTab = computed(() => (props.activeKey === HISTORY_TAB ? HISTORY_TAB : BOOKSHELF_TAB));
const activeTabLabel = computed(() => (activeTab.value === HISTORY_TAB ? "阅读历史" : "我的书架"));
const visibleBooks = computed(() =>
  activeTab.value === HISTORY_TAB ? historyBooks.value : shelfBooks.value
);
const emptyTitle = computed(() =>
  activeTab.value === HISTORY_TAB ? "还没有阅读历史" : "书架是空的"
);
const emptyDescription = computed(() =>
  activeTab.value === HISTORY_TAB ? "打开一本书后会在这里显示。" : "从搜索结果或历史记录中加入书架。"
);

const refreshBooks = () => {
  shelfBooks.value = getShelfBooks();
  historyBooks.value = getHistoryBooks();
};

const openSettingPage = key => {
  emit("open-page", { name: key });
};

const switchTab = key => {
  emit("navigate-home", key === HISTORY_TAB ? HISTORY_TAB : BOOKSHELF_TAB);
};

const submitHomeSearch = value => {
  const nextKeyword = String(value || "").trim();
  homeSearchKeyword.value = nextKeyword;
  if (!nextKeyword) return;
  emit("search", nextKeyword);
};

const openBook = book => {
  addHistoryBook(book);
  refreshBooks();
  emit("enter-reader", book);
};

const getChapterText = book =>
  book.durChapterTitle || book.latestChapterTitle || book.chapterTitle || "暂无阅读章节";

const isInShelf = book => isBookInShelf(book);

const addToShelf = book => {
  addShelfBook(book);
  refreshBooks();
};

const useFallbackCover = event => {
  if (event.target.src !== noCoverImage) event.target.src = noCoverImage;
};

const unsubscribeBookshelf = subscribeBookshelf(refreshBooks);

watch(
  () => props.activeKey,
  () => refreshBooks()
);

onBeforeUnmount(() => {
  unsubscribeBookshelf();
});
</script>

<style scoped>
.reader-home-page--main {
  --reader-page-topbar-row-height: 104px;
}

.home-header {
  position: relative;
  z-index: 10;
  height: var(--reader-page-topbar-space, calc(104px + env(safe-area-inset-top)));
  display: flex;
  flex-direction: column;
  justify-content: center;
  gap: 8px;
  padding: env(safe-area-inset-top) var(--reader-page-content-x, 24px) 8px;
  background: var(--reader-app-bg);
  box-sizing: border-box;
}

.home-header__search {
  --reader-search-bar-input-height: 40px;
  --reader-search-bar-input-radius: 16px;
  --reader-search-bar-button-height: 38px;
  --reader-search-bar-button-radius: 13px;
  --reader-search-bar-button-x: 10px;
}

.home-bookshelf-header {
  position: relative;
  z-index: 10;
  height: 34px;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  box-sizing: border-box;
}

.home-bookshelf-header button {
  min-width: 72px;
  height: 34px;
  border: 0;
  border-radius: 999px;
  background: transparent;
  color: var(--reader-app-text);
  font-size: 16px;
  line-height: 1;
  font-weight: 650;
  letter-spacing: -0.01em;
  cursor: pointer;
  transition: background 0.16s ease, color 0.16s ease, transform 0.16s ease;
}

.home-bookshelf-header button.is-active {
  background: rgba(0, 122, 255, 0.12);
  color: var(--reader-app-accent);
}

.home-bookshelf-header button:active {
  transform: scale(0.96);
}

.home-bookshelf-view {
  min-height: 0;
  width: 100%;
  box-sizing: border-box;
}

.home-book-grid {
  width: 100%;
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(104px, 1fr));
  gap: 22px 18px;
  padding-bottom: calc(96px + env(safe-area-inset-bottom));
  box-sizing: border-box;
}

.home-book-card {
  min-width: 0;
  display: flex;
  flex-direction: column;
  align-items: stretch;
  gap: 7px;
  cursor: pointer;
  user-select: none;
}

.home-book-card__cover-wrap {
  width: 100%;
  aspect-ratio: 3 / 4.15;
  overflow: hidden;
  border-radius: 10px;
  background: linear-gradient(135deg, rgba(255,255,255,0.92), rgba(235,238,244,0.82));
  box-shadow: 0 10px 22px rgba(0, 0, 0, 0.09);
}

.home-book-card__cover {
  width: 100%;
  height: 100%;
  display: block;
  object-fit: cover;
}

.home-book-card__name {
  min-height: 40px;
  display: -webkit-box;
  overflow: hidden;
  color: var(--reader-app-text);
  font-size: 14px;
  line-height: 20px;
  font-weight: 600;
  letter-spacing: -0.01em;
  text-overflow: ellipsis;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
}

.home-book-card__chapter {
  min-height: 17px;
  overflow: hidden;
  color: rgba(60, 60, 67, 0.62);
  font-size: 12px;
  line-height: 17px;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.home-book-card__shelf-button {
  height: 30px;
  margin-top: 1px;
  border: 0;
  border-radius: 999px;
  background: rgba(0, 122, 255, 0.12);
  color: var(--reader-app-accent);
  font-size: 12px;
  line-height: 1;
  font-weight: 650;
  cursor: pointer;
}

.home-book-card__shelf-button:disabled {
  background: rgba(118, 118, 128, 0.12);
  color: rgba(60, 60, 67, 0.52);
  cursor: default;
}

.home-bookshelf-empty {
  min-height: 46vh;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 8px;
  color: rgba(60, 60, 67, 0.52);
  text-align: center;
}

.home-bookshelf-empty__title {
  color: var(--reader-app-text);
  font-size: 17px;
  font-weight: 650;
}

.home-bookshelf-empty__desc {
  font-size: 13px;
  line-height: 1.45;
}

@container reader-shell (min-width: 751px) {
  .home-book-grid {
    grid-template-columns: repeat(auto-fill, minmax(116px, 132px));
    gap: 26px 22px;
  }
}

@container reader-shell (max-width: 750px) {
  .home-header {
    padding-right: var(--reader-mobile-content-x, 14px);
    padding-left: var(--reader-mobile-content-x, 14px);
  }

  .home-bookshelf-header {
    justify-content: flex-start;
  }

  .home-bookshelf-header button {
    min-width: 64px;
    height: 32px;
    font-size: 15px;
  }

  .home-book-grid {
    grid-template-columns: repeat(3, minmax(0, 1fr));
    gap: 20px 14px;
  }
}

@container reader-shell (max-width: 420px) {
  .home-book-grid {
    grid-template-columns: repeat(3, minmax(0, 1fr));
    gap: 18px 12px;
  }

  .home-book-card__name {
    font-size: 13px;
    line-height: 19px;
    min-height: 38px;
  }
}

:global(.night) .home-book-card__chapter,
:global(.night) .home-bookshelf-empty {
  color: rgba(235, 235, 245, 0.56);
}

:global(.night) .home-book-card__shelf-button:disabled {
  color: rgba(235, 235, 245, 0.46);
}
</style>
