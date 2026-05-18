import { getReaderThemeOption } from "../previewData";
import { normalizeClickAreaActions } from "../utils/clickArea";
import { normalizeReadMethod } from "../utils/readMethod";
import { readPersistentJson, writePersistentJson } from "./persistentStorage";
import { defaultReaderSettings } from "./readerDefaultSettings";
import { readerSettingsStorageKey } from "./userStorageKeys";

const numberRules = {
  brightness: { min: 30, max: 100, defaultValue: 100 },
  font: { min: 0, defaultValue: defaultReaderSettings.font },
  fontSize: { min: 8, defaultValue: defaultReaderSettings.fontSize },
  fontWeight: {
    min: 100,
    max: 900,
    defaultValue: defaultReaderSettings.fontWeight
  },
  animateMSTime: {
    min: 0,
    max: 500,
    defaultValue: defaultReaderSettings.animateMSTime
  },
  lineHeight: { min: 1, max: 5, defaultValue: defaultReaderSettings.lineHeight },
  paragraphSpace: { min: 0, max: 5, defaultValue: defaultReaderSettings.paragraphSpace },
  pageHorizontalMargin: {
    min: 0,
    max: 120,
    defaultValue: defaultReaderSettings.pageHorizontalMargin
  },
  pageTopMargin: { min: 0, max: 120, defaultValue: defaultReaderSettings.pageTopMargin },
  pageBottomMargin: {
    min: 0,
    max: 120,
    defaultValue: defaultReaderSettings.pageBottomMargin
  },
  readWidth: { min: 160, defaultValue: defaultReaderSettings.readWidth }
};

const isPlainObject = value =>
  value !== null && typeof value === "object" && !Array.isArray(value);

const normalizeNumber = (value, rule) => {
  const parsed = Number(value);
  const baseValue = Number.isFinite(parsed) ? parsed : rule.defaultValue;
  const minValue = "min" in rule ? rule.min : baseValue;
  const maxValue = "max" in rule ? rule.max : baseValue;
  return Math.min(maxValue, Math.max(minValue, baseValue));
};

const normalizeString = (value, defaultValue = "") =>
  typeof value === "string" ? value : defaultValue;

const normalizeBoolean = (value, defaultValue = false) =>
  typeof value === "boolean" ? value : defaultValue;

const normalizeArray = (value, defaultValue = []) =>
  [...(Array.isArray(value) ? value : defaultValue)];

const normalizePlainObject = (value, defaultValue = {}) => ({
  ...(isPlainObject(value) ? value : defaultValue)
});

export const normalizeReaderSettings = value => {
  const source = isPlainObject(value) ? value : {};
  const themeOption = getReaderThemeOption(source.theme);

  return {
    name: normalizeString(source.name, defaultReaderSettings.name),
    theme: themeOption.value,
    font: normalizeNumber(source.font, numberRules.font),
    chineseFont: normalizeString(source.chineseFont, defaultReaderSettings.chineseFont),
    fontSize: normalizeNumber(source.fontSize, numberRules.fontSize),
    fontWeight: normalizeNumber(source.fontWeight, numberRules.fontWeight),
    fontColor: normalizeString(source.fontColor, themeOption.fontColor),
    bodyColor: normalizeString(source.bodyColor, defaultReaderSettings.bodyColor),
    contentColor: normalizeString(source.contentColor, defaultReaderSettings.contentColor),
    popupColor: normalizeString(source.popupColor, defaultReaderSettings.popupColor),
    themeType: themeOption.themeType,
    readMethod: normalizeReadMethod(source.readMethod),
    brightness: normalizeNumber(source.brightness, numberRules.brightness),
    eyeCare: normalizeBoolean(source.eyeCare, defaultReaderSettings.eyeCare),
    clickAreaMode: normalizeString(source.clickAreaMode, defaultReaderSettings.clickAreaMode),
    clickAreaActions: normalizeClickAreaActions(source.clickAreaActions),
    animateMSTime: normalizeNumber(source.animateMSTime, numberRules.animateMSTime),
    readWidth: normalizeNumber(source.readWidth, numberRules.readWidth),
    lineHeight: normalizeNumber(source.lineHeight, numberRules.lineHeight),
    paragraphSpace: normalizeNumber(source.paragraphSpace, numberRules.paragraphSpace),
    pageHorizontalMargin: normalizeNumber(
      source.pageHorizontalMargin,
      numberRules.pageHorizontalMargin
    ),
    pageTopMargin: normalizeNumber(source.pageTopMargin, numberRules.pageTopMargin),
    pageBottomMargin: normalizeNumber(source.pageBottomMargin, numberRules.pageBottomMargin),
    contentBGImg: normalizeString(source.contentBGImg, defaultReaderSettings.contentBGImg),
    customBGImgList: normalizeArray(
      source.customBGImgList,
      defaultReaderSettings.customBGImgList
    ),
    customFontsMap: normalizePlainObject(
      source.customFontsMap,
      defaultReaderSettings.customFontsMap
    )
  };
};

export const getReaderSettings = () =>
  normalizeReaderSettings(readPersistentJson(readerSettingsStorageKey, null));

export const setReaderSettings = settings => {
  const nextSettings = normalizeReaderSettings(settings);
  writePersistentJson(readerSettingsStorageKey, nextSettings);
  return nextSettings;
};
