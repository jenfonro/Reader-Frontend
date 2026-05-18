<template>
  <HomePage
    v-if="isHomePage"
    @search="emit('search', $event)"
  />
  <BookshelfPage
    v-else-if="isBookshelfPage"
    :active-tab="bookshelfTab"
    @enter-reader="emit('enter-reader', $event)"
    @navigate-tab="emit('navigate-home', $event)"
  />
  <SettingsHomePage
    v-else-if="isSettingsPage"
    @open-page="emit('open-page', $event)"
  />
  <DiscoverPage
    v-else
    :title="pageTitle"
  />
</template>

<script setup>
import { computed } from "vue";
import BookshelfPage from "../components/home/BookshelfPage.vue";
import DiscoverPage from "../components/home/DiscoverPage.vue";
import HomePage from "../components/home/HomePage.vue";
import SettingsHomePage from "../components/home/SettingsHomePage.vue";
import {
  HOME_TAB_HOME,
  HOME_TAB_SETTINGS,
  isBookshelfTab,
  normalizeBookshelfTab
} from "../data/homeTabs";

const pageTitleMap = {
  library: "发现",
  ranking: "排行榜",
  complete: "完本小说",
  tags: "标签",
  authors: "作者"
};

const props = defineProps({
  activeKey: { type: String, default: HOME_TAB_HOME }
});

const emit = defineEmits(["enter-reader", "open-page", "navigate-home", "search"]);

const isHomePage = computed(() => props.activeKey === HOME_TAB_HOME);
const isSettingsPage = computed(() => props.activeKey === HOME_TAB_SETTINGS);
const isBookshelfPage = computed(() => isBookshelfTab(props.activeKey));
const bookshelfTab = computed(() => normalizeBookshelfTab(props.activeKey));
const pageTitle = computed(() => pageTitleMap[props.activeKey] || "发现");
</script>
