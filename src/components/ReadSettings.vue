<template>
  <div class="reading-settings" :class="{ night: isNight, day: !isNight }">
    <transition name="reading-settings-panel" mode="out-in">
      <div v-if="activePanel === 'main'" class="reading-settings__body" key="main">
      <div class="setting-row setting-row--brightness">
        <span class="setting-row__label">亮度</span>
        <input
          :value="config.brightness"
          class="setting-range"
          type="range"
          min="0"
          max="100"
          aria-label="亮度"
          @input="setNumberConfig('brightness', $event.target.value)"
        />
        <button
          type="button"
          class="setting-text-action"
          :class="{ selected: config.eyeCare }"
          @click="setConfig('eyeCare', !config.eyeCare)"
        >
          护眼模式
        </button>
      </div>

      <div class="setting-row setting-row--font">
        <span class="setting-row__label">字体</span>
        <button type="button" class="setting-pill setting-font-step" @click="decConfig('fontSize')">A<sup>-</sup></button>
        <input
          class="setting-font-size setting-number-input"
          type="number"
          :min="configRules.fontSize.min"
          :value="config.fontSize"
          aria-label="字体大小"
          @change="setNumberConfig('fontSize', $event.target.value)"
        />
        <button type="button" class="setting-pill setting-font-step" @click="incConfig('fontSize')">A<sup>+</sup></button>
        <button type="button" class="setting-pill setting-font-config" @click="openPanel('font')">
          字体设置 ›
        </button>
      </div>

      <div class="setting-row">
        <span class="setting-row__label">颜色</span>
        <div class="setting-scroll-row">
          <button
            v-for="item in readerThemeOptions"
            :key="item.value"
            type="button"
            class="setting-color-dot setting-theme-dot"
            :class="{ selected: config.theme === item.value }"
            :style="{ background: item.preview }"
            :aria-label="item.name"
            @click="setTheme(item)"
          >
            <span v-if="config.theme === item.value">✓</span>
          </button>
        </div>
      </div>

      <div class="setting-row">
        <span class="setting-row__label">背景</span>
        <div class="setting-scroll-row">
          <button
            v-for="item in backgroundChoices"
            :key="item.value"
            type="button"
            class="setting-background-card"
            :class="{ selected: config.contentBGImg === item.value }"
            :style="getBackgroundPreviewStyle(item)"
            :aria-label="item.name"
            @click="setBGImg(item.value)"
          ></button>
          <button type="button" class="setting-background-card setting-background-card--custom" @click="openPanel('background')">
            <span>＋</span>
            <small>自定义</small>
          </button>
        </div>
      </div>

      <div class="setting-row">
        <span class="setting-row__label">翻页</span>
        <div
          class="setting-segmented"
          :style="{ '--setting-segmented-count': readMethods.length }"
        >
          <button
            v-for="method in readMethods"
            :key="method"
            type="button"
            :class="{ selected: config.readMethod === method }"
            @click="setReadMethod(method)"
          >
            {{ method }}
          </button>
        </div>
      </div>

      <div class="setting-row">
        <span class="setting-row__label">其他</span>
        <div class="setting-button-group">
          <button type="button" class="setting-pill setting-pill--group" @click="openPanel('spacing')">间距设置</button>
          <button type="button" class="setting-pill setting-pill--group" @click="openPanel('more')">更多 ›</button>
        </div>
      </div>

      </div>

      <div v-else class="reading-settings__subpanel" :key="activePanel">
      <div class="setting-subpanel__header">
        <button type="button" class="setting-subpanel__back" @click="activePanel = 'main'">‹</button>
        <span>{{ activePanelTitle }}</span>
      </div>

      <div v-if="activePanel === 'font'" class="setting-subpanel__body">
        <div class="setting-subpanel-row setting-subpanel-row--font-family">
          <span class="setting-choice-label">正文字体设置</span>
          <div class="setting-scroll-row setting-font-options">
            <button
              v-for="font in fontOptions"
              :key="font.value"
              type="button"
              class="setting-font-option"
              :class="{ selected: config.font === font.value }"
              @click="setConfig('font', font.value)"
            >
              {{ font.name }}
            </button>
          </div>
        </div>
        <div
          v-for="item in fontStepperItems"
          :key="item.name"
          class="setting-subpanel-row setting-subpanel-row--stepper"
        >
          <span class="setting-subpanel-row__label">{{ item.label }}</span>
          <div class="setting-subpanel-stepper">
            <button
              type="button"
              class="setting-pill setting-font-step setting-subpanel-stepper__button"
              @click="decConfig(item.name)"
            >
              −
            </button>
            <input
              v-if="item.editable"
              class="setting-number-input setting-subpanel-number"
              type="number"
              :min="item.min"
              :max="item.max"
              :step="item.step"
              :value="item.value"
              @change="setNumberConfig(item.name, $event.target.value)"
            />
            <span v-else class="setting-subpanel-value">{{ item.value }}</span>
            <button
              type="button"
              class="setting-pill setting-font-step setting-subpanel-stepper__button"
              @click="incConfig(item.name)"
            >
              +
            </button>
          </div>
        </div>
        <div class="setting-subpanel-row setting-subpanel-row--font-color">
          <span class="setting-choice-label">字体颜色</span>
          <div class="setting-scroll-row setting-font-colors">
            <button
              v-for="item in textColors"
              :key="item.value"
              type="button"
              class="setting-color-dot"
              :class="{ selected: config.fontColor === item.value }"
              :style="{ background: item.value }"
              :aria-label="item.name"
              @click="setConfig('fontColor', item.value)"
            ></button>
          </div>
        </div>
      </div>

      <div v-else-if="activePanel === 'background'" class="setting-subpanel__body">
        <div class="setting-subpanel-row">
          <span>页面背景</span>
          <input v-model="config.bodyColor" type="color" />
        </div>
        <div class="setting-subpanel-row">
          <span>阅读背景</span>
          <input v-model="config.contentColor" type="color" />
        </div>
        <div class="setting-subpanel-row">
          <span>浮窗背景</span>
          <input v-model="config.popupColor" type="color" />
        </div>
        <button type="button" class="setting-list-button" @click="uploadBGFile">
          <span>上传背景图片</span>
          <span>›</span>
        </button>
        <input ref="bgFileRef" type="file" accept="image/*" @change="onBGFileChange" style="display:none" />
      </div>

      <div v-else-if="activePanel === 'spacing'" class="setting-subpanel__body">
        <div
          v-for="item in spacingStepperItems"
          :key="item.name"
          class="setting-subpanel-row setting-subpanel-row--stepper setting-subpanel-row--spacing"
        >
          <span class="setting-subpanel-row__label">{{ item.label }}</span>
          <div class="setting-subpanel-stepper">
            <button
              type="button"
              class="setting-pill setting-font-step setting-subpanel-stepper__button"
              @click="decConfig(item.name)"
            >
              −
            </button>
            <span class="setting-subpanel-value">{{ item.value }}</span>
            <button
              type="button"
              class="setting-pill setting-font-step setting-subpanel-stepper__button"
              @click="incConfig(item.name)"
            >
              +
            </button>
          </div>
        </div>
      </div>

      <div v-else class="setting-subpanel__body">
        <button type="button" class="setting-list-button setting-choice-row" @click="openChoicePicker('chineseFont')">
          <span>简繁体设置</span>
          <span class="setting-choice-row__value">{{ getChoiceLabel('chineseFont') }} ›</span>
        </button>
        <button type="button" class="setting-list-button setting-choice-row" @click="openChoicePicker('pageMode')">
          <span>页面模式</span>
          <span class="setting-choice-row__value">{{ getChoiceLabel('pageMode') }} ›</span>
        </button>
        <button type="button" class="setting-list-button setting-choice-row" @click="openChoicePicker('clickAreaMode')">
          <span>点击区域模式</span>
          <span class="setting-choice-row__value">{{ getChoiceLabel('clickAreaMode') }} ›</span>
        </button>
        <button type="button" class="setting-list-button setting-choice-row" @click="openClickAreaEditor">
          <span>点击区域设置</span>
          <span class="setting-choice-row__value">{{ currentClickAreaModeLabel }} ›</span>
        </button>
        <div
          v-for="item in moreStepperItems"
          :key="item.name"
          class="setting-subpanel-row setting-subpanel-row--stepper"
        >
          <span class="setting-subpanel-row__label">{{ item.label }}</span>
          <div class="setting-subpanel-stepper">
            <button
              type="button"
              class="setting-pill setting-font-step setting-subpanel-stepper__button"
              @click="decConfig(item.name)"
            >
              −
            </button>
            <span class="setting-subpanel-value">{{ item.value }}</span>
            <button
              type="button"
              class="setting-pill setting-font-step setting-subpanel-stepper__button"
              @click="incConfig(item.name)"
            >
              +
            </button>
          </div>
        </div>
      </div>
      </div>
    </transition>
    <transition name="setting-picker">
      <div v-if="activeChoicePicker" class="setting-picker" @click.self="closeChoicePicker">
        <div class="setting-picker__panel">
          <div class="setting-picker__title">{{ activeChoiceTitle }}</div>
          <button
            v-for="option in activeChoiceOptions"
            :key="option.value"
            type="button"
            class="setting-picker__option"
            :class="{ selected: isChoiceSelected(option) }"
            @click="selectChoiceOption(option)"
          >
            <span>{{ option.label }}</span>
            <span v-if="isChoiceSelected(option)">✓</span>
          </button>
        </div>
      </div>
    </transition>
  </div>
