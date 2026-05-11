<template>
  <PageLayout
    root-class="reader-interface-settings"
    body-class="reader-settings-page__body"
  >
    <template #header>
      <PageTopbar title="界面设置" back-visible @back="emit('back')" />
    </template>

    <section class="reader-settings-form-card">
      <button
        type="button"
        class="reader-settings-field reader-settings-field--switch"
        :aria-pressed="fullscreenMode"
        @click="toggleFullscreenMode"
      >
        <span>全屏模式</span>
        <span class="reader-settings-switch" :class="{ 'is-active': fullscreenMode }" aria-hidden="true">
          <span></span>
        </span>
      </button>
    </section>
  </PageLayout>
</template>

<script setup>
import { onBeforeUnmount, ref } from "vue";
import PageLayout from "../components/PageLayout.vue";
import PageTopbar from "../components/PageTopbar.vue";
import { getUiPreferences, setUiPreference, subscribeUiPreferences } from "../data/uiPreferences";

const emit = defineEmits(["back"]);
const fullscreenMode = ref(getUiPreferences().fullscreenMode);
const unsubscribePreferences = subscribeUiPreferences(preferences => {
  fullscreenMode.value = preferences.fullscreenMode;
});

const toggleFullscreenMode = () => {
  fullscreenMode.value = !fullscreenMode.value;
  setUiPreference("fullscreenMode", fullscreenMode.value);
};

onBeforeUnmount(() => {
  unsubscribePreferences();
});
</script>
