<template>
  <div class="reader-manage-row-menu-layer" role="presentation" @pointerdown.stop="emit('close')">
    <section class="reader-manage-menu reader-manage-row-menu" @pointerdown.stop>
      <button
        v-for="item in visibleItems"
        :key="item.value"
        type="button"
        class="reader-manage-menu__button"
        :class="{ 'is-danger': item.danger }"
        @click="emit('action', item.value)"
      >
        {{ item.label }}
      </button>
    </section>
  </div>
</template>

<script setup>
import { computed } from "vue";

const props = defineProps({
  items: { type: Array, default: () => [] }
});

const emit = defineEmits(["action", "close"]);

const visibleItems = computed(() => props.items.filter(item => item && item.visible !== false));
</script>
