<template>
  <div
    class="home-view"
    :class="{
      night: isNight,
      day: !isNight,
      'reader-app--fullscreen-mode': fullscreenMode
    }"
  >
    <div class="home-sidebar">
      <div class="home-sidebar__inner">
        <div class="reader-sidebar__brand" :aria-label="siteName">
          <span class="reader-sidebar__brand-logo">
            <Icon name="book-open" :size="21" :stroke-width="2.4" />
          </span>
          <span class="reader-sidebar__brand-name">{{ siteName }}</span>
        </div>

        <nav class="reader-sidebar__nav" aria-label="主导航">
          <button
            v-for="item in navItems"
            :key="item.key"
            type="button"
            class="reader-sidebar__item"
            :class="{
              'is-active': activeKey === item.key,
              'reader-sidebar__item--separated': item.separatedBefore
            }"
            @click="emit('navigate', item.key)"
          >
            <Icon :name="item.icon" :size="20" />
            <span>{{ item.label }}</span>
          </button>
        </nav>
      </div>
    </div>

    <div class="home-content">
      <slot></slot>
    </div>

    <MobileNav
      v-if="showMobileNav"
      :items="mobileNavItems"
      :active-key="activeKey"
      @navigate="emit('navigate', $event)"
    />
  </div>
</template>

<script setup>
import { onBeforeUnmount, ref } from "vue";
import Icon from "./Icon.vue";
import MobileNav from "./MobileNav.vue";
import { getSystemSettings, subscribeSystemSettings } from "../data/systemSettings";
import { getUiPreferences, subscribeUiPreferences } from "../data/uiPreferences";

defineOptions({
  name: "AppShell"
});

defineProps({
  activeKey: { type: String, default: "home" },
  showMobileNav: { type: Boolean, default: true }
});

const emit = defineEmits(["navigate"]);
const siteName = ref(getSystemSettings().siteName);
const navItems = [
  { key: "home", label: "首页", icon: "home" },
  { key: "library", label: "书库", icon: "library" },
  { key: "ranking", label: "排行榜", icon: "ranking" },
  { key: "complete", label: "完本小说", icon: "complete" },
  { key: "tags", label: "标签", icon: "tag" },
  { key: "authors", label: "作者", icon: "user" },
  { key: "history", label: "阅读历史", icon: "history", separatedBefore: true },
  { key: "bookshelf", label: "我的书架", icon: "bookshelf" },
  { key: "settings", label: "设置", icon: "settings", separatedBefore: true }
];
const mobileNavItems = [
  { key: "home", label: "首页", icon: "home" },
  { key: "library", label: "发现", icon: "library" },
  { key: "bookshelf", label: "书架", icon: "bookshelf" },
  { key: "settings", label: "设置", icon: "settings" }
];
const fullscreenMode = ref(getUiPreferences().fullscreenMode);
const isNight = ref(false);
const unsubscribeSystemSettings = subscribeSystemSettings(settings => {
  siteName.value = settings.siteName;
});
const unsubscribeUiPreferences = subscribeUiPreferences(preferences => {
  fullscreenMode.value = preferences.fullscreenMode;
});

onBeforeUnmount(() => {
  unsubscribeSystemSettings();
  unsubscribeUiPreferences();
});
</script>

