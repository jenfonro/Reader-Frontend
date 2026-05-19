<template>
  <div :class="rootClass" role="status" aria-live="polite">
    <span class="reader-page-loading__spinner" aria-hidden="true"></span>
    <span class="reader-page-loading__text">{{ text }}</span>
  </div>
</template>

<script setup>
import { computed } from "vue";

const props = defineProps({
  text: { type: String, default: "正在加载" },
  variant: {
    type: String,
    default: "page",
    validator: value => ["page", "compact"].includes(value)
  }
});

const rootClass = computed(() => [
  "reader-page-loading",
  `reader-page-loading--${props.variant}`
]);
</script>
