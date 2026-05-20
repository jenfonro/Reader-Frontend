<template>
  <div
    class="reader-vertical-stream__page"
    :class="pageClass"
    :data-page-type="page.type"
    :data-chapter-key="page.item?.key || ''"
    :data-seam-chapter-key="page.seam?.item?.key || ''"
    :data-boundary-anchor-key="page.anchorKey || ''"
    :data-boundary-key="page.boundaryKey || ''"
    :data-page-number="page.number"
    :data-page-count="page.pageCount"
    :data-content-offset="page.contentOffset || 0"
    :data-content-top="page.contentTop || 0"
    :data-content-height="page.contentHeight || 0"
    :data-seam-state="page.seam?.type || ''"
    :data-seam-height="page.seam?.height || 0"
    :data-boundary="page.boundary || ''"
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

    <template v-else-if="page.type === 'chapter'">
      <div
        v-if="hasSeam"
        class="reader-vertical-stream__seam"
        :class="`reader-vertical-stream__seam--${page.seam.type}`"
        :style="seamStyle"
      >
        <div
          v-if="page.seam.type === 'tail'"
          class="reader-vertical-stream__seam-content"
        >
          <Content
            class="reader-readable-content reader-text-flow"
            :title="getPageFrameTitle(page.seam)"
            :content="getPageFrameContent(page.seam)"
            :show-content="show"
            :error="error"
            :style="[contentStyle, getPageFrameContentStyle(page.seam)]"
            :reader-config="config"
          />
        </div>
        <ReaderLoadingBlock
          v-else-if="page.seam.type === 'loading'"
          class="reader-vertical-stream__seam-loading"
          variant="compact"
          text="正在加载"
        />
      </div>

      <div
        class="reader-vertical-stream__content"
        :style="contentAreaStyle"
      >
        <Content
          class="reader-readable-content reader-text-flow"
          :title="getPageFrameTitle(page)"
          :content="getPageFrameContent(page)"
          :show-content="show"
          :error="error"
          :style="[contentStyle, getPageFrameContentStyle(page)]"
          :reader-config="config"
        />
      </div>
    </template>

    <ReaderLoadingBlock
      v-else-if="page.type === 'loading'"
      class="reader-vertical-stream__loading"
      variant="compact"
      text="正在加载"
    />
    <div v-else class="reader-vertical-stream__guard" aria-hidden="true"></div>
  </div>
</template>

<script setup>
import { computed } from "vue";
import Content from "../Content.vue";
import ReaderIntroPage from "./ReaderIntroPage.vue";
import ReaderLoadingBlock from "./ReaderLoadingBlock.vue";

const props = defineProps({
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

const toPixel = value => `${Math.max(0, Number(value) || 0)}px`;

const hasSeam = computed(() =>
  props.page.type === "chapter" && props.page.seam && props.page.seam.type !== "none"
);

const pageClass = computed(() => ({
  "reader-vertical-stream__page--loading": props.page.type === "loading",
  "reader-vertical-stream__page--guard": props.page.type === "guard",
  "reader-vertical-stream__page--boundary": Boolean(props.page.boundary),
  "reader-vertical-stream__page--seam": hasSeam.value,
  "reader-vertical-stream__page--seam-loading": props.page.seam?.type === "loading",
  "reader-vertical-stream__page--seam-tail": props.page.seam?.type === "tail"
}));

const seamStyle = computed(() => ({
  height: toPixel(props.page.seam?.height)
}));

const contentAreaStyle = computed(() => {
  const top = Math.max(0, Number(props.page.contentTop) || 0);
  const height = Math.max(0, Number(props.page.contentHeight) || 0);

  return {
    top: toPixel(top),
    height: height ? toPixel(height) : `calc(100% - ${toPixel(top)})`
  };
});
</script>
