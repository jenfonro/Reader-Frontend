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
        <template v-if="isVerticalReadMode">
          <div
            :ref="setVerticalStreamRef"
            class="reader-vertical-stream"
            :class="{ 'reader-vertical-stream--previous-loading': verticalStreamPreviousLoadingHeight > 0 }"
            @scroll="emit('vertical-scroll', $event)"
            @touchcancel.passive="emit('vertical-touch-cancel', $event)"
            @touchend.passive="emit('vertical-touch-end', $event)"
            @touchstart.passive="emit('vertical-touch-start', $event)"
            @touchmove="emit('vertical-touch-move', $event)"
          >
            <div
              class="reader-vertical-stream__previous-loading"
              :class="{
                'reader-vertical-stream__previous-loading--visible': verticalStreamPreviousLoadingHeight > 0,
                'reader-vertical-stream__previous-loading--preview': verticalStreamPreviousPreviewVisible
              }"
              :style="{ height: `${verticalStreamPreviousLoadingHeight}px` }"
              :role="verticalStreamPreviousPreviewVisible ? undefined : 'status'"
              :aria-live="verticalStreamPreviousPreviewVisible ? undefined : 'polite'"
            >
              <template v-if="verticalStreamPreviousPreviewVisible && verticalStreamPreviousPreviewItem">
                <div
                  class="reader-vertical-stream__previous-preview"
                  :style="{ transform: `translate3d(0, -${verticalStreamPreviousPreviewOffset}px, 0)` }"
                >
                  <ReaderIntroPage
                    v-if="isIntroStreamItem(verticalStreamPreviousPreviewItem)"
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
                    :title="verticalStreamPreviousPreviewItem.title"
                    :content="verticalStreamPreviousPreviewItem.content"
                    :show-content="show"
                    :error="error"
                    :style="contentStyle"
                    :reader-config="config"
                  />
                </div>
              </template>
              <template v-else>
                <span class="reader-vertical-stream__previous-loading-spinner" aria-hidden="true"></span>
                <span class="reader-vertical-stream__previous-loading-text">正在加载</span>
              </template>
            </div>
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
        </template>
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
  verticalStreamPreviousLoadingHeight: { type: Number, default: 0 },
  verticalStreamPreviousPreviewItem: { type: Object, default: null },
  verticalStreamPreviousPreviewOffset: { type: Number, default: 0 },
  verticalStreamPreviousPreviewVisible: { type: Boolean, default: false },
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
  "vertical-scroll",
  "vertical-touch-cancel",
  "vertical-touch-end",
  "vertical-touch-move",
  "vertical-touch-start"
]);
</script>
