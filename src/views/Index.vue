<template>
  <div
    class="index-wrapper"
    :class="{
      night: isNight,
      day: !isNight
    }"
  >
    <div
      class="navigation-wrapper"
      :class="[
        navigationClass,
        isWebApp && !isNight ? 'status-bar-light-bg' : ''
      ]"
      :style="navigationStyle"
      @touchstart="handleTouchStart"
      @touchmove="handleTouchMove"
      @touchend="handleTouchEnd"
      v-if="$store.getters.isNormalPage"
    >
      <div class="navigation-inner-wrapper"></div>
    </div>
    <div
      class="shelf-wrapper"
      :class="isWebApp && !isNight ? 'status-bar-light-bg' : ''"
      ref="shelfWrapper"
      @click="showNavigation = false"
    >
      <div class="shelf-title">
        <i
          class="el-icon-menu"
          v-if="$store.getters.isNormalPage && collapseMenu"
          @click.stop="showNavigation = true"
        ></i>
        <span class="title-btn" @click="$router.push('/reader')">进入阅读页</span>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  data() {
    return {
      showNavigation: false,
      navigationClass: "",
      navigationStyle: {},
      touchStartPoint: null
    };
  },
  computed: {
    collapseMenu() {
      return this.$store.getters.collapseMenu;
    },
    isNight() {
      return this.$store.getters.isNight;
    }
  },
  watch: {
    collapseMenu(value) {
      if (!value) {
        this.navigationClass = "";
      } else if (!this.showNavigation) {
        this.navigationClass = "navigation-hidden";
      }
    },
    showNavigation(value) {
      if (!this.collapseMenu) {
        return;
      }
      if (!value) {
        this.navigationClass = "navigation-out";
        setTimeout(() => {
          if (!this.showNavigation) {
            this.navigationClass = "navigation-hidden";
          }
        }, 300);
      } else {
        this.navigationClass = "navigation-in";
      }
    }
  },
  mounted() {
    this.navigationClass =
      this.collapseMenu && !this.showNavigation ? "navigation-hidden" : "";
  },
  methods: {
    handleTouchStart(event) {
      this.touchStartPoint = event.touches && event.touches[0];
    },
    handleTouchMove(event) {
      if (!this.collapseMenu || !this.touchStartPoint || !event.touches[0]) {
        return;
      }
      const moveX = event.touches[0].clientX - this.touchStartPoint.clientX;
      if (moveX < 0) {
        this.navigationStyle = { marginLeft: Math.max(-260, moveX) + "px" };
      }
    },
    handleTouchEnd() {
      this.navigationStyle = {};
      this.touchStartPoint = null;
    }
  }
};
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

        >>>.el-icon-loading {
          font-size: 16px;
        }
      }
    }
  }
}

.night {
  >>>.navigation-wrapper {
    background-color: #121212;
    border-right: 1px solid #555;
  }
  >>>.shelf-title {
    color: #bbb;
  }
  >>>.shelf-wrapper {
    background-color: #222;
  }
}

.navigation-inner-wrapper::-webkit-scrollbar {
  width: 0 !important;
}

@media screen and (max-width: 750px) {
  .index-wrapper {
    overflow-x: hidden;

    >>>.navigation-wrapper {
      .navigation-inner-wrapper {
        padding: 20px 36px 66px 36px;
      }
    }
    >>>.shelf-wrapper {
      padding: 0;
      padding-top: constant(safe-area-inset-top) !important;
      padding-top: env(safe-area-inset-top) !important;

      .shelf-title {
        padding: 20px 24px 0 24px;
      }
    }
  }
}
</style>

<style>
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
