<template>
  <PageLayout root-class="reader-home-page" body-class="reader-settings-menu-body">
    <template #header>
      <PageTopbar title="设置" />
    </template>

    <SettingsHome @select="emit('open-page', $event)" />
  </PageLayout>
</template>

<script setup>
import PageLayout from "../PageLayout.vue";
import PageTopbar from "../PageTopbar.vue";
import SettingsHome from "../settings/SettingsHome.vue";

const emit = defineEmits(["open-page"]);
</script>
