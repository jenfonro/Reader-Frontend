import { READ_METHODS } from "../utils/readMethod";
import { clickAreaModes } from "../utils/clickArea";

export const textColors = [
  { name: "白色", value: "#f6f5ef" },
  { name: "米色", value: "#ded8bf" },
  { name: "浅绿", value: "#dff0d8" },
  { name: "浅蓝", value: "#dce9f0" },
  { name: "黑色", value: "#111111" },
  { name: "深灰", value: "#333333" },
  { name: "灰色", value: "#555555" }
];

export const backgroundChoices = [
  { name: "空背景", value: "", background: "transparent" }
];

export const fontOptions = [
  { name: "系统字体", value: 0 },
  { name: "黑体", value: 1 },
  { name: "楷体", value: 2 },
  { name: "宋体", value: 3 },
  { name: "仿宋", value: 4 }
];

export const readMethods = READ_METHODS;

export const panelTitleMap = {
  font: "字体设置",
  background: "背景设置",
  spacing: "间距设置",
  more: "更多设置"
};

export const choicePickers = {
  chineseFont: {
    title: "简繁体设置",
    field: "chineseFont",
    options: [
      { label: "简体", value: "简体" },
      { label: "繁体", value: "繁体" }
    ]
  },
  clickAreaMode: {
    title: "点击区域模式",
    field: "clickAreaMode",
    options: clickAreaModes
  }
};

const getViewportWidth = () => (typeof window === "undefined" ? 160 : window.innerWidth);

export const createReadSettingsConfigRules = () => {
  const widthStep = Math.floor(getViewportWidth() / 160);

  return {
    brightness: { min: 30, max: 100, delta: 1 },
    fontSize: { min: 8, delta: 1 },
    fontWeight: { min: 100, max: 900, delta: 100 },
    animateMSTime: { min: 0, max: 500, delta: 50 },
    lineHeight: { min: 1, max: 5, delta: 0.2 },
    paragraphSpace: { min: 0, max: 5, delta: 0.2 },
    pageHorizontalMargin: { min: 0, max: 120, delta: 2 },
    pageTopMargin: { min: 0, max: 120, delta: 2 },
    pageBottomMargin: { min: 0, max: 120, delta: 2 },
    readWidth: {
      min: Math.min(widthStep, 4) * 160,
      max: widthStep * 160,
      delta: 160
    }
  };
};

export const clampReadSettingNumber = (rules, name, value, defaultValue) => {
  const rule = rules[name] || {};
  const parsed = Number(value);
  const baseValue = Number.isFinite(parsed) ? parsed : defaultValue;
  const minValue = "min" in rule ? rule.min : baseValue;
  const maxValue = "max" in rule ? rule.max : baseValue;
  const nextValue = Math.min(maxValue, Math.max(minValue, baseValue));

  return Number.isInteger(rule.delta) ? Math.round(nextValue) : Number(nextValue.toFixed(1));
};
