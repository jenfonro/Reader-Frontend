<template>
  <div
    class="reader-view"
    :style="bodyTheme"
    @click="handlerClick"
    :class="{
      night: isNight,
      day: !isNight,
      'mini-interface': miniInterface,
      'reader-view--controls-visible': showToolBar
    }"
  >
    <header class="reader-topbar" :style="topBarTheme" aria-label="阅读器顶部栏">
      <div class="reader-topbar__inner" @click.stop>
        <button
          type="button"
          class="reader-topbar__circle-button"
          aria-label="返回"
          @click="toShelf"
        >
          <span aria-hidden="true">‹</span>
        </button>

        <div class="reader-topbar__actions" aria-label="阅读操作">
          <button type="button" class="reader-topbar__text-button" @click="addBookToShelf">
            加入书架
          </button>
          <el-popover
            v-model:visible="popBookSourceVisible"
            placement="bottom-end"
            :width="popperWidth"
            trigger="click"
            :show-arrow="false"
            popper-class="popper-component"
            :popper-options="menuPopperOptions"
            :teleported="false"
          >
            <template #reference>
              <button type="button" class="reader-topbar__text-button">
                换源
              </button>
            </template>
            <BookSource
              class="popup"
              :visible="popBookSourceVisible"
              @change-book-source="changeBookSource"
            />
          </el-popover>
          <el-popover
            v-model:visible="readerMoreVisible"
            placement="bottom-end"
            :width="160"
            trigger="click"
            :show-arrow="false"
            popper-class="reader-more-popper"
            :popper-options="menuPopperOptions"
            :teleported="false"
          >
            <template #reference>
              <button type="button" class="reader-topbar__circle-button" aria-label="更多">
                <el-icon :size="18">
                  <MoreFilled />
                </el-icon>
              </button>
            </template>
            <div class="reader-more-menu">
              <button type="button" class="reader-more-menu__item" @click="toggleCacheContent">
                <el-icon :size="16">
                  <Download />
                </el-icon>
                <span>下载</span>
              </button>
            </div>
          </el-popover>
        </div>
      </div>
    </header>

    <div class="reader-side-panel" :style="sidePanelTheme">
      <div class="reader-side-actions" @click.stop>
        <div class="reader-side-actions__left">
          <button type="button" class="reader-side-action" :style="sideActionStyle" aria-label="书签">
            <el-icon :size="18">
              <CollectionTag />
            </el-icon>
          </button>
          <button type="button" class="reader-side-action" :style="sideActionStyle" aria-label="搜索">
            <el-icon :size="18">
              <Search />
            </el-icon>
          </button>
          <button
            type="button"
            class="reader-side-action"
            :style="sideActionStyle"
            aria-label="书籍简介"
            @click="openBookIntro"
          >
            <el-icon :size="18">
              <InfoFilled />
            </el-icon>
          </button>
          <button type="button" class="reader-side-action" :style="sideActionStyle" aria-label="顶部">
            <el-icon :size="18">
              <Top />
            </el-icon>
          </button>
          <button type="button" class="reader-side-action" :style="sideActionStyle" aria-label="底部">
            <el-icon :size="18">
              <Bottom />
            </el-icon>
          </button>
        </div>
        <div class="reader-side-actions__right">
          <button type="button" class="reader-side-action" :style="sideActionStyle" aria-label="刷新">
            <el-icon :size="18">
              <RefreshRight />
            </el-icon>
          </button>
          <button type="button" class="reader-side-action" :style="sideActionStyle" aria-label="界面">
            <el-icon :size="18">
              <View />
            </el-icon>
          </button>
          <button type="button" class="reader-side-action" :style="sideActionStyle" aria-label="朗读">
            <el-icon :size="18">
              <Headset />
            </el-icon>
          </button>
          <button type="button" class="reader-side-action" :style="sideActionStyle" aria-label="夜间">
            <el-icon v-if="!isNight" :size="18" class="reader-theme-icon reader-theme-icon--moon">
              <Moon />
            </el-icon>
            <el-icon v-else :size="18" class="reader-theme-icon reader-theme-icon--sun">
              <Sunny />
            </el-icon>
          </button>
        </div>
      </div>
    </div>

    <div class="reader-bottom-panel reader-controls-panel" :style="bottomBarTheme">
      <div class="reader-control-row reader-control-row--progress" @click.stop>
        <button type="button" class="reader-control-text" @click="goPreviousPage">
          上一章
        </button>
        <div class="reader-control-progress">
          <el-slider
            v-model="currentPage"
            :min="1"
            :max="totalPages"
            :show-tooltip="false"
            @change="showPage"
            @input="progressValue = $event"
          />
        </div>
        <button type="button" class="reader-control-text" @click="goNextPage">
          下一章
        </button>
      </div>
      <div v-if="showCacheContentZone" class="reader-cache-panel">
        <div>缓存章节</div>
        <div v-show="!isCachingContent" class="reader-cache-panel__action">
          后面50章
        </div>
        <div v-show="!isCachingContent" class="reader-cache-panel__action">
          后面100章
        </div>
        <div v-show="!isCachingContent" class="reader-cache-panel__action">
          后面全部
        </div>
        <div v-show="isCachingContent" class="reader-cache-panel__status">
          {{ cachingContentTip }}
        </div>
        <div v-show="isCachingContent" class="reader-cache-panel__cancel">
          <el-icon :size="18">
            <Close />
          </el-icon>
        </div>
      </div>
      <div class="reader-control-row reader-control-row--actions" @click.stop>
        <el-popover
          v-model:visible="catalogPopoverVisible"
          placement="top"
          :width="popperWidth"
          trigger="click"
          :show-arrow="false"
          popper-class="popper-component"
          :popper-options="menuPopperOptions"
          :teleported="false"
        >
          <template #reference>
            <button type="button" class="reader-bottom-action">
              <span class="iconfont">&#58905;</span>
              <span>目录</span>
            </button>
          </template>
          <CatalogPopup
            class="popup"
            :visible="catalogPopoverVisible"
            :catalog="catalog"
            :book="readingBook"
            :current-index="chapterIndex"
            :is-night="isNight"
            :loading="catalogLoading"
            @get-content="getContent"
            @refresh="refreshCatalog"
          />
        </el-popover>
        <button type="button" class="reader-bottom-action" @click="toggleNight">
          <el-icon v-if="!isNight" :size="24" class="reader-theme-icon reader-theme-icon--moon">
            <Moon />
          </el-icon>
          <el-icon v-else :size="24" class="reader-theme-icon reader-theme-icon--sun">
            <Sunny />
          </el-icon>
          <span>夜间</span>
        </button>
        <button type="button" class="reader-bottom-action" @click="toggleReadSettings">
          <span class="iconfont">&#58971;</span>
          <span>设置</span>
        </button>
      </div>
    </div>
    <transition name="reader-settings-sheet">
      <div
        v-if="readSettingsVisible"
        class="reader-settings-sheet"
        :style="settingsSheetTheme"
        @click.stop
      >
        <ReadSettings
          class="reader-settings-sheet__content"
          :visible="readSettingsVisible"
          @close="readSettingsVisible = false"
          @show-reader-click-map="showReaderClickMap = true"
          @read-method-change="beforeReadMethodChange"
        />
      </div>
    </transition>
    <div class="reader-bottom-panel" :style="readBarTheme">
      <div class="reader-speech-panel">
        <div class="reader-speech-panel__controls">
          <div class="reader-close-button">
            <el-icon :size="18">
              <Close />
            </el-icon>
          </div>
          <div class="reader-speech-panel__center">
            <span class="reader-speech-panel__segment">上一段</span>
            <span class="reader-speech-panel__play">
              <el-icon
                v-if="speechSpeaking"
               
                :style="speechPlayStyle"
              >
                <VideoPause />
              </el-icon>
              <el-icon
                v-else
               
                :style="speechPlayStyle"
              >
                <VideoPlay />
              </el-icon>
            </span>
            <span class="reader-speech-panel__segment">下一段</span>
          </div>
          <div class="reader-collapse-button">
            <el-icon v-if="showSpeechConfig" :size="18">
              <Bottom />
            </el-icon>
            <el-icon v-else :size="18">
              <Top />
            </el-icon>
          </div>
        </div>
        <div v-if="showSpeechConfig" class="reader-speech-setting">
          <div class="reader-speech-setting__title">语音库</div>
          <div class="reader-speech-setting__value">
            <div class="reader-voice-list">
              <el-radio-group
                v-model="voiceName"
                size="small"
                class="reader-voice-list__group"
              >
                <el-radio-button
                  v-for="(voice, index) in voiceList"
                  :key="index"
                  class="reader-voice-list__option"
                  :value="voice.name"
                />
              </el-radio-group>
            </div>
          </div>
        </div>
        <div v-if="showSpeechConfig" class="reader-speech-setting">
          <div class="reader-speech-setting__title">语音设置</div>
          <div class="reader-speech-setting__value">
            <div class="reader-slider-row">
              <span class="reader-slider-row__label">语速</span>
              <div class="reader-slider-row__bar">
                <el-slider
                  v-model="speechRate"
                  :min="0.5"
                  :max="2"
                  :step="0.1"
                  :show-tooltip="false"
                />
              </div>
              <span class="reader-speech-setting__action">重置</span>
            </div>
            <div class="reader-slider-row">
              <span class="reader-slider-row__label">语调</span>
              <div class="reader-slider-row__bar">
                <el-slider
                  v-model="speechPitch"
                  :min="0"
                  :max="2"
                  :step="0.1"
                  :show-tooltip="false"
                />
              </div>
              <span class="reader-speech-setting__action">重置</span>
            </div>
            <div class="reader-slider-row">
              <span class="reader-slider-row__label">定时</span>
              <div class="reader-slider-row__bar">
                <el-slider
                  v-model="speechMinutes"
                  :min="0"
                  :max="180"
                  :step="1"
                  :show-tooltip="false"
                />
              </div>
              <span class="reader-speech-setting__action">{{ speechMinutes }}分钟</span>
            </div>
          </div>
        </div>
      </div>
    </div>
    <ReaderIntroPanel
      v-if="bookIntroVisible"
      :book="readingBook"
      @close="bookIntroVisible = false"
      @add-bookshelf="addBookToShelf"
    />

    <div
      ref="contentRef"
      class="reader-page"
      :class="chapterClass"
      :style="chapterTheme"
    >
      <div
        v-if="showReaderClickMap && !isIntroPage"
        class="reader-click-map"
        :style="!isSlideRead ? { position: 'fixed' } : {}"
      >
        <div :style="showPrevPageStyle"><span>点击前一页</span></div>
        <div :style="showMenuZoneStyle"><span>点击显示菜单</span></div>
        <div :style="showNextPageStyle"><span>点击后一页</span></div>
        <div class="reader-close-button" @click.stop="showReaderClickMap = false">关闭</div>
      </div>
      <div class="reader-page__top">
        {{ miniInterface && !isIntroPage ? title : "" }}
      </div>
      <div class="reader-page__content">
        <ReaderIntroPage
          v-if="isIntroPage"
          class="reader-page__intro"
          :book="readingBook"
          :loading="introLoading"
          @add-bookshelf="addBookToShelf"
          @start-reading="startReading"
        />
        <div v-else-if="loadingVisible" class="reader-page-loading" role="status" aria-live="polite">
          <span class="reader-page-loading__spinner" aria-hidden="true"></span>
          <span class="reader-page-loading__text">{{ loadingText }}</span>
        </div>
        <div v-else-if="show" class="reader-page__content-inner">
          <Content
            class="reader-text-flow"
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
      <div class="reader-page__bottom">
        <span v-if="isSlideRead">
          {{ `第${currentPage}/${totalPages}页 ${readingProgress}` }}
        </span>
        <span v-if="isSlideRead">{{ timeStr }}</span>
      </div>
    </div>
  </div>
