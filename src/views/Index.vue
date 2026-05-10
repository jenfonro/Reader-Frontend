<template>
  <div
    class="index-wrapper"
    :class="{
      night: isNight,
      day: !isNight
    }"
  >
    <div
      v-if="isNormalPage"
      class="navigation-wrapper"
      :class="[
        navigationClass,
        isWebApp && !isNight ? 'status-bar-light-bg' : ''
      ]"
      :style="navigationStyle"
      @touchstart="handleTouchStart"
      @touchmove="handleTouchMove"
      @touchend="handleTouchEnd"
    >
      <div class="navigation-inner-wrapper"></div>
    </div>
    <div
      ref="shelfWrapper"
      class="shelf-wrapper"
      :class="isWebApp && !isNight ? 'status-bar-light-bg' : ''"
      @click="showNavigation = false"
    >
      <div class="shelf-title">
        <el-icon
          v-if="isNormalPage && collapseMenu"
          class="el-icon-menu"
          @click.stop="showNavigation = true"
        >
          <MenuIcon />
        </el-icon>
        <span class="title-btn" @click="goReader">进入阅读页</span>
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
const showNavigation = ref(false);
const navigationClass = ref("");
const navigationStyle = ref({});
const touchStartPoint = ref(null);
const collapseMenu = ref(getMiniInterface());
const isNight = ref(false);
const isNormalPage = ref(true);
const isWebApp = ref(false);

const syncNavigationClass = () => {
  navigationClass.value =
    collapseMenu.value && !showNavigation.value ? "navigation-hidden" : "";
};

const syncInterface = () => {
  collapseMenu.value = getMiniInterface();
};

const goReader = () => {
  emit("enter-reader");
};

const handleTouchStart = event => {
  touchStartPoint.value = event.touches && event.touches[0];
};

const handleTouchMove = event => {
  if (!collapseMenu.value || !touchStartPoint.value || !event.touches[0]) {
    return;
  }
  const moveX = event.touches[0].clientX - touchStartPoint.value.clientX;
  if (moveX < 0) {
    navigationStyle.value = { marginLeft: `${Math.max(-260, moveX)}px` };
  }
};

const handleTouchEnd = () => {
  navigationStyle.value = {};
  touchStartPoint.value = null;
};

watch(collapseMenu, value => {
  if (!value) {
    navigationClass.value = "";
  } else if (!showNavigation.value) {
    navigationClass.value = "navigation-hidden";
  }
});

watch(showNavigation, value => {
  if (!collapseMenu.value) {
    return;
  }
  if (!value) {
    navigationClass.value = "navigation-out";
    window.setTimeout(() => {
      if (!showNavigation.value) {
        navigationClass.value = "navigation-hidden";
      }
    }, 300);
  } else {
    navigationClass.value = "navigation-in";
  }
});

onMounted(() => {
  syncNavigationClass();
  window.addEventListener("resize", syncInterface);
});

onBeforeUnmount(() => {
  window.removeEventListener("resize", syncInterface);
});
</script>

<style lang="stylus" scoped>
.index-wrapper {
  height: 100%;
  width: 100%;
  display: flex;
  flex-direction: row;

  .navigation-wrapper {
    width: 260px;
    min-width: 260px;
    height: 100%;
    box-sizing: border-box;
    background-color: #F7F7F7;
    position: relative;
    padding-top: 0;
    padding-top: constant(safe-area-inset-top) !important;
    padding-top: env(safe-area-inset-top) !important;

    .navigation-inner-wrapper {
      padding: 48px 36px 66px 36px;
      height: 100%;
      overflow-y: auto;
      box-sizing: border-box;
    }
  }

  .shelf-wrapper {
    padding: 48px 48px;
    height: 100%;
    max-height: 100%;
    width: 100%;
    background-color: #fff;
    display: flex;
    flex-direction: column;
    box-sizing: border-box;

    .shelf-title {
      font-size: 20px;
      font-weight: 600;
      font-family: -apple-system, "Noto Sans", "Helvetica Neue", Helvetica, "Nimbus Sans L", Arial, "Liberation Sans", "PingFang SC", "Hiragino Sans GB", "Noto Sans CJK SC", "Source Han Sans SC", "Source Han Sans CN", "Microsoft YaHei", "Wenquanyi Micro Hei", "WenQuanYi Zen Hei", "ST Heiti", SimHei, "WenQuanYi Zen Hei Sharp", sans-serif;
      margin-bottom: 5px;
      min-width: 320px;
      box-sizing: border-box;

      .el-icon-menu {
        cursor: pointer;
      }

      .title-btn {
        font-size: 14px;
        line-height: 28px;
        float: right;
        cursor: pointer;
        user-select: none;
        margin-left: 10px;

        :deep(.el-icon-loading) {
          font-size: 16px;
        }
      }
    }
  }
}

.night {
  :deep(.navigation-wrapper) {
    background-color: #121212;
    border-right: 1px solid #555;
  }
  :deep(.shelf-title) {
    color: #bbb;
  }
  :deep(.shelf-wrapper) {
    background-color: #222;
  }
}

.navigation-inner-wrapper::-webkit-scrollbar {
  width: 0 !important;
}

@media screen and (max-width: 750px) {
  .index-wrapper {
    overflow-x: hidden;

    :deep(.navigation-wrapper) {
      .navigation-inner-wrapper {
        padding: 20px 36px 66px 36px;
      }
    }
    :deep(.shelf-wrapper) {
      padding: 0;
      padding-top: constant(safe-area-inset-top) !important;
      padding-top: env(safe-area-inset-top) !important;

      .shelf-title {
        padding: 20px 24px 0 24px;
      }
    }
  }
}
</style><style>
.navigation-hidden {
  margin-left: -260px;
}
.navigation-in {
  margin-left: 0px;
  transition: margin-left 0.3s;
}
.navigation-out {
  margin-left: -260px;
  transition: margin-left 0.3s;
}
.status-bar-light-bg {
  background-image: linear-gradient(
    to bottom,
    rgba(0, 0, 0, 0.2) 0,
    transparent 36px
  ) !important;
}
</style>