<style lang="stylus" scoped>
.home-view {
  --reader-blue: var(--reader-app-accent);
  --reader-line: var(--reader-app-line);
  --reader-sidebar-text: var(--reader-app-text);
  --reader-sidebar-item: #1f2937;
  --reader-sidebar-muted: #6e6e73;
  --reader-sidebar-hover: rgba(0, 122, 255, 0.08);
  --reader-sidebar-active: rgba(0, 122, 255, 0.12);
  --reader-card-solid: #fff;
  --reader-radius-card: 22px;
  --reader-shadow-card: 0 10px 30px rgba(0, 0, 0, 0.035);
  --reader-page-content-x: 24px;
  --reader-page-body-gap: 10px;
  --reader-mobile-content-x: 14px;
  --reader-mobile-nav-bottom: calc(16px + env(safe-area-inset-bottom));
  height: 100%;
  width: 100%;
  display: flex;
  flex-direction: row;
  overflow-x: hidden;
  background: var(--reader-app-bg);
  container: reader-shell / inline-size;

  .home-sidebar {
    width: 260px;
    min-width: 260px;
    height: 100%;
    box-sizing: border-box;
    background: var(--reader-app-bg);
    border-right: 1px solid var(--reader-line);
    position: relative;
    padding-top: 0;
    padding-top: constant(safe-area-inset-top) !important;
    padding-top: env(safe-area-inset-top) !important;

    .home-sidebar__inner {
      padding: 0 0 66px;
      height: 100%;
      overflow-y: auto;
      box-sizing: border-box;
    }

    .reader-sidebar__brand {
      min-height: 75px;
      display: flex;
      align-items: center;
      gap: 13px;
      padding: 0 22px;
      box-sizing: border-box;
    }

    .reader-sidebar__brand-logo {
      width: 32px;
      height: 32px;
      display: inline-flex;
      align-items: center;
      justify-content: center;
      flex: 0 0 32px;
      border-radius: 11px;
      color: #fff;
      background: var(--reader-blue);
      box-shadow: 0 8px 18px rgba(0, 122, 255, 0.22);
    }

    .reader-sidebar__brand-name {
      min-width: 0;
      overflow: hidden;
      color: var(--reader-sidebar-text);
      font-size: 19px;
      line-height: 1;
      font-weight: 700;
      text-overflow: ellipsis;
      white-space: nowrap;
    }

    .reader-sidebar__nav {
      display: flex;
      flex-direction: column;
      gap: 6px;
      padding: 22px 18px 0;
    }

    .reader-sidebar__item {
      min-height: 40px;
      display: flex;
      align-items: center;
      gap: 12px;
      width: 100%;
      padding: 0 14px;
      border: 0;
      border-radius: 13px;
      appearance: none;
      background: transparent;
      color: var(--reader-sidebar-item);
      font: inherit;
      font-size: 14px;
      font-weight: 500;
      text-align: left;
      cursor: pointer;
      transition: color 0.16s ease, background 0.16s ease;
    }

    .reader-sidebar__item svg {
      flex: 0 0 auto;
      color: var(--reader-sidebar-muted);
    }

    .reader-sidebar__item:hover {
      color: var(--reader-blue);
      background: var(--reader-sidebar-hover);
    }

    .reader-sidebar__item.is-active {
      color: var(--reader-blue);
      background: var(--reader-sidebar-active);
    }

    .reader-sidebar__item.is-active svg {
      color: var(--reader-blue);
    }

    .reader-sidebar__item--separated {
      margin-top: 22px;
      position: relative;
    }

    .reader-sidebar__item--separated::before {
      content: "";
      position: absolute;
      left: 0;
      right: 0;
      top: -14px;
      height: 1px;
      background: var(--reader-line);
    }
  }

  .home-content {
    height: 100%;
    max-height: 100%;
    width: 100%;
    min-width: 0;
    min-height: 0;
    position: relative;
    background: var(--reader-app-bg);
    box-sizing: border-box;
    overflow: hidden;
    overscroll-behavior: contain;
  }
}

.reader-app--fullscreen-mode {
  --reader-mobile-nav-bottom: 6px;
}

.night {
  --reader-app-bg: #222;
  --reader-app-bg-rgb: 34, 34, 34;
  --reader-app-text: #bbb;
  --reader-line: rgba(255, 255, 255, 0.12);
  --reader-sidebar-text: #e5e7eb;
  --reader-sidebar-item: #d1d5db;
  --reader-sidebar-muted: #8e8e93;
  --reader-sidebar-hover: rgba(10, 132, 255, 0.14);
  --reader-sidebar-active: rgba(10, 132, 255, 0.2);
  --reader-card-solid: #2c2c2e;

  :deep(.home-header) {
    color: #bbb;
  }
}

.home-sidebar__inner::-webkit-scrollbar {
  width: 0 !important;
}

@container reader-shell (max-width: 750px) {
  .home-sidebar {
    display: none;
  }

  .home-view {
    --reader-page-content-x: var(--reader-mobile-content-x);
  }
}
</style>
