<template>
  <div
    class="reader-view"
    :style="bodyTheme"
    :class="{
      night: isNight,
      day: !isNight,
      'mini-interface': miniInterface
    }"
  >
    <div class="reader-main-toolbar" :style="leftBarTheme">
      <div class="reader-tool-list">
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
            <div class="reader-tool">
              <div class="iconfont">
                &#58892;
              </div>
              <div class="reader-tool__label">书架</div>
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
            <div class="reader-tool">
              <div class="reader-tool__el-icon">
                <el-icon :size="18">
                  <MenuIcon />
                </el-icon>
              </div>
              <div class="reader-tool__label">书源</div>
            </div>
          </template>
          <BookSource
            class="popup"
            :visible="popBookSourceVisible"
            @change-book-source="changeBookSource"
          />
        </el-popover>
        <el-popover
          v-model:visible="catalogPopoverVisible"
          placement="right"
          :width="popperWidth"
          trigger="click"
          :show-arrow="false"
          popper-class="popper-component"
          :popper-options="menuPopperOptions"
        >
          <template #reference>
            <div class="reader-tool">
              <div class="iconfont">
                &#58905;
              </div>
              <div class="reader-tool__label">目录</div>
            </div>
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
            <div class="reader-tool">
              <div class="iconfont">
                &#58971;
              </div>
              <div class="reader-tool__label">设置</div>
            </div>
          </template>
          <ReadSettings
            class="popup"
            :visible="readSettingsVisible"
            @close="readSettingsVisible = false"
            @show-reader-click-map="showReaderClickMap = true"
            @read-method-change="beforeReadMethodChange"
          />
        </el-popover>
        <div class="reader-tool" :style="miniInterface ? { order: -1 } : {}">
          <div class="iconfont">
            &#58920;
          </div>
          <div class="reader-tool__label">首页</div>
        </div>
        <div v-if="!miniInterface" class="reader-tool">
          <div class="iconfont">
            &#58914;
          </div>
          <div class="reader-tool__label">顶部</div>
        </div>
        <div v-if="!miniInterface" class="reader-tool">
          <div class="iconfont">
            &#58915;
          </div>
          <div class="reader-tool__label">底部</div>
        </div>
      </div>
    </div>
    <div class="reader-bottom-panel" :style="rightBarTheme">
      <div class="reader-side-actions">
        <div class="reader-side-actions__left">
          <div class="reader-side-action" :style="popupAbsoluteBtnStyle">
            <el-icon :size="18">
              <CollectionTag />
            </el-icon>
          </div>
          <div class="reader-side-action" :style="popupAbsoluteBtnStyle">
            <el-icon :size="18">
              <Search />
            </el-icon>
          </div>
          <button
            type="button"
            class="reader-side-action"
            :style="popupAbsoluteBtnStyle"
            aria-label="书籍简介"
            @click.stop="openBookIntro"
          >
            <el-icon :size="18">
              <InfoFilled />
            </el-icon>
          </button>
          <div class="reader-side-action" :style="popupAbsoluteBtnStyle">
            <el-icon :size="18">
              <Top />
            </el-icon>
          </div>
          <div class="reader-side-action" :style="popupAbsoluteBtnStyle">
            <el-icon :size="18">
              <Bottom />
            </el-icon>
          </div>
        </div>
        <div class="reader-side-actions__right">
          <div class="reader-side-action" :style="popupAbsoluteBtnStyle">
            <el-icon :size="18">
              <RefreshRight />
            </el-icon>
          </div>
          <div class="reader-side-action" :style="popupAbsoluteBtnStyle">
            <el-icon :size="18">
              <View />
            </el-icon>
          </div>
          <div class="reader-side-action" :style="popupAbsoluteBtnStyle">
            <el-icon :size="18">
              <Headset />
            </el-icon>
          </div>
          <div class="reader-side-action" :style="popupAbsoluteBtnStyle">
            <el-icon v-if="!isNight" :size="18" class="reader-theme-icon reader-theme-icon--moon">
              <Moon />
            </el-icon>
            <el-icon v-else :size="18" class="reader-theme-icon reader-theme-icon--sun">
              <Sunny />
            </el-icon>
          </div>
        </div>
      </div>
      <div v-if="miniInterface && !isAudio" class="reader-slider-row">
        <div class="reader-slider-row__bar">
          <el-slider
            v-model="currentPage"
            :min="1"
            :max="totalPages"
            :show-tooltip="false"
            @change="showPage"
            @input="progressValue = $event"
          />
        </div>
        <span class="reader-slider-row__label">{{ formatProgressTip() }}</span>
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
      <div class="reader-tool-list">
        <div class="reader-tool reader-progress-text">
          <span v-if="miniInterface">阅读进度: </span>
          {{ readingProgress }}
        </div>
        <div class="reader-tool" :style="miniInterface ? { order: -1 } : {}">
          <div class="iconfont">
            &#58920;
          </div>
          <span v-if="miniInterface">上一章</span>
        </div>
        <div class="reader-tool">
          <span v-if="miniInterface">下一章</span>
          <div class="iconfont">
            &#58913;
          </div>
        </div>
      </div>
    </div>
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
               
                :style="popupAbsoluteBtnStyle"
              >
                <VideoPause />
              </el-icon>
              <el-icon
                v-else
               
                :style="popupAbsoluteBtnStyle"
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
        v-if="showReaderClickMap"
        class="reader-click-map"
        :style="!isSlideRead ? { position: 'fixed' } : {}"
      >
        <div :style="showPrevPageStyle"><span>点击前一页</span></div>
        <div :style="showMenuZoneStyle"><span>点击显示菜单</span></div>
        <div :style="showNextPageStyle"><span>点击后一页</span></div>
        <div class="reader-close-button" @click="showReaderClickMap = false">关闭</div>
      </div>
      <div class="reader-page__top">
        {{ miniInterface ? title : "" }}
      </div>
      <div class="reader-page__content" @click="handlerClick">
        <div v-if="show" class="reader-page__content-inner">
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
        <span
          v-if="show && !isSlideRead && !error && !isScrollRead"
          class="reader-page__next"
        >
          加载下一章
        </span>
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
import CatalogPopup from "../components/CatalogPopup.vue";
import ReadSettings from "../components/ReadSettings.vue";
import BookSource from "../components/BookSource.vue";
import BookShelf from "../components/BookShelf.vue";
import Content from "../components/Content.vue";
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
  catalogLoading,
  contentStyle,
  currentPage,
  totalPages,
  progressValue,
  readingBook,
  catalog,
  chapterIndex,
  isPreviewBook,
  abortReaderTask,
  loadReaderBook,
  openChapter,
  refreshCatalog: refreshReaderCatalog
} = useReaderRuntime();

