<template>
  <div
    class="chapter-wrapper"
    :style="bodyTheme"
    :class="{
      night: isNight,
      day: !isNight,
      'mini-interface': miniInterface
    }"
  >
    <div class="tool-bar" :style="leftBarTheme">
      <div class="tools">
        <el-popover
          v-model:visible="popBookShelfVisible"
          placement="right"
          :width="popperWidth"
          trigger="click"
          :show-arrow="false"
          popper-class="popper-component"
          :popper-options="menuPopperOptions"
        >
          <template #reference>
            <div class="tool-icon">
              <div class="iconfont">
                &#58892;
              </div>
              <div class="icon-text">书架</div>
            </div>
          </template>
          <BookShelf
            class="popup"
            :visible="popBookShelfVisible"
            @change-book="changeBook"
            @to-shelf="toShelf"
          />
        </el-popover>
        <el-popover
          v-model:visible="popBookSourceVisible"
          placement="right"
          :width="popperWidth"
          trigger="click"
          :show-arrow="false"
          popper-class="popper-component"
          :popper-options="menuPopperOptions"
        >
          <template #reference>
            <div class="tool-icon">
              <div class="tool-el-icon">
                <el-icon class="el-icon-menu">
                  <MenuIcon />
                </el-icon>
              </div>
              <div class="icon-text">书源</div>
            </div>
          </template>
          <BookSource
            class="popup"
            :visible="popBookSourceVisible"
            @change-book-source="changeBookSource"
          />
        </el-popover>
        <el-popover
          v-model:visible="popCataVisible"
          placement="right"
          :width="popperWidth"
          trigger="click"
          :show-arrow="false"
          popper-class="popper-component"
          :popper-options="menuPopperOptions"
        >
          <template #reference>
            <div class="tool-icon">
              <div class="iconfont">
                &#58905;
              </div>
              <div class="icon-text">目录</div>
            </div>
          </template>
          <PopCata
            class="popup"
            :visible="popCataVisible"
            @get-content="getContent"
            @refresh="refreshCatalog"
          />
        </el-popover>
        <el-popover
          v-model:visible="readSettingsVisible"
          placement="right"
          :width="popperWidth"
          trigger="click"
          :show-arrow="false"
          popper-class="popper-component"
          :popper-options="menuPopperOptions"
        >
          <template #reference>
            <div class="tool-icon">
              <div class="iconfont">
                &#58971;
              </div>
              <div class="icon-text">设置</div>
            </div>
          </template>
          <ReadSettings
            class="popup"
            :visible="readSettingsVisible"
            @close="readSettingsVisible = false"
            @show-click-zone="showClickZone = true"
            @read-method-change="beforeReadMethodChange"
          />
        </el-popover>
        <div class="tool-icon" :style="miniInterface ? { order: -1 } : {}">
          <div class="iconfont">
            &#58920;
          </div>
          <div class="icon-text">首页</div>
        </div>
        <div v-if="!miniInterface" class="tool-icon">
          <div class="iconfont">
            &#58914;
          </div>
          <div class="icon-text">顶部</div>
        </div>
        <div v-if="!miniInterface" class="tool-icon">
          <div class="iconfont">
            &#58915;
          </div>
          <div class="icon-text">底部</div>
        </div>
      </div>
    </div>
    <div class="read-bar" :style="rightBarTheme">
      <div class="float-btn-zone">
        <div class="float-left-btn-zone">
          <div class="float-btn" :style="popupAbsoluteBtnStyle">
            <el-icon class="el-icon-collection-tag">
              <CollectionTag />
            </el-icon>
          </div>
          <div class="float-btn" :style="popupAbsoluteBtnStyle">
            <el-icon class="el-icon-search">
              <Search />
            </el-icon>
          </div>
          <div class="float-btn" :style="popupAbsoluteBtnStyle">
            <el-icon class="el-icon-info">
              <InfoFilled />
            </el-icon>
          </div>
          <div
            v-if="miniInterface"
            class="float-btn"
            :style="popupAbsoluteBtnStyle"
          >
            <el-icon class="el-icon-top">
              <Top />
            </el-icon>
          </div>
          <div
            v-if="miniInterface"
            class="float-btn"
            :style="popupAbsoluteBtnStyle"
          >
            <el-icon class="el-icon-bottom">
              <Bottom />
            </el-icon>
          </div>
        </div>
        <div class="float-right-btn-zone">
          <div class="float-btn" :style="popupAbsoluteBtnStyle">
            <el-icon class="el-icon-refresh-right">
              <RefreshRight />
            </el-icon>
          </div>
          <div
            v-if="!isEpub && !isCarToon && !isAudio"
            class="float-btn"
            :style="popupAbsoluteBtnStyle"
          >
            <el-icon class="el-icon-view">
              <View />
            </el-icon>
          </div>
          <div
            v-if="speechAvalable && !isEpub && !isCarToon && !isAudio"
            class="float-btn"
            :style="popupAbsoluteBtnStyle"
          >
            <el-icon class="el-icon-headset">
              <Headset />
            </el-icon>
          </div>
          <div class="float-btn" :style="popupAbsoluteBtnStyle">
            <el-icon v-if="!isNight" class="el-icon-moon">
              <Moon />
            </el-icon>
            <el-icon v-else class="el-icon-sunny">
              <Sunny />
            </el-icon>
          </div>
        </div>
      </div>
      <div v-if="miniInterface && !isAudio" class="progress">
        <div class="progress-bar">
          <el-slider
            v-model="currentPage"
            :min="1"
            :max="totalPages"
            :show-tooltip="false"
            @change="showPage"
            @input="progressValue = $event"
          />
        </div>
        <span class="progress-tip">{{ formatProgressTip() }}</span>
      </div>
      <div v-if="showCacheContentZone" class="cache-content-zone">
        <div>缓存章节</div>
        <div v-show="!isCachingContent" class="cache-content-btn">
          后面50章
        </div>
        <div v-show="!isCachingContent" class="cache-content-btn">
          后面100章
        </div>
        <div v-show="!isCachingContent" class="cache-content-btn">
          后面全部
        </div>
        <div v-show="isCachingContent" class="caching-tip">
          {{ cachingContentTip }}
        </div>
        <div v-show="isCachingContent" class="caching-cancel-btn">
          <el-icon class="el-icon-close">
            <Close />
          </el-icon>
        </div>
      </div>
      <div class="tools">
        <div class="tool-icon progress-text">
          <span v-if="miniInterface">阅读进度: </span>
          {{ readingProgress }}
        </div>
        <div class="tool-icon" :style="miniInterface ? { order: -1 } : {}">
          <div class="iconfont">
            &#58920;
          </div>
          <span v-if="miniInterface">上一章</span>
        </div>
        <div class="tool-icon">
          <span v-if="miniInterface">下一章</span>
          <div class="iconfont">
            &#58913;
          </div>
        </div>
      </div>
    </div>
    <div class="read-bar" :style="readBarTheme">
      <div class="reader-bar-inner">
        <div class="operate-bar">
          <div class="close-btn">
            <el-icon class="el-icon-close">
              <Close />
            </el-icon>
          </div>
          <div class="center">
            <span class="ctrl-btn">上一段</span>
            <span class="play-pause-btn">
              <el-icon
                v-if="speechSpeaking"
                class="el-icon-video-pause"
                :style="popupAbsoluteBtnStyle"
              >
                <VideoPause />
              </el-icon>
              <el-icon
                v-else
                class="el-icon-video-play"
                :style="popupAbsoluteBtnStyle"
              >
                <VideoPlay />
              </el-icon>
            </span>
            <span class="ctrl-btn">下一段</span>
          </div>
          <div class="collapse-btn">
            <el-icon v-if="showSpeechConfig" class="el-icon-bottom">
              <Bottom />
            </el-icon>
            <el-icon v-else class="el-icon-top">
              <Top />
            </el-icon>
          </div>
        </div>
        <div v-if="showSpeechConfig" class="setting-item">
          <div class="setting-title">语音库</div>
          <div class="setting-value">
            <div class="voice-list">
              <el-radio-group
                v-model="voiceName"
                size="small"
                class="radio-group"
              >
                <el-radio-button
                  v-for="(voice, index) in voiceList"
                  :key="index"
                  class="radio-button"
                  :value="voice.name"
                />
              </el-radio-group>
            </div>
          </div>
        </div>
        <div v-if="showSpeechConfig" class="setting-item">
          <div class="setting-title">语音设置</div>
          <div class="setting-value">
            <div class="progress">
              <span class="progress-tip">语速</span>
              <div class="progress-bar">
                <el-slider
                  v-model="speechRate"
                  :min="0.5"
                  :max="2"
                  :step="0.1"
                  :show-tooltip="false"
                />
              </div>
              <span class="setting-btn">重置</span>
            </div>
            <div class="progress">
              <span class="progress-tip">语调</span>
              <div class="progress-bar">
                <el-slider
                  v-model="speechPitch"
                  :min="0"
                  :max="2"
                  :step="0.1"
                  :show-tooltip="false"
                />
              </div>
              <span class="setting-btn">重置</span>
            </div>
            <div class="progress">
              <span class="progress-tip">定时</span>
              <div class="progress-bar">
                <el-slider
                  v-model="speechMinutes"
                  :min="0"
                  :max="180"
                  :step="1"
                  :show-tooltip="false"
                />
              </div>
              <span class="setting-btn">{{ speechMinutes }}分钟</span>
            </div>
          </div>
        </div>
      </div>
    </div>
    <div
      ref="contentRef"
      class="chapter"
      :class="chapterClass"
      :style="chapterTheme"
    >
      <div
        v-if="showClickZone"
        class="click-zone"
        :style="!isSlideRead ? { position: 'fixed' } : {}"
      >
        <div :style="showPrevPageStyle"><span>点击前一页</span></div>
        <div :style="showMenuZoneStyle"><span>点击显示菜单</span></div>
        <div :style="showNextPageStyle"><span>点击后一页</span></div>
        <div class="close-btn" @click="showClickZone = false">关闭</div>
      </div>
      <div class="top-bar">
        {{ miniInterface ? title : "" }}
      </div>
      <div class="content" @click="handlerClick">
        <div v-if="show" class="content-inner">
          <Content
            class="book-content"
            :title="title"
            :content="chapterContent"
            :show-content="show"
            :error="error"
            :style="contentStyle"
            :show-chapter-list="showChapterList"
            :is-scroll-read="isScrollRead"
          />
        </div>
      </div>
      <div class="bottom-bar">
        <span v-if="isSlideRead">
          {{ `第${currentPage}/${totalPages}页 ${readingProgress}` }}
        </span>
        <span v-if="isSlideRead">{{ timeStr }}</span>
        <span
          v-if="show && !isSlideRead && !error && !isScrollRead"
          class="bottom-btn"
        >
          加载下一章
        </span>
      </div>
    </div>
  </div>
