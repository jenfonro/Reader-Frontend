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
      <div class="home-sidebar__inner"></div>
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
import { getMiniInterface } from "../utils/interface";

defineOptions({
  name: "Index"
});

const emit = defineEmits(["enter-reader"]);
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
  height: 100%;
  width: 100%;
  display: flex;
  flex-direction: row;

  .home-sidebar {
    width: 260px;
    min-width: 260px;
    height: 100%;
    box-sizing: border-box;
    background-color: #F7F7F7;
    position: relative;
    padding-top: 0;
    padding-top: constant(safe-area-inset-top) !important;
    padding-top: env(safe-area-inset-top) !important;

    .home-sidebar__inner {
      padding: 48px 36px 66px 36px;
      height: 100%;
      overflow-y: auto;
      box-sizing: border-box;
    }
  }

  .home-content {
    padding: 48px 48px;
    height: 100%;
    max-height: 100%;
    width: 100%;
    background-color: #fff;
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
  :deep(.home-sidebar) {
    background-color: #121212;
    border-right: 1px solid #555;
  }
  :deep(.home-header) {
    color: #bbb;
  }
  :deep(.home-content) {
    background-color: #222;
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
        padding: 20px 36px 66px 36px;
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