</template>

<script setup>
import { computed, onBeforeUnmount, onMounted, reactive, ref, watch } from "vue";
import { getMiniInterface } from "../utils/interface";
import { previewConfig, readerThemeOptions } from "../previewData";
import { READ_METHODS, normalizeReadMethod } from "../utils/readMethod";
import {
  clickAreaModes,
  getClickAreaModeLabel,
  normalizeClickAreaActions
} from "../utils/clickArea";

defineOptions({
  name: "ReadSettings"
});

const props = defineProps({
  visible: {
    type: Boolean,
    default: false
  },
  readerConfig: {
    type: Object,
    default: null
  }
});

const emit = defineEmits(["update-config", "open-click-area-editor"]);

const textColors = [
  { name: "白色", value: "#f6f5ef" },
  { name: "米色", value: "#ded8bf" },
  { name: "浅绿", value: "#dff0d8" },
  { name: "浅蓝", value: "#dce9f0" },
  { name: "黑色", value: "#111111" },
  { name: "深灰", value: "#333333" },
  { name: "灰色", value: "#555555" }
];
const backgroundChoices = [
  { name: "空背景", value: "", background: "transparent" }
];
const fontOptions = [
  { name: "系统字体", value: 0 },
  { name: "黑体", value: 1 },
  { name: "楷体", value: 2 },
  { name: "宋体", value: 3 },
  { name: "仿宋", value: 4 }
];
const readMethods = READ_METHODS;
const choicePickers = {
  chineseFont: {
    title: "简繁体设置",
    field: "chineseFont",
    options: [
      { label: "简体", value: "简体" },
      { label: "繁体", value: "繁体" }
    ]
  },
  pageMode: {
    title: "页面模式",
    field: "pageMode",
    options: [
      { label: "自适应", value: "自适应" },
      { label: "手机模式", value: "手机模式" }
    ]
  },
  clickAreaMode: {
    title: "点击区域模式",
    field: "clickAreaMode",
    options: clickAreaModes
  }
};
const configRules = {
  brightness: { min: 0, max: 100, delta: 1 },
  fontSize: { min: 8, delta: 1 },
  fontWeight: { min: 100, max: 900, delta: 100 },
  animateMSTime: { min: 0, max: 500, delta: 50 },
  lineHeight: { min: 1, max: 5, delta: 0.2 },
  paragraphSpace: { min: 0, max: 5, delta: 0.2 },
  pageHorizontalMargin: { min: 0, max: 120, delta: 2 },
  pageTopMargin: { min: 0, max: 120, delta: 2 },
  pageBottomMargin: { min: 0, max: 120, delta: 2 },
  readWidth: {
    min: Math.min(Math.floor(window.innerWidth / 160), 4) * 160,
    max: Math.floor(window.innerWidth / 160) * 160,
    delta: 160
  }
};

