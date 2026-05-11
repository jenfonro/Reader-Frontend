<template>
  <header class="reader-page-topbar" :aria-label="title || '页面顶部栏'">
    <h1 class="reader-page-topbar__title">{{ title }}</h1>

    <div v-if="backVisible" class="reader-page-topbar__side reader-page-topbar__side--left">
      <button
        type="button"
        class="reader-page-topbar__button reader-page-topbar__back"
        :aria-label="backLabel"
        @click="emit('back')"
      >
        <span aria-hidden="true">‹</span>
      </button>
    </div>

    <div v-if="normalizedActions.length" class="reader-page-topbar__side reader-page-topbar__side--right">
      <button
        v-for="action in normalizedActions"
        :key="action.key"
        type="button"
        class="reader-page-topbar__button"
        :class="{ 'reader-page-topbar__button--primary': action.variant === 'primary' }"
        :aria-label="action.label"
        @click="emit('action', action.key)"
      >
        <Icon v-if="action.icon" :name="action.icon" :size="20" :stroke-width="2.1" />
        <span v-else>{{ action.text || action.label }}</span>
      </button>
    </div>
  </header>
</template>

<script setup>
import { computed } from "vue";
import Icon from "./Icon.vue";

const props = defineProps({
  title: { type: String, default: "" },
  backVisible: { type: Boolean, default: false },
  backLabel: { type: String, default: "返回" },
  actions: { type: Array, default: () => [] }
});

const emit = defineEmits(["back", "action"]);

const normalizedActions = computed(() =>
  props.actions
    .filter(action => action && typeof action.key === "string" && action.key)
    .map(action => ({
      key: action.key,
      label: typeof action.label === "string" && action.label ? action.label : "操作",
      icon: typeof action.icon === "string" ? action.icon : "",
      text: typeof action.text === "string" ? action.text : "",
      variant: typeof action.variant === "string" ? action.variant : ""
    }))
);
</script>

<style scoped>
.reader-page-topbar {
  position: relative;
  z-index: 10;
  width: 100%;
  height: 100%;
  min-width: 0;
  min-height: var(--reader-page-topbar-space, calc(52px + env(safe-area-inset-top)));
  padding-top: env(safe-area-inset-top);
  color: var(--reader-app-text);
  box-sizing: border-box;
}

.reader-page-topbar__title {
  position: absolute;
  inset: env(safe-area-inset-top) 0 auto;
  height: var(--reader-page-topbar-row-height, 52px);
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0;
  overflow: hidden;
  color: var(--reader-app-text);
  font-size: 16px;
  line-height: 1.2;
  font-weight: 600;
  letter-spacing: -0.01em;
  text-align: center;
  text-overflow: ellipsis;
  white-space: nowrap;
  pointer-events: none;
}

.reader-page-topbar__side {
  position: absolute;
  z-index: 2;
  top: calc(env(safe-area-inset-top) + 7px);
  display: inline-flex;
  align-items: center;
  gap: 7px;
}

.reader-page-topbar__side--left {
  left: var(--reader-page-content-x, 24px);
}

.reader-page-topbar__side--right {
  right: var(--reader-page-content-x, 24px);
}

.reader-page-topbar__button {
  width: 38px;
  height: 38px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  flex: 0 0 38px;
  padding: 0;
  border: 0;
  border-radius: 999px;
  background: rgba(255, 255, 255, 0.84);
  color: var(--reader-app-text);
  box-shadow: 0 8px 18px rgba(0, 0, 0, 0.06);
  backdrop-filter: blur(18px);
  transition: background 0.16s ease, color 0.16s ease, transform 0.16s ease;
}

.reader-page-topbar__button:hover,
.reader-page-topbar__button--primary {
  background: rgba(0, 122, 255, 0.12);
  color: var(--reader-app-accent);
}

.reader-page-topbar__button--primary:hover {
  background: rgba(0, 122, 255, 0.18);
  color: var(--reader-app-accent);
}

.reader-page-topbar__button:active {
  transform: scale(0.96);
}

.reader-page-topbar__button > span:not([aria-hidden]) {
  font-size: 12px;
  font-weight: 600;
}

.reader-page-topbar__back span {
  font-size: 32px;
  line-height: 1;
  font-weight: 300;
  transform: translate(-1px, -2px);
}
</style>
