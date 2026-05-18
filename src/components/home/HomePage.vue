<template>
  <PageLayout root-class="reader-home-page reader-home-page--home" body-class="reader-home-page__body">
    <template #header>
      <div class="home-header">
        <SearchBar
          v-model="searchKeyword"
          class="home-header__search"
          @submit="submitSearch"
        />
      </div>
    </template>

    <section class="home-main-view" aria-label="首页"></section>
  </PageLayout>
</template>

<script setup>
import { ref } from "vue";
import PageLayout from "../PageLayout.vue";
import SearchBar from "../SearchBar.vue";

const emit = defineEmits(["search"]);
const searchKeyword = ref("");

const submitSearch = value => {
  const nextKeyword = String(value || "").trim();
  searchKeyword.value = nextKeyword;
  if (!nextKeyword) return;
  emit("search", nextKeyword);
};
</script>

<style scoped>
.reader-home-page--home {
  --reader-page-topbar-row-height: 64px;
}

.home-header {
  position: relative;
  z-index: 10;
  height: var(--reader-page-topbar-space, calc(64px + env(safe-area-inset-top)));
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

.home-main-view {
  min-height: 0;
  width: 100%;
  box-sizing: border-box;
}

@container reader-shell (max-width: 750px) {
  .home-header {
    padding-right: var(--reader-mobile-content-x, 14px);
    padding-left: var(--reader-mobile-content-x, 14px);
  }
}
</style>
