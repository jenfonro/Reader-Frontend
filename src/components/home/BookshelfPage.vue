<template>
  <PageLayout root-class="reader-home-page reader-home-page--bookshelf" body-class="reader-home-page__body">
    <template #header>
      <BookshelfTabs :active-tab="currentTab" @change="switchTab" />
    </template>

    <section class="home-bookshelf-view" :aria-label="activeTabLabel">
      <SearchBar
        v-model="localSearchKeyword"
        class="home-bookshelf-search"
        :placeholder="searchPlaceholder"
        :show-button="false"
      />

      <div v-if="visibleBooks.length" class="home-book-grid">
        <BookshelfBookCard
          v-for="book in visibleBooks"
          :key="book.key"
          :active="activeBookMenuKey === book.key"
          :book="book"
          :chapter-text="getChapterText(book)"
          :history-tab="isHistoryTab"
          :in-shelf="isInShelf(book)"
          :no-cover-image="noCoverImage"
          @add-to-shelf="addToShelf"
          @context-menu="openBookMenu"
          @open="handleBookClick"
          @pointer-down="startBookLongPress"
          @pointer-end="cancelBookLongPress"
          @pointer-move="handleBookPointerMove"
        />
      </div>
      <BookshelfEmptyState
        v-else
        :description="emptyDescription"
        :title="emptyTitle"
      />
    </section>

    <Teleport to="body">
      <ManageRowMenu
        v-if="bookMenu.open"
        fixed
        :items="bookMenuItems"
        :position="bookMenu.position"
        @close="closeBookMenu"
        @action="handleBookMenuAction($event)"
      />
    </Teleport>
  </PageLayout>
</template>

<script setup>
import { computed, onBeforeUnmount, ref, watch } from "vue";
import ManageRowMenu from "../ManageRowMenu.vue";
import PageLayout from "../PageLayout.vue";
import SearchBar from "../SearchBar.vue";
import noCoverImage from "../../assets/imgs/noCover.jpeg";
import BookshelfBookCard from "./BookshelfBookCard.vue";
import BookshelfEmptyState from "./BookshelfEmptyState.vue";
import BookshelfTabs from "./BookshelfTabs.vue";
import {
  HOME_TAB_BOOKSHELF,
  HOME_TAB_HISTORY,
  normalizeBookshelfTab
} from "../../data/homeTabs";
import { useBookContextMenu } from "../../composables/useBookContextMenu";
import {
  addShelfBook,
  getHistoryBooks,
  getShelfBooks,
  isBookInShelf,
  pinShelfBook,
  removeHistoryBook,
  removeShelfBook,
  subscribeBookshelf
} from "../../data/bookshelf";

const props = defineProps({
  activeTab: { type: String, default: HOME_TAB_BOOKSHELF }
});

const emit = defineEmits(["enter-reader", "navigate-tab"]);
const shelfBooks = ref(getShelfBooks());
const historyBooks = ref(getHistoryBooks());
const localSearchKeyword = ref("");
const {
  activeBookMenuKey,
  bookMenu,
  cancelBookLongPress,
  closeBookMenu,
  consumeSuppressedBookClick,
  handleBookPointerMove,
  openBookMenu,
  startBookLongPress
} = useBookContextMenu();

const currentTab = computed(() => normalizeBookshelfTab(props.activeTab));
const isHistoryTab = computed(() => currentTab.value === HOME_TAB_HISTORY);
const baseBooks = computed(() => (isHistoryTab.value ? historyBooks.value : shelfBooks.value));
const normalizedSearchKeyword = computed(() => localSearchKeyword.value.trim().toLowerCase());
const visibleBooks = computed(() => {
  const keyword = normalizedSearchKeyword.value;
  if (!keyword) return baseBooks.value;
  return baseBooks.value.filter(book => getBookSearchText(book).includes(keyword));
});
const hasLocalSearch = computed(() => Boolean(normalizedSearchKeyword.value));
const activeTabLabel = computed(() => (isHistoryTab.value ? "阅读历史" : "我的书架"));
const searchPlaceholder = computed(() => (isHistoryTab.value ? "搜索阅读历史" : "搜索我的书架"));
const bookMenuItems = computed(() =>
  isHistoryTab.value
    ? [{ label: "删除", value: "delete", danger: true }]
    : [
        { label: "置顶", value: "top" },
        { label: "移出书架", value: "remove", danger: true }
      ]
);
const emptyTitle = computed(() => {
  if (hasLocalSearch.value) return "没有匹配结果";
  return isHistoryTab.value ? "还没有阅读历史" : "书架是空的";
});
const emptyDescription = computed(() => {
  if (hasLocalSearch.value) return "换个关键词再试试。";
  return isHistoryTab.value ? "打开一本书后会在这里显示。" : "从搜索结果或历史记录中加入书架。";
});

const refreshBooks = () => {
  shelfBooks.value = getShelfBooks();
  historyBooks.value = getHistoryBooks();
};

const switchTab = key => {
  emit("navigate-tab", normalizeBookshelfTab(key));
};

const getBookSearchText = book =>
  [
    book.name,
    book.title,
    book.author,
    book.originName,
    book.latestChapterTitle,
    book.latestChapter,
    book.durChapterTitle,
    book.chapterTitle,
    Array.isArray(book.tags) ? book.tags.join(" ") : book.tags
  ]
    .filter(Boolean)
    .join(" ")
    .toLowerCase();

const handleBookClick = book => {
  cancelBookLongPress();

  if (consumeSuppressedBookClick()) return;

  if (bookMenu.value.open) {
    closeBookMenu();
    return;
  }

  openBook(book);
};

const handleBookMenuAction = action => {
  const book = bookMenu.value.book;
  closeBookMenu();
  if (!book) return;

  if (isHistoryTab.value) {
    if (action === "delete") {
      removeHistoryBook(book);
      refreshBooks();
    }
    return;
  }

  if (action === "top") {
    pinShelfBook(book);
    refreshBooks();
    return;
  }

  if (action === "remove") {
    removeShelfBook(book);
    refreshBooks();
  }
};

const openBook = book => {
  emit("enter-reader", book);
};

const getChapterText = book =>
  book.durChapterTitle || book.latestChapterTitle || book.chapterTitle || "暂无阅读章节";

const isInShelf = book => isBookInShelf(book);

const addToShelf = book => {
  addShelfBook(book);
  refreshBooks();
};

const unsubscribeBookshelf = subscribeBookshelf(refreshBooks);

watch(
  () => props.activeTab,
  () => {
    closeBookMenu();
    refreshBooks();
  }
);

onBeforeUnmount(() => {
  unsubscribeBookshelf();
});
</script>

<style src="../../styles/bookshelf.css"></style>
