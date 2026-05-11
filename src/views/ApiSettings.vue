<template>
  <PageLayout
    root-class="reader-api-settings"
    body-class="reader-settings-page__body"
  >
    <template #header>
      <PageTopbar title="接口设置" back-visible @back="emit('back')" />
    </template>

    <section class="reader-settings-list-card">
      <button
        type="button"
        class="reader-settings-list-item"
        @click="emit('open-page', 'settings-edgeone')"
      >
        <span class="reader-settings-list-item__icon">
          <Icon name="settings" :size="22" />
        </span>
        <span class="reader-settings-list-item__copy">
          <strong>EdgeOne 接口设置</strong>
          <span>配置 EdgeOne 代理地址与 Secret</span>
        </span>
        <span class="reader-settings-list-item__chevron" aria-hidden="true">›</span>
      </button>
    </section>
  </PageLayout>
</template>

<script setup>
import Icon from "../components/Icon.vue";
import PageLayout from "../components/PageLayout.vue";
import PageTopbar from "../components/PageTopbar.vue";

const emit = defineEmits(["back", "open-page"]);
</script>
