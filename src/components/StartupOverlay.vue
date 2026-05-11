<template>
  <div
    class="startup-overlay"
    :class="{ 'startup-overlay--leaving': leaving }"
    role="status"
    aria-live="polite"
  >
    <div class="startup-overlay__panel">
      <img class="startup-overlay__logo" :src="logoUrl" alt="阅读" />
      <div class="startup-overlay__loading">
        <div class="startup-overlay__spinner" aria-hidden="true"></div>
        <span>加载中</span>
      </div>
      <div class="startup-overlay__progress" aria-hidden="true">
        <div
          class="startup-overlay__progress-bar"
          :style="{ width: `${normalizedProgress}%` }"
        ></div>
      </div>
      <div class="startup-overlay__status">{{ status }}</div>
    </div>
  </div>
</template>

<script setup>
import { computed } from "vue";
import logoUrl from "../assets/reader-logo.svg";

const props = defineProps({
  status: {
    type: String,
    required: true
  },
  progress: {
    type: Number,
    required: true
  },
  leaving: {
    type: Boolean,
    default: false
  }
});

const normalizedProgress = computed(() =>
  Math.max(0, Math.min(100, Math.round(props.progress)))
);
</script>

<style scoped>
.startup-overlay {
  position: fixed;
  inset: 0;
  z-index: 9999;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 32px;
  box-sizing: border-box;
  background: #fff;
  opacity: 1;
  transition: opacity 0.55s ease, visibility 0.55s ease;
}

.startup-overlay--leaving {
  opacity: 0;
  visibility: hidden;
}

.startup-overlay__panel {
  width: min(260px, 76vw);
  display: flex;
  flex-direction: column;
  align-items: center;
}

.startup-overlay__logo {
  width: 76px;
  height: 76px;
  object-fit: contain;
  filter: drop-shadow(0 14px 24px rgba(44, 62, 80, 0.12));
  user-select: none;
  -webkit-user-drag: none;
}

.startup-overlay__loading {
  display: inline-flex;
  align-items: center;
  gap: 10px;
  margin-top: 28px;
  color: rgba(44, 62, 80, 0.72);
  font-size: 14px;
  line-height: 24px;
}

.startup-overlay__spinner {
  width: 24px;
  height: 24px;
  border: 2px solid rgba(44, 62, 80, 0.14);
  border-top-color: rgba(44, 62, 80, 0.72);
  border-radius: 50%;
  animation: startup-spin 0.85s linear infinite;
}

.startup-overlay__progress {
  width: 100%;
  height: 5px;
  margin-top: 22px;
  overflow: hidden;
  border-radius: 999px;
  background: rgba(44, 62, 80, 0.12);
}

.startup-overlay__progress-bar {
  height: 100%;
  border-radius: inherit;
  background: #2c3e50;
  transition: width 0.28s ease;
}

.startup-overlay__status {
  min-height: 20px;
  margin-top: 14px;
  color: rgba(44, 62, 80, 0.62);
  font-size: 14px;
  line-height: 20px;
  text-align: center;
  letter-spacing: 0.02em;
}

@keyframes startup-spin {
  to {
    transform: rotate(360deg);
  }
}
</style>
