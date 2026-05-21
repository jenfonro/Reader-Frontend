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
    <ReaderTopbar
      v-model:more-visible="readerMoreVisible"
      :theme="topBarTheme"
      :in-bookshelf="isReadingBookInShelf"
      :bookshelf-action-text="bookshelfActionText"
      :popper-options="menuPopperOptions"
      @back="toShelf"
      @toggle-bookshelf="toggleReadingBookshelf"
      @toggle-source="toggleBookSourcePanel"
      @toggle-cache="toggleCacheContent"
    />

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
          :book="readingBook"
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

    <ReaderSideActions
      :panel-theme="sidePanelTheme"
      :action-style="sideActionStyle"
      :is-night="isNight"
      @open-intro="openBookIntro"
    />

    <ReaderBottomControls
      v-model:progress="bottomProgressValue"
      :progress-max="bottomProgressMax"
      :theme="bottomBarTheme"
      @change-progress="showProgress"
      @previous-chapter="goPreviousChapterAction"
      @next-chapter="goNextChapterAction"
      @toggle-catalog="toggleCatalogPanel"
      @toggle-settings="toggleReadSettings"
    />
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
      :in-bookshelf="isReadingBookInShelf"
      @close="bookIntroVisible = false"
      @toggle-bookshelf="toggleReadingBookshelf"
    />

    <ReaderPageStage
      :chapter-class="chapterClass"
      :chapter-stream-items="chapterStreamItems"
      :chapter-theme="chapterTheme"
      :config="config"
      :content-style="contentStyle"
      :content-viewport-class="contentViewportClass"
      :display-reader-header-title="displayReaderHeaderTitle"
      :error="error"
      :get-page-frame-content="getPageFrameContent"
      :get-page-frame-content-style="getPageFrameContentStyle"
      :get-page-frame-title="getPageFrameTitle"
      :get-page-frame-class="getPageFrameClass"
      :get-page-frame-style="getPageFrameStyle"
      :has-reader-content="hasReaderContent"
      :page-windows="pageWindows"
      :page-stage-class="pageStageClass"
      :intro-loading="introLoading"
      :is-active-intro-stream-item="isActiveIntroStreamItem"
      :is-paged-read-mode="isPagedReadMode"
      :is-intro-stream-item="isIntroStreamItem"
      :is-vertical-read-mode="isVerticalReadMode"
      :is-reader-loading-visible="isReaderLoadingVisible"
      :is-reader-positioning="isReaderPositioning"
      :is-reading-book-in-shelf="isReadingBookInShelf"
      :measured-chapter-stream-items="measuredChapterStreamItems"
      :mini-interface="miniInterface"
      :reader-loading-text="readerLoadingText"
      :reading-book="readingBook"
      :vertical-stream-next-loading="verticalStreamNextLoading"
      :vertical-stream-previous-loading-height="verticalStreamPreviousLoadingHeight"
      :vertical-stream-previous-preview-item="verticalStreamPreviousPreviewItem"
      :vertical-stream-previous-preview-visible="verticalStreamPreviousPreviewVisible"
      :set-content-viewport-ref="setContentViewportRef"
      :set-vertical-stream-ref="setVerticalStreamRef"
      :show="show"
      @reader-mouse-down="handleReaderMouseDown"
      @reader-touch-cancel="handleReaderTouchCancel"
      @reader-touch-end="handleReaderTouchEnd"
      @reader-touch-move="handleReaderTouchMove"
      @reader-touch-start="handleReaderTouchStart"
      @reader-wheel="handleReaderWheel"
      @start-reading="startReading"
      @toggle-bookshelf="toggleReadingBookshelf"
      @vertical-scroll="handleVerticalScroll"
      @vertical-touch-cancel="handleVerticalTouchCancel"
      @vertical-touch-end="handleVerticalTouchEnd"
      @vertical-touch-move="handleVerticalTouchMove"
      @vertical-touch-start="handleVerticalTouchStart"
    />
  </div>
</template>


<script setup>
import { computed, nextTick, onBeforeUnmount, onMounted, ref, watch } from "vue";
import { ElMessage } from "element-plus/es/components/message/index.mjs";
import "element-plus/es/components/message/style/css.mjs";
import BookSource from "../components/BookSource.vue";
import CatalogPopup from "../components/CatalogPopup.vue";
import ReadSettings from "../components/ReadSettings.vue";
import ClickAreaEditorOverlay from "../components/reader/ClickAreaEditorOverlay.vue";
import ReaderBottomControls from "../components/reader/ReaderBottomControls.vue";
import ReaderIntroPanel from "../components/reader/ReaderIntroPanel.vue";
import ReaderPageStage from "../components/reader/ReaderPageStage.vue";
import ReaderSideActions from "../components/reader/ReaderSideActions.vue";
import ReaderTopbar from "../components/reader/ReaderTopbar.vue";
import { isVerticalReadMethod, normalizeReadMethod } from "../utils/readMethod";
import {
  PAGE_TURN_DISTANCE_RATIO,
  PAGE_TURN_DRAG_SLOP,
  PAGE_TURN_MIN_DISTANCE,
  clampProgressRatio,
  getCommittedPageTurnDirection,
  getPageByRatio,
  getPageRatio
} from "../utils/readerPagination";
import { setReaderSettings } from "../data/readerSettings";
import { convertChineseText } from "../utils/chinese";
import {
  CLICK_AREA_ACTION_MENU,
  CLICK_AREA_ACTION_NEXT,
  CLICK_AREA_ACTION_PREVIOUS,
  normalizeClickAreaActions,
  resolveClickAreaAction
} from "../utils/clickArea";
import { hasReadingHistory } from "../utils/readingHistory.js";
import { isIntroStreamItem } from "../utils/readerStream.js";
import { useReaderMenus } from "../composables/useReaderMenus.js";
import { useReaderRuntime } from "../composables/useReaderRuntime.js";
import { useReaderAppearance } from "../composables/useReaderAppearance.js";
import { useReadingHistoryPersistence } from "../composables/useReadingHistoryPersistence.js";
import { useReaderViewState } from "../composables/useReaderViewState.js";
import { useReaderLayoutScheduler } from "../composables/useReaderLayoutScheduler.js";
import { useReaderBookshelf } from "../composables/useReaderBookshelf.js";
import { useAnimationFrameValue } from "../composables/useAnimationFrameValue.js";

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
const READER_STREAM_LOADING_MIN_DURATION = 2000;

const wait = duration => new Promise(resolve => {
  window.setTimeout(resolve, Math.max(0, duration));
});

const waitRemainingTime = startedAt =>
  wait(READER_STREAM_LOADING_MIN_DURATION - (performance.now() - startedAt));

const VERTICAL_STREAM_LOAD_THRESHOLD = 240;
const VERTICAL_STREAM_PREVIOUS_LOAD_THRESHOLD = 24;
const VERTICAL_STREAM_PREVIOUS_PULL_MAX = 140;
const VERTICAL_STREAM_PREVIOUS_PULL_VIEWPORT_RATIO = 0.92;
const VERTICAL_STREAM_PREVIOUS_PULL_TRIGGER = 100;
const VERTICAL_STREAM_PREVIOUS_PULL_DAMPING = 0.65;
const VERTICAL_CLICK_SCROLL_RATIO = 0.92;
const VERTICAL_PROGRESS_MAX = 1000;
const verticalStreamNextLoading = ref(false);
const verticalStreamPreviousLoading = ref(false);
const verticalStreamPreviousPullHeight = ref(0);
const verticalStreamPreviousPreviewItem = ref(null);
let verticalPreviousPullHeightValue = 0;
let verticalTouchStartY = 0;
let verticalTouchStartScrollTop = 0;
const verticalTouchActive = ref(false);
let verticalPreviousPullGestureActive = false;
let verticalPreviousPullHeightFrame = 0;
let verticalPreviousPendingPullHeight = null;
let verticalBoundaryRequestsSuppressed = false;
let verticalBoundarySuppressTimer = 0;

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
  chapterStream,
  chapterIndex,
  abortReaderTask,
  loadReaderBook,
  switchBookSource,
  loadBookIntro,
  startReading: prepareStartReading,
  syncReadingProgress,
  insertChapterStreamItem,
  loadAdjacentChapterStreamItem,
  openChapter,
  refreshCatalog: refreshReaderCatalog
} = useReaderRuntime();