</template>


<script setup>
import { computed, onBeforeUnmount, onMounted, ref } from "vue";
import { useRouter } from "vue-router";
import { ElMessage } from "element-plus/es/components/message/index.mjs";
import { ElIcon } from "element-plus/es/components/icon/index.mjs";
import { ElPopover } from "element-plus/es/components/popover/index.mjs";
import { ElRadioButton, ElRadioGroup } from "element-plus/es/components/radio/index.mjs";
import { ElSlider } from "element-plus/es/components/slider/index.mjs";
import "element-plus/es/components/icon/style/css.mjs";
import "element-plus/es/components/message/style/css.mjs";
import "element-plus/es/components/popover/style/css.mjs";
import "element-plus/es/components/radio/style/css.mjs";
import "element-plus/es/components/slider/style/css.mjs";
import {
  Bottom,
  Close,
  CollectionTag,
  Headset,
  InfoFilled,
  Menu as MenuIcon,
  Moon,
  RefreshRight,
  Search,
  Sunny,
  Top,
  VideoPause,
  VideoPlay,
  View
} from "@element-plus/icons-vue";
import PopCata from "../components/PopCatalog.vue";
import ReadSettings from "../components/ReadSettings.vue";
import BookSource from "../components/BookSource.vue";
import BookShelf from "../components/BookShelf.vue";
import Content from "../components/Content.vue";
import { getMiniInterface, getWindowSize } from "../utils/interface";
import {
  previewBook,
  previewCatalog,
  previewConfig,
  previewTheme
} from "../previewData";

