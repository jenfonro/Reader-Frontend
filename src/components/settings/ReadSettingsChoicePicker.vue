<template>
  <div class="setting-picker" @click.self="emit('close')">
    <div class="setting-picker__panel">
      <div class="setting-picker__title">{{ title }}</div>
      <button
        v-for="option in options"
        :key="option.value"
        type="button"
        class="setting-picker__option"
        :class="{ selected: option.value === selectedValue }"
        @click="emit('select', option)"
      >
        <span>{{ option.label }}</span>
        <span v-if="option.value === selectedValue">✓</span>
      </button>
    </div>
  </div>
</template>

<script setup>
defineProps({
  options: { type: Array, required: true },
  selectedValue: { type: [String, Number, Boolean], default: "" },
  title: { type: String, default: "" }
});

const emit = defineEmits(["close", "select"]);
</script>
