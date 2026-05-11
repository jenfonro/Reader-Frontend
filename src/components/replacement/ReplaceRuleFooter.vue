<template>
  <label class="reader-source-check" aria-label="全选替换规则">
    <input :checked="allChecked" type="checkbox" @change="emit('update:allChecked', $event.target.checked)" />
    <span></span>
  </label>
  <span class="reader-manage-count">全选（{{ selectedCount }}/{{ total }}）</span>
  <div class="reader-manage-footer-actions reader-source-bottom-actions">
    <button type="button" :disabled="!selectedCount" @click="emit('invert')">反选</button>
    <button type="button" :disabled="!selectedCount" @click="emit('delete')">删除</button>
    <button
      type="button"
      class="reader-manage-footer-more reader-source-bottom-more"
      :disabled="!selectedCount"
      aria-label="批量更多操作"
    >
      <span aria-hidden="true"></span>
    </button>
  </div>
</template>

<script setup>
defineProps({
  allChecked: { type: Boolean, default: false },
  selectedCount: { type: Number, default: 0 },
  total: { type: Number, default: 0 }
});

const emit = defineEmits(["update:allChecked", "invert", "delete"]);
</script>
