<template>
  <section class="reader-intro-page" aria-label="书籍简介">
    <div class="reader-intro-page__cover" aria-hidden="true">
      <img v-if="book.coverUrl" :src="book.coverUrl" :alt="`${bookTitle}封面`" />
      <span v-else>{{ coverText }}</span>
    </div>

    <div class="reader-intro-page__summary">
      <h1>{{ bookTitle }}</h1>
      <p>{{ bookAuthor }}</p>
    </div>

    <div v-if="bookTags.length" class="reader-intro-page__tags" aria-label="标签">
      <span v-for="tag in bookTags" :key="tag">{{ tag }}</span>
    </div>

    <p v-if="latestChapter" class="reader-intro-page__latest">{{ latestChapter }}</p>

    <section class="reader-intro-page__intro" aria-label="简介">
      <p>{{ bookIntro }}</p>
    </section>

    <div v-if="showLoading" class="reader-intro-page__loading" role="status" aria-live="polite">
      <span class="reader-intro-page__spinner" aria-hidden="true"></span>
      <span>正在加载</span>
    </div>

    <div class="reader-intro-page__actions" @click.stop @mousedown.stop @touchstart.stop>
      <button
        type="button"
        :class="{ 'is-danger': inBookshelf }"
        @click="emit('toggle-bookshelf')"
      >
        {{ bookshelfActionText }}
      </button>
      <button type="button" class="is-primary" @click="emit('start-reading')">开始阅读</button>
    </div>
  </section>
</template>

<script setup>
import { computed } from "vue";
import {
  getReaderBookAuthor,
  getReaderBookCoverText,
  getReaderBookIntro,
  getReaderBookLatestChapter,
  getReaderBookTags,
  getReaderBookTitle
} from "./readerIntroData";

defineOptions({
  name: "ReaderIntroPage"
});

const props = defineProps({
  book: { type: Object, default: () => ({}) },
  loading: { type: Boolean, default: false },
  inBookshelf: { type: Boolean, default: false }
});

const emit = defineEmits(["toggle-bookshelf", "start-reading"]);

const bookTitle = computed(() => getReaderBookTitle(props.book));
const bookAuthor = computed(() => getReaderBookAuthor(props.book));
const bookIntro = computed(() => getReaderBookIntro(props.book));
const hasBookIntro = computed(() => String(props.book?.intro || "").trim().length > 0);
const showLoading = computed(() => props.loading && !hasBookIntro.value);
const latestChapter = computed(() => getReaderBookLatestChapter(props.book));
const bookTags = computed(() => getReaderBookTags(props.book));
const coverText = computed(() => getReaderBookCoverText(props.book));
const bookshelfActionText = computed(() => (props.inBookshelf ? "移出书架" : "加入书架"));
</script>

<style scoped>
.reader-intro-page {
  min-height: calc(var(--vh, 1vh) * 80);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 14px;
  padding: 18px 0 34px;
  box-sizing: border-box;
  color: var(--reader-font-color, #2e261d);
  text-align: center;
}

.reader-intro-page__cover {
  width: clamp(112px, 28vw, 156px);
  aspect-ratio: 3 / 4;
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
  border-radius: 18px;
  background: var(--reader-panel-background, rgba(255, 255, 255, 0.32));
  color: rgba(46, 38, 29, 0.72);
  font-size: 22px;
  font-weight: 700;
  letter-spacing: 0.08em;
  box-shadow: 0 16px 38px rgba(72, 55, 34, 0.16);
}

.reader-intro-page__cover img {
  width: 100%;
  height: 100%;
  display: block;
  object-fit: cover;
}

.reader-intro-page__summary {
  width: 100%;
  min-width: 0;
}

.reader-intro-page__summary h1 {
  margin: 0;
  overflow: hidden;
  color: var(--reader-font-color, #2e261d);
  font-size: clamp(24px, 6vw, 34px);
  line-height: 1.16;
  font-weight: 720;
  letter-spacing: -0.04em;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.reader-intro-page__summary p {
  margin: 9px 0 0;
  color: rgba(46, 38, 29, 0.68);
  font-size: 15px;
  line-height: 1.4;
  font-weight: 520;
}

.reader-intro-page__tags {
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  gap: 8px;
}

.reader-intro-page__tags span {
  min-height: 27px;
  display: inline-flex;
  align-items: center;
  padding: 0 10px;
  border-radius: 999px;
  background: var(--reader-panel-background, rgba(255, 255, 255, 0.24));
  color: rgba(46, 38, 29, 0.68);
  font-size: 12px;
  line-height: 1;
  font-weight: 560;
}

.reader-intro-page__latest {
  width: 100%;
  margin: 0;
  overflow: hidden;
  color: rgba(46, 38, 29, 0.5);
  font-size: 14px;
  line-height: 1.35;
  font-weight: 560;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.reader-intro-page__intro {
  width: 100%;
  max-width: 560px;
}

.reader-intro-page__intro p {
  margin: 0;
  color: rgba(46, 38, 29, 0.68);
  font-size: 15px;
  line-height: 1.78;
  font-weight: 430;
}

.reader-intro-page__loading {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  color: rgba(46, 38, 29, 0.5);
  font-size: 13px;
  line-height: 18px;
}

.reader-intro-page__spinner {
  width: 16px;
  height: 16px;
  border: 2px solid rgba(46, 38, 29, 0.14);
  border-top-color: rgba(46, 38, 29, 0.62);
  border-radius: 50%;
  animation: reader-intro-page-spin 0.85s linear infinite;
}

.reader-intro-page__actions {
  display: flex;
  justify-content: center;
  gap: 12px;
  margin-top: 4px;
}

.reader-intro-page__actions button {
  min-width: 112px;
  height: 40px;
  padding: 0 18px;
  border: 0;
  border-radius: 999px;
  background: var(--reader-panel-background, rgba(255, 255, 255, 0.32));
  color: rgba(46, 38, 29, 0.76);
  font-size: 14px;
  line-height: 1;
  font-weight: 650;
}

.reader-intro-page__actions .is-primary {
  background: var(--reader-font-color, rgba(46, 38, 29, 0.84));
  color: #fff7e7;
}

.reader-intro-page__actions .is-danger {
  background: rgba(255, 59, 48, 0.12);
  color: #ff3b30;
}

.reader-intro-page__actions button:active {
  transform: scale(0.96);
}

@keyframes reader-intro-page-spin {
  to {
    transform: rotate(360deg);
  }
}
</style>
