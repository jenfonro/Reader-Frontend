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
          <button
            type="button"
            class="reader-topbar__text-button"
            @click="toggleBookSourcePanel"
          >
            换源
          </button>
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

    <transition name="reader-source-sheet">
      <div
        v-if="popBookSourceVisible"
        class="reader-source-sheet"
        :style="menuSheetTheme"
        @click.stop
      >
        <BookSource
          class="reader-source-sheet__content"
          :visible="popBookSourceVisible"
          @change-book-source="changeBookSource"
        />
      </div>
    </transition>

    <transition name="reader-source-sheet">
      <div
        v-if="showCacheContentZone"
        class="reader-source-sheet"
        :style="menuSheetTheme"
        @click.stop
      >
        <div class="reader-cache-panel">
          <div class="reader-cache-panel__title">缓存章节</div>
          <div class="reader-cache-panel__actions">
            <button type="button" class="reader-cache-panel__action">后面50章</button>
            <button type="button" class="reader-cache-panel__action">后面100章</button>
            <button type="button" class="reader-cache-panel__action">后面全部</button>
          </div>
        </div>
      </div>
    </transition>

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
        <button type="button" class="reader-control-text" @click="goPreviousChapterAction">
          上一章
        </button>
        <div class="reader-control-progress">
          <el-slider
            v-model="currentPage"
            :min="1"
            :max="totalPages"
            :show-tooltip="false"
            :step="1"
            @change="showPage"
          />
        </div>
        <button type="button" class="reader-control-text" @click="goNextChapterAction">
          下一章
        </button>
      </div>
      <div class="reader-control-row reader-control-row--actions" @click.stop>
        <button type="button" class="reader-bottom-action" @click="toggleCatalogPanel">
          <span class="iconfont">&#58905;</span>
          <span>目录</span>
        </button>
        <button type="button" class="reader-bottom-action">
          <el-icon :size="24">
            <VideoPlay />
          </el-icon>
          <span>自动阅读</span>
        </button>
        <button type="button" class="reader-bottom-action" @click="toggleReadSettings">
          <span class="iconfont">&#58971;</span>
          <span>设置</span>
        </button>
      </div>
    </div>
    <transition name="reader-menu-sheet">
      <div
        v-if="catalogPanelVisible"
        class="reader-menu-sheet"
        :style="menuSheetTheme"
        @click.stop
      >
        <CatalogPopup
          class="reader-menu-sheet__content"
          :visible="catalogPanelVisible"
          :catalog="catalog"
          :book="readingBook"
          :current-index="chapterIndex"
          :is-night="isNight"
          :loading="catalogLoading"
          :chinese-font="config.chineseFont"
          @get-content="getContent"
          @refresh="refreshCatalog"
        />
      </div>
    </transition>
    <transition name="reader-menu-sheet">
      <div
        v-if="readSettingsVisible"
        class="reader-menu-sheet"
        :style="menuSheetTheme"
        @click.stop
      >
        <ReadSettings
          class="reader-menu-sheet__content"
          :visible="readSettingsVisible"
          :reader-config="config"
          @update-config="updateReaderConfig"
          @open-click-area-editor="openClickAreaEditor"
        />
      </div>
    </transition>
    <div class="reader-brightness-mask" :style="brightnessMaskStyle" aria-hidden="true"></div>

    <transition name="reader-click-area-editor">
      <ClickAreaEditorOverlay
        v-if="clickAreaEditorVisible"
        :mode="config.clickAreaMode"
        :actions="config.clickAreaActions"
        @close="closeClickAreaEditor"
        @update-actions="updateClickAreaActions"
      />
    </transition>

    <ReaderIntroPanel
      v-if="bookIntroVisible"
      :book="readingBook"
      @close="bookIntroVisible = false"
      @add-bookshelf="addBookToShelf"
    />

    <div
      class="reader-page"
      :class="chapterClass"
      :style="chapterTheme"
    >
      <div class="reader-page__top">
        {{ miniInterface && !isIntroPage ? displayReaderHeaderTitle : "" }}
      </div>
      <div class="reader-page__content">
        <div v-if="loadingVisible" class="reader-page-loading" role="status" aria-live="polite">
          <span class="reader-page-loading__spinner" aria-hidden="true"></span>
          <span class="reader-page-loading__text">{{ loadingText }}</span>
        </div>
        <div
          v-else-if="show"
          ref="contentViewportRef"
          class="reader-page__content-inner"
          :class="contentViewportClass"
          @scroll="handleContentScroll"
          @wheel.passive="handleReaderWheel"
          @mousedown="handleReaderMouseDown"
        >
          <div
            v-if="isHorizontalPageTurn"
            class="reader-horizontal-stage"
            :class="horizontalStageClass"
            @touchstart="handleReaderTouchStart"
            @touchmove="handleReaderTouchMove"
            @touchend="handleReaderTouchEnd"
            @touchcancel="handleReaderTouchCancel"
          >
            <div
              v-for="page in horizontalPageWindows"
              :key="page.key"
              class="reader-page-frame"
              :class="getHorizontalPageFrameClass(page)"
              :style="getHorizontalPageFrameStyle(page)"
            >
              <ReaderIntroPage
                v-if="page.type === 'intro'"
                class="reader-readable-content reader-page__intro"
                :book="readingBook"
                :loading="introLoading"
                :style="getIntroPageStyle(page.number)"
                @add-bookshelf="addBookToShelf"
                @start-reading="startReading"
              />
              <Content
                v-else-if="page.type === 'chapter'"
                class="reader-text-flow reader-readable-content"
                :title="getHorizontalFrameTitle(page)"
                :content="getHorizontalFrameContent(page)"
                :show-content="show"
                :error="error"
                :style="[contentStyle, getHorizontalFrameContentStyle(page)]"
                :reader-config="config"
              />
              <div
                v-else-if="page.type === 'loading'"
                class="reader-page-loading reader-page-frame__loading"
                role="status"
                aria-live="polite"
              >
                <span class="reader-page-loading__spinner" aria-hidden="true"></span>
                <span class="reader-page-loading__text">正在加载正文</span>
              </div>
              <div v-else class="reader-page-frame__placeholder" aria-hidden="true"></div>
            </div>
            <div class="reader-horizontal-measure" aria-hidden="true">
              <Content
                v-for="item in chapterStreamItems"
                :key="item.key"
                class="reader-readable-content reader-horizontal-measure__content"
                :data-chapter-key="item.key"
                :title="item.title"
                :content="item.content"
                :show-content="show"
                :error="error"
                :style="contentStyle"
                :reader-config="config"
              />
            </div>
          </div>
          <div
            v-else-if="isIntroPage"
            class="reader-readable-content reader-intro-flow"
          >
            <div class="reader-intro-flow__intro-page" :style="introPageBlockStyle">
              <ReaderIntroPage
                class="reader-page__intro"
                :book="readingBook"
                :loading="introLoading"
                @add-bookshelf="addBookToShelf"
                @start-reading="startReading"
              />
            </div>
            <div
              v-if="isVerticalPageTurn"
              class="reader-intro-flow__continuation"
              :style="introContinuationStyle"
            >
              <Content
                v-if="introContinuation.content"
                class="reader-text-flow reader-intro-flow__chapter"
                :title="introContinuation.title"
                :content="introContinuation.content"
                :show-content="show"
                :error="introContinuation.error"
                :style="contentStyle"
                :reader-config="config"
              />
              <div
                v-else-if="introContinuation.loading"
                class="reader-page-loading reader-intro-flow__loading"
                role="status"
                aria-live="polite"
              >
                <span class="reader-page-loading__spinner" aria-hidden="true"></span>
                <span class="reader-page-loading__text">正在加载正文</span>
              </div>
              <div
                v-else-if="introContinuation.error"
                class="reader-page-loading reader-intro-flow__loading"
                role="status"
                aria-live="polite"
              >
                <span class="reader-page-loading__text">正文加载失败，请重试</span>
              </div>
            </div>
          </div>
          <div
            v-else-if="isVerticalPageTurn"
            class="reader-readable-content reader-chapter-flow"
          >
            <section
              v-for="item in chapterStreamItems"
              :key="item.key"
              class="reader-chapter-flow__item"
              :class="getChapterFlowItemClass(item)"
              :data-chapter-key="item.key"
            >
              <div class="reader-chapter-flow__item-content">
                <Content
                  class="reader-text-flow"
                  :title="item.title"
                  :content="item.content"
                  :show-content="show"
                  :error="error"
                  :style="contentStyle"
                  :reader-config="config"
                    />
              </div>
            </section>
          </div>
        </div>
      </div>
      <div class="reader-page__bottom"></div>
    </div>
  </div>
</template>


<script setup>
import { computed, nextTick, onBeforeUnmount, onMounted, ref, watch } from "vue";
import { ElMessage } from "element-plus/es/components/message/index.mjs";
import { ElIcon } from "element-plus/es/components/icon/index.mjs";
import { ElPopover } from "element-plus/es/components/popover/index.mjs";
import { ElSlider } from "element-plus/es/components/slider/index.mjs";
import "element-plus/es/components/icon/style/css.mjs";
import "element-plus/es/components/message/style/css.mjs";
import "element-plus/es/components/popover/style/css.mjs";
import "element-plus/es/components/slider/style/css.mjs";
import {
  Bottom,
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
  VideoPlay,
  View
} from "@element-plus/icons-vue";
import BookSource from "../components/BookSource.vue";
import CatalogPopup from "../components/CatalogPopup.vue";
import Content from "../components/Content.vue";
import ReadSettings from "../components/ReadSettings.vue";
import ClickAreaEditorOverlay from "../components/reader/ClickAreaEditorOverlay.vue";
import ReaderIntroPage from "../components/reader/ReaderIntroPage.vue";
import ReaderIntroPanel from "../components/reader/ReaderIntroPanel.vue";
import { getMiniInterface, getWindowSize } from "../utils/interface";
import { isHorizontalReadMethod, isVerticalReadMethod, normalizeReadMethod } from "../utils/readMethod";
import { getReaderTheme, previewConfig } from "../previewData";
import { convertChineseText } from "../utils/chinese";
import {
  CLICK_AREA_ACTION_MENU,
  CLICK_AREA_ACTION_NEXT,
  CLICK_AREA_ACTION_PREVIOUS,
  normalizeClickAreaActions,
  resolveClickAreaAction
} from "../utils/clickArea";
import { useReaderRuntime } from "../composables/useReaderRuntime.js";
import { addHistoryBook, addShelfBook } from "../data/bookshelf";

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
  readingBook,
  catalog,
  introContinuation,
  chapterStream,
  chapterIndex,
  isPreviewBook,
  isIntroPage,
  hasIntroPage,
  abortReaderTask,
  loadReaderBook,
  loadBookIntro,
  loadIntroContinuation,
  startReading,
  showIntroPage,
  promoteIntroContinuation,
  syncReadingProgress,
  activateChapterStreamItem,
  loadNextChapterIntoStream,
  loadPreviousChapterIntoStream,
  openChapter,
  refreshCatalog: refreshReaderCatalog
} = useReaderRuntime();

