<template>
  <div class="reading-settings__subpanel">
    <div class="setting-subpanel__header">
      <button type="button" class="setting-subpanel__back" @click="emit('back')">‹</button>
      <span>{{ title }}</span>
    </div>

    <div v-if="activePanel === 'font'" class="setting-subpanel__body">
      <div class="setting-subpanel-row setting-subpanel-row--font-family">
        <span class="setting-choice-label">正文字体</span>
        <div class="setting-scroll-row setting-font-options">
          <button
            v-for="font in fontOptions"
            :key="font.value"
            type="button"
            class="setting-font-option"
            :class="{ selected: config.font === font.value }"
            @click="emit('set-config', 'font', font.value)"
          >
            {{ font.name }}
          </button>
        </div>
      </div>
      <SettingsStepperRow
        v-for="item in fontStepperItems"
        :key="item.name"
        :item="item"
        :editable="item.editable"
        align="start"
        @decrease="name => emit('decrease-config', name)"
        @increase="name => emit('increase-config', name)"
        @change="(name, value) => emit('change-config', name, value)"
      />
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
            @click="emit('set-config', 'fontColor', item.value)"
          ></button>
        </div>
      </div>
    </div>

    <div v-else-if="activePanel === 'background'" class="setting-subpanel__body">
      <div class="setting-subpanel-row">
        <span>页面背景</span>
        <input :value="config.bodyColor" type="color" @input="emit('set-config', 'bodyColor', $event.target.value)" />
      </div>
      <div class="setting-subpanel-row">
        <span>阅读背景</span>
        <input :value="config.contentColor" type="color" @input="emit('set-config', 'contentColor', $event.target.value)" />
      </div>
      <div class="setting-subpanel-row">
        <span>浮窗背景</span>
        <input :value="config.popupColor" type="color" @input="emit('set-config', 'popupColor', $event.target.value)" />
      </div>
      <button type="button" class="setting-list-button" @click="uploadBGFile">
        <span>上传背景图片</span>
        <span>›</span>
      </button>
      <input ref="bgFileRef" type="file" accept="image/*" @change="onBGFileChange" style="display:none" />
    </div>

    <div v-else-if="activePanel === 'spacing'" class="setting-subpanel__body">
      <SettingsStepperRow
        v-for="item in spacingStepperItems"
        :key="item.name"
        :item="item"
        editable
        align="start"
        @decrease="name => emit('decrease-config', name)"
        @increase="name => emit('increase-config', name)"
        @change="(name, value) => emit('change-config', name, value)"
      />
    </div>

    <div v-else class="setting-subpanel__body">
      <button type="button" class="setting-list-button setting-choice-row" @click="emit('open-choice-picker', 'chineseFont')">
        <span>简繁体设置</span>
        <span class="setting-choice-row__value">{{ getChoiceLabel('chineseFont') }} ›</span>
      </button>
      <button type="button" class="setting-list-button setting-choice-row" @click="emit('open-choice-picker', 'clickAreaMode')">
        <span>点击区域模式</span>
        <span class="setting-choice-row__value">{{ getChoiceLabel('clickAreaMode') }} ›</span>
      </button>
      <button type="button" class="setting-list-button setting-choice-row" @click="emit('open-click-area-editor')">
        <span>点击区域设置</span>
        <span class="setting-choice-row__value">{{ currentClickAreaModeLabel }} ›</span>
      </button>
      <SettingsStepperRow
        v-for="item in moreStepperItems"
        :key="item.name"
        :item="item"
        @decrease="name => emit('decrease-config', name)"
        @increase="name => emit('increase-config', name)"
        @change="(name, value) => emit('change-config', name, value)"
      />
    </div>
  </div>
</template>

<script setup>
import { ref } from "vue";
import SettingsStepperRow from "./SettingsStepperRow.vue";

defineProps({
  activePanel: { type: String, required: true },
  config: { type: Object, required: true },
  currentClickAreaModeLabel: { type: String, required: true },
  fontOptions: { type: Array, required: true },
  fontStepperItems: { type: Array, required: true },
  getChoiceLabel: { type: Function, required: true },
  moreStepperItems: { type: Array, required: true },
  spacingStepperItems: { type: Array, required: true },
  textColors: { type: Array, required: true },
  title: { type: String, required: true }
});

const emit = defineEmits([
  "back",
  "change-config",
  "decrease-config",
  "increase-config",
  "open-choice-picker",
  "open-click-area-editor",
  "set-config"
]);

const bgFileRef = ref(null);

const uploadBGFile = () => {
  bgFileRef.value?.click();
};

const onBGFileChange = event => {
  event.target.value = null;
};
</script>
