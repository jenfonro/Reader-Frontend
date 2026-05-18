<template>
  <div class="home-bookshelf-empty">
    <div class="home-bookshelf-empty__title">{{ title }}</div>
    <div class="home-bookshelf-empty__desc">{{ description }}</div>
  </div>
</template>

<script setup>
defineProps({
  description: { type: String, required: true },
  title: { type: String, required: true }
});
</script>
