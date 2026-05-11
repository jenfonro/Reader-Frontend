<template>
  <div
    class="home-view"
    :class="{
      night: isNight,
      day: !isNight
    }"
  >
    <div
      class="home-sidebar"
      :class="sidebarClass"
      :style="sidebarStyle"
      @touchstart="handleSidebarTouchStart"
      @touchmove="handleSidebarTouchMove"
      @touchend="handleSidebarTouchEnd"
    >
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
            @click="handleNavClick(item.key)"
          >
            <Icon :name="item.icon" :size="20" />
            <span>{{ item.label }}</span>
          </button>
        </nav>
      </div>
    </div>
    <div
      class="home-content"
      @click="showSidebar = false"
    >
      <div class="home-header">
        <el-icon
          v-if="useCollapsedSidebar"
          class="home-header__menu"
          @click.stop="showSidebar = true"
        >
          <MenuIcon />
        </el-icon>
        <span class="home-header__reader-link" @click="goReader">进入阅读页</span>
      </div>
    </div>
  </div>
</template>

<script setup>
import { onBeforeUnmount, onMounted, ref, watch } from "vue";
import { Menu as MenuIcon } from "@element-plus/icons-vue";
import { ElIcon } from "element-plus/es/components/icon/index.mjs";
import "element-plus/es/components/icon/style/css.mjs";
import Icon from "../components/Icon.vue";
import { getMiniInterface } from "../utils/interface";

defineOptions({
  name: "Index"
});

const emit = defineEmits(["enter-reader"]);
const siteName = "开源阅读";
const navItems = [
  { key: "home", label: "首页", icon: "home" },
  { key: "search", label: "搜索", icon: "search" },
  { key: "library", label: "书库", icon: "library" },
  { key: "ranking", label: "排行榜", icon: "ranking" },
  { key: "complete", label: "完本小说", icon: "complete" },
  { key: "tags", label: "标签", icon: "tag" },
  { key: "authors", label: "作者", icon: "user" },
  { key: "history", label: "阅读历史", icon: "history", separatedBefore: true },
  { key: "bookshelf", label: "我的书架", icon: "bookshelf" },
  { key: "settings", label: "设置", icon: "settings", separatedBefore: true }
];
const activeKey = ref("home");
const showSidebar = ref(false);
const sidebarClass = ref("");
const sidebarStyle = ref({});
const sidebarTouchStart = ref(null);
const useCollapsedSidebar = ref(getMiniInterface());
const isNight = ref(false);

const syncSidebarClass = () => {
  sidebarClass.value =
    useCollapsedSidebar.value && !showSidebar.value ? "home-sidebar--hidden" : "";
};

const syncResponsiveState = () => {
  useCollapsedSidebar.value = getMiniInterface();
};

const goReader = () => {
  emit("enter-reader");
};

const handleNavClick = key => {
  activeKey.value = key;
  showSidebar.value = false;
};

const handleSidebarTouchStart = event => {
  sidebarTouchStart.value = event.touches && event.touches[0];
};

const handleSidebarTouchMove = event => {
  if (!useCollapsedSidebar.value || !sidebarTouchStart.value || !event.touches[0]) {
    return;
  }
  const moveX = event.touches[0].clientX - sidebarTouchStart.value.clientX;
  if (moveX < 0) {
    sidebarStyle.value = { marginLeft: `${Math.max(-260, moveX)}px` };
  }
};

const handleSidebarTouchEnd = () => {
  sidebarStyle.value = {};
  sidebarTouchStart.value = null;
};

watch(useCollapsedSidebar, value => {
  if (!value) {
    sidebarClass.value = "";
  } else if (!showSidebar.value) {
    sidebarClass.value = "home-sidebar--hidden";
  }
});

watch(showSidebar, value => {
  if (!useCollapsedSidebar.value) {
    return;
  }
  if (!value) {
    sidebarClass.value = "home-sidebar--leaving";
    window.setTimeout(() => {
      if (!showSidebar.value) {
        sidebarClass.value = "home-sidebar--hidden";
      }
    }, 300);
  } else {
    sidebarClass.value = "home-sidebar--entering";
  }
});

onMounted(() => {
  syncSidebarClass();
  window.addEventListener("resize", syncResponsiveState);
});

onBeforeUnmount(() => {
  window.removeEventListener("resize", syncResponsiveState);
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
  height: 100%;
  width: 100%;
  display: flex;
  flex-direction: row;
  background: var(--reader-app-bg);

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
    padding: 48px 48px;
    height: 100%;
    max-height: 100%;
    width: 100%;
    background: var(--reader-app-bg);
    display: flex;
    flex-direction: column;
    box-sizing: border-box;

    .home-header {
      display: flex;
      align-items: center;
      gap: 10px;
      font-size: 20px;
      font-weight: 600;
      font-family: -apple-system, "Noto Sans", "Helvetica Neue", Helvetica, "Nimbus Sans L", Arial, "Liberation Sans", "PingFang SC", "Hiragino Sans GB", "Noto Sans CJK SC", "Source Han Sans SC", "Source Han Sans CN", "Microsoft YaHei", "Wenquanyi Micro Hei", "WenQuanYi Zen Hei", "ST Heiti", SimHei, "WenQuanYi Zen Hei Sharp", sans-serif;
      margin-bottom: 5px;
      min-width: 320px;
      box-sizing: border-box;

      .home-header__menu {
        cursor: pointer;
      }

      .home-header__reader-link {
        font-size: 14px;
        line-height: 28px;
        margin-left: auto;
        cursor: pointer;
        user-select: none;

      }
    }
  }
}

.night {
  --reader-app-bg: #222;
  --reader-app-text: #bbb;
  --reader-line: rgba(255, 255, 255, 0.12);
  --reader-sidebar-text: #e5e7eb;
  --reader-sidebar-item: #d1d5db;
  --reader-sidebar-muted: #8e8e93;
  --reader-sidebar-hover: rgba(10, 132, 255, 0.14);
  --reader-sidebar-active: rgba(10, 132, 255, 0.2);

  :deep(.home-header) {
    color: #bbb;
  }
}

.home-sidebar__inner::-webkit-scrollbar {
  width: 0 !important;
}

@media screen and (max-width: 750px) {
  .home-view {
    overflow-x: hidden;

    :deep(.home-sidebar) {
      .home-sidebar__inner {
        padding: 0 0 66px;
      }
    }
    :deep(.home-content) {
      padding: 0;
      padding-top: constant(safe-area-inset-top) !important;
      padding-top: env(safe-area-inset-top) !important;

      .home-header {
        padding: 20px 24px 0 24px;
      }
    }
  }
}
</style><style>
.home-sidebar--hidden {
  margin-left: -260px;
}
.home-sidebar--entering {
  margin-left: 0px;
  transition: margin-left 0.3s;
}
.home-sidebar--leaving {
  margin-left: -260px;
  transition: margin-left 0.3s;
}
</style>
