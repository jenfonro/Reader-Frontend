<template>
  <section v-if="open" class="reader-source-editor__more-menu" @pointerdown.stop>
    <button
      v-for="item in items"
      :key="item.value"
      type="button"
      @click="emit('action', item.value)"
    >
      {{ item.label }}
    </button>
  </section>
</template>

<script setup>
defineProps({
  open: { type: Boolean, default: false },
  items: { type: Array, default: () => [] }
});

const emit = defineEmits(["action"]);
</script>