defineOptions({
  name: "Reader"
});

const router = useRouter();
const title = ref("第一章 预览章节");
const chapterContent = ref(
  `这是阅读器界面预览内容。
当前阶段只用于验证 reader-server 原版阅读页菜单、按钮和弹出层是否完整复刻。
后续接入真实章节后会替换为真实内容。`
);
const error = ref(false);
const popCataVisible = ref(false);
const readSettingsVisible = ref(false);
const popBookSourceVisible = ref(false);
const popBookShelfVisible = ref(false);
const showToolBar = ref(true);
const show = ref(true);
const contentStyle = ref({});
const currentPage = ref(1);
const totalPages = ref(1);
const showClickZone = ref(false);
const timeStr = ref("");
const progressValue = ref(1);
const speechAvalable = ref(
  typeof window !== "undefined" &&
    window.speechSynthesis &&
    window.speechSynthesis.getVoices
);
const showReadBar = ref(false);
const voiceList = ref([]);
const voiceName = ref("");
const speechRate = ref(1);
const speechPitch = ref(1);
const speechSpeaking = ref(false);
const showSpeechConfig = ref(true);
const showCacheContentZone = ref(false);
const isCachingContent = ref(false);
const cachingContentTip = ref("");
const autoReading = ref(false);
const showChapterList = ref([]);
const speechMinutes = ref(0);
const miniInterface = ref(getMiniInterface());
const windowSize = ref(getWindowSize());
const config = ref({ ...previewConfig });
const readingBook = ref({ ...previewBook });
const catalog = ref(previewCatalog);
const currentThemeConfig = previewTheme;

