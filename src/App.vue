<template>
  <div id="app">
    <ReaderView
      v-if="isReaderPage"
      :book="readerBook"
      @close-reader="goBack"
    />
    <AppShell
      v-else
      :active-key="shellActiveKey"
      :show-mobile-nav="showShellMobileNav"
      @navigate="handleShellNavigate"
    >
      <component
        :is="currentView"
        :key="currentPageKey"
        v-bind="currentViewProps"
        @enter-reader="openReader"
        @open-page="openPage"
        @navigate-home="handleShellNavigate"
        @search="openSearch"
        @back="goBack"
        @edit="openSourceEditor"
        @edit-replace="openReplaceEditor"
        @saved="handleSourceSaved"
        @saved-replace="handleReplaceSaved"
      />
    </AppShell>
  </div>
</template>

<script setup>
import { computed, defineAsyncComponent, onBeforeUnmount, onMounted, ref } from "vue";
import AppShell from "./components/AppShell.vue";
import IndexView from "./views/Index.vue";
import ReaderView from "./views/Reader.vue";
import {
  HOME_ACTIVE_DEFAULT,
  PAGE_API_SETTINGS,
  PAGE_BOOK_SOURCES,
  PAGE_EDGEONE_SETTINGS,
  PAGE_HOME,
  PAGE_INTERFACE_SETTINGS,
  PAGE_READER,
  PAGE_REPLACE_EDITOR,
  PAGE_REPLACE_RULES,
  PAGE_SEARCH,
  PAGE_SETTINGS_DETAIL,
  PAGE_SOURCE_EDITOR,
  PAGE_SYSTEM_SETTINGS,
  createHomePage,
  getHistoryPage,
  normalizePage,
  normalizeReaderBook,
  writeHistoryPage
} from "./app/pageStack.js";

const SearchPageView = defineAsyncComponent(() => import("./views/SearchPage.vue"));
const SystemSettingsView = defineAsyncComponent(() => import("./views/SystemSettings.vue"));
const ApiSettingsView = defineAsyncComponent(() => import("./views/ApiSettings.vue"));
const EdgeOneSettingsView = defineAsyncComponent(() => import("./views/EdgeOneSettings.vue"));
const InterfaceSettingsView = defineAsyncComponent(() => import("./views/InterfaceSettings.vue"));
const BookSourcePageView = defineAsyncComponent(() => import("./views/BookSourcePage.vue"));
const BookSourceEditView = defineAsyncComponent(() => import("./views/BookSourceEdit.vue"));
const ReplaceRulePageView = defineAsyncComponent(() => import("./views/ReplaceRulePage.vue"));
const ReplaceRuleEditView = defineAsyncComponent(() => import("./views/ReplaceRuleEdit.vue"));
const SettingsDetailView = defineAsyncComponent(() => import("./views/SettingsDetail.vue"));

const currentPage = ref(getHistoryPage());
const readerBook = ref(currentPage.value.name === PAGE_READER ? currentPage.value.book : null);
const homeActiveKey = ref(
  currentPage.value.name === PAGE_HOME ? currentPage.value.activeKey : HOME_ACTIVE_DEFAULT
);
const isReaderPage = computed(() => currentPage.value.name === PAGE_READER);

const showShellMobileNav = computed(() => currentPage.value.name === PAGE_HOME);

const shellActiveKey = computed(() => {
  if (currentPage.value.name === PAGE_HOME) return homeActiveKey.value;
  if (currentPage.value.name === PAGE_SEARCH) return "search";
  return "settings";
});

const currentView = computed(() => {
  switch (currentPage.value.name) {
    case PAGE_SEARCH:
      return SearchPageView;
    case PAGE_SYSTEM_SETTINGS:
      return SystemSettingsView;
    case PAGE_API_SETTINGS:
      return ApiSettingsView;
    case PAGE_EDGEONE_SETTINGS:
      return EdgeOneSettingsView;
    case PAGE_INTERFACE_SETTINGS:
      return InterfaceSettingsView;
    case PAGE_BOOK_SOURCES:
      return BookSourcePageView;
    case PAGE_REPLACE_RULES:
      return ReplaceRulePageView;
    case PAGE_SOURCE_EDITOR:
      return BookSourceEditView;
    case PAGE_REPLACE_EDITOR:
      return ReplaceRuleEditView;
    case PAGE_SETTINGS_DETAIL:
      return SettingsDetailView;
    default:
      return IndexView;
  }
});

const currentViewProps = computed(() => {
  if (currentPage.value.name === PAGE_HOME) {
    return { activeKey: currentPage.value.activeKey || homeActiveKey.value };
  }
  if (currentPage.value.name === PAGE_SOURCE_EDITOR) {
    return {
      sourceKey: currentPage.value.sourceKey || "",
      sourceName: currentPage.value.sourceName || ""
    };
  }
  if (currentPage.value.name === PAGE_REPLACE_EDITOR) {
    return {
      ruleKey: currentPage.value.ruleKey || "",
      ruleName: currentPage.value.ruleName || ""
    };
  }
  if (currentPage.value.name === PAGE_SETTINGS_DETAIL) {
    return { settingKey: currentPage.value.settingKey || "" };
  }
  return {};
});

