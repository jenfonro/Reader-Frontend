<template>
  <label class="reader-manage-search">
    <span aria-hidden="true">⌕</span>
    <input
      :value="modelValue"
      type="search"
      placeholder="搜索替换规则"
      @input="emit('update:modelValue', $event.target.value)"
    />
  </label>
</template>

<script setup>
defineProps({
  modelValue: { type: String, default: "" }
});

const emit = defineEmits(["update:modelValue"]);
</script>