const chapterIndex = computed(() => (readingBook.value.index || 0) | 0);
const isNight = computed(() => config.value.themeType === "night");
const bodyTheme = computed(() => ({
  background: currentThemeConfig.body
}));
const isCarToon = computed(() => false);
const isAudio = computed(() => false);
const isEpub = computed(() => false);
const isSlideRead = computed(() =>
  autoReading.value ||
  showReadBar.value ||
  isEpub.value ||
  isCarToon.value ||
  isAudio.value
    ? false
    : miniInterface.value && config.value.readMethod === "左右滑动"
);
const isScrollRead = computed(
  () =>
    !isEpub.value &&
    !isAudio.value &&
    !isSlideRead.value &&
    (config.value.readMethod === "上下滚动" ||
      config.value.readMethod === "上下滚动2")
);
const chapterClass = computed(() =>
  isSlideRead.value
    ? "slide-reader"
    : isEpub.value
      ? "epub"
      : isCarToon.value
        ? "cartoon"
        : isAudio.value
          ? "audio"
          : ""
);
const chapterTheme = computed(() => {
  const readingStyle = showReadBar.value
    ? { paddingBottom: `${showSpeechConfig.value ? 280 : 80}px` }
    : {};
  return {
    ...readingStyle,
    background: currentThemeConfig.content,
    width: readWidth.value
  };
});
const readWidthConfig = computed(() => {
  let width = config.value.readWidth;
  while (width > windowSize.value.width - 140) {
    width -= 20;
  }
  return width;
});
const leftBarTheme = computed(() => ({
  background: currentThemeConfig.popup,
  marginLeft: miniInterface.value ? 0 : `${-(readWidthConfig.value / 2 + 68)}px`,
  display: miniInterface.value && !showToolBar.value ? "none" : "block"
}));
const rightBarTheme = computed(() => ({
  background: currentThemeConfig.popupPure,
  marginRight: miniInterface.value ? 0 : `${-(readWidthConfig.value / 2 + 52)}px`,
  display: miniInterface.value && !showToolBar.value ? "none" : "block"
}));
const readBarTheme = computed(() => ({
  background: currentThemeConfig.popupPure,
  marginRight: miniInterface.value ? 0 : `${-(readWidthConfig.value / 2)}px`,
  zIndex: 200,
  display: speechAvalable.value && showReadBar.value ? "block" : "none",
  width: miniInterface.value ? "100vw" : "500px"
}));
const readWidth = computed(() => {
  if (!miniInterface.value) {
    return `${readWidthConfig.value - 130}px`;
  }
  return `${windowSize.value.width}px`;
});
const popperWidth = computed(() => {
  if (!miniInterface.value) {
    return readWidthConfig.value - 33;
  }
  return windowSize.value.width - 33;
});
const menuPopperOptions = computed(() => ({
  modifiers: [
    {
      name: "preventOverflow",
      options: {
        altAxis: miniInterface.value,
        padding: 16
      }
    }
  ]
}));
const readingProgress = computed(() => {
  if (catalog.value && catalog.value.length) {
    return `${parseInt(((chapterIndex.value + 1) * 100) / catalog.value.length)}%`;
  }
  return "";
});
const showPrevPageStyle = computed(() => {
  if (isSlideRead.value) {
    return {
      left: 0,
      top: 0,
      bottom: 0,
      right: `${windowSize.value.width / 2}px`,
      background: "#43987324",
      paddingRight: `${windowSize.value.width * 0.2}px`
    };
  }
  return {
    left: 0,
    top: 0,
    right: 0,
    bottom: `${windowSize.value.height / 2}px`,
    background: "#43987324"
  };
});
const showMenuZoneStyle = computed(() => ({
  top: `${windowSize.value.height * 0.3}px`,
  bottom: `${windowSize.value.height * 0.3}px`,
  left: `${windowSize.value.width * 0.3}px`,
  right: `${windowSize.value.width * 0.3}px`,
  background: "#636060",
  zIndex: 10
}));
const showNextPageStyle = computed(() => {
  if (isSlideRead.value) {
    return {
      right: 0,
      top: 0,
      bottom: 0,
      left: `${windowSize.value.width / 2}px`,
      background: "#6b1a7324",
      paddingLeft: `${windowSize.value.width * 0.2}px`
    };
  }
  return {
    left: 0,
    bottom: 0,
    right: 0,
    top: `${windowSize.value.height / 2}px`,
    background: "#6b1a7324"
  };
});
const popupAbsoluteBtnStyle = computed(() => ({
  background: currentThemeConfig.popupPure
}));