const buildLocalConfig = source => {
  const merged = {
    ...previewConfig,
    brightness: 100,
    eyeCare: true,
    readMethod: "上下",
    ...(source || {})
  };
  return {
    ...merged,
    readMethod: normalizeReadMethod(merged.readMethod),
    clickAreaActions: normalizeClickAreaActions(merged.clickAreaActions)
  };
};

const bgFileRef = ref(null);
const activePanel = ref("main");
const activeChoicePicker = ref("");
const config = reactive(buildLocalConfig(props.readerConfig));
const miniInterface = ref(getMiniInterface());

const isNight = computed(() => config.themeType === "night");
const activePanelTitle = computed(() => {
  const titleMap = {
    font: "字体设置",
    background: "背景设置",
    spacing: "间距设置",
    more: "更多设置"
  };
  return titleMap[activePanel.value] || "设置";
});
const currentClickAreaModeLabel = computed(() => getClickAreaModeLabel(config.clickAreaMode));
const activeChoice = computed(() => choicePickers[activeChoicePicker.value] || null);
const activeChoiceTitle = computed(() => activeChoice.value?.title || "");
const activeChoiceOptions = computed(() => activeChoice.value?.options || []);

const buildStepperItem = ({ label, name, editable = false }) => {
  const rule = configRules[name] || {};
  return {
    label,
    name,
    editable,
    value: config[name],
    min: rule.min,
    max: rule.max,
    step: rule.delta || 1
  };
};

