<template>
  <PageLayout root-class="reader-home-page reader-home-page--discover" body-class="reader-home-page__body">
    <template #header>
      <PageTopbar :title="title" />
    </template>

    <section class="home-discover-view" :aria-label="title"></section>
  </PageLayout>
</template>

<script setup>
import PageLayout from "../PageLayout.vue";
import PageTopbar from "../PageTopbar.vue";

defineProps({
  title: { type: String, default: "发现" }
});
</script>

<style scoped>
.home-discover-view {
  min-height: 0;
  width: 100%;
  box-sizing: border-box;
}
</style>