const syncInterface = () => {
  miniInterface.value = getMiniInterface();
  windowSize.value = getWindowSize();
};

const changeBook = () => {
  popBookShelfVisible.value = false;
};

const toShelf = () => {
  router.push("/");
};

const changeBookSource = () => {
  popBookSourceVisible.value = false;
};

const getContent = () => {
  popCataVisible.value = false;
};

const refreshCatalog = () => {
  ElMessage.success("目录刷新预览");
};

const beforeReadMethodChange = () => {};

const showPage = value => {
  currentPage.value = value || progressValue.value;
};

const eventHandler = point => {
  if (
    popBookSourceVisible.value ||
    popBookShelfVisible.value ||
    popCataVisible.value ||
    readSettingsVisible.value
  ) {
    return;
  }
  const midX = windowSize.value.width / 2;
  const midY = windowSize.value.height / 2;
  if (
    Math.abs(point.clientY - midY) <= windowSize.value.height * 0.2 &&
    Math.abs(point.clientX - midX) <= windowSize.value.width * 0.2 &&
    !showReadBar.value
  ) {
    showToolBar.value = !showToolBar.value;
  }
};

const handlerClick = event => {
  eventHandler(event);
};

const formatProgressTip = value => `第 ${value || progressValue.value}/${totalPages.value} 页`;

const formatTime = () => {
  const now = new Date();
  const pad = value => (value >= 10 ? `${value}` : `0${value}`);
  timeStr.value = `${pad(now.getHours())}:${pad(now.getMinutes())}`;
};

onMounted(() => {
  formatTime();
  window.addEventListener("resize", syncInterface);
});

onBeforeUnmount(() => {
  window.removeEventListener("resize", syncInterface);
});
</script>

<style lang="stylus" scoped>
:deep(.popper-component) {
  margin-left: 10px;
}