const fontStepperItems = computed(() => [
  buildStepperItem({ label: "字体大小", name: "fontSize", editable: true }),
  buildStepperItem({ label: "字体粗细", name: "fontWeight" })
]);

const spacingStepperItems = computed(() => {
  const items = [
    buildStepperItem({ label: "段落行高", name: "lineHeight" }),
    buildStepperItem({ label: "段落间距", name: "paragraphSpace" }),
    buildStepperItem({ label: "左右边距", name: "pageHorizontalMargin" }),
    buildStepperItem({ label: "顶部边距", name: "pageTopMargin" }),
    buildStepperItem({ label: "底部边距", name: "pageBottomMargin" })
  ];
  if (!miniInterface.value) {
    items.push(buildStepperItem({ label: "页面宽度", name: "readWidth" }));
  }
  return items;
});

const moreStepperItems = computed(() => [
  buildStepperItem({ label: "动画时长", name: "animateMSTime" })
]);

const syncInterface = () => {
  miniInterface.value = getMiniInterface();
};

const syncLocalConfig = value => {
  Object.assign(config, buildLocalConfig(value));
};

const emitConfigPatch = patch => {
  const nextPatch = { ...patch };
  if (Object.prototype.hasOwnProperty.call(nextPatch, "clickAreaActions")) {
    nextPatch.clickAreaActions = normalizeClickAreaActions(nextPatch.clickAreaActions);
  }
  emit("update-config", nextPatch);
};

const openPanel = panel => {
  activeChoicePicker.value = "";
  activePanel.value = panel;
};