const {
  popBookSourceVisible,
  catalogPanelVisible,
  readSettingsVisible,
  readerMoreVisible,
  clickAreaEditorVisible,
  bookIntroVisible,
  showToolBar,
  showCacheContentZone,
  closeReaderMenus,
  hasVisibleReaderMenu,
  toggleBookSourcePanel,
  toggleCacheContent,
  toggleCatalogPanel,
  toggleReadSettings
} = useReaderMenus();
const {
  bookshelfActionText,
  cleanupReaderBookshelf,
  getBookWithHistory,
  isReadingBookInShelf,
  toggleReadingBookshelf
} = useReaderBookshelf({
  bookIntroVisible,
  readingBook
});
const {
  activeChapterIndex,
  activeChapterKey,
  activeChapterTitle,
  config,
  contentViewportRef,
  currentPage,
  chapterPageMetrics,
  miniInterface,
  pageHeight,
  verticalStreamRef,
  pageTurnDragActive,
  pageTurnDragOffset,
  pageWidth,
  verticalProgress,
  pendingHistoryRestoreAnchor,
  pendingReadMethodSwitchAnchor,
  setContentViewportRef,
  setVerticalStreamRef,
  show,
  suppressNextReaderClick,
  syncInterface,
  totalPages,
  windowSize
} = useReaderViewState();
const {
  bodyTheme,
  bottomBarTheme,
  brightnessMaskStyle,
  chapterClass,
  chapterTheme,
  currentThemeConfig,
  effectiveReadMethod,
  getPageTurnDuration,
  getPageTurnTransition,
  isPagedReadMode,
  isNight,
  isVerticalReadMode,
  menuPopperOptions,
  menuSheetTheme,
  readAxis,
  readWidthConfig,
  sideActionStyle,
  sidePanelTheme,
  topBarTheme
} = useReaderAppearance({
  config,
  miniInterface,
  pageTurnDragActive,
  windowSize
});
const getPageContentTransformStyle = offset => ({
  transform: `translate3d(0, ${-offset}px, 0)`
});
const chapterStreamItems = computed(() => chapterStream.value);
const measuredChapterStreamItems = computed(() =>
  isPagedReadMode.value ? chapterStreamItems.value.filter(item => !isIntroStreamItem(item)) : []
);
const chapterStreamItemMap = computed(() =>
  new Map(chapterStreamItems.value.map(item => [item.key, item]))
);
const activeStreamItem = computed(() =>
  chapterStreamItemMap.value.get(activeChapterKey.value) || chapterStreamItems.value[0] || null
);
const hasReaderContent = computed(() => chapterStreamItems.value.length > 0);
const isActiveIntroStreamItem = computed(() => isIntroStreamItem(activeStreamItem.value));
const readerHeaderTitle = computed(() =>
  activeChapterTitle.value || activeStreamItem.value?.title || ""
);
const displayReaderHeaderTitle = computed(() =>
  convertChineseText(readerHeaderTitle.value, config.value.chineseFont)
);
const isReaderPositioning = computed(() =>
  !error.value && Boolean(pendingHistoryRestoreAnchor.value || pendingReadMethodSwitchAnchor.value)
);
const isReaderContentStaging = computed(() => isReaderPositioning.value);
const isReaderLoadingVisible = computed(() =>
  loadingVisible.value && !hasReaderContent.value
);
const readerLoadingText = computed(() => loadingText.value);
const verticalStreamPreviousPreviewVisible = computed(() =>
  Boolean(verticalStreamPreviousPreviewItem.value)
);
const verticalStreamPreviousLoadingHeight = computed(() => {
  const pullHeight = verticalStreamPreviousPullHeight.value;
  if (!verticalStreamPreviousLoading.value && !verticalStreamPreviousPreviewItem.value) return pullHeight;
  return verticalTouchActive.value ? pullHeight : Math.max(VERTICAL_STREAM_PREVIOUS_PULL_MAX, pullHeight);
});
const bottomProgressMax = computed(() =>
  isVerticalReadMode.value ? VERTICAL_PROGRESS_MAX : totalPages.value
);
const bottomProgressValue = computed({
  get: () => isVerticalReadMode.value ? verticalProgress.value : currentPage.value,
  set: value => {
    if (isVerticalReadMode.value) {
      setVerticalProgress(value);
      return;
    }
    setReaderPage(value);
  }
});

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

const contentViewportClass = computed(() => ({
  "reader-page__content-inner--paged": isPagedReadMode.value,
  "reader-page__content-inner--vertical-scroll": isVerticalReadMode.value,
  "reader-page__content-inner--positioning": isReaderContentStaging.value
}));
const pageTurnMode = computed(() => {
  if (effectiveReadMethod.value === "覆盖") return "cover";
  return "slide";
});
const pageTurnDirection = computed(() => {
  if (pageTurnDragOffset.value < 0) return "next";
  if (pageTurnDragOffset.value > 0) return "previous";
  return "";
});
const pageTurnProgress = computed(() => {
  const size = getPageTurnSize(readAxis.value);
  return Math.min(1, Math.abs(pageTurnDragOffset.value) / size);
});
const pageTurnActive = computed(() => pageTurnProgress.value > 0.001);
const movingFrameRole = computed(() => {
  if (!pageTurnDirection.value) return "current";
  if (pageTurnMode.value === "slide") return "current";
  return pageTurnDirection.value === "next" ? "current" : "previous";
});
const pageStageClass = computed(() => ({
  [`reader-page-stage--${pageTurnMode.value}`]: true,
  [`reader-page-stage--${readAxis.value}`]: true,
  [`reader-page-stage--${pageTurnDirection.value}`]: Boolean(pageTurnDirection.value),
  "reader-page-stage--turning": pageTurnActive.value
}));

const getPageFrameTransform = offset =>
  readAxis.value === "horizontal"
    ? `translate3d(${offset}px, 0, 0)`
    : `translate3d(0, ${offset}px, 0)`;
const createReaderPageFrame = ({ role, type = "empty", number = 0, item = null }) => ({
  key: `${role}-${type}-${item?.key || "empty"}-${number || "none"}`,
  role,
  type,
  number,
  item
});

const getCurrentPageChapterItem = () => {
  const activeItem = chapterStreamItemMap.value.get(activeChapterKey.value);
  if (activeItem) return activeItem;

  return chapterStreamItems.value.find(item => item.index === chapterIndex.value) ||
    chapterStreamItems.value[0] ||
    null;
};
const getPageChapterItemIndex = item => {
  if (!item) return -1;
  return chapterStreamItems.value.findIndex(chapterItem => chapterItem.key === item.key);
};
const getSiblingPageChapterItem = direction => {
  const currentItem = getCurrentPageChapterItem();
  const currentIndex = getPageChapterItemIndex(currentItem);
  if (currentIndex < 0) return null;
  return chapterStreamItems.value[currentIndex + (direction === "previous" ? -1 : 1)] || null;
};
const getChapterPageMetric = item => chapterPageMetrics.value[item?.key] || null;

