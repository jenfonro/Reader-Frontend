<template>
  <div class="click-area-editor-overlay" role="dialog" aria-modal="true" aria-label="点击区域设置" @click.stop>
    <header class="click-area-editor-overlay__header">
      <span>点击区域设置</span>
      <button type="button" aria-label="关闭" @click="emit('close')">×</button>
    </header>

    <div class="click-area-editor-overlay__grid" :class="gridClass">
      <button
        v-for="zone in zones"
        :key="zone.key"
        type="button"
        class="click-area-editor-overlay__zone"
        @click="openActionPicker(zone.key)"
      >
        {{ getActionLabel(zone.key) }}
      </button>
    </div>

    <transition name="click-area-action-picker">
      <div v-if="activeZone" class="click-area-action-picker" @click.self="closeActionPicker">
        <div class="click-area-action-picker__panel">
          <div class="click-area-action-picker__title">选择操作</div>
          <button
            v-for="option in clickAreaActionOptions"
            :key="option.value"
            type="button"
            class="click-area-action-picker__item"
            :class="{ selected: currentAction === option.value }"
            @click="selectAction(option.value)"
          >
            <span>{{ option.label }}</span>
            <span v-if="currentAction === option.value">✓</span>
          </button>
        </div>
      </div>
    </transition>
  </div>
</template>

<script setup>
import { computed, ref } from "vue";
import {
  CLICK_AREA_MODE_NINE_GRID,
  clickAreaActionOptions,
  getClickAreaActionLabel,
  getClickAreaZones,
  getModeClickAreaActions,
  normalizeClickAreaActions
} from "../../utils/clickArea";

const props = defineProps({
  mode: {
    type: String,
    required: true
  },
  actions: {
    type: Object,
    default: null
  }
});

const emit = defineEmits(["close", "update-actions"]);

const activeZone = ref("");
const zones = computed(() => getClickAreaZones(props.mode));
const normalizedActions = computed(() => normalizeClickAreaActions(props.actions));
const modeActions = computed(() => getModeClickAreaActions(props.mode, normalizedActions.value));
const currentAction = computed(() => modeActions.value[activeZone.value] || "");
const gridClass = computed(() => ({
  "click-area-editor-overlay__grid--nine-grid": props.mode === CLICK_AREA_MODE_NINE_GRID,
  "click-area-editor-overlay__grid--three-zone": props.mode !== CLICK_AREA_MODE_NINE_GRID
}));

const getActionLabel = zoneKey => getClickAreaActionLabel(modeActions.value[zoneKey]);

const openActionPicker = zoneKey => {
  activeZone.value = zoneKey;
};

const closeActionPicker = () => {
  activeZone.value = "";
};

const selectAction = action => {
  if (!activeZone.value) return;
  const nextActions = normalizeClickAreaActions(normalizedActions.value);
  nextActions[props.mode] = {
    ...getModeClickAreaActions(props.mode, nextActions),
    [activeZone.value]: action
  };
  emit("update-actions", nextActions);
  closeActionPicker();
};
</script>

<style scoped>
.click-area-editor-overlay {
  position: fixed;
  inset: 0;
  z-index: 3000;
  display: flex;
  flex-direction: column;
  padding: 3px;
  background: rgba(0, 0, 0, 0.68);
  color: #fff;
  box-sizing: border-box;
}

.click-area-editor-overlay__header {
  min-height: 42px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin: 3px;
  padding: 0 16px;
  border-radius: 6px;
  background: rgba(48, 48, 48, 0.76);
  box-sizing: border-box;
}

.click-area-editor-overlay__header span {
  font-size: 16px;
  line-height: 1;
}

.click-area-editor-overlay__header button {
  width: 34px;
  height: 34px;
  border: 0;
  background: transparent;
  color: inherit;
  font-size: 30px;
  line-height: 1;
  cursor: pointer;
}

.click-area-editor-overlay__grid {
  min-height: 0;
  flex: 1;
  display: grid;
}

.click-area-editor-overlay__grid--nine-grid {
  grid-template-columns: repeat(3, minmax(0, 1fr));
  grid-template-rows: repeat(3, minmax(0, 1fr));
}

.click-area-editor-overlay__grid--three-zone {
  grid-template-columns: minmax(0, 1fr);
  grid-template-rows: repeat(3, minmax(0, 1fr));
}

.click-area-editor-overlay__zone {
  min-width: 0;
  min-height: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 3px;
  border: 0;
  border-radius: 6px;
  background: rgba(48, 48, 48, 0.76);
  color: inherit;
  font-size: 16px;
  line-height: 1;
  cursor: pointer;
}

.click-area-editor-overlay__zone:active {
  background: rgba(72, 72, 72, 0.82);
}

.click-area-action-picker {
  position: fixed;
  inset: 0;
  z-index: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 20px;
  background: rgba(0, 0, 0, 0.2);
  box-sizing: border-box;
}

.click-area-action-picker__panel {
  width: min(320px, 100%);
  max-height: min(560px, 86vh);
  overflow-y: auto;
  padding: 10px;
  border-radius: 16px;
  background: rgba(42, 42, 42, 0.96);
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.32);
  box-sizing: border-box;
}

.click-area-action-picker__title {
  padding: 6px 8px 10px;
  color: rgba(255, 255, 255, 0.78);
  font-size: 15px;
  line-height: 1;
}

.click-area-action-picker__item {
  width: 100%;
  min-height: 42px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 12px;
  border: 0;
  border-radius: 12px;
  background: transparent;
  color: inherit;
  font-size: 15px;
  cursor: pointer;
}

.click-area-action-picker__item.selected {
  background: rgba(255, 255, 255, 0.14);
}

.click-area-action-picker-enter-active,
.click-area-action-picker-leave-active {
  transition: opacity 0.16s ease;
}

.click-area-action-picker-enter-from,
.click-area-action-picker-leave-to {
  opacity: 0;
}
</style>
