<template>
  <div class="reader-intro-layer" role="presentation" @click="emit('close')">
    <section class="reader-intro-panel" role="dialog" aria-modal="true" aria-label="书籍简介" @click.stop>
      <button type="button" class="reader-intro-panel__close" aria-label="关闭简介" @click="emit('close')">
        <span aria-hidden="true">×</span>
      </button>

      <div class="reader-intro-panel__cover" aria-hidden="true">
        <img v-if="book.coverUrl" :src="book.coverUrl" :alt="`${bookTitle}封面`" />
        <span v-else>{{ coverText }}</span>
      </div>

      <div class="reader-intro-panel__summary">
        <h1>{{ bookTitle }}</h1>
        <p>{{ bookAuthor }}</p>
      </div>

      <div v-if="bookTags.length" class="reader-intro-panel__tags" aria-label="标签">
        <span v-for="tag in bookTags" :key="tag">{{ tag }}</span>
      </div>

      <p v-if="latestChapter" class="reader-intro-panel__latest">{{ latestChapter }}</p>

      <section class="reader-intro-panel__intro" aria-label="简介">
        <p>{{ bookIntro }}</p>
      </section>

      <button type="button" class="reader-intro-panel__bookshelf" @click="emit('add-bookshelf')">
        加入书架
      </button>
    </section>
  </div>
</template>

<script setup>
import { computed } from "vue";

const props = defineProps({
  book: { type: Object, default: () => ({}) }
});

const emit = defineEmits(["close", "add-bookshelf"]);

const bookTitle = computed(() => props.book.name || props.book.title || "未知书籍");
const bookAuthor = computed(() => props.book.author || "未知作者");
const bookIntro = computed(() => props.book.intro || "暂无简介");
const latestChapter = computed(() => props.book.latestChapterTitle || props.book.latestChapter || "");
const bookTags = computed(() => {
  if (Array.isArray(props.book.tags)) return props.book.tags.filter(Boolean);
  const type = props.book.kind || props.book.category || props.book.typeName;
  return type ? [type] : [];
});
const coverText = computed(() => bookTitle.value.slice(0, 4));
</script>

<style scoped>
.reader-intro-layer {
  position: fixed;
  z-index: 2200;
  inset: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: calc(18px + env(safe-area-inset-top)) 18px calc(18px + env(safe-area-inset-bottom));
  background: rgba(46, 38, 29, 0.16);
  backdrop-filter: blur(6px);
  box-sizing: border-box;
}

.reader-intro-panel {
  position: relative;
  width: min(520px, 100%);
  max-height: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 14px;
  overflow-y: auto;
  padding: 28px 22px 24px;
  border-radius: 28px;
  background: rgba(237, 231, 218, 0.94);
  color: #2e261d;
  box-shadow: 0 24px 70px rgba(72, 55, 34, 0.24);
  box-sizing: border-box;
}

.reader-intro-panel__close {
  position: absolute;
  top: 12px;
  right: 12px;
  width: 34px;
  height: 34px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 0;
  border: 0;
  border-radius: 999px;
  background: rgba(255, 255, 255, 0.38);
  color: rgba(46, 38, 29, 0.68);
  font-size: 22px;
  line-height: 1;
}

.reader-intro-panel__cover {
  width: clamp(112px, 32vw, 158px);
  aspect-ratio: 3 / 4;
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
  border-radius: 20px;
  background: rgba(255, 255, 255, 0.32);
  color: rgba(46, 38, 29, 0.72);
  font-size: 22px;
  font-weight: 700;
  letter-spacing: 0.08em;
  box-shadow: 0 18px 44px rgba(72, 55, 34, 0.2);
}

.reader-intro-panel__cover img {
  width: 100%;
  height: 100%;
  display: block;
  object-fit: cover;
}

.reader-intro-panel__summary {
  width: 100%;
  min-width: 0;
  text-align: center;
}

.reader-intro-panel__summary h1 {
  margin: 0;
  overflow: hidden;
  color: #2e261d;
  font-size: clamp(24px, 6vw, 34px);
  line-height: 1.16;
  font-weight: 720;
  letter-spacing: -0.04em;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.reader-intro-panel__summary p {
  margin: 9px 0 0;
  color: rgba(46, 38, 29, 0.68);
  font-size: 15px;
  line-height: 1.4;
  font-weight: 520;
}

.reader-intro-panel__tags {
  width: 100%;
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  gap: 8px;
}

.reader-intro-panel__tags span {
  min-height: 27px;
  display: inline-flex;
  align-items: center;
  padding: 0 10px;
  border-radius: 999px;
  background: rgba(255, 255, 255, 0.24);
  color: rgba(46, 38, 29, 0.68);
  font-size: 12px;
  line-height: 1;
  font-weight: 560;
}

.reader-intro-panel__latest {
  width: 100%;
  margin: 0;
  overflow: hidden;
  color: rgba(46, 38, 29, 0.5);
  font-size: 14px;
  line-height: 1.35;
  font-weight: 560;
  text-align: center;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.reader-intro-panel__intro {
  width: 100%;
}

.reader-intro-panel__intro p {
  margin: 0;
  color: rgba(46, 38, 29, 0.68);
  font-size: 15px;
  line-height: 1.78;
  font-weight: 430;
  text-align: center;
}

.reader-intro-panel__bookshelf {
  min-width: 132px;
  height: 42px;
  padding: 0 22px;
  border: 0;
  border-radius: 999px;
  background: rgba(46, 38, 29, 0.84);
  color: #fff7e7;
  font-size: 14px;
  line-height: 1;
  font-weight: 650;
}

.reader-intro-panel__close:active,
.reader-intro-panel__bookshelf:active {
  transform: scale(0.96);
}

</style>
