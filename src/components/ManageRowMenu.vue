<template>
  <div
    class="reader-manage-row-menu-layer"
    :class="{ 'reader-manage-row-menu-layer--fixed': fixed }"
    role="presentation"
    @pointerdown.stop="emit('close')"
  >
    <section
      class="reader-manage-menu reader-manage-row-menu"
      :class="{ 'reader-manage-row-menu--fixed': fixed }"
      :style="menuStyle"
      @click.stop
      @pointerdown.stop
    >
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
  fixed: { type: Boolean, default: false },
  items: { type: Array, default: () => [] },
  position: { type: Object, default: () => ({ x: 0, y: 0 }) }
});

const emit = defineEmits(["action", "close"]);

const visibleItems = computed(() => props.items.filter(item => item && item.visible !== false));

const clampMenuPosition = () => {
  const baseX = Number(props.position?.x) || 0;
  const baseY = Number(props.position?.y) || 0;
  const menuWidth = 132;
  const menuHeight = Math.max(44, visibleItems.value.length * 44);
  const viewportWidth = typeof window === "undefined" ? 0 : window.innerWidth;
  const viewportHeight = typeof window === "undefined" ? 0 : window.innerHeight;
  const maxX = viewportWidth ? viewportWidth - menuWidth - 8 : baseX + 8;
  const maxY = viewportHeight ? viewportHeight - menuHeight - 8 : baseY;

  return {
    x: Math.max(8, Math.min(baseX + 8, maxX)),
    y: Math.max(8, Math.min(baseY, maxY))
  };
};

const menuStyle = computed(() => {
  if (!props.fixed) return {};
  const position = clampMenuPosition();
  return {
    left: `${position.x}px`,
    top: `${position.y}px`
  };
});
</script>
