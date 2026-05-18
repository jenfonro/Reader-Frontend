import { ref } from "vue";
import { getReaderSettings } from "../data/readerSettings";
import { getMiniInterface, getWindowSize } from "../utils/interface";

const createDirectionState = () => ({ previous: false, next: false });

export const useReaderViewState = () => {
  const show = ref(true);
  const contentViewportRef = ref(null);
  const currentPage = ref(1);
  const totalPages = ref(1);
  const pageHeight = ref(1);
  const pageWidth = ref(1);
  const pageMaxScrollOffset = ref(0);
  const chapterFlowBlockHeights = ref({});
  const horizontalChapterPageCounts = ref({});
  const verticalStreamLoading = ref(createDirectionState());
  const verticalEdgeLoading = ref(createDirectionState());
  const pendingReadMethodSwitchAnchor = ref(null);
  const pendingHistoryRestoreAnchor = ref(null);
  const activeChapterKey = ref("");
  const activeChapterTitle = ref("");
  const activeChapterIndex = ref(0);
  const pageTurnDragActive = ref(false);
  const pageTurnDragOffsetX = ref(0);
  const pageScrollOffset = ref(0);
  const suppressNextReaderClick = ref(false);
  const miniInterface = ref(getMiniInterface());
  const windowSize = ref(getWindowSize());
  const config = ref(getReaderSettings());

  const setContentViewportRef = element => {
    contentViewportRef.value = element;
  };

  const syncInterface = () => {
    miniInterface.value = getMiniInterface();
    windowSize.value = getWindowSize();
  };

  return {
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
  };
};