const setConfig = (name, value) => {
  if (config[name] === value) return;
  config[name] = value;
  if (name === "clickAreaMode") {
    const clickAreaActions = normalizeClickAreaActions(config.clickAreaActions);
    config.clickAreaActions = clickAreaActions;
    emitConfigPatch({ [name]: value, clickAreaActions });
    return;
  }
  emitConfigPatch({ [name]: value });
};
const setTheme = themeOption => {
  if (!themeOption) return;
  Object.assign(config, {
    theme: themeOption.value,
    themeType: themeOption.themeType,
    fontColor: themeOption.fontColor
  });
  emitConfigPatch({
    theme: themeOption.value,
    themeType: themeOption.themeType,
    fontColor: themeOption.fontColor
  });
};

const clampConfigNumber = (name, value) => {
  const rule = configRules[name] || {};
  const parsed = Number(value);
  if (!Number.isFinite(parsed)) return config[name];
  const minValue = "min" in rule ? rule.min : parsed;
  const maxValue = "max" in rule ? rule.max : parsed;
  const nextValue = Math.min(maxValue, Math.max(minValue, parsed));
  return Number.isInteger(rule.delta) ? Math.round(nextValue) : Number(nextValue.toFixed(1));
};

const setNumberConfig = (name, value) => {
  setConfig(name, clampConfigNumber(name, value));
};

const getChoiceLabel = name => {
  const picker = choicePickers[name];
  if (!picker) return "";
  const value = config[picker.field];
  return picker.options.find(option => option.value === value)?.label || value;
};

const openChoicePicker = name => {
  activeChoicePicker.value = name;
};

const closeChoicePicker = () => {
  activeChoicePicker.value = "";
};

const isChoiceSelected = option => {
  const picker = activeChoice.value;
  return picker?.field ? config[picker.field] === option.value : false;
};

const selectChoiceOption = option => {
  const picker = activeChoice.value;
  if (!picker) return;
  if (picker.field === "pageMode") {
    setPageMode(option.value);
  } else {
    setConfig(picker.field, option.value);
  }
  closeChoicePicker();
};

const openClickAreaEditor = () => {
  activeChoicePicker.value = "";
  emit("open-click-area-editor");
};

const setPageMode = pageMode => {
  setConfig("pageMode", pageMode);
};

const setReadMethod = readMethod => {
  setConfig("readMethod", normalizeReadMethod(readMethod));
};

const incConfig = name => {
  const rule = configRules[name];
  const value = +config[name];
  const nextValue = "max" in rule ? Math.min(rule.max, value + rule.delta) : value + rule.delta;
  setNumberConfig(name, nextValue);
};

const decConfig = name => {
  const rule = configRules[name];
  const value = +config[name];
  const nextValue = "min" in rule ? Math.max(rule.min, value - rule.delta) : value - rule.delta;
  setNumberConfig(name, nextValue);
};

const setBGImg = item => {
  setConfig("contentBGImg", item);
};

const getBackgroundPreviewStyle = item => {
  if (item.value) {
    return { backgroundImage: `url(${item.value})` };
  }
  return { background: item.background };
};

const uploadBGFile = () => {
  bgFileRef.value?.click();
};

const onBGFileChange = event => {
  event.target.value = null;
};

watch(
  () => props.readerConfig,
  value => {
    syncLocalConfig(value);
  },
  { deep: true }
);

onMounted(() => {
  window.addEventListener("resize", syncInterface);
});

onBeforeUnmount(() => {
  window.removeEventListener("resize", syncInterface);
});
</script>

