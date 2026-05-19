import { ref } from "vue";
import { getReaderSettings } from "../data/readerSettings";
import { getMiniInterface, getWindowSize } from "../utils/interface";

export const useReaderViewState = () => {
  const show = ref(true);
  const contentViewportRef = ref(null);
  const verticalStreamRef = ref(null);
  const currentPage = ref(1);
  const totalPages = ref(1);
  const verticalProgress = ref(1);
  const pageHeight = ref(1);
  const pageWidth = ref(1);
  const chapterPageMetrics = ref({});
  const pendingReadMethodSwitchAnchor = ref(null);
  const pendingHistoryRestoreAnchor = ref(null);
  const activeChapterKey = ref("");
  const activeChapterTitle = ref("");
  const activeChapterIndex = ref(0);
  const pageTurnDragActive = ref(false);
  const pageTurnDragOffset = ref(0);
  const suppressNextReaderClick = ref(false);
  const miniInterface = ref(getMiniInterface());
  const windowSize = ref(getWindowSize());
  const config = ref(getReaderSettings());

  const setContentViewportRef = element => {
    contentViewportRef.value = element;
  };

  const setVerticalStreamRef = element => {
    verticalStreamRef.value = element;
  };

  const syncInterface = () => {
    miniInterface.value = getMiniInterface();
    windowSize.value = getWindowSize();
  };

  return {
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
    pendingHistoryRestoreAnchor,
    pendingReadMethodSwitchAnchor,
    setContentViewportRef,
    setVerticalStreamRef,
    show,
    suppressNextReaderClick,
    syncInterface,
    totalPages,
    verticalProgress,
    windowSize
  };
};
