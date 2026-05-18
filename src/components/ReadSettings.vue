<template>
  <div class="reading-settings" :class="{ night: isNight, day: !isNight }">
    <transition name="reading-settings-panel" mode="out-in">
      <ReadSettingsMainPanel
        v-if="activePanel === MAIN_PANEL"
        key="main"
        :background-choices="backgroundChoices"
        :config="config"
        :config-rules="configRules"
        :read-methods="readMethods"
        :reader-theme-options="readerThemeOptions"
        @decrease-config="decConfig"
        @increase-config="incConfig"
        @open-panel="openPanel"
        @set-background-image="setBGImg"
        @set-config="setConfig"
        @set-number-config="setNumberConfig"
        @set-read-method="setReadMethod"
        @set-theme="setTheme"
      />
      <ReadSettingsSubPanel
        v-else
        :key="activePanel"
        :active-panel="activePanel"
        :config="config"
        :current-click-area-mode-label="currentClickAreaModeLabel"
        :font-options="fontOptions"
        :font-stepper-items="fontStepperItems"
        :get-choice-label="getChoiceLabel"
        :more-stepper-items="moreStepperItems"
        :spacing-stepper-items="spacingStepperItems"
        :text-colors="textColors"
        :title="activePanelTitle"
        @back="activePanel = MAIN_PANEL"
        @change-config="setNumberConfig"
        @decrease-config="decConfig"
        @increase-config="incConfig"
        @open-choice-picker="openChoicePicker"
        @open-click-area-editor="openClickAreaEditor"
        @set-config="setConfig"
      />
    </transition>

    <transition name="setting-picker">
      <ReadSettingsChoicePicker
        v-if="activeChoicePicker"
        :options="activeChoiceOptions"
        :selected-value="activeChoiceSelectedValue"
        :title="activeChoiceTitle"
        @close="closeChoicePicker"
        @select="selectChoiceOption"
      />
    </transition>
  </div>
</template>

<script setup>
import { computed, onBeforeUnmount, onMounted, reactive, ref, watch } from "vue";
import ReadSettingsChoicePicker from "./settings/ReadSettingsChoicePicker.vue";
import ReadSettingsMainPanel from "./settings/ReadSettingsMainPanel.vue";
import ReadSettingsSubPanel from "./settings/ReadSettingsSubPanel.vue";
import { readerThemeOptions } from "../previewData";
import { normalizeReaderSettings } from "../data/readerSettings";
import {
  backgroundChoices,
  choicePickers,
  clampReadSettingNumber,
  createReadSettingsConfigRules,
  fontOptions,
  panelTitleMap,
  readMethods,
  textColors
} from "../data/readSettingsOptions";
import { getMiniInterface } from "../utils/interface";
import { normalizeReadMethod } from "../utils/readMethod";
import {
  getClickAreaModeLabel,
  normalizeClickAreaActions
} from "../utils/clickArea";

const MAIN_PANEL = "main";

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

const activePanel = ref(MAIN_PANEL);
const activeChoicePicker = ref("");
const config = reactive(normalizeReaderSettings(props.readerConfig));
const configRules = ref(createReadSettingsConfigRules());
const miniInterface = ref(getMiniInterface());

const isNight = computed(() => config.themeType === "night");
const activePanelTitle = computed(() => panelTitleMap[activePanel.value] || "设置");
const currentClickAreaModeLabel = computed(() => getClickAreaModeLabel(config.clickAreaMode));
const activeChoice = computed(() => choicePickers[activeChoicePicker.value] || null);
const activeChoiceTitle = computed(() => activeChoice.value?.title || "");
const activeChoiceOptions = computed(() => activeChoice.value?.options || []);
const activeChoiceSelectedValue = computed(() => {
  const field = activeChoice.value?.field;
  return field ? config[field] : "";
});

const buildStepperItem = ({ label, name, editable = false }) => {
  const rule = configRules.value[name] || {};
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

const refreshConfigRules = () => {
  configRules.value = createReadSettingsConfigRules();
};

const syncInterface = () => {
  miniInterface.value = getMiniInterface();
  refreshConfigRules();
};

const syncLocalConfig = value => {
  Object.assign(config, normalizeReaderSettings(value));
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

const setNumberConfig = (name, value) => {
  const nextValue = clampReadSettingNumber(configRules.value, name, value, config[name]);
  setConfig(name, nextValue);
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

const selectChoiceOption = option => {
  const picker = activeChoice.value;
  if (!picker) return;

  setConfig(picker.field, option.value);
  closeChoicePicker();
};

const openClickAreaEditor = () => {
  activeChoicePicker.value = "";
  emit("open-click-area-editor");
};

const setReadMethod = readMethod => {
  setConfig("readMethod", normalizeReadMethod(readMethod));
};

const incConfig = name => {
  const rule = configRules.value[name];
  if (!rule) return;

  const value = Number(config[name]);
  const nextValue = "max" in rule ? Math.min(rule.max, value + rule.delta) : value + rule.delta;
  setNumberConfig(name, nextValue);
};

const decConfig = name => {
  const rule = configRules.value[name];
  if (!rule) return;

  const value = Number(config[name]);
  const nextValue = "min" in rule ? Math.max(rule.min, value - rule.delta) : value - rule.delta;
  setNumberConfig(name, nextValue);
};

const setBGImg = item => {
  setConfig("contentBGImg", item);
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

<style src="../styles/read-settings.styl" lang="stylus"></style>