const popBookSourceVisible = ref(false);
const catalogPanelVisible = ref(false);
const readSettingsVisible = ref(false);
const readerMoreVisible = ref(false);
const clickAreaEditorVisible = ref(false);
const bookIntroVisible = ref(false);
const showToolBar = ref(false);
const show = ref(true);
const contentViewportRef = ref(null);
const currentPage = ref(1);
const totalPages = ref(1);
const pageHeight = ref(1);
const pageWidth = ref(1);
const pageMaxScrollOffset = ref(0);
const introTotalPages = ref(1);
const introPageBlockHeight = ref(0);
const chapterFlowBlockHeights = ref({});
const horizontalChapterPageCounts = ref({});
const horizontalStreamLoading = ref({ previous: false, next: false });
const pendingReaderPage = ref(0);
const pendingScrollOffset = ref(null);
const pendingChapterFlowPlacement = ref("");
const pendingChapterFlowTargetKey = ref("");
const pendingHorizontalPagePlacement = ref("");
const pendingReadMethodSwitchAnchor = ref(null);
const activeChapterKey = ref("");
const activeChapterTitle = ref("");
const activeChapterIndex = ref(0);
const pageTurnDragActive = ref(false);
const pageTurnDragOffsetX = ref(0);
const pageScrollOffset = ref(0);
const suppressNextReaderClick = ref(false);
const showCacheContentZone = ref(false);
const miniInterface = ref(getMiniInterface());
const windowSize = ref(getWindowSize());
const config = ref({
  ...previewConfig,
  clickAreaActions: normalizeClickAreaActions(previewConfig.clickAreaActions)
});
const currentThemeConfig = computed(() => getReaderTheme(config.value.theme));
const isNight = computed(() => config.value.themeType === "night");
const brightnessValue = computed(() => {
  const value = Number(config.value.brightness ?? 100);
  if (!Number.isFinite(value)) return 100;
  return Math.min(100, Math.max(0, value));
});
const brightnessMaskStyle = computed(() => ({
  opacity: Number(((100 - brightnessValue.value) / 100).toFixed(2))
}));
const bodyTheme = computed(() => ({
  background: currentThemeConfig.value.body,
  "--reader-body-background": currentThemeConfig.value.body,
  "--reader-content-background": currentThemeConfig.value.content,
  "--reader-panel-background": currentThemeConfig.value.content,
  "--reader-font-color": config.value.fontColor
}));
const effectiveReadMethod = computed(() => normalizeReadMethod(config.value.readMethod));
const pageTurnAxis = computed(() =>
  isVerticalReadMethod(effectiveReadMethod.value) ? "vertical" : "horizontal"
);
const isVerticalPageTurn = computed(() => pageTurnAxis.value === "vertical");
const isHorizontalPageTurn = computed(() => isHorizontalReadMethod(effectiveReadMethod.value));
const chapterClass = computed(() => ({
  "reader-page--page-turn": true,
  "reader-page--vertical-turn": isVerticalPageTurn.value,
  "reader-page--horizontal-turn": isHorizontalPageTurn.value,
  "reader-page--dragging": pageTurnDragActive.value
}));
const chapterTheme = computed(() => ({
  background: currentThemeConfig.value.content,
  width: readWidth.value
}));
const readWidthConfig = computed(() => {
  let width = config.value.readWidth;
  while (width > windowSize.value.width - 140) {
    width -= 20;
  }
  return width;
});
const topBarTheme = computed(() => ({
  background: "transparent",
  color: config.value.fontColor
}));
const sidePanelTheme = computed(() => ({
  color: config.value.fontColor
}));
const bottomBarTheme = computed(() => ({
  background: currentThemeConfig.value.content,
  color: config.value.fontColor
}));
const menuSheetTheme = computed(() => ({
  background: currentThemeConfig.value.content,
  color: config.value.fontColor
}));
const sideActionStyle = computed(() => ({
  background: currentThemeConfig.value.content
}));
const readWidth = computed(() => {
  if (!miniInterface.value) {
    return `${readWidthConfig.value - 130}px`;
  }
  return `${windowSize.value.width}px`;
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
const getPageTurnDuration = () => {
  const duration = Number(config.value.animateMSTime);
  return Number.isFinite(duration) ? Math.max(0, duration) : previewConfig.animateMSTime;
};

const getPageTurnTransition = () => {
  const duration = getPageTurnDuration();
  if (pageTurnDragActive.value || effectiveReadMethod.value === "无动画" || duration <= 0) return "none";
  return `transform ${duration / 1000}s cubic-bezier(0.22, 0.61, 0.36, 1)`;
};
const getPageTranslateY = page => -(page - 1) * pageHeight.value;
const getPagedContentStyle = page => ({
  transform: `translate3d(0, ${getPageTranslateY(page)}px, 0)`
});
const getIntroPageStyle = page => ({
  transform: `translate3d(0, ${getPageTranslateY(page)}px, 0)`
});
const introPageBlockStyle = computed(() => {
  if (!isVerticalPageTurn.value || !isIntroPage.value || !introPageBlockHeight.value) return undefined;
  return { minHeight: `${introPageBlockHeight.value}px` };
});
const currentChapterStreamItem = computed(() => ({
  key: `current-${chapterIndex.value}`,
  index: chapterIndex.value,
  title: title.value,
  content: chapterContent.value
}));
const chapterStreamItems = computed(() =>
  chapterStream.value.length ? chapterStream.value : [currentChapterStreamItem.value]
);
const chapterStreamItemMap = computed(() =>
  new Map(chapterStreamItems.value.map(item => [item.key, item]))
);
const readerHeaderTitle = computed(() => activeChapterTitle.value || title.value);
const displayReaderHeaderTitle = computed(() =>
  convertChineseText(readerHeaderTitle.value, config.value.chineseFont)
);
const introContinuationStyle = computed(() => ({
  minHeight: `${pageHeight.value}px`
}));
const getChapterFlowItemClass = item => ({
  "reader-chapter-flow__item--current": item.key === activeChapterKey.value
});

const getChapterFlowOffsetByKey = (targetKey, align = "start") => {
  let offset = 0;
  for (const item of chapterStreamItems.value) {
    const itemHeight = chapterFlowBlockHeights.value[item.key] || pageHeight.value;
    if (item.key === targetKey) {
      return align === "end" ? Math.max(0, offset + itemHeight - pageHeight.value) : offset;
    }
    offset += itemHeight;
  }
  return align === "end" ? Math.max(0, offset - pageHeight.value) : offset;
};

const getActiveChapterStreamItemByOffset = offset => {
  const focusOffset = offset + pageHeight.value * 0.45;
  let itemOffset = 0;
  for (const item of chapterStreamItems.value) {
    const itemHeight = chapterFlowBlockHeights.value[item.key] || pageHeight.value;
    if (focusOffset < itemOffset + itemHeight) return item;
    itemOffset += itemHeight;
  }
  return chapterStreamItems.value[chapterStreamItems.value.length - 1] || null;
};

const getActiveChapterStreamItem = offset => {
  if (!isVerticalPageTurn.value || isIntroPage.value) return null;
  return getActiveChapterStreamItemByOffset(offset);
};

const syncActiveChapterItem = activeItem => {
  if (!activeItem) return;

  const activeTitle = activeItem.title || "";
  if (
    activeItem.key === activeChapterKey.value &&
    activeTitle === activeChapterTitle.value &&
    activeItem.index === activeChapterIndex.value
  ) {
    return;
  }

  activeChapterKey.value = activeItem.key;
  activeChapterTitle.value = activeTitle;
  activeChapterIndex.value = activeItem.index;
  syncReadingProgress(activeItem);
};

const syncActiveChapterByScrollOffset = offset => {
  syncActiveChapterItem(getActiveChapterStreamItem(offset));
};
const contentViewportClass = computed(() => ({
  "reader-page__content-inner--paged": !isVerticalPageTurn.value,
  "reader-page__content-inner--scroll": isVerticalPageTurn.value
}));
const horizontalTurnMode = computed(() => {
  if (effectiveReadMethod.value === "覆盖") return "cover";
  return "slide";
});
const horizontalTurnDirection = computed(() => {
  if (pageTurnDragOffsetX.value < 0) return "next";
  if (pageTurnDragOffsetX.value > 0) return "previous";
  return "";
});
const horizontalTurnProgress = computed(() => {
  const width = Math.max(1, pageWidth.value);
  return Math.min(1, Math.abs(pageTurnDragOffsetX.value) / width);
});
const horizontalTurnActive = computed(() => horizontalTurnProgress.value > 0.001);
const horizontalMovingFrameRole = computed(() => {
  if (!horizontalTurnDirection.value) return "current";
  if (horizontalTurnMode.value === "slide") return "current";
  return horizontalTurnDirection.value === "next" ? "current" : "previous";
});
const horizontalStageClass = computed(() => ({
  [`reader-horizontal-stage--${horizontalTurnMode.value}`]: true,
  [`reader-horizontal-stage--${horizontalTurnDirection.value}`]: Boolean(horizontalTurnDirection.value),
  "reader-horizontal-stage--turning": horizontalTurnActive.value
}));
const getRuntimeChapterKey = chapter =>
  String(chapter?.chapterUrl || chapter?.url || (chapter?.index ?? chapter?.title ?? chapter?.name ?? ""));
const createReaderPageFrame = ({ role, type = "empty", number = 0, item = null, direction = "" }) => ({
  key: `${role}-${type}-${item?.key || direction || "intro"}-${number || "none"}`,
  role,
  type,
  number,
  item,
  direction
});

const hasPreviousChapter = computed(() => Boolean(catalog.value[chapterIndex.value - 1]));
const hasNextChapter = computed(() => Boolean(catalog.value[chapterIndex.value + 1]));
const canShowIntroBeforeChapter = computed(
  () => hasIntroPage.value && !isIntroPage.value && chapterIndex.value === 0 && currentPage.value === 1
);
const getCurrentHorizontalChapterItem = () => {
  const activeItem = chapterStreamItemMap.value.get(activeChapterKey.value);
  if (activeItem) return activeItem;

  const indexedItem = chapterStreamItems.value.find(item => item.index === chapterIndex.value);
  return indexedItem || chapterStreamItems.value[0] || currentChapterStreamItem.value;
};
const getHorizontalChapterItemIndex = item => {
  if (!item) return -1;
  return chapterStreamItems.value.findIndex(chapterItem => chapterItem.key === item.key);
};
const getHorizontalSiblingChapterItem = direction => {
  const currentItem = getCurrentHorizontalChapterItem();
  const currentIndex = getHorizontalChapterItemIndex(currentItem);
  if (currentIndex < 0) return null;
  return chapterStreamItems.value[currentIndex + (direction === "previous" ? -1 : 1)] || null;
};
const getHorizontalChapterPageCount = item => {
  const measuredCount = Number(horizontalChapterPageCounts.value[item?.key]);
  if (Number.isFinite(measuredCount) && measuredCount > 0) return Math.trunc(measuredCount);
  if (!isIntroPage.value && item?.key === getCurrentHorizontalChapterItem()?.key) {
    return Math.max(1, totalPages.value);
  }
  return 1;
};
const getCurrentHorizontalPageTotal = () =>
  isIntroPage.value ? introTotalPages.value : getHorizontalChapterPageCount(getCurrentHorizontalChapterItem());

const clampProgressRatio = value => {
  const parsedValue = Number(value);
  if (!Number.isFinite(parsedValue)) return 0;
  return Math.min(1, Math.max(0, parsedValue));
};

const getPageRatio = (page, pageTotal) => {
  const total = Math.max(1, Number(pageTotal) || 1);
  if (total <= 1) return 0;
  return clampProgressRatio((Math.max(1, Number(page) || 1) - 1) / (total - 1));
};

const getPageByRatio = (ratio, pageTotal) => {
  const total = Math.max(1, Number(pageTotal) || 1);
  if (total <= 1) return 1;
  return Math.min(total, Math.max(1, Math.round(clampProgressRatio(ratio) * (total - 1)) + 1));
};

const findChapterStreamItemByAnchor = anchor => {
  if (!anchor) return null;
  return chapterStreamItems.value.find(item => item.key === anchor.key) ||
    chapterStreamItems.value.find(item => Number(item.index) === Number(anchor.index)) ||
    null;
};

const getChapterFlowOffsetByHeightMap = (targetKey, heightMap = {}, fallbackHeight = pageHeight.value) => {
  let offset = 0;
  for (const item of chapterStreamItems.value) {
    if (item.key === targetKey) return offset;
    offset += Math.max(1, heightMap[item.key] || fallbackHeight || 1);
  }
  return offset;
};

const captureReadMethodSwitchAnchor = () => {
  if (loadingVisible.value || !show.value) return null;

  if (isIntroPage.value) {
    if (isVerticalPageTurn.value) {
      const maxIntroOffset = Math.max(0, introPageBlockHeight.value - pageHeight.value);
      return {
        type: "intro",
        ratio: maxIntroOffset ? clampProgressRatio(pageScrollOffset.value / maxIntroOffset) : 0
      };
    }

    return {
      type: "intro",
      ratio: getPageRatio(currentPage.value, introTotalPages.value)
    };
  }

  const activeItem = isVerticalPageTurn.value
    ? getActiveChapterStreamItem(pageScrollOffset.value) || chapterStreamItemMap.value.get(activeChapterKey.value)
    : getCurrentHorizontalChapterItem();
  if (!activeItem) return null;

  if (isVerticalPageTurn.value) {
    const itemOffset = getChapterFlowOffsetByKey(activeItem.key, "start");
    const itemHeight = Math.max(1, chapterFlowBlockHeights.value[activeItem.key] || pageHeight.value);
    const maxItemOffset = Math.max(0, itemHeight - pageHeight.value);
    const localOffset = Math.max(0, pageScrollOffset.value - itemOffset);
    return {
      type: "chapter",
      key: activeItem.key,
      index: activeItem.index,
      ratio: maxItemOffset ? clampProgressRatio(localOffset / maxItemOffset) : 0
    };
  }

  return {
    type: "chapter",
    key: activeItem.key,
    index: activeItem.index,
    ratio: getPageRatio(currentPage.value, getCurrentHorizontalPageTotal())
  };
};

const applyReadMethodSwitchAnchor = (anchor, { viewportHeight, chapterFlowHeights, measuredHorizontalPageCounts }) => {
  if (!anchor) return false;

  if (isVerticalPageTurn.value) {
    if (anchor.type === "intro") {
      if (!isIntroPage.value) return false;
      const maxIntroOffset = Math.max(0, introPageBlockHeight.value - viewportHeight);
      setPageScrollOffset(Math.round(maxIntroOffset * clampProgressRatio(anchor.ratio)));
      return true;
    }

    const targetItem = findChapterStreamItemByAnchor(anchor);
    if (!targetItem) return false;

    const heightMap = chapterFlowHeights && Object.keys(chapterFlowHeights).length
      ? chapterFlowHeights
      : chapterFlowBlockHeights.value;
    const itemOffset = getChapterFlowOffsetByHeightMap(targetItem.key, heightMap, viewportHeight);
    const itemHeight = Math.max(1, heightMap[targetItem.key] || viewportHeight);
    const maxItemOffset = Math.max(0, itemHeight - viewportHeight);
    syncActiveChapterItem(targetItem);
    setPageScrollOffset(itemOffset + Math.round(maxItemOffset * clampProgressRatio(anchor.ratio)));
    return true;
  }

  if (isHorizontalPageTurn.value) {
    if (anchor.type === "intro") {
      if (!isIntroPage.value) return false;
      setReaderPage(getPageByRatio(anchor.ratio, introTotalPages.value));
      return true;
    }

    const targetItem = findChapterStreamItemByAnchor(anchor);
    if (!targetItem) return false;

    syncActiveChapterItem(targetItem);
    const pageTotal = Math.max(1, measuredHorizontalPageCounts[targetItem.key] || getHorizontalChapterPageCount(targetItem));
    totalPages.value = pageTotal;
    setReaderPage(getPageByRatio(anchor.ratio, pageTotal));
    return true;
  }

  return false;
};

const createIntroContinuationItem = () => {
  const continuation = introContinuation.value;
  if (!continuation.chapter || !continuation.content) return null;

  const index = Number(continuation.chapter.index);
  return {
    key: getRuntimeChapterKey(continuation.chapter) || `chapter-${Number.isFinite(index) ? index : 0}`,
    index: Number.isFinite(index) ? Math.max(0, Math.trunc(index)) : 0,
    title: continuation.title || continuation.chapter.title || continuation.chapter.name || "",
    content: continuation.content,
    chapter: continuation.chapter
  };
};
const hasHorizontalLoadingFrame = direction => {
  if (horizontalStreamLoading.value[direction]) return true;
  if (isIntroPage.value && direction === "next") return true;
  return hasAdjacentStreamChapter(direction);
};
const canTurnToPreviousReaderPage = computed(() => {
  if (isIntroPage.value) return currentPage.value > 1;
  return currentPage.value > 1 || hasPreviousChapter.value || canShowIntroBeforeChapter.value;
});
const canTurnToNextReaderPage = computed(() => {
  if (isIntroPage.value) return true;
  return currentPage.value < getCurrentHorizontalPageTotal() || hasNextChapter.value;
});

const getPreviousHorizontalPageFrame = () => {
  if (isIntroPage.value) {
    if (currentPage.value > 1) {
      return createReaderPageFrame({ role: "previous", type: "intro", number: currentPage.value - 1 });
    }
    return createReaderPageFrame({ role: "previous" });
  }

  const currentItem = getCurrentHorizontalChapterItem();
  if (currentPage.value > 1) {
    return createReaderPageFrame({ role: "previous", type: "chapter", number: currentPage.value - 1, item: currentItem });
  }

  const previousItem = getHorizontalSiblingChapterItem("previous");
  if (previousItem) {
    return createReaderPageFrame({
      role: "previous",
      type: "chapter",
      number: getHorizontalChapterPageCount(previousItem),
      item: previousItem
    });
  }

  if (canShowIntroBeforeChapter.value) {
    return createReaderPageFrame({ role: "previous", type: "intro", number: introTotalPages.value });
  }

  if (hasHorizontalLoadingFrame("previous")) {
    return createReaderPageFrame({ role: "previous", type: "loading", direction: "previous" });
  }

  return createReaderPageFrame({ role: "previous" });
};

const getCurrentHorizontalPageFrame = () => {
  if (isIntroPage.value) {
    return createReaderPageFrame({ role: "current", type: "intro", number: currentPage.value });
  }
  return createReaderPageFrame({
    role: "current",
    type: "chapter",
    number: currentPage.value,
    item: getCurrentHorizontalChapterItem()
  });
};

const getNextHorizontalPageFrame = () => {
  if (isIntroPage.value) {
    if (currentPage.value < introTotalPages.value) {
      return createReaderPageFrame({ role: "next", type: "intro", number: currentPage.value + 1 });
    }

    const continuationItem = createIntroContinuationItem();
    if (continuationItem) {
      return createReaderPageFrame({ role: "next", type: "chapter", number: 1, item: continuationItem });
    }

    return createReaderPageFrame({ role: "next", type: "loading", direction: "next" });
  }

  const currentItem = getCurrentHorizontalChapterItem();
  const currentPageTotal = getHorizontalChapterPageCount(currentItem);
  if (currentPage.value < currentPageTotal) {
    return createReaderPageFrame({ role: "next", type: "chapter", number: currentPage.value + 1, item: currentItem });
  }

  const nextItem = getHorizontalSiblingChapterItem("next");
  if (nextItem) {
    return createReaderPageFrame({ role: "next", type: "chapter", number: 1, item: nextItem });
  }

  if (hasHorizontalLoadingFrame("next")) {
    return createReaderPageFrame({ role: "next", type: "loading", direction: "next" });
  }

  return createReaderPageFrame({ role: "next" });
};

const horizontalPageWindows = computed(() => [
  getPreviousHorizontalPageFrame(),
  getCurrentHorizontalPageFrame(),
  getNextHorizontalPageFrame()
]);
const horizontalFrameState = computed(() => {
  const width = Math.max(1, pageWidth.value);
  const offset = pageTurnDragOffsetX.value;
  const progress = horizontalTurnProgress.value;
  const transition = getPageTurnTransition();
  const mode = horizontalTurnMode.value;

  const state = {
    previous: { transform: `translate3d(${-width}px, 0, 0)`, opacity: 0, zIndex: 1 },
    current: { transform: "translate3d(0, 0, 0)", opacity: 1, zIndex: 3 },
    next: { transform: `translate3d(${width}px, 0, 0)`, opacity: 0, zIndex: 1 }
  };

  if (mode === "slide") {
    state.previous = { transform: `translate3d(${-width + offset}px, 0, 0)`, opacity: 1, zIndex: 2 };
    state.current = { transform: `translate3d(${offset}px, 0, 0)`, opacity: 1, zIndex: 3 };
    state.next = { transform: `translate3d(${width + offset}px, 0, 0)`, opacity: 1, zIndex: 2 };
  } else if (mode === "cover" && offset < 0) {
    state.current = { transform: `translate3d(${offset}px, 0, 0)`, opacity: 1, zIndex: 3 };
    state.next = { transform: "translate3d(0, 0, 0)", opacity: 1, zIndex: 2 };
  } else if (mode === "cover" && offset > 0) {
    state.previous = { transform: `translate3d(${-width + offset}px, 0, 0)`, opacity: 1, zIndex: 3 };
    state.current = { transform: "translate3d(0, 0, 0)", opacity: 1, zIndex: 2 };
  }

  return Object.fromEntries(
    Object.entries(state).map(([role, value]) => [
      role,
      {
        ...value,
        transition,
        "--reader-turn-progress": progress
      }
    ])
  );
});
const getHorizontalPageFrameStyle = page => horizontalFrameState.value[page.role];
const getHorizontalPageFrameClass = page => ({
  [`reader-page-frame--${page.role}`]: true,
  [`reader-page-frame--${page.type}`]: true,
  "reader-page-frame--active": horizontalTurnActive.value && page.role === horizontalMovingFrameRole.value
});
const getHorizontalFrameTitle = page => page.item?.title || title.value;
const getHorizontalFrameContent = page => page.item?.content || chapterContent.value;
const getHorizontalFrameContentStyle = page => getPagedContentStyle(page.number || 1);

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

const toggleBookSourcePanel = () => {
  const nextVisible = !popBookSourceVisible.value;
  catalogPanelVisible.value = false;
  readSettingsVisible.value = false;
  readerMoreVisible.value = false;
  showCacheContentZone.value = false;
  popBookSourceVisible.value = nextVisible;
};

const toggleCacheContent = () => {
  popBookSourceVisible.value = false;
  readerMoreVisible.value = false;
  showCacheContentZone.value = !showCacheContentZone.value;
};

const toggleCatalogPanel = () => {
  const nextVisible = !catalogPanelVisible.value;
  popBookSourceVisible.value = false;
  readSettingsVisible.value = false;
  readerMoreVisible.value = false;
  showCacheContentZone.value = false;
  catalogPanelVisible.value = nextVisible;
};

const toggleReadSettings = () => {
  const nextVisible = !readSettingsVisible.value;
  popBookSourceVisible.value = false;
  catalogPanelVisible.value = false;
  readerMoreVisible.value = false;
  showCacheContentZone.value = false;
  readSettingsVisible.value = nextVisible;
};

const openBookIntro = () => {
  bookIntroVisible.value = true;
  showToolBar.value = true;
  loadBookIntro();
};

const addBookToShelf = () => {
  const savedBooks = addShelfBook(readingBook.value);
  bookIntroVisible.value = false;
  ElMessage.success(savedBooks.length ? "已加入书架" : "加入书架失败");
};

const clampReaderPage = value => {
  const parsedValue = Number(value);
  const nextValue = Number.isFinite(parsedValue) ? Math.trunc(parsedValue) : 1;
  return Math.min(totalPages.value, Math.max(1, nextValue));
};

const getMaxPageScrollOffset = () => pageMaxScrollOffset.value;

const clampPageScrollOffset = value => {
  const parsedValue = Number(value);
  const nextValue = Number.isFinite(parsedValue) ? parsedValue : 0;
  return Math.min(getMaxPageScrollOffset(), Math.max(0, nextValue));
};

const getPageByScrollOffset = value => {
  const page = Math.floor(clampPageScrollOffset(value) / Math.max(1, pageHeight.value)) + 1;
  return Math.min(totalPages.value, Math.max(1, page));
};

const syncReaderPageByScrollOffset = () => {
  const nextPage = getPageByScrollOffset(pageScrollOffset.value);
  currentPage.value = nextPage;
};

const syncContentScrollTop = () => {
  if (!isVerticalPageTurn.value) return;
  const viewportElement = contentViewportRef.value;
  if (!viewportElement) return;
  if (Math.abs(viewportElement.scrollTop - pageScrollOffset.value) > 1) {
    viewportElement.scrollTop = pageScrollOffset.value;
  }
};

const getIntroContinuationRevealOffset = () =>
  Math.max(0, introPageBlockHeight.value - pageHeight.value - 1);

const shouldPreloadIntroContinuation = () =>
  isVerticalPageTurn.value &&
  isIntroPage.value &&
  pageScrollOffset.value > 1;

const shouldRevealIntroContinuation = () =>
  shouldPreloadIntroContinuation() &&
  pageScrollOffset.value >= getIntroContinuationRevealOffset();

const setPageScrollOffset = (value, { syncDom = true } = {}) => {
  if (syncDom) cancelPendingContentScroll();
  pageScrollOffset.value = clampPageScrollOffset(value);
  syncReaderPageByScrollOffset();
  syncActiveChapterByScrollOffset(pageScrollOffset.value);
  if (syncDom) syncContentScrollTop();
  if (shouldPreloadIntroContinuation()) preloadIntroContinuation();
  if (shouldRevealIntroContinuation()) revealIntroContinuation();
  ensureVerticalStreamAroundViewport();
};

const setReaderPage = value => {
  const nextPage = clampReaderPage(value);
  currentPage.value = nextPage;
  pageScrollOffset.value = clampPageScrollOffset((nextPage - 1) * pageHeight.value);
  ensureHorizontalStreamAroundPage();
};

const resetReaderPage = () => {
  currentPage.value = 1;
  pageScrollOffset.value = 0;
};

const arePageCountMapsEqual = (left, right) => {
  const leftKeys = Object.keys(left);
  const rightKeys = Object.keys(right);
  if (leftKeys.length !== rightKeys.length) return false;
  return leftKeys.every(key => left[key] === right[key]);
};

const measureHorizontalChapterPageCounts = (viewportElement, viewportHeight) => {
  if (!isHorizontalPageTurn.value) return horizontalChapterPageCounts.value;

  const measuredCounts = {};
  const measureElements = Array.from(
    viewportElement.querySelectorAll?.(".reader-horizontal-measure__content") || []
  );

  measureElements.forEach(element => {
    const itemKey = element.dataset.chapterKey;
    if (!itemKey) return;

    const contentHeight = Math.max(viewportHeight, element.scrollHeight || viewportHeight);
    measuredCounts[itemKey] = Math.max(1, Math.ceil(contentHeight / viewportHeight));
  });

  if (Object.keys(measuredCounts).length && !arePageCountMapsEqual(horizontalChapterPageCounts.value, measuredCounts)) {
    horizontalChapterPageCounts.value = measuredCounts;
  }

  return Object.keys(measuredCounts).length ? measuredCounts : horizontalChapterPageCounts.value;
};

let paginationFrame = 0;
let paginationTimer = 0;

const updateReaderPagination = async ({ keepPage = true } = {}) => {
  await nextTick();
  const viewportElement = contentViewportRef.value;
  const contentElement =
    viewportElement?.querySelector(".reader-page-frame--current .reader-readable-content") ||
    viewportElement?.querySelector(".reader-readable-content");
  if (!viewportElement || !contentElement || loadingVisible.value || !show.value) {
    pageHeight.value = 1;
    pageWidth.value = 1;
    pageMaxScrollOffset.value = 0;
    totalPages.value = 1;
    resetReaderPage();
    return;
  }

  const viewportHeight = Math.max(1, viewportElement.clientHeight);
  const introElement = isIntroPage.value
    ? contentElement.querySelector?.(".reader-page__intro") ||
      (contentElement.classList?.contains("reader-page__intro") ? contentElement : null)
    : null;
  const continuationElement = isIntroPage.value
    ? contentElement.querySelector?.(".reader-intro-flow__continuation")
    : null;
  const chapterFlowElements =
    !isIntroPage.value && isVerticalPageTurn.value
      ? Array.from(contentElement.querySelectorAll?.(".reader-chapter-flow__item") || [])
      : [];
  const chapterFlowHeights = {};
  const chapterFlowOrder = [];
  const chapterFlowHeight = chapterFlowElements.reduce((sum, itemElement) => {
    const itemContent = itemElement.querySelector(".reader-chapter-flow__item-content");
    const itemKey = itemElement.dataset.chapterKey;
    const contentBlockHeight = Math.max(
      viewportHeight,
      itemContent?.scrollHeight || itemElement.scrollHeight || viewportHeight
    );
    chapterFlowOrder.push(itemKey);
    chapterFlowHeights[itemKey] = contentBlockHeight;
    return sum + contentBlockHeight;
  }, 0);
  const getChapterFlowAlignedOffset = (targetKey, align) => {
    let offset = 0;
    for (const itemKey of chapterFlowOrder) {
      const itemHeight = chapterFlowHeights[itemKey] || viewportHeight;
      if (itemKey === targetKey) {
        return align === "end" ? Math.max(0, offset + itemHeight - viewportHeight) : offset;
      }
      offset += itemHeight;
    }
    return align === "end" ? Math.max(0, offset - viewportHeight) : offset;
  };
  const getChapterFlowEndOffset = targetKey => {
    let offset = 0;
    for (const itemKey of chapterFlowOrder) {
      const itemHeight = chapterFlowHeights[itemKey] || viewportHeight;
      if (itemKey === targetKey) return offset + itemHeight;
      offset += itemHeight;
    }
    return offset;
  };
  const introContentHeight = Math.max(viewportHeight, introElement?.scrollHeight || viewportHeight);
  const nextIntroTotalPages = Math.max(1, Math.ceil(introContentHeight / viewportHeight));
  const nextIntroBlockHeight = nextIntroTotalPages * viewportHeight;
  const continuationHeight = isIntroPage.value && isVerticalPageTurn.value
    ? Math.max(viewportHeight, continuationElement?.scrollHeight || 0)
    : continuationElement?.scrollHeight || 0;
  const measuredHorizontalPageCounts = measureHorizontalChapterPageCounts(viewportElement, viewportHeight);
  const currentHorizontalItem = !isIntroPage.value && isHorizontalPageTurn.value
    ? getCurrentHorizontalChapterItem()
    : null;
  const currentHorizontalContentHeight = Math.max(viewportHeight, contentElement.scrollHeight || viewportHeight);
  const currentHorizontalPages = currentHorizontalItem
    ? Math.max(
      1,
      measuredHorizontalPageCounts[currentHorizontalItem.key] ||
        Math.ceil(currentHorizontalContentHeight / viewportHeight)
    )
    : 1;
  const contentHeight = currentHorizontalItem
    ? currentHorizontalPages * viewportHeight
    : chapterFlowElements.length
      ? Math.max(viewportHeight, chapterFlowHeight)
      : isIntroPage.value && isVerticalPageTurn.value
        ? Math.max(viewportHeight, nextIntroBlockHeight + continuationHeight)
        : Math.max(viewportHeight, contentElement.scrollHeight);
  const nextTotalPages = currentHorizontalItem
    ? currentHorizontalPages
    : Math.max(1, Math.ceil(contentHeight / viewportHeight));
  pageHeight.value = viewportHeight;
  pageWidth.value = Math.max(1, viewportElement.clientWidth);
  pageMaxScrollOffset.value = Math.max(0, contentHeight - viewportHeight);
  totalPages.value = nextTotalPages;
  if (chapterFlowElements.length) chapterFlowBlockHeights.value = chapterFlowHeights;
  if (isIntroPage.value) {
    introTotalPages.value = nextIntroTotalPages;
    introPageBlockHeight.value = nextIntroBlockHeight;
  }
  const pendingPage = pendingReaderPage.value;
  const nextPendingScrollOffset = pendingScrollOffset.value;
  const nextPendingChapterFlowPlacement = pendingChapterFlowPlacement.value;
  const nextPendingChapterFlowTargetKey = pendingChapterFlowTargetKey.value;
  const nextPendingHorizontalPagePlacement = pendingHorizontalPagePlacement.value;
  const nextPendingReadMethodSwitchAnchor = pendingReadMethodSwitchAnchor.value;
  pendingReaderPage.value = 0;
  pendingScrollOffset.value = null;
  pendingChapterFlowPlacement.value = "";
  pendingChapterFlowTargetKey.value = "";
  pendingHorizontalPagePlacement.value = "";
  pendingReadMethodSwitchAnchor.value = null;
  if (currentHorizontalItem) syncActiveChapterItem(currentHorizontalItem);
  if (nextPendingReadMethodSwitchAnchor && applyReadMethodSwitchAnchor(nextPendingReadMethodSwitchAnchor, {
    viewportHeight,
    chapterFlowHeights,
    measuredHorizontalPageCounts
  })) return;
  if (isVerticalPageTurn.value) {
    if (nextPendingChapterFlowPlacement === "previous-preserve" && chapterFlowElements.length) {
      const preservedOffset = Number.isFinite(nextPendingScrollOffset) ? nextPendingScrollOffset : 0;
      setPageScrollOffset(getChapterFlowEndOffset(nextPendingChapterFlowTargetKey) + preservedOffset);
      return;
    }
    if (nextPendingChapterFlowPlacement === "previous-end" && chapterFlowElements.length) {
      setPageScrollOffset(getChapterFlowAlignedOffset(nextPendingChapterFlowTargetKey, "end"));
      return;
    }
    if (nextPendingChapterFlowPlacement === "previous-start" && chapterFlowElements.length) {
      setPageScrollOffset(getChapterFlowAlignedOffset(nextPendingChapterFlowTargetKey, "start"));
      return;
    }
    if (nextPendingChapterFlowPlacement === "next-start" && chapterFlowElements.length) {
      setPageScrollOffset(getChapterFlowAlignedOffset(nextPendingChapterFlowTargetKey, "start"));
      return;
    }
    if (Number.isFinite(nextPendingScrollOffset)) {
      setPageScrollOffset(nextPendingScrollOffset);
      return;
    }
    setPageScrollOffset(pendingPage ? (pendingPage - 1) * viewportHeight : keepPage ? pageScrollOffset.value : 0);
    return;
  }
  if (nextPendingHorizontalPagePlacement === "first") {
    setReaderPage(1);
    return;
  }
  if (nextPendingHorizontalPagePlacement === "last") {
    setReaderPage(totalPages.value);
    return;
  }
  setReaderPage(pendingPage || (keepPage ? currentPage.value : 1));
};

const scheduleReaderPagination = ({ keepPage = true } = {}) => {
  if (paginationFrame) cancelAnimationFrame(paginationFrame);
  if (paginationTimer) clearTimeout(paginationTimer);
  paginationFrame = requestAnimationFrame(() => {
    paginationFrame = 0;
    updateReaderPagination({ keepPage });
    paginationTimer = window.setTimeout(() => updateReaderPagination({ keepPage: true }), 120);
  });
};

const canLoadIntroContinuation = ({ retryError = false } = {}) => {
  if (!isVerticalPageTurn.value || !isIntroPage.value) return false;
  if (introContinuation.value.content || introContinuation.value.loading) return false;
  if (introContinuation.value.loaded && !introContinuation.value.error) return false;
  if (introContinuation.value.error && !retryError) return false;
  return true;
};

const preloadIntroContinuation = () => {
  if (!canLoadIntroContinuation()) return false;

  loadIntroContinuation();
  return true;
};

const revealIntroContinuation = () => {
  if (!isVerticalPageTurn.value || !isIntroPage.value) return false;
  if (introContinuation.value.content) return false;
  if (introContinuation.value.loading) return true;
  if (!canLoadIntroContinuation({ retryError: true })) return false;

  loadIntroContinuation();
  scheduleReaderPagination({ keepPage: true });
  return true;
};

const getVerticalStreamPreloadDistance = () => Math.max(pageHeight.value * 1.5, 480);

const loadVerticalStreamChapter = async direction => {
  const preservedOffset = pageScrollOffset.value;
  const item = direction === "previous"
    ? await loadPreviousChapterIntoStream()
    : await loadNextChapterIntoStream();

  if (!item) return false;
  if (direction === "previous") {
    pendingScrollOffset.value = preservedOffset;
    pendingChapterFlowPlacement.value = "previous-preserve";
    pendingChapterFlowTargetKey.value = item.key;
  }
  scheduleReaderPagination({ keepPage: true });
  return item;
};

function ensureVerticalStreamAroundViewport({ forceNext = false, forcePrevious = false } = {}) {
  if (!isVerticalPageTurn.value || isIntroPage.value || loadingVisible.value || !show.value) return;

  const preloadDistance = getVerticalStreamPreloadDistance();
  const maxOffset = getMaxPageScrollOffset();
  if (forcePrevious || pageScrollOffset.value <= preloadDistance) {
    loadVerticalStreamChapter("previous");
  }
  if (forceNext || maxOffset - pageScrollOffset.value <= preloadDistance) {
    loadVerticalStreamChapter("next");
  }
}

const showPage = value => {
  setReaderPage(value || currentPage.value);
};

const getActiveChapterFlowIndex = () => {
  const activeKey = activeChapterKey.value;
  const index = chapterStreamItems.value.findIndex(item => item.key === activeKey);
  return index >= 0 ? index : 0;
};

const getChapterStreamBoundaryIndex = direction => {
  const indexes = chapterStreamItems.value.map(item => Number(item.index)).filter(Number.isFinite);
  if (!indexes.length) return chapterIndex.value;
  return direction === "previous" ? Math.min(...indexes) : Math.max(...indexes);
};

const hasAdjacentStreamChapter = direction => {
  const boundaryIndex = getChapterStreamBoundaryIndex(direction);
  const chapterOffset = direction === "previous" ? -1 : 1;
  return Boolean(catalog.value[boundaryIndex + chapterOffset]);
};

const setHorizontalStreamLoading = (direction, value) => {
  horizontalStreamLoading.value = {
    ...horizontalStreamLoading.value,
    [direction]: value
  };
};

const loadHorizontalStreamChapter = async direction => {
  if (!isHorizontalPageTurn.value || isIntroPage.value) return false;
  if (!hasAdjacentStreamChapter(direction)) return false;

  setHorizontalStreamLoading(direction, true);
  try {
    const item = direction === "previous"
      ? await loadPreviousChapterIntoStream()
      : await loadNextChapterIntoStream();
    if (item) scheduleReaderPagination({ keepPage: true });
    return item;
  } finally {
    setHorizontalStreamLoading(direction, false);
  }
};

const loadHorizontalIntroContinuation = async () => {
  if (!isHorizontalPageTurn.value || !isIntroPage.value) return false;
  if (introContinuation.value.content) return introContinuation.value;

  setHorizontalStreamLoading("next", true);
  try {
    const continuation = await loadIntroContinuation();
    scheduleReaderPagination({ keepPage: true });
    return continuation;
  } finally {
    setHorizontalStreamLoading("next", false);
  }
};

const ensureHorizontalStreamAroundPage = ({ forceNext = false, forcePrevious = false } = {}) => {
  if (!isHorizontalPageTurn.value || loadingVisible.value || !show.value) return;

  if (isIntroPage.value) {
    if (forceNext) loadHorizontalIntroContinuation();
    return;
  }

  const currentPageTotal = getCurrentHorizontalPageTotal();
  if (forcePrevious || currentPage.value <= 2) loadHorizontalStreamChapter("previous");
  if (forceNext || currentPage.value >= currentPageTotal - 1) loadHorizontalStreamChapter("next");
};

const setHorizontalActiveChapterItem = (item, placement = "first") => {
  if (!item) return false;

  pendingHorizontalPagePlacement.value = placement;
  if (!activateChapterStreamItem(item)) {
    pendingHorizontalPagePlacement.value = "";
    return false;
  }

  syncActiveChapterItem(item);
  scheduleReaderPagination({ keepPage: true });
  return true;
};

const showIntroLastPage = () => {
  pendingReaderPage.value = introTotalPages.value;
  showIntroPage();
  scheduleReaderPagination({ keepPage: true });
};

const scrollToChapterFlowItem = (item, align = "start") => {
  if (!item) return false;
  setPageScrollOffset(getChapterFlowOffsetByKey(item.key, align));
  return true;
};

const goNextChapterAction = async () => {
  if (isHorizontalPageTurn.value) {
    if (isIntroPage.value) {
      await goNextHorizontalPage();
      return;
    }

    const nextItem = getHorizontalSiblingChapterItem("next") || await loadHorizontalStreamChapter("next");
    if (nextItem) setHorizontalActiveChapterItem(nextItem, "first");
    return;
  }

  if (!isVerticalPageTurn.value) return;
  if (isIntroPage.value) {
    goNextPage();
    return;
  }

  const nextItem = chapterStreamItems.value[getActiveChapterFlowIndex() + 1];
  if (scrollToChapterFlowItem(nextItem, "start")) return;

  const appended = await loadNextChapterIntoStream();
  if (appended) {
    pendingChapterFlowPlacement.value = "next-start";
    pendingChapterFlowTargetKey.value = appended.key;
    scheduleReaderPagination({ keepPage: true });
    return;
  }
  if (hasAdjacentStreamChapter("next")) return;
};

const goPreviousChapterAction = async () => {
  if (isHorizontalPageTurn.value) {
    if (isIntroPage.value) return;

    const previousItem = getHorizontalSiblingChapterItem("previous") || await loadHorizontalStreamChapter("previous");
    if (previousItem) {
      setHorizontalActiveChapterItem(previousItem, "last");
      return;
    }
    if (canShowIntroBeforeChapter.value) showIntroLastPage();
    return;
  }

  if (!isVerticalPageTurn.value) return;
  if (isIntroPage.value) return;

  const previousItem = chapterStreamItems.value[getActiveChapterFlowIndex() - 1];
  if (scrollToChapterFlowItem(previousItem, "start")) return;

  const prepended = await loadPreviousChapterIntoStream();
  if (prepended) {
    pendingChapterFlowPlacement.value = "previous-start";
    pendingChapterFlowTargetKey.value = prepended.key;
    scheduleReaderPagination({ keepPage: true });
    return;
  }
  if (hasAdjacentStreamChapter("previous")) return;
};

const goNextHorizontalPage = async () => {
  if (isIntroPage.value) {
    if (currentPage.value < introTotalPages.value) {
      setReaderPage(currentPage.value + 1);
      return;
    }

    if (!introContinuation.value.content) await loadHorizontalIntroContinuation();
    if (promoteIntroContinuation()) {
      pendingHorizontalPagePlacement.value = "first";
      loadHorizontalStreamChapter("next");
      scheduleReaderPagination({ keepPage: true });
    }
    return;
  }

  const currentPageTotal = getCurrentHorizontalPageTotal();
  if (currentPage.value < currentPageTotal) {
    setReaderPage(currentPage.value + 1);
    return;
  }

  const nextItem = getHorizontalSiblingChapterItem("next") || await loadHorizontalStreamChapter("next");
  if (nextItem) setHorizontalActiveChapterItem(nextItem, "first");
};

const goPreviousHorizontalPage = async () => {
  if (isIntroPage.value) {
    if (currentPage.value > 1) setReaderPage(currentPage.value - 1);
    return;
  }

  if (currentPage.value > 1) {
    setReaderPage(currentPage.value - 1);
    return;
  }

  const previousItem = getHorizontalSiblingChapterItem("previous") || await loadHorizontalStreamChapter("previous");
  if (previousItem) {
    setHorizontalActiveChapterItem(previousItem, "last");
    return;
  }

  if (canShowIntroBeforeChapter.value) showIntroLastPage();
};

const goNextPage = async () => {
  if (isHorizontalPageTurn.value) {
    await goNextHorizontalPage();
    return;
  }

  if (isVerticalPageTurn.value) {
    const nextOffset = pageScrollOffset.value + pageHeight.value;
    if (nextOffset <= getMaxPageScrollOffset()) {
      setPageScrollOffset(nextOffset);
      return;
    }
    if (isIntroPage.value) {
      const chapterScrollOffset = Math.max(0, pageScrollOffset.value - introPageBlockHeight.value);
      if (promoteIntroContinuation()) {
        loadNextChapterIntoStream();
        pendingScrollOffset.value = chapterScrollOffset;
        scheduleReaderPagination({ keepPage: true });
        return;
      }
      revealIntroContinuation();
      return;
    }
    const appended = await loadNextChapterIntoStream();
    if (appended) {
      pendingScrollOffset.value = nextOffset;
      pendingChapterFlowTargetKey.value = appended.key;
      scheduleReaderPagination({ keepPage: true });
      return;
    }
    return;
  }
};

const goPreviousPage = async () => {
  if (isHorizontalPageTurn.value) {
    await goPreviousHorizontalPage();
    return;
  }

  if (isVerticalPageTurn.value) {
    const nextOffset = pageScrollOffset.value - pageHeight.value;
    if (nextOffset >= 0) {
      setPageScrollOffset(nextOffset);
      return;
    }
    if (!isIntroPage.value) {
      const prepended = await loadPreviousChapterIntoStream();
      if (prepended) {
        pendingChapterFlowPlacement.value = "previous-end";
        pendingChapterFlowTargetKey.value = prepended.key;
        scheduleReaderPagination({ keepPage: true });
        return;
      }
      if (hasAdjacentStreamChapter("previous")) return;
      if (canShowIntroBeforeChapter.value) showIntroLastPage();
    }
    return;
  }
};

const PAGE_TURN_DRAG_SLOP = 8;
const PAGE_TURN_DISTANCE_RATIO = 0.18;
const PAGE_TURN_MIN_DISTANCE = 56;
const PAGE_TURN_VELOCITY = 0.45;
let readerDrag = null;
let pageTurnAnimationTimer = 0;
let horizontalClickTurnFrame = 0;
let horizontalOffsetFrame = 0;
let pendingHorizontalOffset = 0;
let preparedHorizontalDirection = "";
let contentScrollFrame = 0;
let pendingContentScrollTop = 0;

const getPageTurnSize = axis =>
  axis === "horizontal" ? pageWidth.value : pageHeight.value;

const hasBlockingReaderPanel = () =>
  bookIntroVisible.value ||
  popBookSourceVisible.value ||
  catalogPanelVisible.value ||
  readSettingsVisible.value ||
  readerMoreVisible.value ||
  showCacheContentZone.value;

const canStartReaderDrag = (source, event) => {
  if (hasBlockingReaderPanel()) return false;
  if (loadingVisible.value || !show.value) return false;
  if (source === "mouse" && event.button !== 0) return false;
  if (pageTurnAxis.value === "vertical") return source === "mouse";
  return pageTurnAxis.value === "horizontal";
};

const prepareHorizontalPageFrame = offset => {
  if (!isHorizontalPageTurn.value || Math.abs(offset) < 1) return;
  const direction = offset < 0 ? "next" : "previous";
  if (direction === preparedHorizontalDirection) return;
  preparedHorizontalDirection = direction;
  ensureHorizontalStreamAroundPage({
    forceNext: offset < 0,
    forcePrevious: offset > 0
  });
};

const applyHorizontalPageTurnOffset = offset => {
  const nextOffset = Math.max(-pageWidth.value, Math.min(pageWidth.value, offset));
  if (Math.abs(nextOffset) < 1) preparedHorizontalDirection = "";
  pageTurnDragOffsetX.value = nextOffset;
  prepareHorizontalPageFrame(nextOffset);
};

const cancelPendingHorizontalOffset = () => {
  if (!horizontalOffsetFrame) return;
  window.cancelAnimationFrame(horizontalOffsetFrame);
  horizontalOffsetFrame = 0;
};

const setHorizontalPageTurnOffset = offset => {
  cancelPendingHorizontalOffset();
  applyHorizontalPageTurnOffset(offset);
};

const scheduleHorizontalPageTurnOffset = offset => {
  pendingHorizontalOffset = offset;
  if (horizontalOffsetFrame) return;

  horizontalOffsetFrame = window.requestAnimationFrame(() => {
    horizontalOffsetFrame = 0;
    applyHorizontalPageTurnOffset(pendingHorizontalOffset);
  });
};

const flushHorizontalPageTurnOffset = () => {
  if (!horizontalOffsetFrame) return;
  cancelPendingHorizontalOffset();
  applyHorizontalPageTurnOffset(pendingHorizontalOffset);
};

const cancelPendingContentScroll = () => {
  if (!contentScrollFrame) return;
  window.cancelAnimationFrame(contentScrollFrame);
  contentScrollFrame = 0;
};

const resetReaderDrag = () => {
  readerDrag = null;
  pageTurnDragActive.value = false;
  setHorizontalPageTurnOffset(0);
};

const removeMouseDragListeners = () => {
  window.removeEventListener("mousemove", handleReaderMouseMove);
  window.removeEventListener("mouseup", handleReaderMouseUp);
};

const getHorizontalPageTurnCommitDelay = () =>
  effectiveReadMethod.value === "无动画" ? 0 : getPageTurnDuration();

const resetHorizontalPageTurnAfterAnimation = direction => {
  window.clearTimeout(pageTurnAnimationTimer);
  pageTurnAnimationTimer = window.setTimeout(async () => {
    pageTurnDragActive.value = true;
    if (direction === "next") {
      await goNextPage();
    } else {
      await goPreviousPage();
    }
    setHorizontalPageTurnOffset(0);
    requestAnimationFrame(() => {
      pageTurnDragActive.value = false;
    });
  }, getHorizontalPageTurnCommitDelay());
};

const cancelPendingHorizontalClickTurn = () => {
  if (!horizontalClickTurnFrame) return;
  window.cancelAnimationFrame(horizontalClickTurnFrame);
  horizontalClickTurnFrame = 0;
};

const cancelPendingClickPageTurn = () => {
  cancelPendingHorizontalClickTurn();
};

const canCommitHorizontalPageTurn = direction => {
  if (direction === "next") return canTurnToNextReaderPage.value;
  if (direction === "previous") return canTurnToPreviousReaderPage.value;
  return false;
};

const finishHorizontalPageTurn = direction => {
  cancelPendingHorizontalClickTurn();
  cancelPendingHorizontalOffset();
  pageTurnDragActive.value = false;
  if (!direction || !canCommitHorizontalPageTurn(direction)) {
    setHorizontalPageTurnOffset(0);
    return;
  }

  const targetOffset = direction === "next" ? -pageWidth.value : pageWidth.value;
  setHorizontalPageTurnOffset(targetOffset);
  resetHorizontalPageTurnAfterAnimation(direction);
};

const startHorizontalPageTurnFromRest = direction => {
  cancelPendingClickPageTurn();
  if (!direction || !canCommitHorizontalPageTurn(direction)) return;

  if (effectiveReadMethod.value === "无动画") {
    direction === "next" ? goNextPage() : goPreviousPage();
    return;
  }

  const targetOffset = direction === "next" ? -pageWidth.value : pageWidth.value;
  pageTurnDragActive.value = true;
  setHorizontalPageTurnOffset(0);
  horizontalClickTurnFrame = window.requestAnimationFrame(() => {
    pageTurnDragActive.value = false;
    horizontalClickTurnFrame = window.requestAnimationFrame(() => {
      horizontalClickTurnFrame = 0;
      setHorizontalPageTurnOffset(targetOffset);
      resetHorizontalPageTurnAfterAnimation(direction);
    });
  });
};

const animateVerticalPageTurnTo = targetOffset => {
  cancelPendingClickPageTurn();
  const fromOffset = pageScrollOffset.value;
  const toOffset = clampPageScrollOffset(targetOffset);
  const duration = getPageTurnDuration();

  if (duration <= 0 || Math.abs(toOffset - fromOffset) < 1) {
    setPageScrollOffset(toOffset);
    return;
  }

  const viewportElement = contentViewportRef.value;
  if (!viewportElement) {
    setPageScrollOffset(toOffset);
    return;
  }

  cancelPendingContentScroll();
  viewportElement.scrollTo({ top: toOffset, behavior: "smooth" });
};

const startVerticalPageTurnFromRest = direction => {
  const targetOffset = pageScrollOffset.value + (direction === "next" ? pageHeight.value : -pageHeight.value);
  const boundedTargetOffset = clampPageScrollOffset(targetOffset);

  if (boundedTargetOffset !== pageScrollOffset.value) {
    animateVerticalPageTurnTo(boundedTargetOffset);
    return;
  }

  if (direction === "next") {
    goNextPage();
    return;
  }

  if (direction === "previous") goPreviousPage();
};

const isReaderAtScrollStart = () => pageScrollOffset.value <= 1;
const isReaderAtScrollEnd = () => pageScrollOffset.value >= getMaxPageScrollOffset() - 1;

const finishVerticalPageTurnDrag = ({ delta, velocity, threshold }) => {
  pageTurnDragActive.value = false;
  const shouldTurnNext = delta <= -threshold || velocity <= -PAGE_TURN_VELOCITY;
  const shouldTurnPrevious = delta >= threshold || velocity >= PAGE_TURN_VELOCITY;

  if (isIntroPage.value) {
    if (shouldTurnNext && isReaderAtScrollEnd()) goNextPage();
    return;
  }

  ensureVerticalStreamAroundViewport({
    forceNext: shouldTurnNext && isReaderAtScrollEnd() && canTurnToNextReaderPage.value,
    forcePrevious: shouldTurnPrevious && isReaderAtScrollStart() && canTurnToPreviousReaderPage.value
  });
};

const turnReaderPageByCurrentMethod = direction => {
  if (isHorizontalPageTurn.value) {
    startHorizontalPageTurnFromRest(direction);
    return;
  }

  if (isVerticalPageTurn.value) startVerticalPageTurnFromRest(direction);
};

const getTouchPoint = event => {
  const touch = event.touches?.[0] || event.changedTouches?.[0];
  return touch ? { x: touch.clientX, y: touch.clientY } : null;
};

const startReaderDrag = (source, event, point) => {
  if (!point || !canStartReaderDrag(source, event)) return;

  window.clearTimeout(pageTurnAnimationTimer);
  cancelPendingClickPageTurn();
  readerDrag = {
    axis: pageTurnAxis.value,
    source,
    startX: point.x,
    startY: point.y,
    startScrollOffset: pageScrollOffset.value,
    lastPoint: pageTurnAxis.value === "horizontal" ? point.x : point.y,
    lastTime: performance.now(),
    velocity: 0,
    lastDelta: 0,
    moved: false
  };
  pageTurnDragActive.value = true;
  setHorizontalPageTurnOffset(0);

  if (source === "mouse") {
    window.addEventListener("mousemove", handleReaderMouseMove);
    window.addEventListener("mouseup", handleReaderMouseUp);
  }
};

const cancelReaderDrag = () => {
  if (readerDrag?.source === "mouse") removeMouseDragListeners();
  resetReaderDrag();
};

const moveReaderDrag = (event, point) => {
  if (!readerDrag || !point) return;

  const deltaX = point.x - readerDrag.startX;
  const deltaY = point.y - readerDrag.startY;
  const isHorizontal = readerDrag.axis === "horizontal";
  const primaryDelta = isHorizontal ? deltaX : deltaY;
  const crossDelta = isHorizontal ? deltaY : deltaX;
  const now = performance.now();
  const primaryPoint = isHorizontal ? point.x : point.y;

  if (!readerDrag.moved) {
    const distance = Math.hypot(deltaX, deltaY);
    if (distance < PAGE_TURN_DRAG_SLOP) return;
    if (Math.abs(primaryDelta) <= Math.abs(crossDelta)) {
      suppressNextReaderClick.value = true;
      cancelReaderDrag();
      return;
    }
    readerDrag.moved = true;
    suppressNextReaderClick.value = true;
  }

  const movedDelta = isHorizontal ? point.x - readerDrag.startX : point.y - readerDrag.startY;
  readerDrag.lastDelta = movedDelta;
  const elapsed = Math.max(1, now - readerDrag.lastTime);
  readerDrag.velocity = (primaryPoint - readerDrag.lastPoint) / elapsed;
  readerDrag.lastPoint = primaryPoint;
  readerDrag.lastTime = now;

  if (isHorizontal) {
    scheduleHorizontalPageTurnOffset(movedDelta);
  } else {
    setPageScrollOffset(readerDrag.startScrollOffset - movedDelta);
  }
  event.preventDefault();
};

const endReaderDrag = event => {
  if (!readerDrag) return;

  const { axis, moved, velocity, source, lastDelta } = readerDrag;
  if (axis === "horizontal") flushHorizontalPageTurnOffset();
  const offset = pageTurnDragOffsetX.value;
  const threshold = Math.max(
    PAGE_TURN_MIN_DISTANCE,
    getPageTurnSize(axis) * PAGE_TURN_DISTANCE_RATIO
  );
  readerDrag = null;
  if (source === "mouse") removeMouseDragListeners();

  if (!moved) {
    pageTurnDragActive.value = false;
    setHorizontalPageTurnOffset(0);
    return;
  }

  suppressNextReaderClick.value = true;
  event?.preventDefault?.();
  if (axis === "vertical") {
    finishVerticalPageTurnDrag({ delta: lastDelta, velocity, threshold });
    return;
  }
  if (offset <= -threshold || velocity <= -PAGE_TURN_VELOCITY) {
    finishHorizontalPageTurn("next");
    return;
  }
  if (offset >= threshold || velocity >= PAGE_TURN_VELOCITY) {
    finishHorizontalPageTurn("previous");
    return;
  }
  finishHorizontalPageTurn("");
};

function handleReaderMouseMove(event) {
  moveReaderDrag(event, { x: event.clientX, y: event.clientY });
}

function handleReaderMouseUp(event) {
  endReaderDrag(event);
}

const handleReaderMouseDown = event => {
  startReaderDrag("mouse", event, { x: event.clientX, y: event.clientY });
};

const handleReaderTouchStart = event => {
  startReaderDrag("touch", event, getTouchPoint(event));
};

const handleReaderTouchMove = event => {
  moveReaderDrag(event, getTouchPoint(event));
};

const handleReaderTouchEnd = event => {
  endReaderDrag(event);
};

const handleReaderTouchCancel = () => {
  cancelReaderDrag();
};

const handleReaderWheel = event => {
  if (!isVerticalPageTurn.value || loadingVisible.value || hasBlockingReaderPanel()) return;

  if (isIntroPage.value) {
    if (event.deltaY > 0) preloadIntroContinuation();
    if (event.deltaY > 0 && isReaderAtScrollEnd()) goNextPage();
    return;
  }

  ensureVerticalStreamAroundViewport({
    forceNext: event.deltaY > 0 && isReaderAtScrollEnd() && canTurnToNextReaderPage.value,
    forcePrevious: event.deltaY < 0 && isReaderAtScrollStart() && canTurnToPreviousReaderPage.value
  });
};

const handleContentScroll = event => {
  if (!isVerticalPageTurn.value) return;
  pendingContentScrollTop = event.currentTarget.scrollTop;
  if (Math.abs(pendingContentScrollTop - pageScrollOffset.value) <= 1) return;
  if (contentScrollFrame) return;

  contentScrollFrame = window.requestAnimationFrame(() => {
    contentScrollFrame = 0;
    setPageScrollOffset(pendingContentScrollTop, { syncDom: false });
  });
};

const getContent = note => {
  catalogPanelVisible.value = false;
  openChapter(note);
};

const refreshCatalog = () => {
  if (isPreviewBook.value) {
    ElMessage.success("目录刷新预览");
    return;
  }
  refreshReaderCatalog();
};

const openClickAreaEditor = () => {
  closeReaderMenus();
  clickAreaEditorVisible.value = true;
};

const closeClickAreaEditor = () => {
  clickAreaEditorVisible.value = false;
};

const updateClickAreaActions = clickAreaActions => {
  updateReaderConfig({ clickAreaActions });
};

const updateReaderConfig = patch => {
  const currentReadMethod = normalizeReadMethod(config.value.readMethod);
  const nextPatch = { ...patch };
  const hasReadMethodPatch = Object.prototype.hasOwnProperty.call(nextPatch, "readMethod");
  const nextReadMethod = hasReadMethodPatch ? normalizeReadMethod(nextPatch.readMethod) : currentReadMethod;
  if (hasReadMethodPatch) nextPatch.readMethod = nextReadMethod;

  if (
    hasReadMethodPatch &&
    nextReadMethod !== currentReadMethod &&
    isVerticalReadMethod(nextReadMethod) !== isVerticalReadMethod(currentReadMethod)
  ) {
    pendingReadMethodSwitchAnchor.value = captureReadMethodSwitchAnchor();
  }

  config.value = {
    ...config.value,
    ...nextPatch,
    clickAreaActions: normalizeClickAreaActions(
      nextPatch.clickAreaActions || config.value.clickAreaActions
    )
  };
};

const closeReaderMenus = () => {
  popBookSourceVisible.value = false;
  catalogPanelVisible.value = false;
  readSettingsVisible.value = false;
  readerMoreVisible.value = false;
  showCacheContentZone.value = false;
  showToolBar.value = false;
};

const hasVisibleReaderMenu = () =>
  showToolBar.value ||
  popBookSourceVisible.value ||
  catalogPanelVisible.value ||
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
  const action = resolveClickAreaAction({
    mode: config.value.clickAreaMode,
    actions: config.value.clickAreaActions,
    point: { x: point.clientX, y: point.clientY },
    size: { width: windowSize.value.width, height: windowSize.value.height }
  });
  if (action === CLICK_AREA_ACTION_MENU) {
    showToolBar.value = !showToolBar.value;
    return;
  }
  if (action === CLICK_AREA_ACTION_NEXT) {
    turnReaderPageByCurrentMethod("next");
    return;
  }
  if (action === CLICK_AREA_ACTION_PREVIOUS) {
    turnReaderPageByCurrentMethod("previous");
  }
};

const handlerClick = event => {
  if (suppressNextReaderClick.value) {
    suppressNextReaderClick.value = false;
    event.preventDefault();
    event.stopPropagation();
    return;
  }
  eventHandler(event);
};

watch(
  () => props.book,
  book => {
    introTotalPages.value = 1;
    introPageBlockHeight.value = 0;
    chapterFlowBlockHeights.value = {};
    horizontalChapterPageCounts.value = {};
    horizontalStreamLoading.value = { previous: false, next: false };
    pendingHorizontalPagePlacement.value = "";
    activeChapterKey.value = "";
    activeChapterTitle.value = "";
    activeChapterIndex.value = 0;
    loadReaderBook(book);
  },
  { immediate: true }
);

watch(
  readingBook,
  book => {
    addHistoryBook(book);
  },
  { deep: true, immediate: true }
);

watch(
  [title, chapterContent, loadingVisible, isIntroPage, show],
  () => {
    resetReaderPage();
    scheduleReaderPagination({ keepPage: false });
  },
  { flush: "post" }
);

watch(
  introContinuation,
  () => scheduleReaderPagination({ keepPage: true }),
  { flush: "post" }
);

watch(
  chapterStream,
  () => scheduleReaderPagination({ keepPage: true }),
  { flush: "post" }
);

watch(
  [
    () => config.value.fontSize,
    () => config.value.fontWeight,
    () => config.value.lineHeight,
    () => config.value.paragraphSpace,
    () => config.value.pageHorizontalMargin,
    () => config.value.pageTopMargin,
    () => config.value.pageBottomMargin,
    () => config.value.chineseFont,
    () => config.value.theme,
    () => config.value.readMethod,
    readWidthConfig,
    windowSize,
    miniInterface
  ],
  () => scheduleReaderPagination({ keepPage: true }),
  { flush: "post" }
);

onMounted(() => {
  scheduleReaderPagination({ keepPage: false });
  window.addEventListener("resize", syncInterface);
});

onBeforeUnmount(() => {
  abortReaderTask();
  if (paginationFrame) cancelAnimationFrame(paginationFrame);
  if (paginationTimer) clearTimeout(paginationTimer);
  if (pageTurnAnimationTimer) window.clearTimeout(pageTurnAnimationTimer);
  if (horizontalOffsetFrame) window.cancelAnimationFrame(horizontalOffsetFrame);
  cancelPendingContentScroll();
  removeMouseDragListeners();
  window.removeEventListener("resize", syncInterface);
});
</script>

<style lang="stylus" scoped>
:deep(.reader-more-popper) {
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

  .reader-brightness-mask {
    position: fixed;
    inset: 0;
    z-index: 3000;
    pointer-events: none;
    background: #000;
    transition: opacity 0.12s linear;
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

  }

  .reader-menu-sheet,
  .reader-source-sheet {
    position: fixed;
    left: 50%;
    right: auto;
    width: calc(100vw - 24px);
    max-width: 680px;
    box-sizing: border-box;
    overflow: hidden;
    border: 1px solid rgba(120, 104, 75, 0.12);
    border-radius: 24px;
    background: var(--reader-panel-background, #ede7da);
    box-shadow: 0 18px 50px rgba(72, 55, 34, 0.16);
    backdrop-filter: blur(22px) saturate(1.15);
    transform: translateX(-50%);
  }

  .reader-menu-sheet {
    bottom: calc(70px + env(safe-area-inset-bottom));
    z-index: 102;
  }

  .reader-source-sheet {
    top: calc(66px + env(safe-area-inset-top));
    z-index: 2000;
  }

  .reader-menu-sheet__content,
  .reader-source-sheet__content,
  .reader-cache-panel {
    width: 100%;
    box-sizing: border-box;
  }

  :deep(.reader-menu-sheet__content.reading-settings),
  :deep(.reader-menu-sheet__content.reader-popup),
  :deep(.reader-source-sheet__content.reader-popup) {
    margin: 0;
    padding: 16px 22px 18px;
    max-height: min(52vh, 440px);
  }

  :deep(.reader-menu-sheet__content .reading-settings__body),
  :deep(.reader-menu-sheet__content .reader-popup__body),
  :deep(.reader-source-sheet__content .reader-popup__body) {
    max-height: min(52vh, 440px);
  }

  .reader-cache-panel {
    padding: 24px 18px 16px;
    background: transparent;
    color: var(--reader-font-color, inherit);
    font-size: 14px;
  }

  .reader-cache-panel::before {
    content: "";
    position: absolute;
    top: 9px;
    left: 50%;
    width: 36px;
    height: 4px;
    border-radius: 999px;
    background: rgba(120, 120, 128, 0.34);
    transform: translateX(-50%);
  }

  .reader-cache-panel__title {
    margin-bottom: 14px;
    font-size: 18px;
    line-height: 1.25;
    font-weight: 700;
    letter-spacing: -0.02em;
  }

  .reader-cache-panel__actions {
    display: grid;
    grid-template-columns: repeat(3, minmax(0, 1fr));
    gap: 8px;
  }

  .reader-cache-panel__action {
    height: 40px;
    border: 0;
    border-radius: 999px;
    color: inherit;
    background: rgba(118, 118, 128, 0.12);
    cursor: pointer;
    font-size: 14px;
    transition: background 0.16s ease, transform 0.16s ease;
  }

  .reader-cache-panel__action:active {
    transform: scale(0.96);
  }

  .reader-menu-sheet-enter-active,
  .reader-menu-sheet-leave-active,
  .reader-source-sheet-enter-active,
  .reader-source-sheet-leave-active {
    transition: opacity 0.2s ease, transform 0.2s ease;
  }

  .reader-menu-sheet-enter-from,
  .reader-menu-sheet-leave-to {
    opacity: 0;
    transform: translateX(-50%) translateY(24px);
  }

  .reader-source-sheet-enter-from,
  .reader-source-sheet-leave-to {
    opacity: 0;
    transform: translateX(-50%) translateY(-24px);
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
    height: 100vh;
    height: calc(var(--vh, 1vh) * 100);
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

    .reader-page__content {
      height: calc(100% - 74px);
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
        height: 100%;
        min-height: 0;
        padding-bottom: 0;
        overflow: hidden;
        box-sizing: border-box;
        contain: layout paint style;
      }

      .reader-page__content-inner--paged {
        position: relative;
        touch-action: none;
        cursor: grab;
      }

      .reader-page__content-inner--scroll {
        overflow-x: hidden;
        overflow-y: auto;
        -webkit-overflow-scrolling: touch;
        overscroll-behavior: contain;
        cursor: grab;
      }

      .reader-horizontal-stage {
        position: relative;
        width: 100%;
        height: 100%;
        overflow: hidden;
        contain: layout paint style;
        transform: translateZ(0);
      }

      .reader-page-frame {
        position: absolute;
        inset: 0;
        width: 100%;
        height: 100%;
        overflow: hidden;
        background: var(--reader-content-background);
        contain: layout paint style;
        will-change: transform, opacity;
        backface-visibility: hidden;
      }

      .reader-page-frame__placeholder {
        width: 100%;
        height: 100%;
        background: var(--reader-content-background);
      }

      .reader-page-frame__loading {
        min-height: 100%;
      }

      .reader-horizontal-measure {
        position: absolute;
        inset: 0;
        z-index: -1;
        overflow: visible;
        visibility: hidden;
        pointer-events: none;
      }

      .reader-horizontal-measure__content {
        width: 100%;
        min-height: 100%;
      }

      .reader-horizontal-stage--cover .reader-page-frame--current.reader-page-frame--chapter {
        box-shadow: inset 0 0 0 1px rgba(120, 104, 75, 0.06);
      }

      .reader-horizontal-stage--cover.reader-horizontal-stage--turning .reader-page-frame--active.reader-page-frame--chapter::after {
        content: "";
        position: absolute;
        top: 0;
        right: 0;
        width: 1px;
        height: 100%;
        pointer-events: none;
        background: rgba(86, 72, 48, 0.28);
        box-shadow: -8px 0 16px rgba(86, 72, 48, 0.1);
        opacity: calc(0.24 + var(--reader-turn-progress) * 0.36);
      }

      .reader-chapter-flow {
        min-height: 100%;
      }

      .reader-chapter-flow__item {
        min-height: 100%;
        box-sizing: border-box;
      }

      .reader-chapter-flow__item-content {
        min-height: 100%;
      }
    }

    &.reader-page--horizontal-turn {
      touch-action: none;
      user-select: none;
      -webkit-user-select: none;
    }

    &.reader-page--vertical-turn {
      touch-action: pan-y;
    }

    &.reader-page--dragging {
      cursor: grabbing;
    }

    &.reader-page--vertical-turn.reader-page--dragging {
      user-select: none;
      -webkit-user-select: none;
    }

    &.reader-page--horizontal-turn .reader-text-flow {
      backface-visibility: hidden;
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
      height: 30px;
      text-align: center;
      padding-bottom: 0;
    }
  }

  .reader-click-area-editor-enter-active,
  .reader-click-area-editor-leave-active {
    transition: opacity 0.16s ease;
  }

  .reader-click-area-editor-enter-from,
  .reader-click-area-editor-leave-to {
    opacity: 0;
  }

  @keyframes reader-page-loading-spin {
    to {
      transform: rotate(360deg);
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

  :deep(.reader-page) {
    border: 1px solid #d8d8d8;
    color: #262626;
  }

  .reader-page__bottom, .reader-page__top {
    color: rgba(0, 0, 0, 0.4);
  }

}

.night {
  :deep(.popup) {
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.48), 0 0 6px rgba(0, 0, 0, 0.16);
  }

  :deep(.reader-page) {
    border: 1px solid #444;
    color: #666;
  }


  .reader-page__bottom, .reader-page__top {
    color: #666;
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

  .reader-menu-sheet,
  .reader-source-sheet {
    width: calc(100vw - 20px);
    border-radius: 22px;
  }

  .reader-bottom-panel {
    left: 0;
    right: auto;
    width: 100vw;
    margin-left: 0 !important;
    margin-right: 0 !important;

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
    .reader-page__content-inner {
      margin-top: 30px;
      margin-top: calc(30px + constant(safe-area-inset-top));
      margin-top: calc(30px + env(safe-area-inset-top));
      padding-top: 15px;
      padding-bottom: 15px;
    }

    .reader-page__content {
      height: 100%;
    }

    .reader-page__content-inner--paged,
    .reader-page__content-inner--scroll {
      height: calc(100% - 30px);
      height: calc(100% - 30px - constant(safe-area-inset-top));
      height: calc(100% - 30px - env(safe-area-inset-top));
      min-height: 0;
      padding-bottom: 15px;
    }
  }

}
.reader-view.mini-interface::-webkit-scrollbar {
  width: 0 !important;
}
</style>
