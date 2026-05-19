<template>
  <div class="reader-page" :class="chapterClass" :style="chapterTheme">
    <div class="reader-page__top">
      {{ miniInterface && !isActiveIntroStreamItem && !isReaderPositioning ? displayReaderHeaderTitle : "" }}
    </div>
    <div class="reader-page__content">
      <ReaderLoadingBlock
        v-if="isReaderLoadingVisible"
        :text="readerLoadingText"
      />
      <div
        v-if="hasReaderContent && show"
        :ref="setContentViewportRef"
        class="reader-page__content-inner"
        :class="contentViewportClass"
        @wheel.passive="emit('reader-wheel', $event)"
        @mousedown="emit('reader-mouse-down', $event)"
      >
        <div
          v-if="isVerticalReadMode"
          :ref="setVerticalStreamRef"
          class="reader-vertical-stream"
          @scroll="emit('vertical-scroll', $event)"
        >
          <section
            v-for="item in chapterStreamItems"
            :key="item.key"
            class="reader-vertical-stream__item"
            :data-chapter-key="item.key"
          >
            <ReaderIntroPage
              v-if="isIntroStreamItem(item)"
              class="reader-readable-content reader-page__intro"
              :book="readingBook"
              :loading="introLoading"
              :in-bookshelf="isReadingBookInShelf"
              @toggle-bookshelf="emit('toggle-bookshelf')"
              @start-reading="emit('start-reading')"
            />
            <Content
              v-else
              class="reader-readable-content reader-text-flow"
              :title="item.title"
              :content="item.content"
              :show-content="show"
              :error="error"
              :style="contentStyle"
              :reader-config="config"
            />
          </section>
          <ReaderLoadingBlock
            v-if="verticalStreamNextLoading"
            class="reader-vertical-stream__loading"
            variant="compact"
            text="正在加载"
          />
        </div>
        <div
          v-else-if="isPagedReadMode"
          class="reader-page-stage"
          :class="pageStageClass"
          @touchstart="emit('reader-touch-start', $event)"
          @touchmove="emit('reader-touch-move', $event)"
          @touchend="emit('reader-touch-end', $event)"
          @touchcancel="emit('reader-touch-cancel', $event)"
        >
          <ReaderPageFrame
            v-for="page in pageWindows"
            :key="page.key"
            :class="getPageFrameClass(page)"
            :style="getPageFrameStyle(page)"
            :config="config"
            :content-style="contentStyle"
            :error="error"
            :get-page-frame-content="getPageFrameContent"
            :get-page-frame-content-style="getPageFrameContentStyle"
            :get-page-frame-title="getPageFrameTitle"
            :intro-loading="introLoading"
            :is-intro-stream-item="isIntroStreamItem"
            :is-reading-book-in-shelf="isReadingBookInShelf"
            :page="page"
            :reading-book="readingBook"
            :show="show"
            @toggle-bookshelf="emit('toggle-bookshelf')"
            @start-reading="emit('start-reading')"
          />
        </div>
        <div class="reader-page-measure" aria-hidden="true">
          <Content
            v-for="item in measuredChapterStreamItems"
            :key="item.key"
            class="reader-readable-content reader-page-measure__content"
            :data-chapter-key="item.key"
            :title="item.title"
            :content="item.content"
            :show-content="show"
            :error="error"
            :style="contentStyle"
            :reader-config="config"
          />
        </div>
      </div>
    </div>
    <div class="reader-page__bottom"></div>
  </div>
</template>

<script setup>
import Content from "../Content.vue";
import ReaderIntroPage from "./ReaderIntroPage.vue";
import ReaderLoadingBlock from "./ReaderLoadingBlock.vue";
import ReaderPageFrame from "./ReaderPageFrame.vue";

defineProps({
  chapterClass: { type: [String, Array, Object], default: "" },
  chapterStreamItems: { type: Array, default: () => [] },
  chapterTheme: { type: Object, default: () => ({}) },
  config: { type: Object, required: true },
  contentStyle: { type: [Object, Array], default: () => ({}) },
  contentViewportClass: { type: Object, default: () => ({}) },
  displayReaderHeaderTitle: { type: String, default: "" },
  error: { type: Boolean, default: false },
  getPageFrameContent: { type: Function, default: () => "" },
  getPageFrameContentStyle: { type: Function, default: () => ({}) },
  getPageFrameTitle: { type: Function, default: () => "" },
  getPageFrameClass: { type: Function, default: () => {} },
  getPageFrameStyle: { type: Function, default: () => ({}) },
  hasReaderContent: { type: Boolean, default: false },
  pageWindows: { type: Array, default: () => [] },
  pageStageClass: { type: Object, default: () => ({}) },
  introLoading: { type: Boolean, default: false },
  isActiveIntroStreamItem: { type: Boolean, default: false },
  isPagedReadMode: { type: Boolean, default: false },
  isIntroStreamItem: { type: Function, default: () => false },
  isVerticalReadMode: { type: Boolean, default: false },
  isReaderLoadingVisible: { type: Boolean, default: false },
  isReaderPositioning: { type: Boolean, default: false },
  isReadingBookInShelf: { type: Boolean, default: false },
  measuredChapterStreamItems: { type: Array, default: () => [] },
  miniInterface: { type: Boolean, default: false },
  readerLoadingText: { type: String, default: "正在加载" },
  readingBook: { type: Object, required: true },
  verticalStreamNextLoading: { type: Boolean, default: false },
  setContentViewportRef: { type: Function, default: () => {} },
  setVerticalStreamRef: { type: Function, default: () => {} },
  show: { type: Boolean, default: false }
});

const emit = defineEmits([
  "reader-mouse-down",
  "reader-touch-cancel",
  "reader-touch-end",
  "reader-touch-move",
  "reader-touch-start",
  "reader-wheel",
  "start-reading",
  "toggle-bookshelf",
  "vertical-scroll"
]);
</script>
