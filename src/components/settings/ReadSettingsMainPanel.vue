<template>
  <div class="reading-settings__body">
    <div class="setting-row setting-row--brightness">
      <span class="setting-row__label">亮度</span>
      <input
        :value="config.brightness"
        class="setting-range"
        type="range"
        min="30"
        max="100"
        aria-label="亮度"
        @input="emit('set-number-config', 'brightness', $event.target.value)"
      />
      <button
        type="button"
        class="setting-text-action"
        :class="{ selected: config.eyeCare }"
        @click="emit('set-config', 'eyeCare', !config.eyeCare)"
      >
        护眼模式
      </button>
    </div>

    <div class="setting-row setting-row--font">
      <span class="setting-row__label">字体</span>
      <button type="button" class="setting-pill setting-font-step" @click="emit('decrease-config', 'fontSize')">
        A<sup>-</sup>
      </button>
      <input
        class="setting-font-size setting-number-input"
        type="number"
        :min="configRules.fontSize.min"
        :value="config.fontSize"
        aria-label="字体大小"
        @change="emit('set-number-config', 'fontSize', $event.target.value)"
      />
      <button type="button" class="setting-pill setting-font-step" @click="emit('increase-config', 'fontSize')">
        A<sup>+</sup>
      </button>
      <button type="button" class="setting-pill setting-font-config" @click="emit('open-panel', 'font')">
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
          @click="emit('set-theme', item)"
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
          @click="emit('set-background-image', item.value)"
        ></button>
        <button type="button" class="setting-background-card setting-background-card--custom" @click="emit('open-panel', 'background')">
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
          @click="emit('set-read-method', method)"
        >
          {{ method }}
        </button>
      </div>
    </div>

    <div class="setting-row">
      <span class="setting-row__label">其他</span>
      <div class="setting-button-group">
        <button type="button" class="setting-pill setting-pill--group" @click="emit('open-panel', 'spacing')">间距设置</button>
        <button type="button" class="setting-pill setting-pill--group" @click="emit('open-panel', 'more')">更多 ›</button>
      </div>
    </div>
  </div>
</template>

<script setup>
defineProps({
  backgroundChoices: { type: Array, required: true },
  config: { type: Object, required: true },
  configRules: { type: Object, required: true },
  readMethods: { type: Array, required: true },
  readerThemeOptions: { type: Array, required: true }
});

const emit = defineEmits([
  "decrease-config",
  "increase-config",
  "open-panel",
  "set-background-image",
  "set-config",
  "set-number-config",
  "set-read-method",
  "set-theme"
]);

const getBackgroundPreviewStyle = item => {
  if (item.value) {
    return { backgroundImage: `url(${item.value})` };
  }
  return { background: item.background };
};
</script>