.chapter-wrapper {
  padding: 0;
  flex-direction: column;
  align-items: center;

  :deep(.no-point) {
    pointer-events: none;
  }

  .tool-bar {
    position: fixed;
    top: 0;
    padding-top: 0;
    padding-top: constant(safe-area-inset-top) !important;
    padding-top: env(safe-area-inset-top) !important;
    left: 50%;
    z-index: 2001;

    .tools {
      display: flex;
      flex-direction: column;

      .tool-icon {
        font-size: 18px;
        width: 58px;
        height: 48px;
        text-align: center;
        padding-top: 12px;
        cursor: pointer;
        outline: none;

        .iconfont {
          font-family: iconfont;
          width: 16px;
          font-size: 16px;
          margin: 0 auto;
          height: 22px;
          line-height: 22px;
          vertical-align: middle;
        }

        .tool-el-icon {
          font-size: 18px;
          line-height: 22px;
          height: 22px;

          i {
            line-height: 22px;
          }
        }

        .icon-text {
          font-size: 12px;
        }
      }
    }
  }

  .read-bar {
    position: fixed;
    bottom: 0;
    right: 50%;
    z-index: 100;

    .progress {
      padding: 10px 36px;
      display: flex;
      justify-content: space-between;
      align-items: center;

      .progress-bar {
        flex: 1;
        padding: 0 10px;
      }

      .progress-tip {
        font-size: 14px;
        margin-left: 5px;
      }
    }

    .cache-content-zone {
      padding: 10px 36px;
      display: flex;
      justify-content: space-between;
      align-items: center;
      font-size: 14px;
      position: absolute;
      right: 55px;
      width: 300px;
      background: inherit;

      .cache-content-btn {
        cursor: pointer;
      }
    }

    .float-left-btn-zone {
      position: absolute;
      bottom: 155px;
      left: 4px;
      right: auto;
      display: flex;
      flex-direction: column;

      .float-btn {
        line-height: 32px;
        width: 36px;
        height: 36px;
        border-radius: 100%;
        display: block;
        cursor: pointer;
        text-align: center;
        vertical-align: middle;
        pointer-events: all;
        margin-top: 20px;

        .el-icon-top, .el-icon-bottom, .el-icon-info, .el-icon-search, .el-icon-collection-tag {
          line-height: 36px;
        }
      }
    }

    .float-right-btn-zone {
      position: absolute;
      bottom: 155px;
      left: 4px;
      right: auto;
      display: flex;
      flex-direction: column;

      .float-btn {
        line-height: 32px;
        width: 36px;
        height: 36px;
        border-radius: 100%;
        display: block;
        cursor: pointer;
        text-align: center;
        vertical-align: middle;
        pointer-events: all;
        margin-top: 20px;

        .el-icon-refresh-right, .el-icon-headset, .el-icon-view {
          line-height: 36px;
        }
        .el-icon-moon {
          color: #121212;
          line-height: 34px;
        }
        .el-icon-sunny {
          color: #666;
          line-height: 34px;
        }
      }
    }

    .tools {
      display: flex;
      flex-direction: column;

      .tool-icon {
        font-size: 18px;
        width: 42px;
        height: 31px;
        padding-top: 12px;
        text-align: center;
        align-items: center;
        cursor: pointer;
        outline: none;
        margin-top: -1px;

        &.progress-text {
          font-size: 16px;
        }

        .iconfont {
          font-family: iconfont;
          width: 16px;
          height: 16px;
          font-size: 16px;
          margin: 0 auto 6px;
        }
      }
    }

    .reader-bar-inner {
      display: flex;
      flex-direction: column;
      padding-bottom: 10px;
      padding-bottom: calc(10px + constant(safe-area-inset-top));
      padding-bottom: calc(10px + env(safe-area-inset-top));
      padding-left: 5px;
      padding-right: 5px;

      .operate-bar {
        display: flex;
        flex-direction: row;
        justify-content: space-between;
        padding: 10px 10px 0 10px;
        align-items: center;

        .close-btn, .collapse-btn {
          font-size: 22px;
          height: 35px;
          cursor: pointer;
        }

        .center {
          span {
            display: inline-block;
            cursor: pointer;
          }
          .play-pause-btn {
            font-size: 50px;
            margin-top: -40px;
            i {
              border-radius: 100%;
            }
          }
          .ctrl-btn {
            margin: 0px 15px;
          }
        }
      }

      .setting-item {
        display: flex;
        flex-direction: column;
        padding: 5px 10px;

        .setting-title {
          font-size: 14px;
        }

        .setting-btn {
          font-size: 14px;
          cursor: pointer;
          display: inline-block;
          margin-left: 5px;
        }

        .voice-list {
          display: flex;
          flex-direction: row;
          overflow-x: auto;
          padding: 5px 10px;

          .radio-group {
            white-space: nowrap;

            .radio-button {
              margin-right: 10px;

              .el-radio-button__inner {
                border-radius: 4px 4px 4px 4px;
              }
            }
          }
        }

        .progress {
          padding: 5px 10px;

          .progress-tip {
            margin-left: 0;
            margin-right: 5px;
          }
        }
      }
    }
  }

  .chapter-bar {
    .el-breadcrumb {
      .item {
        font-size: 14px;
        color: #606266;
      }
    }
  }

  .chapter {
    font-family: 'Microsoft YaHei', PingFangSC-Regular, HelveticaNeue-Light, 'Helvetica Neue Light', sans-serif;
    text-align: left;
    padding: 0 65px;
    min-height: 100vh;
    min-height: calc(var(--vh, 1vh) * 100);
    width: 670px;
    margin: 0 auto;
    background-size: cover;
    position: relative;

    :deep(.el-icon-loading) {
      font-size: 36px;
      color: #B5B5B5;
    }

    :deep(.el-loading-text) {
      font-weight: 500;
      color: #B5B5B5;
    }

    .click-zone {
      position: absolute;
      z-index: 120;
      top: 0;
      bottom: 0;
      left: 0;
      right: 0;
      background: #333;
      opacity: 0.8;
      color: #fff;
      font-size: 14px;
      pointer-events: none;

      div {
        position: absolute;
        text-align: center;
        display: flex;
        align-items: center;
        justify-content: center;
      }

      .close-btn {
        left: 0;
        right: 0;
        bottom: 20px;
        height: 45px;
        line-height: 45px;
        z-index: 10;
        padding: 0;
        cursor: pointer;
        pointer-events: all;
      }
    }

    .content {
      font-size: 18px;
      line-height: 1.8;
      overflow: hidden;
      font-family: 'Microsoft YaHei', PingFangSC-Regular, HelveticaNeue-Light, 'Helvetica Neue Light', sans-serif;

      .content-inner {
        min-height: calc(var(--vh, 1vh) * 80);
        padding-bottom: 25px;
        box-sizing: border-box;
      }
    }

    .bottom-bar, .top-bar {
      box-sizing: border-box;
    }
    .top-bar {
      height: 44px;
      padding: 10px;
    }
    .bottom-bar {
      width: 100%;
      text-align: center;
      padding-bottom: 30px;
      .bottom-btn {
        font-size: 14px;
        cursor: pointer;
        display: inline-block;
        margin: 0 auto;
        padding: 10px 40px;
        width: 80%;
        box-sizing: border-box;
      }
    }
  }

  .chapter.audio {
    .top-bar, .bottom-bar {
      display: none;
    }
    .content-inner {
      height: calc(var(--vh, 1vh) * 100);
      margin-top: 0 !important;
      padding-top: 0 !important;
      padding-bottom: 0 !important;
      display: flex;
      align-items: center;
    }
  }
}

