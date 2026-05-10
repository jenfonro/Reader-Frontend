<script setup>
import { ref } from 'vue';

const emit = defineEmits(['changeBookSource', 'refresh', 'loadMore']);

const bookSourceGroup = ref('');
const bookSourceGroupList = [
  { name: '全部分组', count: 3, value: '' },
  { name: '默认分组', count: 2, value: 'default' },
];
const bookSource = [
  { originName: '示例书源', time: 128, latestChapterTitle: '第一百二十章 风起', selected: true },
  { originName: '备用书源一', time: 236, latestChapterTitle: '第一百一十九章 星河', selected: false },
  { originName: '备用书源二', time: 0, latestChapterTitle: '', selected: false },
];
</script>

<template>
  <div class="popup-wrapper">
    <div class="title-zone">
      <div class="title">来源({{ bookSource.length }})</div>
      <div class="title-btn">
        <el-select
          v-model="bookSourceGroup"
          size="small"
          class="booksource-group-select"
          filterable
          placeholder="全部分组"
        >
          <el-option
            v-for="(item, index) in bookSourceGroupList"
            :key="`source-group-${index}`"
            :label="`${item.name} (${item.count})`"
            :value="item.value"
          />
        </el-select>
        <span @click="emit('refresh')">刷新</span>
        <span @click="emit('loadMore')">加载更多</span>
      </div>
    </div>
    <div class="data-wrapper day">
      <div class="source-list">
        <div
          v-for="(searchBook, index) in bookSource"
          :key="index"
          class="source-item"
          :class="{ selected: searchBook.selected }"
          @click="emit('changeBookSource', searchBook)"
        >
          <div class="source-title">
            <div class="source-name">{{ searchBook.originName }}</div>
            <div class="source-time">{{ searchBook.time ? `⏱ ${searchBook.time}ms` : '' }}</div>
          </div>
          <div class="source-latest-chapter">{{ searchBook.latestChapterTitle || '无最新章节' }}</div>
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

.title-btn span {
  margin-left: 15px;
}

.booksource-group-select {
  width: 140px;
}

.data-wrapper {
  height: 300px;
  overflow: auto;
}

.data-wrapper::-webkit-scrollbar {
  width: 0 !important;
}

.source-item {
  width: 100%;
  cursor: pointer;
  display: flex;
  flex-direction: column;
  max-width: 100%;
  overflow: hidden;
  padding: 8px 0;
  border-bottom: 1px solid #eee;
}

.source-title {
  display: flex;
  flex-direction: row;
  flex-wrap: wrap;
  justify-content: space-between;
  align-items: center;
}

.source-name {
  font-size: 16px;
  overflow: hidden;
  white-space: nowrap;
  text-overflow: ellipsis;
}

.source-time {
  float: right;
  font-size: 12px;
}

.source-latest-chapter {
  overflow: hidden;
  white-space: nowrap;
  text-overflow: ellipsis;
  color: #888;
  font-size: 14px;
  margin-top: 6px;
}

.source-item.selected .source-name {
  color: #eb4259;
}
</style>