const currentPageKey = computed(() => {
  if (currentPage.value.name === PAGE_SOURCE_EDITOR) {
    return [
      PAGE_SOURCE_EDITOR,
      currentPage.value.sourceKey || "",
      currentPage.value.sourceName || ""
    ].join(":");
  }
  if (currentPage.value.name === PAGE_REPLACE_EDITOR) {
    return [
      PAGE_REPLACE_EDITOR,
      currentPage.value.ruleKey || "",
      currentPage.value.ruleName || ""
    ].join(":");
  }
  if (currentPage.value.name === PAGE_SETTINGS_DETAIL) {
    return `${PAGE_SETTINGS_DETAIL}:${currentPage.value.settingKey || ""}`;
  }
  return currentPage.value.name;
});

const syncCurrentPage = page => {
  currentPage.value = normalizePage(page);
  if (currentPage.value.name === PAGE_READER) {
    readerBook.value = currentPage.value.book || null;
  }
  if (currentPage.value.name === PAGE_HOME) {
    homeActiveKey.value = currentPage.value.activeKey || HOME_ACTIVE_DEFAULT;
  }
};

const replaceCurrentPage = page => {
  syncCurrentPage(writeHistoryPage(page, "replace"));
};

const pushPage = page => {
  if (currentPage.value.name === PAGE_HOME) {
    writeHistoryPage(createHomePage(homeActiveKey.value), "replace");
  }
  syncCurrentPage(writeHistoryPage(page, "push"));
};

const goBack = () => {
  if (window.history.length > 1) {
    window.history.back();
    return;
  }
  replaceCurrentPage(createHomePage(homeActiveKey.value));
};

const openReader = book => {
  const nextBook = normalizeReaderBook(book);
  readerBook.value = nextBook;
  if (currentPage.value.name === PAGE_READER) return;
  pushPage({ name: PAGE_READER, book: nextBook });
};

const openSearch = async value => {
  const keyword = String(value || "").trim();
  if (!keyword) return;

  const searchState = await import("./search/searchPageState.js");
  searchState.searchByKeyword(keyword);

  if (currentPage.value.name !== PAGE_SEARCH) pushPage({ name: PAGE_SEARCH });
};

const handleShellNavigate = key => {
  const activeKey = key || HOME_ACTIVE_DEFAULT;
  homeActiveKey.value = activeKey;
  replaceCurrentPage(createHomePage(activeKey));
};

const openPage = page => {
  const pageName = typeof page === "string" ? page : page?.name;
  if (pageName === PAGE_SYSTEM_SETTINGS) {
    pushPage({ name: PAGE_SYSTEM_SETTINGS });
    return;
  }
  if (pageName === PAGE_API_SETTINGS) {
    pushPage({ name: PAGE_API_SETTINGS });
    return;
  }
  if (pageName === PAGE_EDGEONE_SETTINGS) {
    pushPage({ name: PAGE_EDGEONE_SETTINGS });
    return;
  }
  if (pageName === PAGE_INTERFACE_SETTINGS) {
    pushPage({ name: PAGE_INTERFACE_SETTINGS });
    return;
  }
  if (pageName === PAGE_BOOK_SOURCES) {
    pushPage({ name: PAGE_BOOK_SOURCES });
    return;
  }
  if (pageName === PAGE_REPLACE_RULES) {
    pushPage({ name: PAGE_REPLACE_RULES });
    return;
  }
  if (pageName) {
    pushPage({ name: PAGE_SETTINGS_DETAIL, settingKey: pageName });
  }
};

const openSourceEditor = source => {
  pushPage({
    name: PAGE_SOURCE_EDITOR,
    sourceKey: source?.key || "",
    sourceName: source?.name || "新建书源"
  });
};

const openReplaceEditor = rule => {
  pushPage({
    name: PAGE_REPLACE_EDITOR,
    ruleKey: rule?.key || "",
    ruleName: rule?.name || "新建替换"
  });
};

const handleSourceSaved = result => {
  if (currentPage.value.name !== PAGE_SOURCE_EDITOR || !result?.key) return;
  replaceCurrentPage({
    ...currentPage.value,
    sourceKey: result.key,
    sourceName: result.source?.bookSourceName || currentPage.value.sourceName
  });
};

const handleReplaceSaved = result => {
  if (currentPage.value.name !== PAGE_REPLACE_EDITOR || !result?.key) return;
  replaceCurrentPage({
    ...currentPage.value,
    ruleKey: result.key,
    ruleName: result.rule?.name || currentPage.value.ruleName
  });
};

const handlePopState = event => {
  syncCurrentPage(getHistoryPage(event?.state));
};


onMounted(() => {
  writeHistoryPage(currentPage.value, "replace");
  window.addEventListener("popstate", handlePopState);
});

onBeforeUnmount(() => {
  window.removeEventListener("popstate", handlePopState);
});
</script>

<style src="./styles/app.css"></style>
