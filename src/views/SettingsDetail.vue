<template>
  <PageLayout
    root-class="reader-settings-detail"
    body-class="reader-settings-page__body"
  >
    <template #header>
      <PageTopbar :title="setting.label" back-visible @back="emit('back')" />
    </template>

    <section class="reader-settings-detail-card">
      <span class="reader-settings-detail-card__icon">
        <Icon :name="setting.icon || 'settings'" :size="28" />
      </span>
      <h1>{{ setting.label }}</h1>
      <p>{{ setting.description }}</p>
      <div class="reader-settings-placeholder-text">{{ setting.label }}页面</div>
    </section>
  </PageLayout>
</template>

<script setup>
import { computed } from "vue";
import Icon from "../components/Icon.vue";
import PageLayout from "../components/PageLayout.vue";
import PageTopbar from "../components/PageTopbar.vue";
import { findSettingsItem, settingsItems } from "../data/settings";

const props = defineProps({
  settingKey: { type: String, default: "" }
});

const emit = defineEmits(["back"]);

const setting = computed(() => findSettingsItem(props.settingKey) || settingsItems[0]);
</script>