.day {
  :deep(.popup) {
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.12), 0 0 6px rgba(0, 0, 0, 0.04);
  }

  :deep(.tool-icon) {
    border: 1px solid rgba(0, 0, 0, 0.1);
    margin-top: -1px;
    color: #000;

    .icon-text {
      color: rgba(0, 0, 0, 0.4);
    }
  }

  :deep(.progress-tip) {
    color: rgba(0, 0, 0, 0.4);
  }

  :deep(.cache-content-zone) {
    color: rgba(0, 0, 0, 0.4);
  }

  :deep(.float-left-btn-zone) {
    color: #121212;
  }

  :deep(.float-right-btn-zone) {
    color: #121212;
  }

  :deep(.reader-bar-inner) {
    color: #121212;

    .setting-title {
      color: rgba(0, 0, 0, 0.8);
    }

    .setting-value {
      color: rgba(0, 0, 0, 0.4);
    }
  }

  :deep(.chapter) {
    border: 1px solid #d8d8d8;
    color: #262626;
  }

  .bottom-bar, .top-bar {
    color: rgba(0, 0, 0, 0.4);
  }

  :deep(.el-slider__runway) {
    background-color: #fff;
  }

  :deep(.play-pause-btn) {
    color: #409EFF;
  }
}

.night {
  :deep(.popup) {
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.48), 0 0 6px rgba(0, 0, 0, 0.16);
  }

  :deep(.tool-icon) {
    border: 1px solid #444;
    margin-top: -1px;
    color: #666;

    .icon-text {
      color: #666;
    }
  }

  :deep(.progress-tip) {
    color: #666;
  }

  :deep(.cache-content-zone) {
    color: #666;
  }

  :deep(.float-left-btn-zone) {
    color: #666;
  }

  :deep(.float-right-btn-zone) {
    color: #666;
  }

  :deep(.reader-bar-inner) {
    color: #666;
  }

  :deep(.chapter) {
    border: 1px solid #444;
    color: #666;
  }

  :deep(.popper__arrow) {
    background: #666;
  }

  .bottom-bar, .top-bar {
    color: #666;
  }

  :deep(.el-slider__runway) {
    background-color: #282828;
  }
  :deep(.el-slider__bar) {
    background-color: #185798;
  }
  :deep(.el-slider__button) {
    border: 2px solid #185798;
    background-color: #282828;
  }
  :deep(.play-pause-btn) {
    color: #185798;
  }
}

.chapter-wrapper {
  .read-bar {
    .float-btn-zone {
      position: absolute;
      bottom: 135px;
      left: 4px;

      .float-left-btn-zone {
        position: relative;
        left: auto;
        bottom: auto;
      }

      .float-right-btn-zone {
        position: relative;
        left: auto;
        bottom: auto;
        margin-bottom: 20px;
      }
    }

  }
}

