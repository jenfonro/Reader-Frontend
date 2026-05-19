<template>
  <div class="reader-page-frame">
    <ReaderIntroPage
      v-if="page.type === 'chapter' && isIntroStreamItem(page.item)"
      class="reader-readable-content reader-page__intro"
      :book="readingBook"
      :loading="introLoading"
      :in-bookshelf="isReadingBookInShelf"
      @toggle-bookshelf="emit('toggle-bookshelf')"
      @start-reading="emit('start-reading')"
    />
    <Content
      v-else-if="page.type === 'chapter'"
      class="reader-text-flow reader-readable-content"
      :title="getPageFrameTitle(page)"
      :content="getPageFrameContent(page)"
      :show-content="show"
      :error="error"
      :style="[contentStyle, getPageFrameContentStyle(page)]"
      :reader-config="config"
    />
    <ReaderLoadingBlock
      v-else-if="page.type === 'loading'"
      class="reader-page-frame__loading"
    />
    <div v-else class="reader-page-frame__placeholder" aria-hidden="true"></div>
  </div>
</template>

<script setup>
import Content from "../Content.vue";
import ReaderIntroPage from "./ReaderIntroPage.vue";
import ReaderLoadingBlock from "./ReaderLoadingBlock.vue";

defineProps({
  config: { type: Object, required: true },
  contentStyle: { type: [Object, Array], default: () => ({}) },
  error: { type: Boolean, default: false },
  getPageFrameContent: { type: Function, default: () => "" },
  getPageFrameContentStyle: { type: Function, default: () => ({}) },
  getPageFrameTitle: { type: Function, default: () => "" },
  introLoading: { type: Boolean, default: false },
  isIntroStreamItem: { type: Function, default: () => false },
  isReadingBookInShelf: { type: Boolean, default: false },
  page: { type: Object, required: true },
  readingBook: { type: Object, required: true },
  show: { type: Boolean, default: false }
});

const emit = defineEmits(["start-reading", "toggle-bookshelf"]);
</script>
