<template>
  <div :class="rootClass" role="status" aria-live="polite">
    <span class="reader-page-loading__spinner" aria-hidden="true"></span>
    <span class="reader-page-loading__text">{{ text }}</span>
  </div>
</template>

<script setup>
import { computed } from "vue";

const props = defineProps({
  inline: { type: Boolean, default: false },
  text: { type: String, default: "正在加载正文" }
});

const rootClass = computed(() =>
  props.inline ? "reader-chapter-flow__loading-body" : "reader-page-loading"
);
</script>