.chapter-wrapper.mini-interface {
  padding: 0;
  position: relative;
  height: 100%;

  .tool-bar {
    left: 0;
    width: 100vw;
    margin-left: 0 !important;

    .tools {
      flex-direction: row;
      justify-content: space-around;
      .tool-icon {
        border: none;
      }
    }
  }

  .read-bar {
    right: 0;
    width: 100vw;
    margin-right: 0 !important;

    .cache-content-zone {
      position: relative;
      width: auto;
      right: 0;
      background: inherit;
    }

    .float-btn-zone {
      position: static;
      bottom: 0;
      left: 0;
    }

    .float-left-btn-zone {
      position: absolute;
      right: auto;
      left: 20px;
      bottom: 135px;
    }

    .float-right-btn-zone {
      position: absolute;
      left: auto;
      right: 20px;
      bottom: 135px;
    }

    .tools {
      flex-direction: row;
      justify-content: space-around;
      padding: 0 15px;
      height: 45px;
      .tool-icon {
        border: none;
        width: auto;
        padding: 0;
        height: 45px;
        line-height: 45px;
        .iconfont {
          display: inline-block;
        }
        span {
          vertical-align: middle;
        }
      }
    }
  }

  .chapter {
    width: 100vw !important;
    padding: 0 16px;
    box-sizing: border-box;
    border: none;
    text-align: justify;
    position: relative;

    .top-bar {
      position: fixed;
      top: 0;
      left: 0;
      width: 100vw;
      z-index: 50;
      background: inherit;
      height: 30px;
      height: calc(30px + constant(safe-area-inset-top));
      height: calc(30px + env(safe-area-inset-top));
      padding: 6px 16px;
      padding-top: calc(6px + constant(safe-area-inset-top));
      padding-top: calc(6px + env(safe-area-inset-top));
      font-size: 12px;
    }

    .content-inner {
      margin-top: 30px;
      margin-top: calc(30px + constant(safe-area-inset-top));
      margin-top: calc(30px + env(safe-area-inset-top));
      padding-top: 15px;
      padding-bottom: 15px;
    }
  }

  .chapter.cartoon {
    padding: 0;

    .content-inner {
      padding-top: 1px;
    }
  }

  .chapter.slide-reader {
    padding: 0;
    height: 100%;

    .bottom-bar {
      height: 24px;
      position: absolute;
      bottom: 0;
      padding: 0 16px;
      padding-bottom: 6px;
      display: flex;
      justify-content: space-between;
      font-size: 12px;
    }

    .top-bar {
      position: relative;
    }

    .content {
      position: absolute;
      overflow: visible;
      top: 30px;
      top: calc(30px + constant(safe-area-inset-top));
      top: calc(30px + env(safe-area-inset-top));
      bottom: 24px;
    }

    .content-inner {
      margin: 0 16px;
      overflow: hidden;
      text-align: justify;
      padding: 0;
      height: 100%;
    }

    .book-content {
      height: 100%;
      -webkit-columns: calc(100vw - 32px) 1;
      -webkit-column-gap: 32px;
      columns: calc(100vw - 16px) 1;
      column-gap: 16px;
    }
  }
}
.chapter-wrapper.mini-interface::-webkit-scrollbar {
  width: 0 !important;
}
</style><style lang="stylus">
.voice-list {
  .el-radio-button__inner {
    border-radius: 4px !important;
    border-left: 1px solid #DCDFE6;
    box-shadow: none;
  }
}
.night-theme {
  .voice-list {
    .el-radio-button {
      box-shadow: none !important;
    }
    .el-radio-button__inner {
      background-color: #bbb;
      border-color: #bbb;
    }
    .el-radio-button__inner:hover {
      color: #185798;
    }
    .el-radio-button__orig-radio:checked+.el-radio-button__inner {
      background-color: #185798;
      border-color: #185798;
      color: #fff;
      box-shadow: none;
    }
  }
}
.kindle-page {
  .day {
    .tool-icon {
      border: 1px solid #fefefefe;

      .icon-text {
        color: #444;
      }
    }

    .progress-tip {
      color: #444;
    }

    .cache-content-zone {
      color: #444;
    }

    .reader-bar-inner {

      .setting-title {
        color: rgba(0, 0, 0, 0.8);
      }

      .setting-value {
        color: #444;
      }
    }

    .bottom-bar, .top-bar {
      color: #444;
    }
  }
}
</style>
