<template>
  <nav class="reader-mobile-nav" :style="navStyle" aria-label="底部导航">
    <button
      v-for="item in items"
      :key="item.key"
      type="button"
      :class="{ 'is-active': activeKey === item.key }"
      @click="emit('navigate', item.key)"
    >
      <Icon :name="item.icon" :size="21" />
      <span>{{ item.label }}</span>
    </button>
  </nav>
</template>

<script setup>
import { computed } from "vue";
import Icon from "./Icon.vue";

const props = defineProps({
  items: { type: Array, required: true },
  activeKey: { type: String, required: true }
});

const emit = defineEmits(["navigate"]);
const navStyle = computed(() => ({
  "--reader-mobile-nav-count": Math.max(props.items.length, 1)
}));
</script>

<style scoped>
.reader-mobile-nav {
  display: none;
}

@container reader-shell (max-width: 750px) {
  .reader-mobile-nav {
    position: fixed;
    z-index: 45;
    left: 50%;
    right: auto;
    bottom: var(--reader-mobile-nav-bottom, calc(16px + env(safe-area-inset-bottom)));
    width: min(430px, calc(100% - 28px));
    min-height: 68px;
    display: grid;
    grid-template-columns: repeat(var(--reader-mobile-nav-count, 4), minmax(0, 1fr));
    gap: 0;
    padding: 5px;
    border: 1px solid rgba(255, 255, 255, 0.78);
    border-radius: 999px;
    background: rgba(255, 255, 255, 0.72);
    box-shadow: 0 20px 48px rgba(0, 0, 0, 0.12);
    backdrop-filter: blur(24px);
    transform: translateX(-50%);
  }

  .reader-mobile-nav button {
    min-width: 0;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 2px;
    border: 0;
    border-radius: 999px;
    background: transparent;
    color: #111827;
    font-size: 11px;
    line-height: 1.1;
    font-weight: 600;
  }

  .reader-mobile-nav button svg {
    width: 22px;
    height: 22px;
  }

  .reader-mobile-nav button.is-active {
    background: rgba(118, 118, 128, 0.14);
    color: var(--reader-blue);
  }
}
</style>
