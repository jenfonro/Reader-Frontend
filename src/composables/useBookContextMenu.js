import { computed, onBeforeUnmount, onMounted, ref } from "vue";

const DEFAULT_LONG_PRESS_DELAY = 520;
const DEFAULT_SUPPRESS_CLICK_DELAY = 700;
const DEFAULT_POINTER_MOVE_LIMIT = 10;

const createClosedMenu = () => ({
  open: false,
  key: "",
  book: null,
  position: { x: 0, y: 0 }
});

const getMenuPoint = point => ({
  x: Number(point?.clientX ?? point?.x) || 0,
  y: Number(point?.clientY ?? point?.y) || 0
});

export const useBookContextMenu = ({
  bookCardSelector = ".home-book-card",
  longPressDelay = DEFAULT_LONG_PRESS_DELAY,
  menuSelector = ".reader-manage-row-menu",
  pointerMoveLimit = DEFAULT_POINTER_MOVE_LIMIT,
  suppressClickDelay = DEFAULT_SUPPRESS_CLICK_DELAY
} = {}) => {
  const bookMenu = ref(createClosedMenu());
  const activeBookMenuKey = computed(() => bookMenu.value.key);
  let longPressTimer = 0;
  let longPressStartPoint = null;
  let longPressStartTarget = null;
  let suppressClickTimer = 0;
  let suppressNextActivation = false;
  let openingClickIgnoreTarget = null;
  let openingClickIgnoreUntil = 0;

  const clearLongPressTimer = () => {
    if (longPressTimer) {
      window.clearTimeout(longPressTimer);
      longPressTimer = 0;
    }
    longPressStartPoint = null;
    longPressStartTarget = null;
  };

  const clearSuppressClickTimer = () => {
    if (!suppressClickTimer) return;
    window.clearTimeout(suppressClickTimer);
    suppressClickTimer = 0;
  };

  const suppressNextBookActivation = () => {
    clearSuppressClickTimer();
    suppressNextActivation = true;
    suppressClickTimer = window.setTimeout(() => {
      suppressNextActivation = false;
      suppressClickTimer = 0;
    }, suppressClickDelay);
  };

  const consumeSuppressedBookClick = () => {
    if (!suppressNextActivation) return false;
    clearSuppressClickTimer();
    suppressNextActivation = false;
    return true;
  };

  const rememberOpeningClick = target => {
    openingClickIgnoreTarget = target || null;
    openingClickIgnoreUntil = openingClickIgnoreTarget ? Date.now() + suppressClickDelay : 0;
  };

  const shouldIgnoreOpeningClick = event => {
    if (!openingClickIgnoreTarget || Date.now() > openingClickIgnoreUntil) return false;
    const target = event.target;
    return target === openingClickIgnoreTarget || openingClickIgnoreTarget.contains?.(target);
  };

  const clearOpeningClickIgnore = () => {
    openingClickIgnoreTarget = null;
    openingClickIgnoreUntil = 0;
  };

  const openBookMenu = (book, point, { suppressBookClick = true, ignoreClickTarget = null } = {}) => {
    clearLongPressTimer();
    if (suppressBookClick) suppressNextBookActivation();
    if (ignoreClickTarget) rememberOpeningClick(ignoreClickTarget);

    bookMenu.value = {
      open: true,
      key: book.key,
      book,
      position: getMenuPoint(point)
    };
  };

  const closeBookMenu = () => {
    clearOpeningClickIgnore();
    bookMenu.value = createClosedMenu();
  };

  const startBookLongPress = (book, event) => {
    if (event.button !== undefined && event.button !== 0) return;
    if (event.target.closest?.("button")) return;

    clearLongPressTimer();
    longPressStartPoint = { x: event.clientX, y: event.clientY };
    longPressStartTarget = event.currentTarget;
    longPressTimer = window.setTimeout(() => {
      openBookMenu(book, longPressStartPoint, { ignoreClickTarget: longPressStartTarget });
    }, longPressDelay);
  };

  const handleBookPointerMove = event => {
    if (!longPressStartPoint) return;

    const offsetX = Math.abs(event.clientX - longPressStartPoint.x);
    const offsetY = Math.abs(event.clientY - longPressStartPoint.y);
    if (offsetX > pointerMoveLimit || offsetY > pointerMoveLimit) clearLongPressTimer();
  };

  const cancelBookLongPress = () => {
    clearLongPressTimer();
  };

  const handleDocumentMenuClick = event => {
    if (!bookMenu.value.open) return;
    if (shouldIgnoreOpeningClick(event)) return;

    const target = event.target;
    if (target?.closest?.(menuSelector)) return;
    if (target?.closest?.(bookCardSelector)) suppressNextBookActivation();
    closeBookMenu();
  };

  const handleMenuEscape = event => {
    if (event.key === "Escape") closeBookMenu();
  };

  const handleMenuViewportChange = () => {
    if (bookMenu.value.open) closeBookMenu();
  };

  onMounted(() => {
    document.addEventListener("click", handleDocumentMenuClick, true);
    window.addEventListener("keydown", handleMenuEscape);
    window.addEventListener("scroll", handleMenuViewportChange, { passive: true });
    window.addEventListener("resize", handleMenuViewportChange, { passive: true });
  });

  onBeforeUnmount(() => {
    clearLongPressTimer();
    clearSuppressClickTimer();
    clearOpeningClickIgnore();
    document.removeEventListener("click", handleDocumentMenuClick, true);
    window.removeEventListener("keydown", handleMenuEscape);
    window.removeEventListener("scroll", handleMenuViewportChange);
    window.removeEventListener("resize", handleMenuViewportChange);
  });

  return {
    activeBookMenuKey,
    bookMenu,
    cancelBookLongPress,
    closeBookMenu,
    consumeSuppressedBookClick,
    handleBookPointerMove,
    openBookMenu,
    startBookLongPress
  };
};
