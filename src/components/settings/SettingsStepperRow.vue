<template>
  <div
    class="setting-subpanel-row setting-subpanel-row--stepper"
    :class="{ 'setting-subpanel-row--start': align === 'start' }"
  >
    <span class="setting-subpanel-row__label">{{ item.label }}</span>
    <div class="setting-subpanel-stepper">
      <button
        type="button"
        class="setting-pill setting-font-step setting-subpanel-stepper__button"
        @click="emit('decrease', item.name)"
      >
        −
      </button>
      <input
        v-if="editable"
        class="setting-number-input setting-subpanel-number"
        type="number"
        :min="item.min"
        :max="item.max"
        :step="item.step"
        :value="item.value"
        :aria-label="item.label"
        @change="emit('change', item.name, $event.target.value)"
      />
      <span v-else class="setting-subpanel-value">{{ item.value }}</span>
      <button
        type="button"
        class="setting-pill setting-font-step setting-subpanel-stepper__button"
        @click="emit('increase', item.name)"
      >
        +
      </button>
    </div>
  </div>
</template>

<script setup>
defineProps({
  align: { type: String, default: "end" },
  editable: { type: Boolean, default: false },
  item: { type: Object, required: true }
});

const emit = defineEmits(["change", "decrease", "increase"]);
</script>

<style scoped>
.setting-subpanel-row {
  min-height: 42px;
  display: grid;
  grid-template-columns: max-content minmax(0, 1fr);
  align-items: center;
  gap: 12px;
  margin-bottom: 12px;
}

.setting-subpanel-row--start {
  grid-template-columns: max-content max-content;
}

.setting-subpanel-row--start .setting-subpanel-stepper {
  justify-self: start;
}

.setting-subpanel-row__label {
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

.setting-pill {
  height: 42px;
  padding: 0;
  border: 0;
  border-radius: 999px;
  background: rgba(120, 104, 75, 0.12);
  color: inherit;
  cursor: pointer;
  line-height: 1;
}

.setting-font-step {
  width: 42px;
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

.setting-number-input::-webkit-outer-spin-button,
.setting-number-input::-webkit-inner-spin-button {
  appearance: none;
  margin: 0;
}

:global(.night) .setting-pill,
:global(.night) .setting-subpanel-value,
:global(.night) .setting-subpanel-number {
  background: rgba(255, 255, 255, 0.08);
}

@media (max-width: 560px) {
  .setting-subpanel-row {
    grid-template-columns: max-content minmax(0, 1fr);
    gap: 10px;
  }

  .setting-subpanel-row--start {
    grid-template-columns: max-content max-content;
  }

  .setting-subpanel-stepper {
    min-width: 140px;
    grid-template-columns: 38px minmax(42px, auto) 38px;
    gap: 7px;
  }

  .setting-font-step {
    width: 38px;
    height: 38px;
    font-size: 18px;
  }

  .setting-subpanel-value,
  .setting-subpanel-number {
    width: 42px;
    height: 38px;
    font-size: 14px;
    line-height: 38px;
  }
}
</style>