const catalogPopoverVisible = ref(false);
const readSettingsVisible = ref(false);
const popBookSourceVisible = ref(false);
const popBookShelfVisible = ref(false);
const bookIntroVisible = ref(false);
const showToolBar = ref(true);
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

const changeBook = book => {
  popBookShelfVisible.value = false;
  loadReaderBook(book);
};

const toShelf = () => {
  emit("close-reader");
};

const changeBookSource = () => {
  popBookSourceVisible.value = false;
};

const openBookIntro = () => {
  bookIntroVisible.value = true;
  showToolBar.value = true;
};

const addBookToShelf = () => {
  bookIntroVisible.value = false;
  ElMessage.success("已加入书架预览");
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

const showPage = value => {
  currentPage.value = value || progressValue.value;
};

const eventHandler = point => {
  if (
    popBookSourceVisible.value ||
    popBookShelfVisible.value ||
    bookIntroVisible.value ||
    catalogPopoverVisible.value ||
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
:deep(.popper-component) {
  margin-left: 10px;
}


.reader-view {
  padding: 0;
  flex-direction: column;
  align-items: center;

  :deep(.no-point) {
    pointer-events: none;
  }

  .reader-main-toolbar {
    position: fixed;
    top: 0;
    padding-top: 0;
    padding-top: constant(safe-area-inset-top) !important;
    padding-top: env(safe-area-inset-top) !important;
    left: 50%;
    z-index: 2001;

    .reader-tool-list {
      display: flex;
      flex-direction: column;

      .reader-tool {
        font-size: 18px;
        width: 58px;
        height: 48px;
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        gap: 4px;
        cursor: pointer;
        outline: none;

        .iconfont {
          font-family: iconfont;
          width: 16px;
          height: 22px;
          font-size: 16px;
          margin: 0;
          line-height: 1;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .reader-tool__el-icon {
          font-size: 18px;
          height: 22px;
          display: flex;
          align-items: center;
          justify-content: center;

        }

        .reader-tool__label {
          font-size: 12px;
          line-height: 1;
        }
      }
    }
  }

  .reader-bottom-panel {
    position: fixed;
    bottom: 0;
    right: 50%;
    z-index: 100;

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

    .reader-side-actions__left {
      position: absolute;
      bottom: 155px;
      left: 4px;
      right: auto;
      display: flex;
      flex-direction: column;

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
    }

    .reader-side-actions__right {
      position: absolute;
      bottom: 155px;
      left: 4px;
      right: auto;
      display: flex;
      flex-direction: column;

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


        .reader-theme-icon--moon {
          color: #121212;
        }
        .reader-theme-icon--sun {
          color: #666;
        }
      }
    }

    .reader-tool-list {
      display: flex;
      flex-direction: column;

      .reader-tool {
        font-size: 18px;
        min-width: 42px;
        height: 31px;
        padding: 0 6px;
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
      .reader-page__next {
        font-size: 14px;
        cursor: pointer;
        display: inline-flex;
        align-items: center;
        justify-content: center;
        margin: 0 auto;
        padding: 10px 40px;
        width: 80%;
        box-sizing: border-box;
      }
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

.day {
  :deep(.popup) {
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.12), 0 0 6px rgba(0, 0, 0, 0.04);
  }

  :deep(.reader-tool) {
    border: 1px solid rgba(0, 0, 0, 0.1);
    color: #000;

    .reader-tool__label {
      color: rgba(0, 0, 0, 0.4);
    }
  }

  :deep(.reader-slider-row__label) {
    color: rgba(0, 0, 0, 0.4);
  }

  :deep(.reader-cache-panel) {
    color: rgba(0, 0, 0, 0.4);
  }

  :deep(.reader-side-actions__left) {
    color: #121212;
  }

  :deep(.reader-side-actions__right) {
    color: #121212;
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

  :deep(.el-slider__runway) {
    background-color: #fff;
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
    border: 1px solid #444;
    color: #666;

    .reader-tool__label {
      color: #666;
    }
  }

  :deep(.reader-slider-row__label) {
    color: #666;
  }

  :deep(.reader-cache-panel) {
    color: #666;
  }

  :deep(.reader-side-actions__left) {
    color: #666;
  }

  :deep(.reader-side-actions__right) {
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
  :deep(.reader-speech-panel__play) {
    color: #185798;
  }
}

.reader-view {
  .reader-bottom-panel {
    .reader-side-actions {
      position: absolute;
      bottom: 135px;
      left: 4px;

      .reader-side-actions__left {
        position: relative;
        left: auto;
        bottom: auto;
      }

      .reader-side-actions__right {
        position: relative;
        left: auto;
        bottom: auto;
        margin-bottom: 20px;
      }
    }

  }
}

.reader-view.mini-interface {
  padding: 0;
  position: relative;
  height: 100%;

  .reader-main-toolbar {
    left: 0;
    width: 100vw;
    margin-left: 0 !important;

    .reader-tool-list {
      flex-direction: row;
      justify-content: space-around;
      .reader-tool {
        border: none;
      }
    }
  }

  .reader-bottom-panel {
    right: 0;
    width: 100vw;
    margin-right: 0 !important;

    .reader-cache-panel {
      position: relative;
      width: auto;
      right: 0;
      background: inherit;
    }

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

    .reader-tool-list {
      flex-direction: row;
      justify-content: space-around;
      padding: 0 15px;
      height: 45px;

      .reader-tool {
        border: none;
        width: auto;
        padding: 0;
        height: 45px;
        line-height: 1;
        display: flex;
        flex-direction: row;
        align-items: center;
        justify-content: center;
        gap: 4px;

        .iconfont {
          display: inline-flex;
          align-items: center;
          justify-content: center;
        }

        span {
          line-height: 1;
        }
      }
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
