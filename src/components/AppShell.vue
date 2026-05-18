<template>
  <div
    class="home-view"
    :class="{
      night: isNight,
      day: !isNight
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
      :active-key="mobileActiveKey"
      @navigate="emit('navigate', $event)"
    />
  </div>
</template>

<script setup>
import { computed, onBeforeUnmount, ref } from "vue";
import Icon from "./Icon.vue";
import MobileNav from "./MobileNav.vue";
import { getSystemSettings, subscribeSystemSettings } from "../data/systemSettings";

defineOptions({
  name: "AppShell"
});

const props = defineProps({
  activeKey: { type: String, default: "home" },
  showMobileNav: { type: Boolean, default: true }
});

const emit = defineEmits(["navigate"]);
const siteName = ref(getSystemSettings().siteName);
const navItems = [
  { key: "home", label: "首页", icon: "home" },
  { key: "library", label: "发现", icon: "library" },
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
const discoverKeys = new Set(["library", "ranking", "complete", "tags", "authors"]);
const mobileActiveKey = computed(() => {
  if (props.activeKey === "history") return "bookshelf";
  if (discoverKeys.has(props.activeKey)) return "library";
  return props.activeKey;
});
const isNight = ref(false);
const unsubscribeSystemSettings = subscribeSystemSettings(settings => {
  siteName.value = settings.siteName;
});
onBeforeUnmount(() => {
  unsubscribeSystemSettings();
});
</script>

<style src="../styles/app-shell.styl" lang="stylus" scoped></style>
