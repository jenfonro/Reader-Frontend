<template>
  <div class="home-bookshelf-header" role="tablist" aria-label="书架与历史">
    <button
      type="button"
      :class="{ 'is-active': activeTab === HOME_TAB_BOOKSHELF }"
      role="tab"
      :aria-selected="activeTab === HOME_TAB_BOOKSHELF"
      @click="emit('change', HOME_TAB_BOOKSHELF)"
    >
      书架
    </button>
    <button
      type="button"
      :class="{ 'is-active': activeTab === HOME_TAB_HISTORY }"
      role="tab"
      :aria-selected="activeTab === HOME_TAB_HISTORY"
      @click="emit('change', HOME_TAB_HISTORY)"
    >
      历史
    </button>
  </div>
</template>

<script setup>
import { HOME_TAB_BOOKSHELF, HOME_TAB_HISTORY } from "../../data/homeTabs";

defineProps({
  activeTab: { type: String, required: true }
});

const emit = defineEmits(["change"]);
</script>
