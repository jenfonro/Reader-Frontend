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
      v-model:page="currentPage"
      :total-pages="totalPages"
      :theme="bottomBarTheme"
      @change-page="showPage"
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
      :get-chapter-flow-item-class="getChapterFlowItemClass"
      :get-horizontal-frame-content="getHorizontalFrameContent"
      :get-horizontal-frame-content-style="getHorizontalFrameContentStyle"
      :get-horizontal-frame-title="getHorizontalFrameTitle"
      :get-horizontal-page-frame-class="getHorizontalPageFrameClass"
      :get-horizontal-page-frame-style="getHorizontalPageFrameStyle"
      :has-reader-content="hasReaderContent"
      :horizontal-page-windows="horizontalPageWindows"
      :horizontal-stage-class="horizontalStageClass"
      :intro-loading="introLoading"
      :is-active-intro-stream-item="isActiveIntroStreamItem"
      :is-horizontal-page-turn="isHorizontalPageTurn"
      :is-intro-stream-item="isIntroStreamItem"
      :is-next-vertical-edge-loading-visible="isNextVerticalEdgeLoadingVisible"
      :is-previous-vertical-edge-loading-visible="isPreviousVerticalEdgeLoadingVisible"
      :is-reader-loading-visible="isReaderLoadingVisible"
      :is-reader-positioning="isReaderPositioning"
      :is-reading-book-in-shelf="isReadingBookInShelf"
      :is-vertical-page-turn="isVerticalPageTurn"
      :measured-chapter-stream-items="measuredChapterStreamItems"
      :mini-interface="miniInterface"
      :reader-loading-text="readerLoadingText"
      :reading-book="readingBook"
      :set-content-viewport-ref="setContentViewportRef"
      :show="show"
      :vertical-edge-loading-style="verticalEdgeLoadingStyle"
      @content-scroll="handleContentScroll"
      @content-touch-end="handleContentTouchEnd"
      @content-touch-move="handleContentTouchMove"
      @content-touch-start="handleContentTouchStart"
      @reader-mouse-down="handleReaderMouseDown"
      @reader-touch-cancel="handleReaderTouchCancel"
      @reader-touch-end="handleReaderTouchEnd"
      @reader-touch-move="handleReaderTouchMove"
      @reader-touch-start="handleReaderTouchStart"
      @reader-wheel="handleReaderWheel"
      @start-reading="startReading"
      @toggle-bookshelf="toggleReadingBookshelf"
    />
  </div>
</template>


<script setup>
import { computed, nextTick, onBeforeUnmount, onMounted, watch } from "vue";
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
import { useReaderPaginationScheduler } from "../composables/useReaderPaginationScheduler.js";
import { useReaderVerticalBoundaryTouch } from "../composables/useReaderVerticalBoundaryTouch.js";
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
const READER_LOADING_PAGE_MIN_DURATION = 2000;

const wait = duration => new Promise(resolve => {
  window.setTimeout(resolve, Math.max(0, duration));
});

