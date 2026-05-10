<script setup>
const emit = defineEmits(['changeBook', 'refreshShelf']);

const shelfBooks = [
  { name: '示例书籍', durChapterTitle: '第一章 旧日的风', unread: 12, selected: true },
  { name: '长夜余火', durChapterTitle: '第二十章 灯火', unread: 3, selected: false },
  { name: '大道朝天', durChapterTitle: '第六章 雪线', unread: 28, selected: false },
];
</script>

<template>
  <div class="popup-wrapper">
    <div class="title-zone">
      <div class="title">书架({{ shelfBooks.length }})</div>
      <div class="title-btn">
        <span @click="emit('refreshShelf')">刷新</span>
      </div>
    </div>
    <div class="data-wrapper day">
      <div class="shelfbook-list">
        <div
          v-for="book in shelfBooks"
          :key="book.name"
          class="book-item"
          :class="{ selected: book.selected }"
          @click="emit('changeBook', book)"
        >
          <div class="book-title">
            <div class="book-name">{{ book.name }}</div>
            <div class="book-progress">{{ book.unread }}</div>
          </div>
          <div class="chapter-text">{{ book.durChapterTitle }}</div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.popup-wrapper {
  margin: -16px;
  margin-bottom: -13px;
  padding: 24px;
  padding-top: calc(24px + constant(safe-area-inset-top));
  padding-top: calc(24px + env(safe-area-inset-top));
  background: var(--reader-popup-bg);
}

.title-zone {
  margin: 0 0 20px 0;
  width: 100%;
  display: flex;
  flex-direction: row;
  flex-wrap: wrap;
  justify-content: space-between;
}

.title {
  font-size: 18px;
  font-weight: 400;
  color: #ed4259;
  border-bottom: 1px solid #ed4259;
  width: fit-content;
}

.title-btn {
  font-size: 14px;
  line-height: 26px;
  color: #ed4259;
  cursor: pointer;
}

.data-wrapper {
  height: 300px;
  overflow: auto;
}

.data-wrapper::-webkit-scrollbar {
  width: 0 !important;
}

.book-item {
  width: 100%;
  cursor: pointer;
  display: flex;
  flex-direction: column;
  max-width: 100%;
  overflow: hidden;
  padding: 8px 0;
  border-bottom: 1px solid #eee;
}

.book-title {
  display: flex;
  flex-direction: row;
  flex-wrap: wrap;
  justify-content: space-between;
  align-items: center;
}

.book-name {
  font-size: 16px;
  overflow: hidden;
  white-space: nowrap;
  text-overflow: ellipsis;
}

.book-progress {
  float: right;
  font-size: 12px;
}

.chapter-text {
  overflow: hidden;
  white-space: nowrap;
  text-overflow: ellipsis;
  color: #888;
  font-size: 14px;
  margin-top: 6px;
}

.book-item.selected .book-name {
  color: #eb4259;
}
</style>