const getChapterPageCount = item => {
  if (isIntroStreamItem(item)) return 1;

  const pageCount = Number(getChapterPageMetric(item)?.pageCount);
  if (Number.isFinite(pageCount) && pageCount > 0) return Math.trunc(pageCount);
  if (item?.key === getCurrentPageChapterItem()?.key) return Math.max(1, totalPages.value);
  return 1;
};
const getCurrentPageTotal = () =>
  getChapterPageCount(getCurrentPageChapterItem());

const getBookHistoryProgress = book => {
  const progress = Number(book?.durChapterProgress);
  return Number.isFinite(progress) ? clampProgressRatio(progress) : 0;
};

const createHistoryRestoreAnchor = book => {
  if (!hasReadingHistory(book)) return null;

  const index = Number(book?.durChapterIndex);
  if (!Number.isFinite(index)) return null;

  return {
    type: "chapter",
    index: Math.max(0, Math.trunc(index)),
    ratio: getBookHistoryProgress(book)
  };
};

const findChapterStreamItemByAnchor = anchor => {
  if (!anchor) return null;
  return chapterStreamItems.value.find(item => item.key === anchor.key) ||
    chapterStreamItems.value.find(item => Number(item.index) === Number(anchor.index)) ||
    null;
};

const getCurrentReadingRatio = () => {
  if (isVerticalReadMode.value) return getVerticalProgressRatio();
  return getPageRatio(currentPage.value, getCurrentPageTotal());
};

const captureReadMethodSwitchAnchor = () => {
  if (loadingVisible.value || !show.value) return null;

  const activeItem = getCurrentPageChapterItem();
  if (!activeItem) return null;

  if (isIntroStreamItem(activeItem)) {
    return {
      type: "intro",
      key: activeItem.key,
      ratio: 0
    };
  }

  return {
    type: "chapter",
    key: activeItem.key,
    index: activeItem.index,
    ratio: getCurrentReadingRatio()
  };
};

const captureReadingHistoryAnchor = () => {
  const anchor = captureReadMethodSwitchAnchor();
  if (anchor?.type !== "chapter") return null;

  const item = findChapterStreamItemByAnchor(anchor);
  return item && !isIntroStreamItem(item) ? anchor : null;
};

const applyReadMethodSwitchAnchor = (anchor, { measuredPageMetrics }) => {
  if (!anchor) return false;

  if (anchor.type === "intro") {
    const introItem = chapterStreamItems.value.find(isIntroStreamItem);
    if (!introItem) return false;

    syncActiveChapterItem(introItem);
    if (isVerticalReadMode.value) setVerticalProgress(1);
    else setReaderPage(1);
    return true;
  }

  const targetItem = findChapterStreamItemByAnchor(anchor);
  if (!targetItem) return false;

  syncActiveChapterItem(targetItem);
  if (isVerticalReadMode.value) {
    setVerticalProgressByRatio(anchor.ratio);
    return true;
  }

  const pageTotal = Math.max(1, measuredPageMetrics[targetItem.key]?.pageCount || getChapterPageCount(targetItem));
  totalPages.value = pageTotal;
  setReaderPage(getPageByRatio(anchor.ratio, pageTotal));
  return true;
};

const hasBoundaryLoadingPage = direction =>
  !getSiblingPageChapterItem(direction) && hasAdjacentStreamChapter(direction);

const canTurnToPreviousReaderPage = computed(() =>
  currentPage.value > 1 ||
  Boolean(getSiblingPageChapterItem("previous")) ||
  hasAdjacentStreamChapter("previous")
);
const canTurnToNextReaderPage = computed(() =>
  currentPage.value < getCurrentPageTotal() ||
  Boolean(getSiblingPageChapterItem("next")) ||
  hasAdjacentStreamChapter("next")
);

const getPreviousPageFrame = () => {
  const currentItem = getCurrentPageChapterItem();
  if (currentPage.value > 1) {
    return createReaderPageFrame({
      role: "previous",
      type: "chapter",
      number: currentPage.value - 1,
      item: currentItem
    });
  }

  const previousItem = getSiblingPageChapterItem("previous");
  if (previousItem) {
    return createReaderPageFrame({
      role: "previous",
      type: "chapter",
      number: getChapterPageCount(previousItem),
      item: previousItem
    });
  }

  if (hasBoundaryLoadingPage("previous")) {
    return createReaderPageFrame({ role: "previous", type: "loading" });
  }

  return createReaderPageFrame({ role: "previous" });
};

const getCurrentPageFrame = () => {
  return createReaderPageFrame({
    role: "current",
    type: "chapter",
    number: currentPage.value,
    item: getCurrentPageChapterItem()
  });
};

const getNextPageFrame = () => {
  const currentItem = getCurrentPageChapterItem();
  const currentPageTotal = getChapterPageCount(currentItem);
  if (currentPage.value < currentPageTotal) {
    return createReaderPageFrame({
      role: "next",
      type: "chapter",
      number: currentPage.value + 1,
      item: currentItem
    });
  }

  const nextItem = getSiblingPageChapterItem("next");
  if (nextItem) {
    return createReaderPageFrame({
      role: "next",
      type: "chapter",
      number: 1,
      item: nextItem
    });
  }

  if (hasBoundaryLoadingPage("next")) {
    return createReaderPageFrame({ role: "next", type: "loading" });
  }

  return createReaderPageFrame({ role: "next" });
};

