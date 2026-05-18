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
        @scroll="emit('content-scroll', $event)"
        @wheel.passive="emit('reader-wheel', $event)"
        @touchstart.passive="emit('content-touch-start', $event)"
        @touchmove.passive="emit('content-touch-move', $event)"
        @touchend.passive="emit('content-touch-end', $event)"
        @touchcancel.passive="emit('content-touch-end', $event)"
        @mousedown="emit('reader-mouse-down', $event)"
      >
        <div
          v-if="isHorizontalPageTurn"
          class="reader-horizontal-stage"
          :class="horizontalStageClass"
          @touchstart="emit('reader-touch-start', $event)"
          @touchmove="emit('reader-touch-move', $event)"
          @touchend="emit('reader-touch-end', $event)"
          @touchcancel="emit('reader-touch-cancel', $event)"
        >
          <div
            v-for="page in horizontalPageWindows"
            :key="page.key"
            class="reader-page-frame"
            :class="getHorizontalPageFrameClass(page)"
            :style="getHorizontalPageFrameStyle(page)"
          >
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
              :title="getHorizontalFrameTitle(page)"
              :content="getHorizontalFrameContent(page)"
              :show-content="show"
              :error="error"
              :style="[contentStyle, getHorizontalFrameContentStyle(page)]"
              :reader-config="config"
            />
            <ReaderLoadingBlock
              v-else-if="page.type === 'loading'"
              class="reader-page-frame__loading"
            />
            <div v-else class="reader-page-frame__placeholder" aria-hidden="true"></div>
          </div>
          <div class="reader-horizontal-measure" aria-hidden="true">
            <Content
              v-for="item in measuredChapterStreamItems"
              :key="item.key"
              class="reader-readable-content reader-horizontal-measure__content"
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
        <div
          v-else-if="isVerticalPageTurn"
          class="reader-readable-content reader-chapter-flow"
        >
          <section
            v-if="isPreviousVerticalEdgeLoadingVisible"
            class="reader-chapter-flow__loading reader-chapter-flow__loading--previous"
            :style="verticalEdgeLoadingStyle"
          >
            <ReaderLoadingBlock inline />
          </section>
          <section
            v-for="item in chapterStreamItems"
            :key="item.key"
            class="reader-chapter-flow__item"
            :class="getChapterFlowItemClass(item)"
            :data-chapter-key="item.key"
          >
            <div class="reader-chapter-flow__item-content">
              <ReaderIntroPage
                v-if="isIntroStreamItem(item)"
                class="reader-page__intro"
                :book="readingBook"
                :loading="introLoading"
                :in-bookshelf="isReadingBookInShelf"
                @toggle-bookshelf="emit('toggle-bookshelf')"
                @start-reading="emit('start-reading')"
              />
              <Content
                v-else
                class="reader-text-flow"
                :title="item.title"
                :content="item.content"
                :show-content="show"
                :error="error"
                :style="contentStyle"
                :reader-config="config"
              />
            </div>
          </section>
          <section
            v-if="isNextVerticalEdgeLoadingVisible"
            class="reader-chapter-flow__loading reader-chapter-flow__loading--next"
            :style="verticalEdgeLoadingStyle"
          >
            <ReaderLoadingBlock inline />
          </section>
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

defineProps({
  chapterClass: { type: [String, Array, Object], default: "" },
  chapterStreamItems: { type: Array, default: () => [] },
  chapterTheme: { type: Object, default: () => ({}) },
  config: { type: Object, required: true },
  contentStyle: { type: [Object, Array], default: () => ({}) },
  contentViewportClass: { type: Object, default: () => ({}) },
  displayReaderHeaderTitle: { type: String, default: "" },
  error: { type: Boolean, default: false },
  getChapterFlowItemClass: { type: Function, default: () => {} },
  getHorizontalFrameContent: { type: Function, default: () => "" },
  getHorizontalFrameContentStyle: { type: Function, default: () => ({}) },
  getHorizontalFrameTitle: { type: Function, default: () => "" },
  getHorizontalPageFrameClass: { type: Function, default: () => {} },
  getHorizontalPageFrameStyle: { type: Function, default: () => ({}) },
  hasReaderContent: { type: Boolean, default: false },
  horizontalPageWindows: { type: Array, default: () => [] },
  horizontalStageClass: { type: Object, default: () => ({}) },
  introLoading: { type: Boolean, default: false },
  isActiveIntroStreamItem: { type: Boolean, default: false },
  isHorizontalPageTurn: { type: Boolean, default: false },
  isIntroStreamItem: { type: Function, default: () => false },
  isNextVerticalEdgeLoadingVisible: { type: Boolean, default: false },
  isPreviousVerticalEdgeLoadingVisible: { type: Boolean, default: false },
  isReaderLoadingVisible: { type: Boolean, default: false },
  isReaderPositioning: { type: Boolean, default: false },
  isReadingBookInShelf: { type: Boolean, default: false },
  isVerticalPageTurn: { type: Boolean, default: false },
  measuredChapterStreamItems: { type: Array, default: () => [] },
  miniInterface: { type: Boolean, default: false },
  readerLoadingText: { type: String, default: "正在加载" },
  readingBook: { type: Object, required: true },
  setContentViewportRef: { type: Function, default: () => {} },
  show: { type: Boolean, default: false },
  verticalEdgeLoadingStyle: { type: Object, default: () => ({}) }
});

const emit = defineEmits([
  "content-scroll",
  "content-touch-end",
  "content-touch-move",
  "content-touch-start",
  "reader-mouse-down",
  "reader-touch-cancel",
  "reader-touch-end",
  "reader-touch-move",
  "reader-touch-start",
  "reader-wheel",
  "start-reading",
  "toggle-bookshelf"
]);
</script>
