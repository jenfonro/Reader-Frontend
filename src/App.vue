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
import { createReaderBookFromSearchResult } from "./search/searchResultBook.js";

const PAGE_HOME = "home";
const PAGE_READER = "reader";
const PAGE_SEARCH = "search";
const PAGE_SYSTEM_SETTINGS = "settings-system";
const PAGE_API_SETTINGS = "settings-api";
const PAGE_EDGEONE_SETTINGS = "settings-edgeone";
const PAGE_INTERFACE_SETTINGS = "settings-interface";
const PAGE_BOOK_SOURCES = "settings-sources";
const PAGE_REPLACE_RULES = "settings-replace";
const PAGE_SOURCE_EDITOR = "source-editor";
const PAGE_REPLACE_EDITOR = "replace-editor";
const PAGE_SETTINGS_DETAIL = "settings-detail";
const HOME_ACTIVE_DEFAULT = "home";

const IndexView = defineAsyncComponent(() => import("./views/Index.vue"));
const ReaderView = defineAsyncComponent(() => import("./views/Reader.vue"));
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

const createHomePage = (activeKey = HOME_ACTIVE_DEFAULT) => ({
  name: PAGE_HOME,
  activeKey: activeKey || HOME_ACTIVE_DEFAULT
});

const normalizeReaderBook = book => {
  if (!book || typeof book !== "object" || Array.isArray(book)) return null;
  try {
    return JSON.parse(JSON.stringify(createReaderBookFromSearchResult(book)));
  } catch (error) {
    return createReaderBookFromSearchResult(book);
  }
};

const normalizePage = value => {
  if (value?.name === PAGE_READER) {
    return {
      name: PAGE_READER,
      book: normalizeReaderBook(value.book || value.readerBook)
    };
  }
  if (value?.name === PAGE_SEARCH) {
    return { name: PAGE_SEARCH };
  }
  if (value?.name === PAGE_SYSTEM_SETTINGS) {
    return { name: PAGE_SYSTEM_SETTINGS };
  }
  if (value?.name === PAGE_API_SETTINGS) {
    return { name: PAGE_API_SETTINGS };
  }
  if (value?.name === PAGE_EDGEONE_SETTINGS) {
    return { name: PAGE_EDGEONE_SETTINGS };
  }
  if (value?.name === PAGE_INTERFACE_SETTINGS) {
    return { name: PAGE_INTERFACE_SETTINGS };
  }
  if (value?.name === PAGE_BOOK_SOURCES) {
    return { name: PAGE_BOOK_SOURCES };
  }
  if (value?.name === PAGE_REPLACE_RULES) {
    return { name: PAGE_REPLACE_RULES };
  }
  if (value?.name === PAGE_SOURCE_EDITOR) {
    return {
      name: PAGE_SOURCE_EDITOR,
      sourceKey: typeof value.sourceKey === "string" ? value.sourceKey : "",
      sourceName: typeof value.sourceName === "string" ? value.sourceName : ""
    };
  }
  if (value?.name === PAGE_REPLACE_EDITOR) {
    return {
      name: PAGE_REPLACE_EDITOR,
      ruleKey: typeof value.ruleKey === "string" ? value.ruleKey : "",
      ruleName: typeof value.ruleName === "string" ? value.ruleName : ""
    };
  }
  if (value?.name === PAGE_SETTINGS_DETAIL) {
    return {
      name: PAGE_SETTINGS_DETAIL,
      settingKey: typeof value.settingKey === "string" ? value.settingKey : ""
    };
  }
  return createHomePage(value?.activeKey);
};

const getHistoryPage = stateValue => {
  if (typeof window === "undefined") return createHomePage();
  const state = stateValue === undefined ? window.history.state : stateValue;
  if (state?.appPage) return normalizePage(state.appPage);
  return normalizePage(state);
};

const writeHistoryPage = (page, mode = "replace") => {
  const normalizedPage = normalizePage(page);
  const method = mode === "push" ? "pushState" : "replaceState";
  window.history[method]({ appPage: normalizedPage }, "", window.location.href);
  return normalizedPage;
};

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

<style>
#app {
  font-family: "Avenir", Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  color: var(--reader-app-text);
  margin: 0;
  height: 100%;
  position: relative;
  background: var(--reader-app-bg);
}

@font-face {
  font-family: "reader-st";
  src: local("Songti SC"), local("Noto Serif CJK SC"),
    local("Source Han Serif SC"), local("Source Han Serif CN"), local("STSong"),
    local("宋体"), local("明体"), local("明朝"), local("Songti"),
    local("Songti TC"), /*iOS6+iBooks3*/ local("Song S"), local("Song T"),
    local("STBShusong"), local("TBMincho"), local("HYMyeongJo"),
    /*Kindle Paperwihite*/ local("DK-SONGTI");
}

@font-face {
  font-family: "reader-fs";
  src: local("STFangsong"), local("FangSong"), local("FangSong_GB2312"),
    local("amasis30"), local("仿宋"), local("仿宋_GB2312"), local("Yuanti"),
    local("Yuanti SC"), local("Yuanti TC"),
    /*iOS6+iBooks3*/ local("DK-FANGSONG");
}

@font-face {
  font-family: "reader-kt";
  src: local("Kaiti SC"), local("STKaiti"), local("Caecilia"), local("楷体"),
    local("楷体_GB2312"), local("Kaiti"), local("Kaiti SC"), local("Kaiti TC"),
    /*iOS6+iBooks3*/ local("MKai PRC"), local("MKaiGB18030C-Medium"),
    local("MKaiGB18030C-Bold"), /*Kindle Paperwihite*/ local("DK-KAITI");
}

@font-face {
  font-family: "reader-ht";
  src: local("Noto Sans CJK SC"), local("Source Han Sans SC"),
    local("Source Han Sans CN"), local("Microsoft YaHei"), local("PingFang SC"),
    local("Hiragino Sans GB"), local("黑体"), local("微软雅黑"), local("Heiti"),
    local("Heiti SC"), local("Heiti TC"), /*iOS6+iBooks3*/ local("MYing Hei S"),
    local("MYing Hei T"), local("TBGothic"),
    /*Kindle Paperwihite*/ local("DK-HEITI");
}
*::-webkit-scrollbar {
  display: none;
  width: 0 !important;
  height: 0 !important;
}
*:focus {
  outline: none !important;
}
</style><style lang="stylus">
.popper-component {
  top: 0 !important;
}
.mini-interface {
  .popper-component {
    top: 0 !important;
    left: 0 !important;
    width: 100vw !important;
    box-sizing: border-box;
    margin: 0 !important;
    overflow-x: hidden;
  }
}
</style>