const pageWindows = computed(() => {
  if (!isPagedReadMode.value) return [];

  return [
    getPreviousPageFrame(),
    getCurrentPageFrame(),
    getNextPageFrame()
  ];
});
const pageFrameState = computed(() => {
  const size = getPageTurnSize(readAxis.value);
  const offset = pageTurnDragOffset.value;
  const progress = pageTurnProgress.value;
  const transition = getPageTurnTransition();
  const mode = pageTurnMode.value;

  const state = {
    previous: { transform: getPageFrameTransform(-size), opacity: 0, zIndex: 1 },
    current: { transform: getPageFrameTransform(0), opacity: 1, zIndex: 3 },
    next: { transform: getPageFrameTransform(size), opacity: 0, zIndex: 1 }
  };

  if (mode === "slide") {
    state.previous = { transform: getPageFrameTransform(-size + offset), opacity: 1, zIndex: 2 };
    state.current = { transform: getPageFrameTransform(offset), opacity: 1, zIndex: 3 };
    state.next = { transform: getPageFrameTransform(size + offset), opacity: 1, zIndex: 2 };
  } else if (mode === "cover" && offset < 0) {
    state.current = { transform: getPageFrameTransform(offset), opacity: 1, zIndex: 3 };
    state.next = { transform: getPageFrameTransform(0), opacity: 1, zIndex: 2 };
  } else if (mode === "cover" && offset > 0) {
    state.previous = { transform: getPageFrameTransform(-size + offset), opacity: 1, zIndex: 3 };
    state.current = { transform: getPageFrameTransform(0), opacity: 1, zIndex: 2 };
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
const getPageFrameStyle = page => pageFrameState.value[page.role];
const getPageFrameClass = page => ({
  [`reader-page-frame--${page.role}`]: true,
  [`reader-page-frame--${page.type}`]: true,
  "reader-page-frame--active": pageTurnActive.value && page.role === movingFrameRole.value
});
const getPageFrameTitle = page => page.item?.title || title.value;
const getPageFrameContent = page => page.item?.content || chapterContent.value;

const getForwardPageOffset = pageNumber => (pageNumber - 1) * pageHeight.value;

const getPageFrameContentStyle = page => {
  const pageNumber = Math.max(1, Math.min(page.number || 1, getChapterPageCount(page.item)));
  return getPageContentTransformStyle(getForwardPageOffset(pageNumber));
};

const toShelf = () => {
  emit("close-reader");
};

const resetReaderRuntimeViewState = () => {
  chapterPageMetrics.value = {};
  activeChapterKey.value = "";
  activeChapterTitle.value = "";
  activeChapterIndex.value = 0;
  currentPage.value = 1;
  totalPages.value = 1;
  verticalProgress.value = 1;
  clearVerticalPreviousBoundaryState();
};

const changeBookSource = async searchBook => {
  if (!searchBook) return;

  const sourceSwitchAnchor = captureReadingHistoryAnchor();
  popBookSourceVisible.value = false;
  showToolBar.value = false;

  try {
    const switched = await switchBookSource(searchBook);
    if (switched) {
      resetReaderRuntimeViewState();
      pendingReadMethodSwitchAnchor.value = sourceSwitchAnchor;
      scheduleReaderLayout({ keepPosition: false });
      return;
    }
    ElMessage.error("换源失败，请稍后再试");
  } catch (error) {
    ElMessage.error("换源失败，请稍后再试");
  }
};

const openBookIntro = () => {
  bookIntroVisible.value = true;
  showToolBar.value = true;
  loadBookIntro();
};

const clampReaderPage = value => {
  const parsedValue = Number(value);
  const nextValue = Number.isFinite(parsedValue) ? Math.trunc(parsedValue) : 1;
  return Math.min(totalPages.value, Math.max(1, nextValue));
};

const setReaderPage = value => {
  currentPage.value = clampReaderPage(value);
};

const clampVerticalProgress = value => {
  const parsedValue = Number(value);
  const nextValue = Number.isFinite(parsedValue) ? Math.trunc(parsedValue) : 1;
  return Math.min(VERTICAL_PROGRESS_MAX, Math.max(1, nextValue));
};

const setVerticalProgress = value => {
  verticalProgress.value = clampVerticalProgress(value);
};

const getVerticalProgressByRatio = ratio => {
  if (VERTICAL_PROGRESS_MAX <= 1) return 1;
  return Math.min(
    VERTICAL_PROGRESS_MAX,
    Math.max(1, Math.round(clampProgressRatio(ratio) * (VERTICAL_PROGRESS_MAX - 1)) + 1)
  );
};

const setVerticalProgressByRatio = ratio => {
  setVerticalProgress(getVerticalProgressByRatio(ratio));
};

const getVerticalProgressRatio = () => {
  if (VERTICAL_PROGRESS_MAX <= 1) return 0;
  return clampProgressRatio((verticalProgress.value - 1) / (VERTICAL_PROGRESS_MAX - 1));
};

const getVerticalPlacementProgress = placement =>
  placement === "last" ? VERTICAL_PROGRESS_MAX : 1;

const getContentViewportSize = () => {
  const viewportElement = contentViewportRef.value;
  return {
    height: Math.max(1, viewportElement?.clientHeight || pageHeight.value || windowSize.value.height || 1),
    width: Math.max(1, viewportElement?.clientWidth || pageWidth.value || windowSize.value.width || 1)
  };
};

const measureChapterPageMetrics = viewportHeight => {
  const viewportElement = contentViewportRef.value;
  if (!viewportElement) return {};

  return Array.from(viewportElement.querySelectorAll(".reader-page-measure__content")).reduce(
    (pageMetricMap, element) => {
      const key = element.dataset.chapterKey;
      const contentHeight = Math.max(1, element.scrollHeight || viewportHeight);
      if (key) {
        pageMetricMap[key] = {
          contentHeight,
          pageCount: Math.max(1, Math.ceil(contentHeight / viewportHeight))
        };
      }
      return pageMetricMap;
    },
    {}
  );
};

const syncReaderLayoutMetrics = () => {
  const { height, width } = getContentViewportSize();
  pageHeight.value = height;
  pageWidth.value = width;

  const pageMetricMap = isPagedReadMode.value ? measureChapterPageMetrics(height) : {};
  chapterPageMetrics.value = pageMetricMap;
  if (isPagedReadMode.value) {
    totalPages.value = Math.max(
      1,
      pageMetricMap[getCurrentPageChapterItem()?.key]?.pageCount || getCurrentPageTotal()
    );
  }
  return { height, width, pageMetricMap };
};

const getVerticalStreamSections = element =>
  Array.from(element?.querySelectorAll(".reader-vertical-stream__item") || []);

const getVerticalStreamSectionItem = section =>
  chapterStreamItemMap.value.get(section?.dataset?.chapterKey) || null;

const getVerticalReadingLine = element => {
  const rect = element.getBoundingClientRect();
  return rect.top + Math.min(180, Math.max(48, element.clientHeight * 0.35));
};

const getVisibleVerticalStreamSection = element => {
  const readingLine = getVerticalReadingLine(element);
  return getVerticalStreamSections(element).find(section => {
    const rect = section.getBoundingClientRect();
    return rect.top <= readingLine && rect.bottom > readingLine;
  }) || getVerticalStreamSections(element)[0] || null;
};

const getVerticalSectionProgress = (element, section) => {
  const sectionTop = section.offsetTop;
  const sectionScrollableHeight = Math.max(1, section.scrollHeight - element.clientHeight);
  return clampProgressRatio((element.scrollTop - sectionTop) / sectionScrollableHeight);
};

const updateVerticalReadingPosition = element => {
  if (!element || !isVerticalReadMode.value) return;

  const section = getVisibleVerticalStreamSection(element);
  const item = getVerticalStreamSectionItem(section);
  if (!section || !item) return;

  setVerticalProgressByRatio(getVerticalSectionProgress(element, section));
  syncActiveChapterItem(item);
};

const requestVerticalStreamBoundary = (element, { includePrevious = true, includeNext = true } = {}) => {
  if (!element || loadingVisible.value || hasBlockingReaderPanel()) return;

  if (includePrevious && element.scrollTop <= VERTICAL_STREAM_PREVIOUS_LOAD_THRESHOLD) {
    loadReaderStreamChapter("previous");
  }

  if (includeNext) {
    const remainingScroll = element.scrollHeight - element.clientHeight - element.scrollTop;
    if (remainingScroll <= VERTICAL_STREAM_LOAD_THRESHOLD) loadReaderStreamChapter("next");
  }
};

const getVerticalPreviousPullMaxHeight = () => {
  const viewportHeight = pageHeight.value || verticalStreamRef.value?.clientHeight || windowSize.value.height || VERTICAL_STREAM_PREVIOUS_PULL_MAX;
  return Math.max(VERTICAL_STREAM_PREVIOUS_PULL_MAX, viewportHeight * VERTICAL_STREAM_PREVIOUS_PULL_VIEWPORT_RATIO);
};

const getClampedVerticalPreviousPullHeight = (value, maxHeight = VERTICAL_STREAM_PREVIOUS_PULL_MAX) => {
  const height = Number(value);
  return Math.min(
    Math.max(VERTICAL_STREAM_PREVIOUS_PULL_MAX, maxHeight),
    Math.max(0, Number.isFinite(height) ? height : 0)
  );
};

const getVerticalPreviousLoadingElement = () =>
  verticalStreamRef.value?.querySelector(".reader-vertical-stream__previous-loading") || null;

const getValidVerticalPreviousPullHeight = height => {
  const heightValue = Number(height);
  return Number.isFinite(heightValue) ? Math.max(0, heightValue) : 0;
};

const renderVerticalPreviousPullHeight = height => {
  const pullHeight = getValidVerticalPreviousPullHeight(height);
  verticalStreamRef.value?.style.setProperty(
    "--reader-vertical-previous-pull-height",
    `${pullHeight}px`
  );
};

const applyVerticalPreviousPullHeight = (
  value,
  maxHeight = VERTICAL_STREAM_PREVIOUS_PULL_MAX,
  { syncReactive = true } = {}
) => {
  const height = getClampedVerticalPreviousPullHeight(value, maxHeight);
  verticalPreviousPullHeightValue = height;
  renderVerticalPreviousPullHeight(height);
  if (syncReactive || (height > 0 && verticalStreamPreviousPullHeight.value <= 0)) {
    verticalStreamPreviousPullHeight.value = height;
  }
  return height;
};

const cancelVerticalPreviousPullHeightFrame = () => {
  if (verticalPreviousPullHeightFrame) window.cancelAnimationFrame(verticalPreviousPullHeightFrame);
  verticalPreviousPullHeightFrame = 0;
  verticalPreviousPendingPullHeight = null;
};

const flushVerticalPreviousPullHeightFrame = () => {
  const pendingPullHeight = verticalPreviousPendingPullHeight;
  if (verticalPreviousPullHeightFrame) window.cancelAnimationFrame(verticalPreviousPullHeightFrame);
  verticalPreviousPullHeightFrame = 0;
  verticalPreviousPendingPullHeight = null;
  if (pendingPullHeight) {
    applyVerticalPreviousPullHeight(pendingPullHeight.value, pendingPullHeight.maxHeight);
  }
};

const setVerticalPreviousPullHeight = (value, maxHeight = VERTICAL_STREAM_PREVIOUS_PULL_MAX) => {
  cancelVerticalPreviousPullHeightFrame();
  applyVerticalPreviousPullHeight(value, maxHeight);
};

const scheduleVerticalPreviousPullHeight = (value, maxHeight = VERTICAL_STREAM_PREVIOUS_PULL_MAX) => {
  verticalPreviousPendingPullHeight = { value, maxHeight };
  if (verticalPreviousPullHeightFrame) return;

  verticalPreviousPullHeightFrame = window.requestAnimationFrame(() => {
    const pendingPullHeight = verticalPreviousPendingPullHeight;
    verticalPreviousPullHeightFrame = 0;
    verticalPreviousPendingPullHeight = null;
    if (pendingPullHeight) {
      applyVerticalPreviousPullHeight(pendingPullHeight.value, pendingPullHeight.maxHeight, {
        syncReactive: false
      });
    }
  });
};

const getVerticalPreviousGestureHeight = deltaY =>
  Math.max(0, deltaY - verticalTouchStartScrollTop) * VERTICAL_STREAM_PREVIOUS_PULL_DAMPING;

const setVerticalPreviousPullHeightByGesture = deltaY => {
  const pullHeight = getVerticalPreviousGestureHeight(deltaY);
  scheduleVerticalPreviousPullHeight(pullHeight, getVerticalPreviousPullMaxHeight());
  return pullHeight;
};

const resetVerticalPreviousPullHeight = () => {
  if (!verticalStreamPreviousLoading.value && !verticalStreamPreviousPreviewItem.value) {
    setVerticalPreviousPullHeight(0);
  }
};

const getVerticalPreviousSlotHeight = () => {
  const loadingElement = getVerticalPreviousLoadingElement();
  const height = loadingElement?.getBoundingClientRect().height;
  return Number.isFinite(height) ? height : verticalPreviousPullHeightValue;
};

const clearVerticalPreviousBoundaryState = () => {
  verticalStreamPreviousPreviewItem.value = null;
  verticalStreamPreviousLoading.value = false;
  setVerticalPreviousPullHeight(0);
};

const prepareVerticalPreviousPreviewItem = item => {
  flushVerticalPreviousPullHeightFrame();
  const slotHeight = getVerticalPreviousSlotHeight();
  verticalStreamPreviousPreviewItem.value = item;
  verticalStreamPreviousLoading.value = false;
  setVerticalPreviousPullHeight(slotHeight, getVerticalPreviousPullMaxHeight());
  return item;
};

const getVerticalPreviousCommitScrollTop = ({ insertedHeight, slotHeight, scrollTop }) =>
  Math.max(0, insertedHeight - slotHeight + scrollTop);

const commitVerticalPreviousStreamItem = async item => {
  flushVerticalPreviousPullHeightFrame();
  const element = verticalStreamRef.value;
  const slotHeight = getVerticalPreviousSlotHeight();
  const scrollTop = element?.scrollTop || 0;

  insertChapterStreamItem(item, "previous");
  clearVerticalPreviousBoundaryState();
  await nextTick();

  const insertedSection = getVerticalStreamSectionByItem(item);
  const measuredInsertedHeight = insertedSection?.getBoundingClientRect().height ||
    insertedSection?.scrollHeight ||
    0;
  const insertedHeight = Math.max(
    0,
    Number.isFinite(measuredInsertedHeight) ? measuredInsertedHeight : 0
  );

  if (element) {
    suppressVerticalStreamBoundaryRequests();
    element.scrollTop = getVerticalPreviousCommitScrollTop({
      insertedHeight,
      slotHeight,
      scrollTop
    });
  }

  syncReaderLayoutMetrics();
  return item;
};

const resolveVerticalPreviousStreamItem = async item => {
  if (verticalTouchActive.value && verticalPreviousPullGestureActive) {
    return prepareVerticalPreviousPreviewItem(item);
  }
  return await commitVerticalPreviousStreamItem(item);
};

const commitVerticalPreviousPreviewItem = () => {
  const item = verticalStreamPreviousPreviewItem.value;
  if (!item) return false;

  commitVerticalPreviousStreamItem(item);
  return true;
};

const finishVerticalTouchGesture = () => {
  verticalTouchActive.value = false;
  verticalTouchStartY = 0;
  verticalTouchStartScrollTop = 0;
  verticalPreviousPullGestureActive = false;
};

const canShowPreviousPullIndicator = element =>
  isVerticalReadMode.value &&
  !loadingVisible.value &&
  !hasBlockingReaderPanel() &&
  !verticalStreamPreviousLoading.value &&
  !verticalStreamPreviousPreviewItem.value &&
  !streamChapterLoadTasks.previous &&
  (element?.scrollTop || 0) <= VERTICAL_STREAM_PREVIOUS_LOAD_THRESHOLD;

const suppressVerticalStreamBoundaryRequests = () => {
  window.clearTimeout(verticalBoundarySuppressTimer);
  verticalBoundaryRequestsSuppressed = true;
  verticalBoundarySuppressTimer = window.setTimeout(() => {
    verticalBoundaryRequestsSuppressed = false;
    verticalBoundarySuppressTimer = 0;
  }, 120);
};

const getVerticalStreamSectionByItem = item => {
  if (!item) return null;
  return getVerticalStreamSections(verticalStreamRef.value)
    .find(section => section.dataset.chapterKey === item.key) || null;
};

const scrollVerticalToStreamItem = async (item, placement = "first") => {
  if (!isVerticalReadMode.value) return;

  await nextTick();
  const section = getVerticalStreamSectionByItem(item);
  if (!section) return;

  suppressVerticalStreamBoundaryRequests();
  section.scrollIntoView({
    block: placement === "last" ? "end" : "start",
    behavior: "auto"
  });
  updateVerticalReadingPosition(verticalStreamRef.value);
};

const scrollVerticalToCurrentProgress = async () => {
  if (!isVerticalReadMode.value) return;

  await nextTick();
  const element = verticalStreamRef.value;
  const section = getVerticalStreamSectionByItem(getCurrentPageChapterItem());
  if (!element || !section) return;

  const sectionScrollableHeight = Math.max(0, section.scrollHeight - element.clientHeight);
  suppressVerticalStreamBoundaryRequests();
  element.scrollTo({
    top: section.offsetTop + getVerticalProgressRatio() * sectionScrollableHeight,
    behavior: "auto"
  });
  updateVerticalReadingPosition(element);
};

const scrollVerticalPageByDirection = direction => {
  const element = verticalStreamRef.value;
  if (!element || !direction) return;

  element.scrollBy({
    top: (direction === "next" ? 1 : -1) * pageHeight.value * VERTICAL_CLICK_SCROLL_RATIO,
    behavior: "smooth"
  });
  requestVerticalStreamBoundary(element);
};

const handleVerticalScroll = event => {
  if (!isVerticalReadMode.value) return;

  const element = event.target;
  updateVerticalReadingPosition(element);
  if (!verticalBoundaryRequestsSuppressed) {
    requestVerticalStreamBoundary(element, { includePrevious: false });
  }
};

const handleVerticalTouchStart = event => {
  const point = getTouchPoint(event);
  verticalTouchActive.value = Boolean(point);
  verticalTouchStartY = point?.y || 0;
  verticalTouchStartScrollTop = verticalStreamRef.value?.scrollTop || 0;
  verticalPreviousPullGestureActive = false;
  resetVerticalPreviousPullHeight();
};

const handleVerticalTouchMove = event => {
  if (!isVerticalReadMode.value || loadingVisible.value || hasBlockingReaderPanel()) return;

  const element = verticalStreamRef.value;
  const point = getTouchPoint(event);
  if (!element || !point || !verticalTouchActive.value) return;

  const deltaY = point.y - verticalTouchStartY;
  if (Math.abs(deltaY) < PAGE_TURN_DRAG_SLOP) return;

  const isPreviousBoundaryLoading = Boolean(
    verticalStreamPreviousPreviewItem.value || verticalStreamPreviousLoading.value || streamChapterLoadTasks.previous
  );
  if (isPreviousBoundaryLoading) {
    const shouldControlPreviousPull =
      verticalPreviousPullGestureActive ||
      (deltaY > 0 &&
        (verticalTouchStartScrollTop <= VERTICAL_STREAM_PREVIOUS_LOAD_THRESHOLD ||
          element.scrollTop <= VERTICAL_STREAM_PREVIOUS_LOAD_THRESHOLD));

    if (shouldControlPreviousPull) {
      const pullHeight = setVerticalPreviousPullHeightByGesture(deltaY);
      if (pullHeight <= 0 && deltaY < 0) {
        verticalPreviousPullGestureActive = false;
        setVerticalPreviousPullHeight(0, getVerticalPreviousPullMaxHeight());
        return;
      }

      event.preventDefault?.();
      verticalPreviousPullGestureActive = true;
    }
    return;
  }

  const isPullingPrevious =
    deltaY > 0 &&
    (verticalTouchStartScrollTop <= VERTICAL_STREAM_PREVIOUS_LOAD_THRESHOLD ||
      element.scrollTop <= VERTICAL_STREAM_PREVIOUS_LOAD_THRESHOLD);
  if (isPullingPrevious) {
    if (!canShowPreviousPullIndicator(element)) {
      resetVerticalPreviousPullHeight();
      return;
    }

    event.preventDefault?.();
    verticalPreviousPullGestureActive = true;
    const pullHeight = setVerticalPreviousPullHeightByGesture(deltaY);
    if (pullHeight >= VERTICAL_STREAM_PREVIOUS_PULL_TRIGGER) {
      loadReaderStreamChapter("previous");
    }
    return;
  }

  resetVerticalPreviousPullHeight();

  requestVerticalStreamBoundary(element, {
    includePrevious: false,
    includeNext: deltaY < 0
  });
};

const handleVerticalTouchEnd = () => {
  flushVerticalPreviousPullHeightFrame();
  const element = verticalStreamRef.value;
  const pullHeight = verticalPreviousPullHeightValue;
  const shouldLoadPrevious =
    pullHeight >= VERTICAL_STREAM_PREVIOUS_PULL_TRIGGER &&
    (verticalTouchStartScrollTop <= VERTICAL_STREAM_PREVIOUS_LOAD_THRESHOLD ||
      (element?.scrollTop || 0) <= VERTICAL_STREAM_PREVIOUS_LOAD_THRESHOLD) &&
    canShowPreviousPullIndicator(element);
  const shouldCommitPreviousPreview = Boolean(verticalStreamPreviousPreviewItem.value);

  finishVerticalTouchGesture();

  if (shouldCommitPreviousPreview) {
    commitVerticalPreviousPreviewItem();
    return;
  }

  if (shouldLoadPrevious) {
    setVerticalPreviousPullHeight(
      Math.max(VERTICAL_STREAM_PREVIOUS_PULL_MAX, pullHeight),
      getVerticalPreviousPullMaxHeight()
    );
    loadReaderStreamChapter("previous");
    return;
  }

  resetVerticalPreviousPullHeight();
};

const handleVerticalTouchCancel = () => {
  flushVerticalPreviousPullHeightFrame();
  const shouldCommitPreviousPreview = Boolean(verticalStreamPreviousPreviewItem.value);
  finishVerticalTouchGesture();
  if (shouldCommitPreviousPreview) {
    commitVerticalPreviousPreviewItem();
    return;
  }
  resetVerticalPreviousPullHeight();
};

const getPendingReaderAnchor = () => {
  if (pendingHistoryRestoreAnchor.value) return pendingHistoryRestoreAnchor.value;
  if (pendingReadMethodSwitchAnchor.value) return pendingReadMethodSwitchAnchor.value;
  return null;
};

const clearPendingReaderAnchor = anchor => {
  if (pendingHistoryRestoreAnchor.value === anchor) pendingHistoryRestoreAnchor.value = null;
  if (pendingReadMethodSwitchAnchor.value === anchor) pendingReadMethodSwitchAnchor.value = null;
};

const applyPendingReaderAnchor = metrics => {
  const anchor = getPendingReaderAnchor();
  if (!anchor) return false;

  const applied = applyReadMethodSwitchAnchor(anchor, {
    measuredPageMetrics: metrics.pageMetricMap
  });
  if (!applied) return false;

  clearPendingReaderAnchor(anchor);
  return true;
};

const applyReaderLayoutPosition = async (metrics, keepPosition) => {
  const appliedAnchor = applyPendingReaderAnchor(metrics);
  if (appliedAnchor) {
    if (isVerticalReadMode.value) await scrollVerticalToCurrentProgress();
    return;
  }

  if (isVerticalReadMode.value) {
    if (!keepPosition) {
      setVerticalProgress(1);
      await scrollVerticalToCurrentProgress();
    }
    return;
  }

  setReaderPage(keepPosition ? currentPage.value : 1);
};

const requestVisibleVerticalStreamBoundary = async () => {
  if (!isVerticalReadMode.value) return;

  await nextTick();
  requestVerticalStreamBoundary(verticalStreamRef.value, { includePrevious: false });
};

const applyReaderLayout = async ({ keepPosition }) => {
  if (!show.value) return;

  await applyReaderLayoutPosition(syncReaderLayoutMetrics(), keepPosition);
  await requestVisibleVerticalStreamBoundary();
};

const {
  cleanupLayoutScheduler,
  scheduleLayout: scheduleReaderLayout
} = useReaderLayoutScheduler({
  applyLayout: applyReaderLayout
});

const showProgress = value => {
  if (isVerticalReadMode.value) {
    setVerticalProgress(value || verticalProgress.value);
    scrollVerticalToCurrentProgress();
    return;
  }

  setReaderPage(value || currentPage.value);
};


const getChapterStreamBoundaryIndex = direction => {
  const indexes = chapterStreamItems.value.map(item => Number(item.index)).filter(Number.isFinite);
  if (!indexes.length) return chapterIndex.value;
  return direction === "previous" ? Math.min(...indexes) : Math.max(...indexes);
};

const hasIntroChapterInStream = () => chapterStreamItems.value.some(isIntroStreamItem);

const hasAdjacentStreamChapter = direction => {
  const boundaryIndex = getChapterStreamBoundaryIndex(direction);
  if (direction === "previous" && boundaryIndex <= 0) return !hasIntroChapterInStream();

  const chapterOffset = direction === "previous" ? -1 : 1;
  return Boolean(catalog.value[boundaryIndex + chapterOffset]);
};

const streamChapterLoadTasks = { previous: null, next: null };

const loadReaderStreamChapter = async direction => {
  if (!isPagedReadMode.value && !isVerticalReadMode.value) return false;
  if (direction === "previous" && verticalStreamPreviousPreviewItem.value) {
    return verticalStreamPreviousPreviewItem.value;
  }
  if (streamChapterLoadTasks[direction]) return streamChapterLoadTasks[direction];

  streamChapterLoadTasks[direction] = (async () => {
    const loadingStartedAt = performance.now();
    const shouldShowVerticalNextLoading = isVerticalReadMode.value && direction === "next";
    const shouldShowVerticalPreviousLoading = isVerticalReadMode.value && direction === "previous";
    if (shouldShowVerticalNextLoading) verticalStreamNextLoading.value = true;
    if (shouldShowVerticalPreviousLoading) {
      flushVerticalPreviousPullHeightFrame();
      setVerticalPreviousPullHeight(
        verticalTouchActive.value
          ? verticalStreamPreviousPullHeight.value
          : Math.max(VERTICAL_STREAM_PREVIOUS_PULL_MAX, verticalStreamPreviousPullHeight.value),
        getVerticalPreviousPullMaxHeight()
      );
      verticalStreamPreviousLoading.value = true;
    }
    try {
      const item = await loadAdjacentChapterStreamItem(direction);
      await waitRemainingTime(loadingStartedAt);
      if (!item) return false;

      if (shouldShowVerticalPreviousLoading) {
        return await resolveVerticalPreviousStreamItem(item);
      }

      insertChapterStreamItem(item, direction);
      await nextTick();
      syncReaderLayoutMetrics();
      return item;
    } finally {
      if (shouldShowVerticalNextLoading) verticalStreamNextLoading.value = false;
      if (shouldShowVerticalPreviousLoading && !verticalStreamPreviousPreviewItem.value) {
        verticalStreamPreviousLoading.value = false;
        setVerticalPreviousPullHeight(0);
      }
      streamChapterLoadTasks[direction] = null;
    }
  })();

  return streamChapterLoadTasks[direction];
};

const ensurePageWindowStreamAroundFrame = ({ forceNext = false, forcePrevious = false } = {}) => {
  if (!isPagedReadMode.value || loadingVisible.value || !show.value) return;

  const currentPageTotal = getCurrentPageTotal();
  if (forcePrevious) loadReaderStreamChapter("previous");
  if (forceNext || currentPage.value >= currentPageTotal - 1) loadReaderStreamChapter("next");
};

const getChapterPlacementPage = (item, placement) => {
  if (placement === "last") return getChapterPageCount(item);
  if (Number.isFinite(Number(placement))) return Number(placement);
  return 1;
};

const setActiveChapterItem = async (item, placement = "first") => {
  if (!item) return false;

  insertChapterStreamItem(item, item.index < activeChapterIndex.value ? "previous" : "next");
  syncActiveChapterItem(item);
  await nextTick();
  const metrics = syncReaderLayoutMetrics();
  if (isVerticalReadMode.value) {
    setVerticalProgress(getVerticalPlacementProgress(placement));
    await scrollVerticalToStreamItem(item, placement);
    return true;
  }

  const pageTotal = Math.max(1, metrics.pageMetricMap[item.key]?.pageCount || getChapterPageCount(item));
  totalPages.value = pageTotal;
  setReaderPage(Math.min(pageTotal, Math.max(1, getChapterPlacementPage(item, placement))));
  return true;
};

const startReading = async () => {
  const item = await prepareStartReading();
  if (!item) return;

  if (isPagedReadMode.value || isVerticalReadMode.value) {
    await setActiveChapterItem(item, "first");
  }
};

const goNextChapterAction = async () => {
  if (!isPagedReadMode.value && !isVerticalReadMode.value) return;

  const nextItem = getSiblingPageChapterItem("next") || await loadReaderStreamChapter("next");
  if (nextItem) await setActiveChapterItem(nextItem, "first");
};

const goPreviousChapterAction = async () => {
  if (!isPagedReadMode.value && !isVerticalReadMode.value) return;

  const previousItem = getSiblingPageChapterItem("previous") || await loadReaderStreamChapter("previous");
  if (previousItem) await setActiveChapterItem(previousItem, "first");
};

const getAdjacentChapterPlacement = direction =>
  direction === "previous" ? "last" : "first";

const turnToAdjacentChapter = async direction => {
  const item = getSiblingPageChapterItem(direction) || await loadReaderStreamChapter(direction);
  if (!item) return false;

  return setActiveChapterItem(item, getAdjacentChapterPlacement(direction));
};

const goNextPageWindow = async () => {
  const currentPageTotal = getCurrentPageTotal();
  if (currentPage.value < currentPageTotal) {
    setReaderPage(currentPage.value + 1);
    return;
  }

  await turnToAdjacentChapter("next");
};

const goPreviousPageWindow = async () => {
  if (currentPage.value > 1) {
    setReaderPage(currentPage.value - 1);
    return;
  }

  await turnToAdjacentChapter("previous");
};

const goNextPage = async () => {
  if (isPagedReadMode.value) await goNextPageWindow();
};

const goPreviousPage = async () => {
  if (isPagedReadMode.value) await goPreviousPageWindow();
};

let readerDrag = null;
let pageTurnAnimationTimer = 0;
let clickPageTurnFrame = 0;
let preparedPageTurnDirection = "";

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
  if (pageTurnAnimationTimer) return false;
  if (isVerticalReadMode.value) return false;
  if (source === "mouse" && event.button !== 0) return false;
  return isPagedReadMode.value;
};

const preparePageFrame = offset => {
  if (!isPagedReadMode.value || Math.abs(offset) < 1) return;
  const direction = offset < 0 ? "next" : "previous";
  if (direction === preparedPageTurnDirection) return;
  preparedPageTurnDirection = direction;
  ensurePageWindowStreamAroundFrame({
    forceNext: offset < 0,
    forcePrevious: offset > 0
  });
};

const applyPageTurnOffset = offset => {
  const size = getPageTurnSize(readAxis.value);
  const nextOffset = Math.max(-size, Math.min(size, offset));
  if (Math.abs(nextOffset) < 1) preparedPageTurnDirection = "";
  pageTurnDragOffset.value = nextOffset;
  preparePageFrame(nextOffset);
};

const {
  cancel: cancelPendingPageTurnOffset,
  flush: flushPageTurnOffset,
  schedule: schedulePageTurnOffset,
  set: setPageTurnOffset
} = useAnimationFrameValue({
  apply: applyPageTurnOffset
});

const resetReaderDrag = () => {
  readerDrag = null;
  pageTurnDragActive.value = false;
  setPageTurnOffset(0);
};

const removeMouseDragListeners = () => {
  window.removeEventListener("mousemove", handleReaderMouseMove);
  window.removeEventListener("mouseup", handleReaderMouseUp);
};

const getPageTurnCommitDelay = () =>
  effectiveReadMethod.value === "无动画" ? 0 : getPageTurnDuration();

const resetPageTurnAfterAnimation = direction => {
  window.clearTimeout(pageTurnAnimationTimer);
  pageTurnAnimationTimer = window.setTimeout(async () => {
    pageTurnAnimationTimer = 0;
    pageTurnDragActive.value = true;
    if (direction === "next") {
      await goNextPage();
    } else {
      await goPreviousPage();
    }
    setPageTurnOffset(0);
    requestAnimationFrame(() => {
      pageTurnDragActive.value = false;
    });
  }, getPageTurnCommitDelay());
};

const cancelPendingClickTurnFrame = () => {
  if (!clickPageTurnFrame) return;
  window.cancelAnimationFrame(clickPageTurnFrame);
  clickPageTurnFrame = 0;
};

const cancelPendingClickPageTurn = () => {
  cancelPendingClickTurnFrame();
};

const canCommitPageTurn = direction => {
  if (direction === "next") return canTurnToNextReaderPage.value;
  if (direction === "previous") return canTurnToPreviousReaderPage.value;
  return false;
};

const finishPageTurn = direction => {
  cancelPendingClickTurnFrame();
  cancelPendingPageTurnOffset();
  pageTurnDragActive.value = false;
  if (!direction || !canCommitPageTurn(direction)) {
    setPageTurnOffset(0);
    return;
  }

  const targetOffset = direction === "next"
    ? -getPageTurnSize(readAxis.value)
    : getPageTurnSize(readAxis.value);
  setPageTurnOffset(targetOffset);
  resetPageTurnAfterAnimation(direction);
};

const startPageTurnFromRest = direction => {
  cancelPendingClickPageTurn();
  if (!direction || !canCommitPageTurn(direction)) return;

  if (effectiveReadMethod.value === "无动画") {
    direction === "next" ? goNextPage() : goPreviousPage();
    return;
  }

  const targetOffset = direction === "next"
    ? -getPageTurnSize(readAxis.value)
    : getPageTurnSize(readAxis.value);
  pageTurnDragActive.value = true;
  setPageTurnOffset(0);
  clickPageTurnFrame = window.requestAnimationFrame(() => {
    pageTurnDragActive.value = false;
    clickPageTurnFrame = window.requestAnimationFrame(() => {
      clickPageTurnFrame = 0;
      setPageTurnOffset(targetOffset);
      resetPageTurnAfterAnimation(direction);
    });
  });
};

const turnReaderPageByCurrentMethod = direction => {
  if (isVerticalReadMode.value) {
    scrollVerticalPageByDirection(direction);
    return;
  }

  if (isPagedReadMode.value) startPageTurnFromRest(direction);
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
    axis: readAxis.value,
    source,
    startX: point.x,
    startY: point.y,
    lastPoint: readAxis.value === "horizontal" ? point.x : point.y,
    lastTime: performance.now(),
    velocity: 0,
    moved: false
  };
  pageTurnDragActive.value = true;
  setPageTurnOffset(0);

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
  const elapsed = Math.max(1, now - readerDrag.lastTime);
  readerDrag.velocity = (primaryPoint - readerDrag.lastPoint) / elapsed;
  readerDrag.lastPoint = primaryPoint;
  readerDrag.lastTime = now;

  schedulePageTurnOffset(movedDelta);
  event.preventDefault();
};

const endReaderDrag = event => {
  if (!readerDrag) return;

  const { axis, moved, velocity, source } = readerDrag;
  flushPageTurnOffset();
  const offset = pageTurnDragOffset.value;
  const threshold = Math.max(
    PAGE_TURN_MIN_DISTANCE,
    getPageTurnSize(axis) * PAGE_TURN_DISTANCE_RATIO
  );
  readerDrag = null;
  if (source === "mouse") removeMouseDragListeners();

  if (!moved) {
    pageTurnDragActive.value = false;
    setPageTurnOffset(0);
    return;
  }

  suppressNextReaderClick.value = true;
  event?.preventDefault?.();
  finishPageTurn(getCommittedPageTurnDirection({
    delta: offset,
    velocity,
    threshold
  }));
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
  if (loadingVisible.value || hasBlockingReaderPanel()) return;

  if (isVerticalReadMode.value) {
    requestVerticalStreamBoundary(verticalStreamRef.value, {
      includePrevious: false,
      includeNext: event.deltaY > 0
    });
    return;
  }

  if (!isPagedReadMode.value) return;

  if (event.deltaY > 0) {
    turnReaderPageByCurrentMethod("next");
    return;
  }
  if (event.deltaY < 0) turnReaderPageByCurrentMethod("previous");
};

const getContent = async note => {
  catalogPanelVisible.value = false;
  const item = await openChapter(note);
  if (!item) return;

  if (isPagedReadMode.value || isVerticalReadMode.value) await setActiveChapterItem(item, "first");
};

const refreshCatalog = () => {
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

  config.value = setReaderSettings({
    ...config.value,
    ...nextPatch,
    clickAreaActions: normalizeClickAreaActions(
      nextPatch.clickAreaActions || config.value.clickAreaActions
    )
  });
};

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
    const bookWithHistory = getBookWithHistory(book);
    resetReaderRuntimeViewState();
    pendingHistoryRestoreAnchor.value = createHistoryRestoreAnchor(bookWithHistory);
    loadReaderBook(bookWithHistory);
  },
  { immediate: true }
);


const { cleanupReadingHistoryPersistence } = useReadingHistoryPersistence({
  activeChapterKey,
  captureReadingHistoryAnchor,
  positionSources: [currentPage, verticalProgress],
  findChapterStreamItemByAnchor,
  isReaderPositioning,
  loadingVisible,
  readingBook
});

watch(
  chapterStream,
  () => {
    scheduleReaderLayout({ keepPosition: true });
  },
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
  () => scheduleReaderLayout({ keepPosition: true }),
  { flush: "post" }
);

onMounted(() => {
  scheduleReaderLayout({ keepPosition: false });
  window.addEventListener("resize", syncInterface);
});

onBeforeUnmount(() => {
  abortReaderTask();
  cleanupLayoutScheduler();
  if (pageTurnAnimationTimer) window.clearTimeout(pageTurnAnimationTimer);
  if (verticalBoundarySuppressTimer) window.clearTimeout(verticalBoundarySuppressTimer);
  cancelPendingPageTurnOffset();
  cleanupReadingHistoryPersistence();
  removeMouseDragListeners();
  window.removeEventListener("resize", syncInterface);
  cleanupReaderBookshelf();
});
</script>

<style src="../styles/reader.styl" lang="stylus"></style>