</template>


<script setup>
import { computed, onBeforeUnmount, onMounted, ref, watch } from "vue";
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
  Download,
  Headset,
  InfoFilled,
  MoreFilled,
  Moon,
  RefreshRight,
  Search,
  Sunny,
  Top,
  VideoPause,
  VideoPlay,
  View
} from "@element-plus/icons-vue";
import BookSource from "../components/BookSource.vue";
import CatalogPopup from "../components/CatalogPopup.vue";
import Content from "../components/Content.vue";
import ReadSettings from "../components/ReadSettings.vue";
import ReaderIntroPage from "../components/reader/ReaderIntroPage.vue";
import ReaderIntroPanel from "../components/reader/ReaderIntroPanel.vue";
import { getMiniInterface, getWindowSize } from "../utils/interface";
import { previewConfig, previewTheme } from "../previewData";
import { useReaderRuntime } from "../composables/useReaderRuntime.js";

defineOptions({
  name: "Reader"
});

const props = defineProps({
  book: {
    type: Object,
    default: null
  }
});

const emit = defineEmits(["close-reader"]);
const {
  title,
  chapterContent,
  error,
  loadingVisible,
  loadingText,
  introLoading,
  catalogLoading,
  contentStyle,
  currentPage,
  totalPages,
  progressValue,
  readingBook,
  catalog,
  chapterIndex,
  isPreviewBook,
  isIntroPage,
  abortReaderTask,
  loadReaderBook,
  loadBookIntro,
  startReading,
  openChapter,
  refreshCatalog: refreshReaderCatalog,
  goToReaderPage,
  goNextPage,
  goPreviousPage
} = useReaderRuntime();