const waitRemainingTime = startedAt =>
  wait(READER_LOADING_PAGE_MIN_DURATION - (performance.now() - startedAt));

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
  chapterFlowBlockHeights,
  config,
  contentViewportRef,
  currentPage,
  horizontalChapterPageCounts,
  miniInterface,
  pageHeight,
  pageMaxScrollOffset,
  pageScrollOffset,
  pageTurnDragActive,
  pageTurnDragOffsetX,
  pageWidth,
  pendingHistoryRestoreAnchor,
  pendingReadMethodSwitchAnchor,
  setContentViewportRef,
  show,
  suppressNextReaderClick,
  syncInterface,
  totalPages,
  verticalEdgeLoading,
  verticalStreamLoading,
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
  isHorizontalPageTurn,
  isNight,
  isVerticalPageTurn,
  menuPopperOptions,
  menuSheetTheme,
  pageTurnAxis,
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
const getPageTranslateY = page => -(page - 1) * pageHeight.value;
const getPagedContentStyle = page => ({
  transform: `translate3d(0, ${getPageTranslateY(page)}px, 0)`
});
const chapterStreamItems = computed(() => chapterStream.value);
const measuredChapterStreamItems = computed(() =>
  chapterStreamItems.value.filter(item => !isIntroStreamItem(item))
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
const getVerticalEdgeLoadingHeight = direction =>
  verticalEdgeLoading.value[direction] ? Math.max(1, pageHeight.value) : 0;
const isPreviousVerticalEdgeLoadingVisible = computed(() =>
  isVerticalPageTurn.value && hasReaderContent.value && verticalEdgeLoading.value.previous
);
const isNextVerticalEdgeLoadingVisible = computed(() =>
  isVerticalPageTurn.value && hasReaderContent.value && verticalEdgeLoading.value.next
);
const verticalEdgeLoadingStyle = computed(() => ({
  height: `${Math.round(Math.max(1, pageHeight.value))}px`
}));
const getVerticalLeadingFlowHeight = () => getVerticalEdgeLoadingHeight("previous");
const getVerticalTrailingFlowHeight = () => getVerticalEdgeLoadingHeight("next");
const readerLoadingText = computed(() => loadingText.value);
const getChapterFlowItemClass = item => ({
  "reader-chapter-flow__item--current": item.key === activeChapterKey.value
});

const getChapterFlowOffsetByKey = (targetKey, align = "start") => {
  let offset = getVerticalLeadingFlowHeight();
  for (const item of chapterStreamItems.value) {
    const itemHeight = chapterFlowBlockHeights.value[item.key] || pageHeight.value;
    if (item.key === targetKey) {
      return align === "end" ? Math.max(0, offset + itemHeight - pageHeight.value) : offset;
    }
    offset += itemHeight;
  }
  return align === "end" ? Math.max(0, offset - pageHeight.value) : offset;
};

const getChapterFlowItemAtOffset = offset => {
  let itemOffset = getVerticalLeadingFlowHeight();
  if (offset < itemOffset) {
    const firstItem = chapterStreamItems.value[0] || null;
    return firstItem ? { item: firstItem, itemOffset, itemHeight: pageHeight.value } : null;
  }

  let lastMatch = null;
  for (const item of chapterStreamItems.value) {
    const itemHeight = chapterFlowBlockHeights.value[item.key] || pageHeight.value;
    lastMatch = { item, itemOffset, itemHeight };
    if (offset < itemOffset + itemHeight) return lastMatch;
    itemOffset += itemHeight;
  }

  return lastMatch;
};

const getActiveChapterStreamItemByOffset = offset => {
  const match = getChapterFlowItemAtOffset(offset + pageHeight.value * 0.45);
  return match?.item || null;
};

const getActiveChapterStreamItem = offset => {
  if (!isVerticalPageTurn.value) return null;
  return getActiveChapterStreamItemByOffset(offset);
};

let verticalFlowCommitDepth = 0;

const captureVerticalFlowMetrics = () => {
  const viewportElement = contentViewportRef.value;
  return {
    scrollHeight: Math.max(0, viewportElement?.scrollHeight || 0),
    scrollTop: Math.max(0, viewportElement?.scrollTop ?? pageScrollOffset.value),
    viewportHeight: Math.max(1, pageHeight.value)
  };
};

const getVerticalFlowHeightDelta = beforeMetrics =>
  captureVerticalFlowMetrics().scrollHeight - Math.max(0, beforeMetrics?.scrollHeight || 0);

const getVerticalCurrentOffset = ({ before }) => before.scrollTop;

const getVerticalPrependPreserveOffset = ({ before, heightDelta }) =>
  before.scrollTop + heightDelta;

const getVerticalPreviousPageOffset = ({ before, heightDelta }) =>
  before.scrollTop + heightDelta - before.viewportHeight;

const getVerticalNextPageOffset = ({ before }) =>
  before.scrollTop + before.viewportHeight;

const commitVerticalFlowMutation = async ({ mutate, getTargetOffset }) => {
  const before = captureVerticalFlowMetrics();
  cancelPendingContentScroll();
  verticalFlowCommitDepth += 1;

  try {
    mutate();
    await nextTick();
    const metrics = syncReaderLayoutMetrics();
    const heightDelta = getVerticalFlowHeightDelta(before);
    const targetOffset = getTargetOffset({ before, heightDelta, metrics });
    setPageScrollOffset(targetOffset, { ensureStream: false });
    return metrics;
  } finally {
    verticalFlowCommitDepth -= 1;
  }
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
  "reader-page__content-inner--scroll": isVerticalPageTurn.value,
  "reader-page__content-inner--positioning": isReaderContentStaging.value
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
const createReaderPageFrame = ({ role, type = "empty", number = 0, item = null }) => ({
  key: `${role}-${type}-${item?.key || "empty"}-${number || "none"}`,
  role,
  type,
  number,
  item
});

const getCurrentHorizontalChapterItem = () => {
  const activeItem = chapterStreamItemMap.value.get(activeChapterKey.value);
  if (activeItem) return activeItem;

  return chapterStreamItems.value.find(item => item.index === chapterIndex.value) ||
    chapterStreamItems.value[0] ||
    null;
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
  if (isIntroStreamItem(item)) return 1;

  const measuredCount = Number(horizontalChapterPageCounts.value[item?.key]);
  if (Number.isFinite(measuredCount) && measuredCount > 0) return Math.trunc(measuredCount);
  if (item?.key === getCurrentHorizontalChapterItem()?.key) return Math.max(1, totalPages.value);
  return 1;
};
const getCurrentHorizontalPageTotal = () =>
  getHorizontalChapterPageCount(getCurrentHorizontalChapterItem());

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

const getChapterFlowOffsetByHeightMap = (targetKey, heightMap = {}, defaultHeight = pageHeight.value) => {
  let offset = getVerticalLeadingFlowHeight();
  for (const item of chapterStreamItems.value) {
    if (item.key === targetKey) return offset;
    offset += Math.max(1, heightMap[item.key] || defaultHeight || 1);
  }
  return offset;
};

const getChapterFlowItemMetrics = (
  targetKey,
  heightMap = chapterFlowBlockHeights.value,
  viewportHeight = pageHeight.value
) => {
  const itemOffset = getChapterFlowOffsetByHeightMap(targetKey, heightMap, viewportHeight);
  const itemHeight = Math.max(1, heightMap[targetKey] || viewportHeight || 1);
  const maxItemOffset = Math.max(0, itemHeight - Math.max(1, viewportHeight || 1));
  return { itemOffset, itemHeight, maxItemOffset };
};

const getReaderFocusOffset = viewportHeight =>
  Math.max(1, viewportHeight || pageHeight.value || 1) * 0.45;

const captureReadMethodSwitchAnchor = () => {
  if (loadingVisible.value || !show.value) return null;

  const activeItem = isVerticalPageTurn.value
    ? getActiveChapterStreamItem(pageScrollOffset.value) || chapterStreamItemMap.value.get(activeChapterKey.value)
    : getCurrentHorizontalChapterItem();
  if (!activeItem) return null;

  if (isIntroStreamItem(activeItem)) {
    return {
      type: "intro",
      key: activeItem.key,
      ratio: 0
    };
  }

  if (isVerticalPageTurn.value) {
    const { itemOffset, itemHeight, maxItemOffset } = getChapterFlowItemMetrics(activeItem.key);
    const focusOffset = pageScrollOffset.value + getReaderFocusOffset(pageHeight.value);
    const localOffset = Math.max(0, Math.min(itemHeight, focusOffset - itemOffset));
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

const captureReadingHistoryAnchor = () => {
  const anchor = captureReadMethodSwitchAnchor();
  if (anchor?.type !== "chapter") return null;

  const item = findChapterStreamItemByAnchor(anchor);
  return item && !isIntroStreamItem(item) ? anchor : null;
};

const applyReadMethodSwitchAnchor = (anchor, { viewportHeight, chapterFlowHeights, measuredHorizontalPageCounts }) => {
  if (!anchor) return false;

  if (anchor.type === "intro") {
    const introItem = chapterStreamItems.value.find(isIntroStreamItem);
    if (!introItem) return false;

    syncActiveChapterItem(introItem);
    if (isVerticalPageTurn.value) setPageScrollOffset(0);
    else setReaderPage(1);
    return true;
  }

  if (isVerticalPageTurn.value) {
    const targetItem = findChapterStreamItemByAnchor(anchor);
    if (!targetItem) return false;

    const heightMap = chapterFlowHeights && Object.keys(chapterFlowHeights).length
      ? chapterFlowHeights
      : chapterFlowBlockHeights.value;
    const { itemOffset, maxItemOffset } = getChapterFlowItemMetrics(
      targetItem.key,
      heightMap,
      viewportHeight
    );
    const localOffset = Math.round(
      maxItemOffset * clampProgressRatio(anchor.ratio)
    );
    const targetOffset = itemOffset + localOffset - getReaderFocusOffset(viewportHeight);
    syncActiveChapterItem(targetItem);
    setPageScrollOffset(targetOffset);
    return true;
  }

  if (isHorizontalPageTurn.value) {
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

const hasHorizontalBoundaryLoadingPage = direction =>
  !getHorizontalSiblingChapterItem(direction) && hasAdjacentStreamChapter(direction);

const canTurnToPreviousReaderPage = computed(() =>
  currentPage.value > 1 ||
  Boolean(getHorizontalSiblingChapterItem("previous")) ||
  hasAdjacentStreamChapter("previous")
);
const canTurnToNextReaderPage = computed(() =>
  currentPage.value < getCurrentHorizontalPageTotal() ||
  Boolean(getHorizontalSiblingChapterItem("next")) ||
  hasAdjacentStreamChapter("next")
);

const getPreviousHorizontalPageFrame = () => {
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

  if (hasHorizontalBoundaryLoadingPage("previous")) {
    return createReaderPageFrame({ role: "previous", type: "loading" });
  }

  return createReaderPageFrame({ role: "previous" });
};

const getCurrentHorizontalPageFrame = () => {
  return createReaderPageFrame({
    role: "current",
    type: "chapter",
    number: currentPage.value,
    item: getCurrentHorizontalChapterItem()
  });
};

const getNextHorizontalPageFrame = () => {
  const currentItem = getCurrentHorizontalChapterItem();
  const currentPageTotal = getHorizontalChapterPageCount(currentItem);
  if (currentPage.value < currentPageTotal) {
    return createReaderPageFrame({ role: "next", type: "chapter", number: currentPage.value + 1, item: currentItem });
  }

  const nextItem = getHorizontalSiblingChapterItem("next");
  if (nextItem) {
    return createReaderPageFrame({ role: "next", type: "chapter", number: 1, item: nextItem });
  }

  if (hasHorizontalBoundaryLoadingPage("next")) {
    return createReaderPageFrame({ role: "next", type: "loading" });
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

const toShelf = () => {
  emit("close-reader");
};

const resetReaderRuntimeViewState = () => {
  chapterFlowBlockHeights.value = {};
  horizontalChapterPageCounts.value = {};
  verticalStreamLoading.value = { previous: false, next: false };
  verticalEdgeLoading.value = { previous: false, next: false };
  activeChapterKey.value = "";
  activeChapterTitle.value = "";
  activeChapterIndex.value = 0;
  currentPage.value = 1;
  pageScrollOffset.value = 0;
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
      scheduleReaderPagination({ keepPage: false });
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

const setReaderPage = value => {
  currentPage.value = clampReaderPage(value);
};

const setPageScrollOffset = (value, { syncDom = true, ensureStream = true } = {}) => {
  const nextOffset = clampPageScrollOffset(value);
  pageScrollOffset.value = nextOffset;
  syncReaderPageByScrollOffset();
  syncActiveChapterByScrollOffset(nextOffset);
  if (syncDom) syncContentScrollTop();
  if (ensureStream) ensureVerticalStreamAroundViewport();
};

const getContentViewportSize = () => {
  const viewportElement = contentViewportRef.value;
  return {
    height: Math.max(1, viewportElement?.clientHeight || pageHeight.value || windowSize.value.height || 1),
    width: Math.max(1, viewportElement?.clientWidth || pageWidth.value || windowSize.value.width || 1)
  };
};

const measureChapterFlowHeights = viewportHeight => {
  const viewportElement = contentViewportRef.value;
  if (!viewportElement) return {};

  return Array.from(viewportElement.querySelectorAll(".reader-chapter-flow__item")).reduce(
    (heightMap, element) => {
      const key = element.dataset.chapterKey;
      if (key) heightMap[key] = Math.max(1, element.offsetHeight || element.scrollHeight || viewportHeight);
      return heightMap;
    },
    {}
  );
};

const measureHorizontalPageCounts = viewportHeight => {
  const viewportElement = contentViewportRef.value;
  if (!viewportElement) return {};

  return Array.from(viewportElement.querySelectorAll(".reader-horizontal-measure__content")).reduce(
    (pageCountMap, element) => {
      const key = element.dataset.chapterKey;
      if (key) pageCountMap[key] = Math.max(1, Math.ceil((element.scrollHeight || viewportHeight) / viewportHeight));
      return pageCountMap;
    },
    {}
  );
};

const syncReaderLayoutMetrics = () => {
  const { height, width } = getContentViewportSize();
  pageHeight.value = height;
  pageWidth.value = width;

  if (isVerticalPageTurn.value) {
    const heightMap = measureChapterFlowHeights(height);
    chapterFlowBlockHeights.value = heightMap;
    const totalHeight = chapterStreamItems.value.reduce(
      (sum, item) => sum + Math.max(1, heightMap[item.key] || height),
      getVerticalLeadingFlowHeight() + getVerticalTrailingFlowHeight()
    );
    pageMaxScrollOffset.value = Math.max(0, totalHeight - height);
    totalPages.value = Math.max(1, Math.ceil(Math.max(totalHeight, height) / height));
    return { height, width, heightMap, pageCountMap: {} };
  }

  const pageCountMap = measureHorizontalPageCounts(height);
  horizontalChapterPageCounts.value = pageCountMap;
  pageMaxScrollOffset.value = 0;
  totalPages.value = Math.max(1, pageCountMap[getCurrentHorizontalChapterItem()?.key] || getCurrentHorizontalPageTotal());
  return { height, width, heightMap: {}, pageCountMap };
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
    viewportHeight: metrics.height,
    chapterFlowHeights: metrics.heightMap,
    measuredHorizontalPageCounts: metrics.pageCountMap
  });
  if (!applied) return false;

  clearPendingReaderAnchor(anchor);
  return true;
};

const applyVerticalPagination = (metrics, keepPage) => {
  if (applyPendingReaderAnchor(metrics)) return;

  setPageScrollOffset(keepPage ? pageScrollOffset.value : 0);
};

const applyHorizontalPagination = (metrics, keepPage) => {
  if (applyPendingReaderAnchor(metrics)) return;

  setReaderPage(keepPage ? currentPage.value : 1);
};

const applyReaderPagination = ({ keepPage }) => {
  if (!show.value) return;

  const metrics = syncReaderLayoutMetrics();
  if (isVerticalPageTurn.value) {
    applyVerticalPagination(metrics, keepPage);
    return;
  }

  applyHorizontalPagination(metrics, keepPage);
};

const {
  cleanupPaginationScheduler,
  schedulePagination: scheduleReaderPagination
} = useReaderPaginationScheduler({
  applyPagination: applyReaderPagination
});

const getVerticalStreamPreloadDistance = () => Math.max(pageHeight.value * 1.5, 480);

const setVerticalStreamLoading = (direction, value) => {
  verticalStreamLoading.value = {
    ...verticalStreamLoading.value,
    [direction]: value
  };
};

const isVerticalStreamLoading = direction => Boolean(verticalStreamLoading.value[direction]);

const showVerticalEdgeLoading = direction => {
  if (verticalEdgeLoading.value[direction]) return;

  verticalEdgeLoading.value = {
    ...verticalEdgeLoading.value,
    [direction]: true
  };
};

const clearVerticalEdgeLoading = direction => {
  if (!direction) {
    verticalEdgeLoading.value = { previous: false, next: false };
    return;
  }

  if (!verticalEdgeLoading.value[direction]) return;
  verticalEdgeLoading.value = {
    ...verticalEdgeLoading.value,
    [direction]: false
  };
};

const beginVerticalStreamLoading = direction => {
  if (isVerticalStreamLoading(direction)) return false;

  setVerticalStreamLoading(direction, true);
  return true;
};

const finishVerticalStreamLoading = direction => {
  setVerticalStreamLoading(direction, false);
};

const fetchVerticalStreamChapter = direction => loadAdjacentChapterStreamItem(direction);

const getVerticalInsertTargetOffset = (direction, advancePage = false) => {
  if (advancePage) {
    return direction === "previous" ? getVerticalPreviousPageOffset : getVerticalNextPageOffset;
  }

  return direction === "previous" ? getVerticalPrependPreserveOffset : getVerticalCurrentOffset;
};

const commitVerticalLoadingPage = direction =>
  commitVerticalFlowMutation({
    mutate: () => showVerticalEdgeLoading(direction),
    getTargetOffset: direction === "previous" ? getVerticalPreviousPageOffset : getVerticalNextPageOffset
  });

const clearVerticalLoadingPage = direction => {
  if (!verticalEdgeLoading.value[direction]) return Promise.resolve(false);

  return commitVerticalFlowMutation({
    mutate: () => clearVerticalEdgeLoading(direction),
    getTargetOffset: direction === "previous" ? getVerticalPrependPreserveOffset : getVerticalCurrentOffset
  });
};

const commitVerticalChapterInsertion = (item, direction, { advancePage = false, replaceLoading = false } = {}) =>
  commitVerticalFlowMutation({
    mutate: () => {
      insertChapterStreamItem(item, direction);
      if (replaceLoading) clearVerticalEdgeLoading(direction);
    },
    getTargetOffset: replaceLoading
      ? getVerticalInsertTargetOffset(direction, false)
      : getVerticalInsertTargetOffset(direction, advancePage)
  });

const loadVerticalStreamChapter = async direction => {
  if (!isVerticalPageTurn.value || loadingVisible.value || !show.value) return false;
  if (!hasAdjacentStreamChapter(direction)) return false;
  if (!beginVerticalStreamLoading(direction)) return false;

  try {
    const item = await fetchVerticalStreamChapter(direction);
    if (!item) return false;

    await commitVerticalChapterInsertion(item, direction);
    return item;
  } finally {
    finishVerticalStreamLoading(direction);
  }
};

function ensureVerticalStreamAroundViewport({ forceNext = false, forcePrevious = false } = {}) {
  if (!isVerticalPageTurn.value || loadingVisible.value || !show.value) return;

  const preloadDistance = getVerticalStreamPreloadDistance();
  const maxOffset = getMaxPageScrollOffset();
  if (forcePrevious) {
    loadVerticalStreamChapter("previous");
  }
  if (forceNext || maxOffset - pageScrollOffset.value <= preloadDistance) {
    loadVerticalStreamChapter("next");
  }
}

const showPage = value => {
  const targetPage = value || currentPage.value;
  if (isVerticalPageTurn.value) {
    setPageScrollOffset((targetPage - 1) * pageHeight.value);
    return;
  }

  setReaderPage(targetPage);
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

const hasIntroChapterInStream = () => chapterStreamItems.value.some(isIntroStreamItem);

const hasAdjacentStreamChapter = direction => {
  const boundaryIndex = getChapterStreamBoundaryIndex(direction);
  if (direction === "previous" && boundaryIndex <= 0) return !hasIntroChapterInStream();

  const chapterOffset = direction === "previous" ? -1 : 1;
  return Boolean(catalog.value[boundaryIndex + chapterOffset]);
};

const horizontalStreamLoadTasks = { previous: null, next: null };

const loadHorizontalStreamChapter = async direction => {
  if (!isHorizontalPageTurn.value) return false;
  if (horizontalStreamLoadTasks[direction]) return horizontalStreamLoadTasks[direction];
  if (!hasAdjacentStreamChapter(direction)) return false;

  horizontalStreamLoadTasks[direction] = (async () => {
    const loadingPageStartedAt = performance.now();
    try {
      const item = await loadAdjacentChapterStreamItem(direction);
      await waitRemainingTime(loadingPageStartedAt);
      if (!item) return false;

      insertChapterStreamItem(item, direction);
      await nextTick();
      syncReaderLayoutMetrics();
      return item;
    } finally {
      horizontalStreamLoadTasks[direction] = null;
    }
  })();

  return horizontalStreamLoadTasks[direction];
};

const ensureHorizontalStreamAroundPage = ({ forceNext = false, forcePrevious = false } = {}) => {
  if (!isHorizontalPageTurn.value || loadingVisible.value || !show.value) return;

  const currentPageTotal = getCurrentHorizontalPageTotal();
  if (forcePrevious) loadHorizontalStreamChapter("previous");
  if (forceNext || currentPage.value >= currentPageTotal - 1) loadHorizontalStreamChapter("next");
};

const getHorizontalPlacementPage = (item, placement) => {
  if (placement === "last") return getHorizontalChapterPageCount(item);
  if (Number.isFinite(Number(placement))) return Number(placement);
  return 1;
};

const setHorizontalActiveChapterItem = async (item, placement = "first") => {
  if (!item) return false;

  insertChapterStreamItem(item, item.index < activeChapterIndex.value ? "previous" : "next");
  syncActiveChapterItem(item);
  await nextTick();
  const metrics = syncReaderLayoutMetrics();
  const pageTotal = Math.max(1, metrics.pageCountMap[item.key] || getHorizontalChapterPageCount(item));
  totalPages.value = pageTotal;
  setReaderPage(Math.min(pageTotal, Math.max(1, getHorizontalPlacementPage(item, placement))));
  return true;
};

const scrollToChapterFlowItem = (item, align = "start") => {
  if (!item) return false;
  syncReaderLayoutMetrics();
  setPageScrollOffset(getChapterFlowOffsetByKey(item.key, align));
  return true;
};

const startReading = async () => {
  const item = await prepareStartReading();
  if (!item) return;

  if (isHorizontalPageTurn.value) {
    await setHorizontalActiveChapterItem(item, "first");
    return;
  }

  insertChapterStreamItem(item, item.index < activeChapterIndex.value ? "previous" : "next");
  pendingReadMethodSwitchAnchor.value = null;
  syncActiveChapterItem(item);
  await nextTick();
  syncReaderLayoutMetrics();
  scrollToChapterFlowItem(item, "start");
};

const goNextChapterAction = async () => {
  if (isHorizontalPageTurn.value) {
    const nextItem = getHorizontalSiblingChapterItem("next") || await loadHorizontalStreamChapter("next");
    if (nextItem) await setHorizontalActiveChapterItem(nextItem, "first");
    return;
  }

  if (!isVerticalPageTurn.value) return;
  await turnToVerticalAdjacentChapter("next");
};

const goPreviousChapterAction = async () => {
  if (isHorizontalPageTurn.value) {
    const previousItem = getHorizontalSiblingChapterItem("previous") || await loadHorizontalStreamChapter("previous");
    if (previousItem) {
      await setHorizontalActiveChapterItem(previousItem, "last");
      return;
    }
    return;
  }

  if (!isVerticalPageTurn.value) return;
  await turnToVerticalAdjacentChapter("previous");
};

const getHorizontalAdjacentChapterPlacement = direction =>
  direction === "previous" ? "last" : "first";

const turnToHorizontalAdjacentChapter = async direction => {
  const item = getHorizontalSiblingChapterItem(direction) || await loadHorizontalStreamChapter(direction);
  if (!item) return false;

  return setHorizontalActiveChapterItem(item, getHorizontalAdjacentChapterPlacement(direction));
};

const goNextHorizontalPage = async () => {
  const currentPageTotal = getCurrentHorizontalPageTotal();
  if (currentPage.value < currentPageTotal) {
    setReaderPage(currentPage.value + 1);
    return;
  }

  await turnToHorizontalAdjacentChapter("next");
};

const goPreviousHorizontalPage = async () => {
  if (currentPage.value > 1) {
    setReaderPage(currentPage.value - 1);
    return;
  }

  await turnToHorizontalAdjacentChapter("previous");
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
    await turnToVerticalAdjacentChapter("next");
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
    await turnToVerticalAdjacentChapter("previous");
    return;
  }
};

let readerDrag = null;
let pageTurnAnimationTimer = 0;
let horizontalClickTurnFrame = 0;
let preparedHorizontalDirection = "";

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

const {
  cancel: cancelPendingHorizontalOffset,
  flush: flushHorizontalPageTurnOffset,
  schedule: scheduleHorizontalPageTurnOffset,
  set: setHorizontalPageTurnOffset
} = useAnimationFrameValue({
  apply: applyHorizontalPageTurnOffset
});

const {
  cancel: cancelPendingContentScroll,
  schedule: scheduleContentScrollOffset
} = useAnimationFrameValue({
  apply: value => setPageScrollOffset(value, { syncDom: false })
});

const flushContentScrollState = () => {
  if (!isVerticalPageTurn.value) return;
  const viewportElement = contentViewportRef.value;
  if (!viewportElement) return;

  cancelPendingContentScroll();
  const nextOffset = viewportElement.scrollTop;
  if (Math.abs(nextOffset - pageScrollOffset.value) > 1) {
    setPageScrollOffset(nextOffset, { syncDom: false });
  }
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
    pageTurnAnimationTimer = 0;
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

const getVerticalPageTurnOffset = direction =>
  pageScrollOffset.value + (direction === "previous" ? -pageHeight.value : pageHeight.value);

const moveVerticalPageByOffset = direction => {
  const targetOffset = getVerticalPageTurnOffset(direction);
  const nextOffset = clampPageScrollOffset(targetOffset);
  if (nextOffset === pageScrollOffset.value) return false;

  setPageScrollOffset(nextOffset);
  return true;
};

const turnToVerticalAdjacentChapter = async direction => {
  if (moveVerticalPageByOffset(direction)) return true;
  if (!hasAdjacentStreamChapter(direction)) return false;
  if (!beginVerticalStreamLoading(direction)) return false;

  let loadingPageCommitted = false;
  let loadingPageStartedAt = 0;
  try {
    await commitVerticalLoadingPage(direction);
    loadingPageCommitted = true;
    loadingPageStartedAt = performance.now();

    const item = await fetchVerticalStreamChapter(direction);
    await waitRemainingTime(loadingPageStartedAt);
    if (!item) {
      await clearVerticalLoadingPage(direction);
      return false;
    }

    await commitVerticalChapterInsertion(item, direction, { replaceLoading: true });
    return true;
  } finally {
    finishVerticalStreamLoading(direction);
    if (loadingPageCommitted && verticalEdgeLoading.value[direction]) {
      if (loadingPageStartedAt) await waitRemainingTime(loadingPageStartedAt);
      await clearVerticalLoadingPage(direction);
    }
  }
};

const loadVerticalAdjacentChapterAtBoundary = async direction => {
  if (!isVerticalPageTurn.value || loadingVisible.value || !show.value) return false;

  return turnToVerticalAdjacentChapter(direction);
};

const requestPreviousVerticalStreamAtBoundary = () => {
  if (!isVerticalPageTurn.value || loadingVisible.value || hasBlockingReaderPanel()) return;
  if (!isReaderAtScrollStart() || !canTurnToPreviousReaderPage.value) return;

  loadVerticalAdjacentChapterAtBoundary("previous");
};

const requestNextVerticalStreamAtBoundary = () => {
  if (!isVerticalPageTurn.value || loadingVisible.value || hasBlockingReaderPanel()) return;
  if (!isReaderAtScrollEnd() || !canTurnToNextReaderPage.value) return;

  loadVerticalAdjacentChapterAtBoundary("next");
};

const {
  handleContentTouchEnd,
  handleContentTouchMove,
  handleContentTouchStart
} = useReaderVerticalBoundaryTouch({
  hasBlockingReaderPanel,
  isReaderAtScrollEnd,
  isReaderAtScrollStart,
  isVerticalPageTurn,
  loadingVisible,
  requestNext: requestNextVerticalStreamAtBoundary,
  requestPrevious: requestPreviousVerticalStreamAtBoundary
});

const finishVerticalPageTurnDrag = ({ delta, velocity, threshold }) => {
  pageTurnDragActive.value = false;
  const direction = getCommittedPageTurnDirection({ delta, velocity, threshold });

  if (direction === "next") requestNextVerticalStreamAtBoundary();
  if (direction === "previous") requestPreviousVerticalStreamAtBoundary();
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
  finishHorizontalPageTurn(getCommittedPageTurnDirection({
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
  if (!isVerticalPageTurn.value || loadingVisible.value || hasBlockingReaderPanel()) return;

  if (event.deltaY > 0) {
    requestNextVerticalStreamAtBoundary();
    return;
  }
  if (event.deltaY < 0) requestPreviousVerticalStreamAtBoundary();
};

const handleContentScroll = event => {
  if (!isVerticalPageTurn.value || verticalFlowCommitDepth > 0) return;

  const nextOffset = event.currentTarget.scrollTop;
  if (Math.abs(nextOffset - pageScrollOffset.value) <= 1) return;

  scheduleContentScrollOffset(nextOffset);
};

const getContent = async note => {
  catalogPanelVisible.value = false;
  const item = await openChapter(note);
  if (!item) return;

  if (isHorizontalPageTurn.value) {
    await setHorizontalActiveChapterItem(item, "first");
    return;
  }

  syncActiveChapterItem(item);
  await nextTick();
  syncReaderLayoutMetrics();
  setPageScrollOffset(getChapterFlowOffsetByKey(item.key, "start"));
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
  currentPage,
  findChapterStreamItemByAnchor,
  flushContentScrollState,
  isReaderPositioning,
  loadingVisible,
  pageScrollOffset,
  readingBook
});

watch(
  chapterStream,
  () => {
    scheduleReaderPagination({ keepPage: true });
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
  () => scheduleReaderPagination({ keepPage: true }),
  { flush: "post" }
);

onMounted(() => {
  scheduleReaderPagination({ keepPage: false });
  window.addEventListener("resize", syncInterface);
});

onBeforeUnmount(() => {
  abortReaderTask();
  cleanupPaginationScheduler();
  if (pageTurnAnimationTimer) window.clearTimeout(pageTurnAnimationTimer);
  cancelPendingHorizontalOffset();
  cleanupReadingHistoryPersistence();
  cancelPendingContentScroll();
  removeMouseDragListeners();
  window.removeEventListener("resize", syncInterface);
  cleanupReaderBookshelf();
});
</script>

<style src="../styles/reader.styl" lang="stylus"></style>
