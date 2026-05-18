import { computed } from "vue";
import { getReaderTheme } from "../previewData";
import { isHorizontalReadMethod, isVerticalReadMethod, normalizeReadMethod } from "../utils/readMethod";

const MIN_BRIGHTNESS = 30;
const MAX_BRIGHTNESS = 100;
const READ_WIDTH_SIDE_SPACE = 140;
const DESKTOP_READER_GUTTER = 130;
const READ_WIDTH_STEP = 20;

export const useReaderAppearance = ({ config, miniInterface, pageTurnDragActive, windowSize }) => {
  const currentThemeConfig = computed(() => getReaderTheme(config.value.theme));
  const isNight = computed(() => config.value.themeType === "night");
  const brightnessValue = computed(() => {
    const value = Number(config.value.brightness ?? MAX_BRIGHTNESS);
    if (!Number.isFinite(value)) return MAX_BRIGHTNESS;
    return Math.min(MAX_BRIGHTNESS, Math.max(MIN_BRIGHTNESS, value));
  });
  const brightnessMaskStyle = computed(() => ({
    opacity: Number(((MAX_BRIGHTNESS - brightnessValue.value) / MAX_BRIGHTNESS).toFixed(2))
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
  const readWidthConfig = computed(() => {
    let width = config.value.readWidth;
    while (width > windowSize.value.width - READ_WIDTH_SIDE_SPACE) {
      width -= READ_WIDTH_STEP;
    }
    return width;
  });
  const readWidth = computed(() => {
    if (!miniInterface.value) {
      return `${readWidthConfig.value - DESKTOP_READER_GUTTER}px`;
    }
    return `${windowSize.value.width}px`;
  });
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
    return Number.isFinite(duration) ? Math.max(0, duration) : 300;
  };

  const getPageTurnTransition = () => {
    const duration = getPageTurnDuration();
    if (pageTurnDragActive.value || effectiveReadMethod.value === "无动画" || duration <= 0) return "none";
    return `transform ${duration / 1000}s cubic-bezier(0.22, 0.61, 0.36, 1)`;
  };

  return {
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
  };
};