const popBookSourceVisible = ref(false);
const catalogPopoverVisible = ref(false);
const readSettingsVisible = ref(false);
const readerMoreVisible = ref(false);
const bookIntroVisible = ref(false);
const showToolBar = ref(false);
const show = ref(true);
const showReaderClickMap = ref(false);
const timeStr = ref("");
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
const currentThemeConfig = previewTheme;
const isNight = computed(() => config.value.themeType === "night");
const bodyTheme = computed(() => ({
  background: currentThemeConfig.body,
  "--reader-body-background": currentThemeConfig.body,
  "--reader-content-background": currentThemeConfig.content,
  "--reader-panel-background": currentThemeConfig.content,
  "--reader-font-color": currentThemeConfig.font
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
const topBarTheme = computed(() => ({
  background: "transparent",
  color: currentThemeConfig.font
}));
const sidePanelTheme = computed(() => ({
  color: currentThemeConfig.font
}));
const bottomBarTheme = computed(() => ({
  background: currentThemeConfig.content,
  color: currentThemeConfig.font
}));
const settingsSheetTheme = computed(() => ({
  background: currentThemeConfig.content,
  color: currentThemeConfig.font
}));
const readBarTheme = computed(() => ({
  background: currentThemeConfig.content,
  marginRight: miniInterface.value ? 0 : `${-(readWidthConfig.value / 2)}px`,
  zIndex: 200,
  display: speechAvalable.value && showReadBar.value ? "block" : "none",
  width: miniInterface.value ? "100vw" : "500px"
}));
const sideActionStyle = computed(() => ({
  background: currentThemeConfig.content
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
  if (isIntroPage.value) return "0%";
  if (catalog.value && catalog.value.length) {
    return `${Math.trunc(((chapterIndex.value + 1) * 100) / catalog.value.length)}%`;
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
const speechPlayStyle = computed(() => ({
  background: currentThemeConfig.content
}));

const syncInterface = () => {
  miniInterface.value = getMiniInterface();
  windowSize.value = getWindowSize();
};

const toShelf = () => {
  emit("close-reader");
};

const changeBookSource = () => {
  popBookSourceVisible.value = false;
};

const toggleCacheContent = () => {
  readerMoreVisible.value = false;
  showCacheContentZone.value = !showCacheContentZone.value;
};

const toggleNight = () => {
  config.value.themeType = isNight.value ? "day" : "night";
};

const toggleReadSettings = () => {
  readSettingsVisible.value = !readSettingsVisible.value;
};

const openBookIntro = () => {
  bookIntroVisible.value = true;
  showToolBar.value = true;
  loadBookIntro();
};

const addBookToShelf = () => {
  bookIntroVisible.value = false;
  ElMessage.success("已加入书架预览");
};

const showPage = value => {
  goToReaderPage(value || progressValue.value);
};

const getContent = note => {
  catalogPopoverVisible.value = false;
  openChapter(note);
};

const refreshCatalog = () => {
  if (isPreviewBook.value) {
    ElMessage.success("目录刷新预览");
    return;
  }
  refreshReaderCatalog();
};

const beforeReadMethodChange = () => {};

const closeReaderMenus = () => {
  popBookSourceVisible.value = false;
  catalogPopoverVisible.value = false;
  readSettingsVisible.value = false;
  readerMoreVisible.value = false;
  showCacheContentZone.value = false;
  showToolBar.value = false;
};

const hasVisibleReaderMenu = () =>
  showToolBar.value ||
  popBookSourceVisible.value ||
  catalogPopoverVisible.value ||
  readSettingsVisible.value ||
  readerMoreVisible.value ||
  showCacheContentZone.value;

const eventHandler = point => {
  if (bookIntroVisible.value) {
    return;
  }
  if (hasVisibleReaderMenu()) {
    closeReaderMenus();
    return;
  }
  if (isIntroPage.value) {
    showToolBar.value = true;
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
    return;
  }

  const shouldGoNext = isSlideRead.value
    ? point.clientX > midX
    : point.clientY > midY;
  if (shouldGoNext) {
    goNextPage();
    return;
  }
  goPreviousPage();
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

watch(
  () => props.book,
  loadReaderBook,
  { immediate: true }
);

onMounted(() => {
  formatTime();
  window.addEventListener("resize", syncInterface);
});

onBeforeUnmount(() => {
  abortReaderTask();
  window.removeEventListener("resize", syncInterface);
});
</script>

<style lang="stylus" scoped>
:deep(.reader-more-popper),
:deep(.popper-component) {
  background: var(--reader-panel-background);
  color: var(--reader-font-color);
}

:deep(.reader-more-popper) {
  padding: 6px;
}


.reader-view {
  padding: 0;
  flex-direction: column;
  align-items: center;

  :deep(.no-point) {
    pointer-events: none;
  }

  .reader-topbar {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    z-index: 2001;
    padding-top: constant(safe-area-inset-top);
    padding-top: env(safe-area-inset-top);
    opacity: 0;
    pointer-events: none;
    transform: translateY(-100%);
    transition: opacity 0.22s ease, transform 0.22s ease;

    .reader-topbar__inner {
      display: grid;
      grid-template-columns: 1fr auto 1fr;
      align-items: center;
      gap: 12px;
      padding: 10px clamp(14px, 4vw, 28px) 8px;
    }

    .reader-topbar__actions {
      grid-column: 3;
      justify-self: end;
      display: inline-flex;
      align-items: center;
      gap: 9px;
    }

    .reader-topbar__circle-button,
    .reader-topbar__text-button {
      border: 0;
      color: inherit;
      background: var(--reader-panel-background);
      box-shadow: 0 10px 28px rgba(72, 55, 34, 0.1);
      backdrop-filter: blur(18px);
      cursor: pointer;
      transition: transform 0.16s ease, background 0.16s ease, opacity 0.16s ease;
    }

    .reader-topbar__circle-button {
      width: 38px;
      height: 38px;
      display: inline-flex;
      align-items: center;
      justify-content: center;
      padding: 0;
      border-radius: 999px;
    }

    .reader-topbar__circle-button > span {
      font-size: 32px;
      line-height: 1;
      font-weight: 300;
      transform: translate(-1px, -2px);
    }

    .reader-topbar__text-button {
      height: 36px;
      padding: 0 13px;
      border-radius: 999px;
      font-size: 13px;
      line-height: 1;
      font-weight: 600;
    }

    .reader-topbar__circle-button:active,
    .reader-topbar__text-button:active {
      transform: scale(0.96);
    }
  }

  .reader-side-panel {
    position: fixed;
    bottom: 0;
    right: 50%;
    z-index: 101;
    width: min(100vw, 680px);
    opacity: 0;
    pointer-events: none;
    transition: opacity 0.18s ease;

    .reader-side-actions__left {
      position: absolute;
      bottom: 155px;
      left: 4px;
      right: auto;
      display: flex;
      flex-direction: column;
    }

    .reader-side-actions__right {
      position: absolute;
      bottom: 155px;
      right: 4px;
      left: auto;
      display: flex;
      flex-direction: column;
    }

    .reader-side-action {
      width: 36px;
      height: 36px;
      display: flex;
      align-items: center;
      justify-content: center;
      margin-top: 20px;
      padding: 0;
      border: 0;
      border-radius: 100%;
      color: inherit;
      cursor: pointer;
      text-align: center;
      pointer-events: all;
    }

    .reader-theme-icon--moon {
      color: #121212;
    }

    .reader-theme-icon--sun {
      color: #666;
    }
  }

  .reader-bottom-panel {
    position: fixed;
    bottom: 0;
    right: 50%;
    z-index: 100;
    border-top: 1px solid rgba(120, 104, 75, 0.18);
    box-shadow: 0 -8px 24px rgba(72, 55, 34, 0.06);
    padding: 10px 22px calc(14px + env(safe-area-inset-bottom));

    &.reader-controls-panel {
      left: 50%;
      right: auto;
      width: min(100vw, 680px);
      margin-left: max(-340px, -50vw);
      box-sizing: border-box;
      opacity: 0;
      pointer-events: none;
      transform: translateY(100%);
      transition: opacity 0.22s ease, transform 0.22s ease;
      overflow: visible;
    }

    .reader-slider-row {
      padding: 10px 36px;
      display: flex;
      justify-content: space-between;
      align-items: center;

      .reader-slider-row__bar {
        flex: 1;
        padding: 0 10px;
      }

      .reader-slider-row__label {
        font-size: 14px;
        margin-left: 5px;
      }
    }

    .reader-cache-panel {
      padding: 10px 36px;
      display: flex;
      justify-content: space-between;
      align-items: center;
      font-size: 14px;
      position: absolute;
      right: 55px;
      width: 300px;
      background: inherit;

      .reader-cache-panel__action {
        cursor: pointer;
      }
    }

    .reader-control-row {
      display: grid;
      align-items: center;
      gap: 14px;
    }

    .reader-control-row--progress {
      grid-template-columns: auto minmax(120px, 1fr) auto;
      margin-bottom: 12px;
    }

    .reader-control-row--actions {
      grid-template-columns: repeat(3, 1fr);
      justify-items: center;
    }

    .reader-control-text,
    .reader-bottom-action {
      border: 0;
      color: inherit;
      background: transparent;
      cursor: pointer;
      outline: none;
    }

    .reader-control-text {
      min-width: 52px;
      padding: 0;
      font-size: 14px;
      line-height: 1;
      white-space: nowrap;
    }

    .reader-control-progress {
      min-width: 0;
      padding: 0 4px;
    }

    .reader-bottom-action {
      min-width: 48px;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      gap: 5px;
      padding: 0;
      font-size: 12px;
      line-height: 1;

      .iconfont {
        font-family: iconfont;
        width: 22px;
        height: 22px;
        display: inline-flex;
        align-items: center;
        justify-content: center;
        font-size: 21px;
        line-height: 1;
      }
    }

    :deep(.reader-control-progress .el-slider) {
      --el-slider-height: 10px;
      --el-slider-button-size: 20px;
      --el-slider-button-wrapper-size: 28px;
      --el-slider-button-wrapper-offset: -9px;
      --el-slider-border-radius: 999px;
      height: 22px;
    }

    :deep(.reader-control-progress .el-slider__runway) {
      height: 10px;
      border-radius: 999px;
      background-color: rgba(120, 104, 75, 0.16);
      box-shadow: inset 0 1px 3px rgba(72, 55, 34, 0.06);
    }

    :deep(.reader-control-progress .el-slider__bar) {
      height: 10px;
      border-radius: 999px;
      background-color: rgba(120, 104, 75, 0.22);
    }

    :deep(.reader-control-progress .el-slider__button) {
      width: 20px;
      height: 20px;
      border: 0;
      background-color: rgba(255, 250, 235, 0.88);
      box-shadow: 0 6px 16px rgba(72, 55, 34, 0.16);
    }

    .reader-tool-list {
      display: flex;
      flex-direction: column;

      .reader-tool {
        font-size: 18px;
        min-width: 42px;
        height: 31px;
        padding: 0 6px;
        border: 0;
        color: inherit;
        background: transparent;
        display: flex;
        flex-direction: row;
        align-items: center;
        justify-content: center;
        gap: 4px;
        cursor: pointer;
        outline: none;

        &.reader-progress-text {
          font-size: 16px;
          min-width: auto;
        }

        .iconfont {
          font-family: iconfont;
          width: 16px;
          height: 16px;
          font-size: 16px;
          margin: 0;
          line-height: 1;
          display: flex;
          align-items: center;
          justify-content: center;
        }
      }
    }

    .reader-speech-panel {
      display: flex;
      flex-direction: column;
      padding-bottom: 10px;
      padding-bottom: calc(10px + constant(safe-area-inset-top));
      padding-bottom: calc(10px + env(safe-area-inset-top));
      padding-left: 5px;
      padding-right: 5px;

      .reader-speech-panel__controls {
        display: flex;
        flex-direction: row;
        justify-content: space-between;
        padding: 10px 10px 0 10px;
        align-items: center;

        .reader-close-button, .reader-collapse-button {
          font-size: 22px;
          height: 35px;
          cursor: pointer;
        }

        .reader-speech-panel__center {
          span {
            display: inline-flex;
            align-items: center;
            cursor: pointer;
          }
          .reader-speech-panel__play {
            font-size: 50px;
            margin-top: -40px;
            display: flex;
            align-items: center;
            justify-content: center;
            border-radius: 100%;
          }
          .reader-speech-panel__segment {
            margin: 0px 15px;
          }
        }
      }

      .reader-speech-setting {
        display: flex;
        flex-direction: column;
        padding: 5px 10px;

        .reader-speech-setting__title {
          font-size: 14px;
        }

        .reader-speech-setting__action {
          font-size: 14px;
          cursor: pointer;
          display: inline-flex;
          align-items: center;
          margin-left: 5px;
        }

        .reader-voice-list {
          display: flex;
          flex-direction: row;
          overflow-x: auto;
          padding: 5px 10px;

          .reader-voice-list__group {
            white-space: nowrap;

            .reader-voice-list__option {
              margin-right: 10px;

              .el-radio-button__inner {
                border-radius: 4px 4px 4px 4px;
              }
            }
          }
        }

        .reader-slider-row {
          padding: 5px 10px;

          .reader-slider-row__label {
            margin-left: 0;
            margin-right: 5px;
          }
        }
      }
    }
  }

  .reader-settings-sheet {
    position: fixed;
    left: 50%;
    right: auto;
    bottom: calc(64px + env(safe-area-inset-bottom));
    z-index: 102;
    width: min(100vw, 680px);
    margin-left: max(-340px, -50vw);
    box-sizing: border-box;
    overflow: hidden;
    border-top: 1px solid rgba(120, 104, 75, 0.18);
    border-bottom: 1px solid rgba(120, 104, 75, 0.14);
    box-shadow: 0 -8px 24px rgba(72, 55, 34, 0.06);
  }

  .reader-settings-sheet__content {
    width: 100%;
    box-sizing: border-box;
  }

  :deep(.reader-settings-sheet__content.reading-settings) {
    margin: 0;
    padding: 16px 22px 18px;
    max-height: min(52vh, 440px);
  }

  :deep(.reader-settings-sheet__content .reading-settings__body) {
    max-height: min(52vh, 440px);
  }

  .reader-settings-sheet-enter-active,
  .reader-settings-sheet-leave-active {
    transition: opacity 0.2s ease, transform 0.2s ease;
  }

  .reader-settings-sheet-enter-from,
  .reader-settings-sheet-leave-to {
    opacity: 0;
    transform: translateY(24px);
  }

  &.reader-view--controls-visible {
    .reader-topbar {
      opacity: 1;
      pointer-events: auto;
      transform: translateY(0);
    }

    .reader-bottom-panel.reader-controls-panel {
      opacity: 1;
      pointer-events: auto;
      transform: translateY(0);
    }

    .reader-side-panel {
      opacity: 1;
      pointer-events: auto;
    }
  }



  .reader-page {
    font-family: 'Microsoft YaHei', PingFangSC-Regular, HelveticaNeue-Light, 'Helvetica Neue Light', sans-serif;
    text-align: left;
    padding: 0 65px;
    min-height: 100vh;
    min-height: calc(var(--vh, 1vh) * 100);
    width: 670px;
    margin: 0 auto;
    background-size: cover;
    position: relative;


    :deep(.el-loading-text) {
      font-weight: 500;
      color: #B5B5B5;
    }

    .reader-click-map {
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

      .reader-close-button {
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

    .reader-page__content {
      font-size: 18px;
      line-height: 1.8;
      overflow: hidden;
      font-family: 'Microsoft YaHei', PingFangSC-Regular, HelveticaNeue-Light, 'Helvetica Neue Light', sans-serif;

      .reader-page-loading {
        min-height: calc(var(--vh, 1vh) * 80);
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        gap: 14px;
        color: #8a8a8a;
        font-size: 14px;
        line-height: 20px;
      }

      .reader-page-loading__spinner {
        width: 28px;
        height: 28px;
        border: 2px solid rgba(138, 138, 138, 0.18);
        border-top-color: rgba(138, 138, 138, 0.86);
        border-radius: 50%;
        animation: reader-page-loading-spin 0.85s linear infinite;
      }

      .reader-page__content-inner {
        min-height: calc(var(--vh, 1vh) * 80);
        padding-bottom: 25px;
        box-sizing: border-box;
      }
    }

    .reader-page__bottom, .reader-page__top {
      box-sizing: border-box;
    }
    .reader-page__top {
      height: 44px;
      padding: 10px;
    }
      .reader-page__bottom {
      width: 100%;
      text-align: center;
      padding-bottom: 30px;
    }
  }

  @keyframes reader-page-loading-spin {
    to {
      transform: rotate(360deg);
    }
  }

  .reader-page.audio {
    .reader-page__top, .reader-page__bottom {
      display: none;
    }
    .reader-page__content-inner {
      height: calc(var(--vh, 1vh) * 100);
      margin-top: 0 !important;
      padding-top: 0 !important;
      padding-bottom: 0 !important;
      display: flex;
      align-items: center;
    }
  }
}

.reader-more-menu {
  display: flex;
  flex-direction: column;
}

.reader-more-menu__item {
  min-height: 36px;
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 0 10px;
  border: 0;
  border-radius: 10px;
  color: inherit;
  background: transparent;
  font-size: 14px;
  cursor: pointer;
}

.reader-more-menu__item:active {
  background: var(--reader-content-background);
}

.day {
  :deep(.popup) {
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.12), 0 0 6px rgba(0, 0, 0, 0.04);
  }

  :deep(.reader-tool) {
    color: #000;
  }

  :deep(.reader-slider-row__label) {
    color: rgba(0, 0, 0, 0.4);
  }

  :deep(.reader-cache-panel) {
    color: rgba(0, 0, 0, 0.4);
  }

  :deep(.reader-speech-panel) {
    color: #121212;

    .reader-speech-setting__title {
      color: rgba(0, 0, 0, 0.8);
    }

    .reader-speech-setting__value {
      color: rgba(0, 0, 0, 0.4);
    }
  }

  :deep(.reader-page) {
    border: 1px solid #d8d8d8;
    color: #262626;
  }

  .reader-page__bottom, .reader-page__top {
    color: rgba(0, 0, 0, 0.4);
  }

  :deep(.reader-speech-panel__play) {
    color: #409EFF;
  }
}

.night {
  :deep(.popup) {
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.48), 0 0 6px rgba(0, 0, 0, 0.16);
  }

  :deep(.reader-tool) {
    color: #666;
  }

  :deep(.reader-slider-row__label) {
    color: #666;
  }

  :deep(.reader-cache-panel) {
    color: #666;
  }

  :deep(.reader-speech-panel) {
    color: #666;
  }

  :deep(.reader-page) {
    border: 1px solid #444;
    color: #666;
  }


  .reader-page__bottom, .reader-page__top {
    color: #666;
  }

  :deep(.reader-speech-panel__play) {
    color: #185798;
  }
}


.reader-view.mini-interface {
  padding: 0;
  position: relative;
  height: 100%;

  .reader-topbar {
    left: 0;
    width: 100vw;
  }

  .reader-side-panel {
    right: 0;
    width: 100vw;

    .reader-side-actions {
      position: static;
      bottom: 0;
      left: 0;
    }

    .reader-side-actions__left {
      position: absolute;
      right: auto;
      left: 20px;
      bottom: 135px;
    }

    .reader-side-actions__right {
      position: absolute;
      left: auto;
      right: 20px;
      bottom: 135px;
    }
  }

  .reader-settings-sheet {
    left: 0;
    right: auto;
    width: 100vw;
    margin-left: 0 !important;
    margin-right: 0 !important;
  }

  .reader-bottom-panel {
    left: 0;
    right: auto;
    width: 100vw;
    margin-left: 0 !important;
    margin-right: 0 !important;

    .reader-cache-panel {
      position: relative;
      width: auto;
      right: 0;
      background: inherit;
    }

  }

  .reader-page {
    width: 100vw !important;
    padding: 0 16px;
    box-sizing: border-box;
    border: none;
    text-align: justify;
    position: relative;

    .reader-page__top {
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

    .reader-page-loading,
    .reader-page__intro,
    .reader-page__content-inner {
      margin-top: 30px;
      margin-top: calc(30px + constant(safe-area-inset-top));
      margin-top: calc(30px + env(safe-area-inset-top));
      padding-top: 15px;
      padding-bottom: 15px;
    }
  }

  .reader-page.cartoon {
    padding: 0;

    .reader-page__content-inner {
      padding-top: 1px;
    }
  }

  .reader-page.slide-reader {
    padding: 0;
    height: 100%;

    .reader-page__bottom {
      height: 24px;
      position: absolute;
      bottom: 0;
      padding: 0 16px;
      padding-bottom: 6px;
      display: flex;
      justify-content: space-between;
      font-size: 12px;
    }

    .reader-page__top {
      position: relative;
    }

    .reader-page__content {
      position: absolute;
      overflow: visible;
      top: 30px;
      top: calc(30px + constant(safe-area-inset-top));
      top: calc(30px + env(safe-area-inset-top));
      bottom: 24px;
    }

    .reader-page-loading,
    .reader-page__intro,
    .reader-page__content-inner {
      margin: 0 16px;
      overflow: hidden;
      text-align: justify;
      padding: 0;
      height: 100%;
    }

    .reader-text-flow {
      height: 100%;
      -webkit-columns: calc(100vw - 32px) 1;
      -webkit-column-gap: 32px;
      columns: calc(100vw - 16px) 1;
      column-gap: 16px;
    }
  }
}
.reader-view.mini-interface::-webkit-scrollbar {
  width: 0 !important;
}
</style><style lang="stylus">
.reader-voice-list {
  .el-radio-button__inner {
    border-radius: 4px !important;
    border-left: 1px solid #DCDFE6;
    box-shadow: none;
  }
}
</style>
