const VERTICAL_EDGE_LOAD_DISTANCE = 48;

const getTouchPoint = event => {
  const touch = event.touches?.[0] || event.changedTouches?.[0];
  return touch ? { x: touch.clientX, y: touch.clientY } : null;
};

export const useReaderVerticalBoundaryTouch = ({
  hasBlockingReaderPanel,
  isReaderAtScrollEnd,
  isReaderAtScrollStart,
  isVerticalPageTurn,
  loadingVisible,
  requestNext,
  requestPrevious
}) => {
  let touchStartY = 0;
  let touchStartedAtTop = false;
  let touchStartedAtBottom = false;
  let previousRequested = false;
  let nextRequested = false;

  const resetTouchState = () => {
    touchStartY = 0;
    touchStartedAtTop = false;
    touchStartedAtBottom = false;
    previousRequested = false;
    nextRequested = false;
  };

  const handleContentTouchStart = event => {
    if (!isVerticalPageTurn.value) return;

    const point = getTouchPoint(event);
    touchStartY = point?.y || 0;
    touchStartedAtTop = isReaderAtScrollStart();
    touchStartedAtBottom = isReaderAtScrollEnd();
    previousRequested = false;
    nextRequested = false;
  };

  const handleContentTouchMove = event => {
    if (!isVerticalPageTurn.value || loadingVisible.value || hasBlockingReaderPanel()) return;

    const point = getTouchPoint(event);
    if (!point) return;

    const pullPreviousDistance = point.y - touchStartY;
    if (
      touchStartedAtTop &&
      !previousRequested &&
      pullPreviousDistance >= VERTICAL_EDGE_LOAD_DISTANCE
    ) {
      previousRequested = true;
      requestPrevious();
      return;
    }

    const pullNextDistance = touchStartY - point.y;
    if (
      touchStartedAtBottom &&
      !nextRequested &&
      pullNextDistance >= VERTICAL_EDGE_LOAD_DISTANCE
    ) {
      nextRequested = true;
      requestNext();
    }
  };

  return {
    handleContentTouchEnd: resetTouchState,
    handleContentTouchMove,
    handleContentTouchStart
  };
};