<style lang="stylus" scoped>
.reading-settings {
  --reading-settings-main-height: 398px;
  position: relative;
  user-select: none;
  margin: -16px;
  margin-bottom: -13px;
  padding: 18px 22px 20px;
  height: var(--reading-settings-main-height);
  max-height: 52vh;
  overflow: hidden;
  background: var(--reader-panel-background, #ede7da);
  color: var(--reader-font-color, inherit);
  text-align: left;
  box-sizing: border-box;
}

.reading-settings__body,
.reading-settings__subpanel {
  height: 100%;
  overflow-y: auto;
  scrollbar-width: none;
}

.reading-settings__body::-webkit-scrollbar,
.reading-settings__subpanel::-webkit-scrollbar {
  display: none;
}

.reading-settings-panel-enter-active,
.reading-settings-panel-leave-active {
  transition: opacity 0.18s ease, transform 0.18s ease;
}

.reading-settings-panel-enter-from,
.reading-settings-panel-leave-to {
  opacity: 0;
  transform: translateY(22px);
}

.setting-row,
.setting-subpanel-row {
  display: grid;
  grid-template-columns: 54px minmax(0, 1fr);
  align-items: center;
  gap: 12px;
  margin-bottom: 18px;
}

.setting-row--brightness {
  grid-template-columns: 54px minmax(0, 1fr) auto;
}

.setting-row--font {
  grid-template-columns: 54px 42px 42px 42px minmax(0, 1fr);
}

.setting-row__label {
  font-size: 16px;
  line-height: 1;
  white-space: nowrap;
}

.setting-range {
  width: 100%;
  height: 34px;
  accent-color: rgba(54, 47, 34, 0.36);
}

.setting-text-action,
.setting-pill,
.setting-segmented,
.setting-list-button {
  background: rgba(120, 104, 75, 0.12);
}

.setting-text-action,
.setting-pill,
.setting-list-button {
  border: 0;
  color: inherit;
  cursor: pointer;
}

.setting-text-action,
.setting-pill {
  height: 42px;
  border-radius: 999px;
  padding: 0 18px;
  font-size: 16px;
  line-height: 1;
}

.setting-text-action.selected,
.setting-pill.selected,
.setting-segmented button.selected,
.setting-list-button.selected {
  background: rgba(255, 250, 235, 0.62);
  box-shadow: inset 0 0 0 1px rgba(120, 104, 75, 0.16);
}

.setting-font-config {
  justify-self: start;
  width: 118px;
  min-width: 0;
  padding: 0 14px;
}

.setting-font-step {
  width: 42px;
  padding: 0;
  font-size: 14px;
}

.setting-font-step sup {
  font-size: 10px;
  line-height: 1;
}

.setting-pill--group {
  flex: 1;
}

.setting-font-size {
  width: 42px;
  height: 42px;
  padding: 0;
  text-align: center;
  font-size: 18px;
  line-height: 42px;
}

.setting-number-input {
  min-width: 0;
  border: 0;
  border-radius: 999px;
  background: rgba(120, 104, 75, 0.12);
  color: inherit;
  outline: none;
  box-sizing: border-box;
  appearance: textfield;
}

.setting-number-input::-webkit-outer-spin-button,
.setting-number-input::-webkit-inner-spin-button {
  appearance: none;
  margin: 0;
}

.setting-scroll-row {
  min-width: 0;
  display: flex;
  align-items: center;
  gap: 18px;
  overflow-x: auto;
  scrollbar-width: none;
}

.setting-scroll-row::-webkit-scrollbar {
  display: none;
}

.setting-color-dot {
  width: 42px;
  height: 42px;
  flex: 0 0 42px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  border: 2px solid transparent;
  border-radius: 50%;
  color: inherit;
  cursor: pointer;
  box-shadow: 0 0 0 1px rgba(120, 104, 75, 0.18);
}

.setting-color-dot.selected {
  border-color: currentColor;
  box-shadow: 0 0 0 1px currentColor, inset 0 0 0 2px rgba(255, 250, 235, 0.68);
}

.setting-theme-dot span {
  width: 18px;
  height: 18px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  background: rgba(255, 250, 235, 0.72);
  color: #4d402b;
  font-size: 12px;
  line-height: 1;
}

.setting-font-options,
.setting-font-colors {
  justify-content: flex-start;
}

.setting-font-option {
  height: 34px;
  flex: 0 0 auto;
  padding: 0 14px;
  border: 0;
  border-radius: 999px;
  background: rgba(120, 104, 75, 0.12);
  color: inherit;
  font-size: 14px;
  cursor: pointer;
}

.setting-font-option.selected {
  background: rgba(255, 250, 235, 0.62);
  box-shadow: inset 0 0 0 1px rgba(120, 104, 75, 0.16);
}

.setting-background-card {
  width: 92px;
  height: 38px;
  flex: 0 0 92px;
  display: inline-flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  overflow: hidden;
  border: 1px solid rgba(120, 104, 75, 0.14);
  border-radius: 10px;
  background-size: cover;
  background-position: center;
  color: inherit;
  cursor: pointer;
}

.setting-background-card.selected {
  border-color: currentColor;
  box-shadow: inset 0 0 0 1px currentColor;
}

.setting-background-card--custom {
  background: rgba(120, 104, 75, 0.12);
  font-size: 16px;
}

.setting-background-card--custom small {
  font-size: 11px;
  opacity: 0.66;
}

.setting-segmented {
  min-width: 0;
  display: grid;
  grid-template-columns: repeat(var(--setting-segmented-count), minmax(0, 1fr));
  gap: 0;
  padding: 4px;
  border-radius: 999px;
}

.setting-segmented button {
  height: 38px;
  border: 0;
  border-radius: 999px;
  background: transparent;
  color: inherit;
  font-size: 16px;
  cursor: pointer;
}

.setting-button-group {
  display: flex;
  gap: 12px;
}

.setting-subpanel__header {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 16px;
  font-size: 17px;
  font-weight: 600;
}

.setting-subpanel__back {
  width: 34px;
  height: 34px;
  border: 0;
  border-radius: 50%;
  background: rgba(120, 104, 75, 0.12);
  color: inherit;
  font-size: 26px;
  line-height: 1;
  cursor: pointer;
}

.setting-list-button {
  width: 100%;
  min-height: 42px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 10px;
  padding: 0 16px;
  border-radius: 16px;
  font-size: 15px;
}

.setting-choice-row__value {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  color: rgba(80, 68, 48, 0.66);
  white-space: nowrap;
}

.setting-subpanel-row {
  min-height: 42px;
  margin-bottom: 12px;
}

.setting-subpanel-row--font-family,
.setting-subpanel-row--font-color,
.setting-subpanel-row--stepper {
  grid-template-columns: max-content minmax(0, 1fr);
}

.setting-subpanel-row--spacing {
  grid-template-columns: max-content max-content;
}

.setting-subpanel-row--spacing .setting-subpanel-stepper {
  justify-self: start;
}

.setting-subpanel-row__label,
.setting-choice-label {
  min-width: 0;
  font-size: 15px;
  line-height: 1;
  white-space: nowrap;
}

.setting-subpanel-stepper {
  min-width: 154px;
  display: grid;
  grid-template-columns: 42px minmax(46px, auto) 42px;
  align-items: center;
  justify-self: end;
  gap: 8px;
}

.setting-subpanel-stepper__button {
  font-size: 20px;
}

.setting-subpanel-stepper__button:active {
  transform: scale(0.94);
}

.setting-subpanel-value,
.setting-subpanel-number {
  width: 46px;
  height: 42px;
  min-width: 0;
  border-radius: 999px;
  background: rgba(120, 104, 75, 0.12);
  color: inherit;
  text-align: center;
  font-size: 15px;
  line-height: 42px;
  white-space: nowrap;
  box-sizing: border-box;
}

.setting-subpanel-value {
  display: inline-flex;
  align-items: center;
  justify-content: center;
}

.setting-subpanel-number {
  padding: 0 6px;
  border: 0;
  outline: none;
  appearance: textfield;
}

.setting-picker {
  position: absolute;
  inset: 0;
  z-index: 20;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 20px;
  background: rgba(45, 38, 28, 0.18);
  box-sizing: border-box;
}

.setting-picker__panel {
  width: min(280px, 100%);
  padding: 12px;
  border-radius: 18px;
  background: var(--reader-panel-background, #ede7da);
  box-shadow: 0 16px 38px rgba(72, 55, 34, 0.18);
  box-sizing: border-box;
}

.setting-picker__title {
  padding: 2px 4px 10px;
  font-size: 16px;
  line-height: 1;
}

.setting-picker__option {
  width: 100%;
  min-height: 40px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-top: 6px;
  padding: 0 14px;
  border: 0;
  border-radius: 14px;
  background: transparent;
  color: inherit;
  font-size: 15px;
  cursor: pointer;
}

.setting-picker__option.selected {
  background: rgba(255, 250, 235, 0.62);
}

.setting-picker-enter-active,
.setting-picker-leave-active {
  transition: opacity 0.16s ease;
}

.setting-picker-enter-active .setting-picker__panel,
.setting-picker-leave-active .setting-picker__panel {
  transition: transform 0.16s ease;
}

.setting-picker-enter-from,
.setting-picker-leave-to {
  opacity: 0;
}

.setting-picker-enter-from .setting-picker__panel,
.setting-picker-leave-to .setting-picker__panel {
  transform: translateY(12px) scale(0.98);
}

.night {
  .setting-text-action,
  .setting-pill,
  .setting-segmented,
  .setting-list-button,
  .setting-subpanel-value,
  .setting-number-input {
    background: rgba(255, 255, 255, 0.08);
  }

  .setting-font-option {
    background: transparent;
  }

  .setting-font-option.selected,
  .setting-picker__option.selected {
    background: rgba(255, 255, 255, 0.16);
  }

  .setting-choice-row__value {
    color: rgba(255, 255, 255, 0.52);
  }
}

@media (max-width: 560px) {
  .reading-settings {
    --reading-settings-main-height: 378px;
    padding: 16px 18px 18px;
  }

  .setting-row,
  .setting-subpanel-row {
    grid-template-columns: 44px minmax(0, 1fr);
    gap: 10px;
  }

  .setting-subpanel-row--font-family,
  .setting-subpanel-row--font-color,
  .setting-subpanel-row--stepper {
    grid-template-columns: max-content minmax(0, 1fr);
  }

  .setting-subpanel-row--spacing {
    grid-template-columns: max-content max-content;
  }

  .setting-subpanel-stepper {
    min-width: 140px;
    grid-template-columns: 38px minmax(42px, auto) 38px;
    gap: 7px;
  }

  .setting-subpanel-stepper__button {
    font-size: 18px;
  }

  .setting-subpanel-value,
  .setting-subpanel-number {
    width: 42px;
    height: 38px;
    font-size: 14px;
    line-height: 38px;
  }

  .setting-row--brightness {
    grid-template-columns: 44px minmax(0, 1fr) auto;
  }

  .setting-row--font {
    grid-template-columns: 44px 38px 38px 38px minmax(0, 1fr);
  }

  .setting-row__label,
  .setting-segmented button,
  .setting-pill,
  .setting-text-action {
    font-size: 14px;
  }

  .setting-pill,
  .setting-text-action {
    height: 38px;
    padding: 0 12px;
  }

  .setting-font-step {
    width: 38px;
    padding: 0;
    font-size: 13px;
  }

  .setting-font-size {
    width: 38px;
    height: 38px;
    font-size: 16px;
    line-height: 38px;
  }

  .setting-font-config {
    width: 96px;
    padding: 0 10px;
  }

  .setting-color-dot {
    width: 38px;
    height: 38px;
    flex-basis: 38px;
  }

  .setting-background-card {
    width: 76px;
    flex-basis: 76px;
  }
}
</style>
